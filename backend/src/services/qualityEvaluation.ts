import dotenv from 'dotenv';

dotenv.config();

export interface StoryQuality {
  clarity: { score: number; description: string };
  completeness: { score: number; description: string };
  acceptanceCriteria: { score: number; description: string };
  specificity: { score: number; description: string };
  structure: { score: number; description: string };
  businessValueAlignment: { score: number; description: string };
  testability: { score: number; description: string };
  technicalFeasibility: { score: number; description: string };
  overallScore: number;
  grade: string;
  improvementAreas: string[];
  recommendations: string[];
}

export class QualityEvaluationService {
  private mistralApiKey: string | undefined;

  constructor() {
    this.mistralApiKey = process.env.MISTRAL_API_KEY;
  }

  async evaluateStory(content: string, title: string): Promise<StoryQuality> {
    console.log('QualityEvaluationService.evaluateStory called:', {
      hasApiKey: !!this.mistralApiKey,
      contentLength: content?.length || 0,
      title: title?.substring(0, 50) || 'No title'
    });
    
    if (!this.mistralApiKey) {
      throw new Error('Mistral API key is required for quality evaluation');
    }

    try {
      const prompt = `You are a Senior Business Analyst with 10+ years of experience in Healthcare IT, specializing in Electronic Health Records (EHR) systems, clinical workflow automation, and healthcare compliance (HIPAA, HL7, PoPIA).

Evaluate the following Agile user story for a regulated healthcare project.

User Story Title: "${title}"
User Story Content: "${content}"

Evaluate the user story across ALL EIGHT key dimensions, assigning a score out of 20 for each:

1. Clarity: Is it unambiguous and easy to understand? (Score 0-20)
2. Completeness: Are acceptance criteria and preconditions defined? (Score 0-20)
3. Acceptance Criteria: Are there explicit Given/When/Then scenarios or testable conditions? (Score 0-20)
   - Look for: "Acceptance Criteria", "##", "Given:", "When:", "Then:", "Scenario:", bullet points with conditions
   - If the story contains ANY of these patterns, it HAS acceptance criteria
   - Score based on quality and completeness, not just presence
4. Specificity: Are requirements specific and well-defined? (Score 0-20)
5. Structure: Does it follow standard user story format (As a/I want/So that)? (Score 0-20)
6. Business Value Alignment: Does it address clear healthcare value (safety, compliance, efficiency)? (Score 0-20)
7. Testability: Can QA easily derive test cases? (Score 0-20)
8. Technical Feasibility: Is it implementable under typical healthcare constraints? (Score 0-20)

IMPORTANT SCORING GUIDELINES FOR ACCEPTANCE CRITERIA:
- If the story has "Acceptance Criteria" header or "##" followed by scenarios: Score 16-20
- If the story has Given/When/Then format: Score 15-20
- If the story has structured bullet points with testable conditions: Score 12-16
- If the story has some testable statements: Score 8-12
- Only score 0-5 if there are truly NO acceptance criteria at all

Provide your output in a JSON format with ALL EIGHT criteria (this is critical):
- 'clarity': { 'score': number (0-20), 'description': string }
- 'completeness': { 'score': number (0-20), 'description': string }
- 'acceptanceCriteria': { 'score': number (0-20), 'description': string }
- 'specificity': { 'score': number (0-20), 'description': string }
- 'structure': { 'score': number (0-20), 'description': string }
- 'businessValueAlignment': { 'score': number (0-20), 'description': string }
- 'testability': { 'score': number (0-20), 'description': string }
- 'technicalFeasibility': { 'score': number (0-20), 'description': string }
- 'overallScore': number (sum of all 8 scores, 0-160)
- 'improvementAreas': string[] (list of specific areas that need improvement, empty array if story is excellent)
- 'recommendations': string[] (list of actionable recommendations to improve the story, or general best practices)

IMPORTANT: You MUST include all 8 criteria, improvementAreas, and recommendations in your response. Missing any will cause a validation error.

Return ONLY valid JSON, no additional text.`;

      const mistralClient = (await import('./mistralApiClient')).default.getInstance();
      const response = await mistralClient.fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.mistralApiKey}`,
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_CHAT_MODEL || 'mistral-small-latest',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json() as { choices: Array<{ message: { content: string } }> };
        if (data.choices?.[0]?.message) {
          const content = data.choices[0].message.content.trim();
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const quality = JSON.parse(jsonMatch[0]);
            console.log('🔍 Raw AI Response:', {
              improvementAreas: quality.improvementAreas,
              recommendations: quality.recommendations,
              improvementAreasType: typeof quality.improvementAreas,
              improvementAreasLength: quality.improvementAreas?.length
            });
            const validated = this.validateAndNormalizeQuality(quality);
            // Calculate overall score (sum of all scores out of 160 - 8 criteria * 20 each)
            const totalScore = validated.clarity.score +
              validated.completeness.score +
              validated.acceptanceCriteria.score +
              validated.specificity.score +
              validated.structure.score +
              validated.businessValueAlignment.score +
              validated.testability.score +
              validated.technicalFeasibility.score;
            validated.overallScore = Math.round(totalScore);
            validated.grade = this.calculateGrade(validated.overallScore);
            return validated;
          }
        }
      }
      
      throw new Error('Failed to get valid quality evaluation from Mistral AI');
    } catch (error) {
      console.error('Mistral AI quality evaluation failed:', error);
      throw error;
    }
  }

  private calculateGrade(score: number): string {
    // Scale is now 0-160 (8 criteria × 20 points each)
    const percentage = (score / 160) * 100;
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 55) return 'C-';
    if (percentage >= 50) return 'D+';
    if (percentage >= 45) return 'D';
    return 'F';
  }

  private validateAndNormalizeQuality(quality: any): StoryQuality {
    const normalizeScore = (score: any, fallback: number): number => {
      const num = typeof score === 'number' ? score : parseFloat(score);
      return Math.max(0, Math.min(20, isNaN(num) ? fallback : num));
    };

    // Validate that all required fields are present from AI response
    if (!quality.clarity || !quality.completeness || !quality.acceptanceCriteria || 
        !quality.specificity || !quality.structure || !quality.businessValueAlignment ||
        !quality.testability || !quality.technicalFeasibility) {
      throw new Error('Incomplete quality evaluation response from AI - all criteria must be evaluated');
    }

    const clarityScore = normalizeScore(quality.clarity?.score ?? quality.clarity, 0);
    const completenessScore = normalizeScore(quality.completeness?.score ?? quality.completeness, 0);
    const acceptanceCriteriaScore = normalizeScore(quality.acceptanceCriteria?.score ?? quality.acceptanceCriteria, 0);
    const specificityScore = normalizeScore(quality.specificity?.score ?? quality.specificity, 0);
    const structureScore = normalizeScore(quality.structure?.score ?? quality.structure, 0);
    const businessValueScore = normalizeScore(quality.businessValueAlignment?.score ?? quality.businessValueAlignment, 0);
    const testabilityScore = normalizeScore(quality.testability?.score ?? quality.testability, 0);
    const technicalFeasibilityScore = normalizeScore(quality.technicalFeasibility?.score ?? quality.technicalFeasibility, 0);

    const validatedQuality: StoryQuality = {
      clarity: {
        score: clarityScore,
        description: quality.clarity?.description || String(quality.clarity) || 'No description provided',
      },
      completeness: {
        score: completenessScore,
        description: quality.completeness?.description || String(quality.completeness) || 'No description provided',
      },
      acceptanceCriteria: {
        score: acceptanceCriteriaScore,
        description: quality.acceptanceCriteria?.description || 'No description provided',
      },
      specificity: {
        score: specificityScore,
        description: quality.specificity?.description || 'No description provided',
      },
      structure: {
        score: structureScore,
        description: quality.structure?.description || 'No description provided',
      },
      businessValueAlignment: {
        score: businessValueScore,
        description: quality.businessValueAlignment?.description || String(quality.businessValueAlignment) || 'No description provided',
      },
      testability: {
        score: testabilityScore,
        description: quality.testability?.description || String(quality.testability) || 'No description provided',
      },
      technicalFeasibility: {
        score: technicalFeasibilityScore,
        description: quality.technicalFeasibility?.description || String(quality.technicalFeasibility) || 'No description provided',
      },
      overallScore: 0, // Will be calculated after
      grade: 'C',
      improvementAreas: Array.isArray(quality.improvementAreas) && quality.improvementAreas.length > 0
        ? quality.improvementAreas
        : ['No improvement areas identified'],
      recommendations: Array.isArray(quality.recommendations) && quality.recommendations.length > 0
        ? quality.recommendations
        : ['No recommendations provided']
    };

    console.log('✅ Validated quality:', {
      improvementAreas: validatedQuality.improvementAreas,
      recommendations: validatedQuality.recommendations
    });

    return validatedQuality;
  }

  private generateMockQuality(content: string, title: string): StoryQuality {
    console.log('generateMockQuality called for:', {
      title: title?.substring(0, 50) || 'No title',
      contentPreview: content?.substring(0, 100) || 'No content'
    });
    
    // Enhanced healthcare-specific heuristic evaluation (scores out of 20 each)
    
    // More comprehensive acceptance criteria detection
    const hasExplicitAcceptanceCriteria = /acceptance\s*criteria|acceptance\s*criterion/i.test(content);
    const hasGivenWhenThen = /given\s+.+when\s+.+then\s+|given.*when.*then|scenario\s*:/i.test(content);
    const hasStructuredCriteria = /\-\s*(given|when|then|should|must|will|can)/i.test(content);
    const bulletMatches = content.match(/[\-\*\•]\s+/g);
    const hasBulletPoints = bulletMatches && bulletMatches.length >= 2;
    const hasTestableConditions = /(if\s+.*then|when\s+.*should|must\s+be|should\s+be|will\s+be|can\s+be)/i.test(content);
    
    // Calculate acceptance criteria score based on multiple indicators
    const acceptanceCriteriaScore = hasExplicitAcceptanceCriteria ? 20 : 
                                  hasGivenWhenThen ? 18 : 
                                  hasStructuredCriteria ? 16 : 
                                  hasBulletPoints ? 14 : 
                                  hasTestableConditions ? 12 : 0;
    
    // Create boolean for backward compatibility
    const hasAcceptanceCriteria = acceptanceCriteriaScore > 0;

    const hasPreconditions = /precondition|prerequisite|before|assume|requires|depends|must\s+have/i.test(content);
    const hasActor = /as\s+(a|an)\s+[a-z\s]+,?\s+i\s+want|user|admin|doctor|nurse|patient|clinician|physician|practitioner|administrator|staff/i.test(content);
    const hasValue = /so\s+that|in\s+order\s+to|to\s+enable|to\s+allow|to\s+ensure|to\s+improve|to\s+help|benefit|value|purpose/i.test(content);
    const hasHealthcareValue = /safety|compliance|hipaa|popia|patient\s+care|clinical|quality|efficiency|workflow|diagnosis|treatment|medical|healthcare/i.test(content);
    const hasTestCriteria = /test|verify|validate|assert|check|measure|ensure|confirm|should\s+be|must\s+be/i.test(content);
    const hasTechDetails = /api|database|interface|security|performance|scale|system|integration|ehr|emr|ui|backend|frontend/i.test(content);
    const hasHealthcareContext = /patient|doctor|nurse|medical|hospital|clinic|prescription|diagnosis|treatment|health|clinical|practitioner|pharmacy|lab/i.test(content);

    // Scoring based on healthcare user story quality criteria (each out of 20)
    const clarityScore = hasActor && hasValue && hasHealthcareContext ? 18 : hasActor && hasValue ? 15 : hasActor ? 12 : 8;
    const completenessScore = Math.min(20, (acceptanceCriteriaScore * 0.7) + (hasPreconditions ? 6 : 0));
    const businessValueScore = hasHealthcareValue && hasValue ? 18 : hasValue ? 14 : hasHealthcareContext ? 12 : 8;
    const testabilityScore = Math.min(20, (acceptanceCriteriaScore * 0.6) + (hasTestCriteria ? 8 : 0));
    const technicalFeasibilityScore = hasTechDetails && hasHealthcareContext ? 16 : hasTechDetails ? 13 : hasHealthcareContext ? 12 : 10;

    const specificityScore = clarityScore; // Using clarity as proxy for specificity
    const structureScore = hasActor && hasValue ? 18 : hasActor ? 12 : 8;
    
    const totalScore = clarityScore + completenessScore + acceptanceCriteriaScore + specificityScore + structureScore + businessValueScore + testabilityScore + technicalFeasibilityScore;

    return {
      clarity: {
        score: clarityScore,
        description: hasActor && hasValue && hasHealthcareContext
          ? 'The story is clear with well-defined healthcare actor and value proposition.'
          : hasActor && hasValue
          ? 'The story is clear but could better articulate healthcare-specific value.'
          : 'The story lacks clarity in actor definition or value proposition.',
      },
      completeness: {
        score: completenessScore,
        description: acceptanceCriteriaScore >= 16 && hasPreconditions
          ? 'Excellent - has structured acceptance criteria and clear preconditions.'
          : acceptanceCriteriaScore >= 12
          ? 'Good acceptance criteria present but could add more preconditions.'
          : acceptanceCriteriaScore > 0
          ? 'Some testable conditions found but needs formal acceptance criteria in Given/When/Then format.'
          : 'Missing acceptance criteria - add explicit Given/When/Then scenarios.',
      },
      acceptanceCriteria: {
        score: acceptanceCriteriaScore,
        description: hasExplicitAcceptanceCriteria
          ? 'Excellent - has explicit acceptance criteria headers and structured scenarios.'
          : hasGivenWhenThen
          ? 'Good - has Given/When/Then format but could use "Acceptance Criteria" headers.'
          : hasStructuredCriteria
          ? 'Has structured criteria with action words but needs Given/When/Then format.'
          : hasBulletPoints
          ? 'Has bullet points that could be converted to formal acceptance criteria.'
          : hasTestableConditions
          ? 'Has testable conditions but needs formal Given/When/Then scenarios.'
          : 'Missing acceptance criteria - add explicit Given/When/Then scenarios.',
      },
      specificity: {
        score: clarityScore, // Using clarity score as proxy for specificity
        description: hasActor && hasHealthcareContext
          ? 'Story is specific with clear healthcare context and defined actors.'
          : hasActor
          ? 'Story has defined actors but could be more specific about healthcare context.'
          : 'Story lacks specificity in actors and healthcare context.',
      },
      structure: {
        score: hasActor && hasValue ? 18 : hasActor ? 12 : 8,
        description: hasActor && hasValue
          ? 'Well-structured with clear As a/I want/So that format.'
          : hasActor
          ? 'Has actor definition but missing clear value proposition.'
          : 'Poor structure - missing standard user story format.',
      },
      businessValueAlignment: {
        score: businessValueScore,
        description: hasHealthcareValue && hasValue
          ? 'Strong healthcare value alignment with clear safety, compliance, or efficiency benefits.'
          : hasValue
          ? 'Has business value but could better emphasize healthcare-specific benefits.'
          : 'Business value and healthcare impact need clarification.',
      },
      testability: {
        score: testabilityScore,
        description: acceptanceCriteriaScore >= 16 && hasTestCriteria
          ? 'Excellent - has structured acceptance criteria with clear testable conditions.'
          : acceptanceCriteriaScore >= 12
          ? 'Good testability with some acceptance criteria but could be more specific.'
          : hasTestCriteria
          ? 'Has testable elements but needs formal acceptance criteria structure.'
          : 'Low testability - needs clear Given/When/Then acceptance criteria.',
      },
      technicalFeasibility: {
        score: technicalFeasibilityScore,
        description: hasTechDetails && hasHealthcareContext
          ? 'Technically feasible with appropriate healthcare system considerations.'
          : hasTechDetails
          ? 'Appears technically feasible but could specify healthcare constraints.'
          : 'Technical implementation details need clarification.',
      },
      overallScore: totalScore,
      grade: this.calculateGrade(totalScore),
      improvementAreas: [
        !hasAcceptanceCriteria && 'Add explicit acceptance criteria with Given/When/Then format',
        !hasPreconditions && 'Specify preconditions and healthcare workflow assumptions',
        !hasHealthcareValue && 'Emphasize healthcare value (safety, compliance, efficiency)',
        !(hasActor && hasValue) && 'Follow standard user story structure (As a [healthcare role] I want [feature] so that [healthcare benefit])',
        !hasTestCriteria && 'Include testable criteria and validation requirements',
        !hasTechDetails && 'Add technical feasibility and healthcare system integration details'
      ].filter(Boolean) as string[],
      recommendations: [
        'Use healthcare-specific roles (doctor, nurse, patient, administrator)',
        'Emphasize compliance requirements (HIPAA, HL7, clinical standards)',
        'Include patient safety and care quality considerations',
        'Specify integration with existing healthcare systems (EHR, EMR, PACS)',
        'Add acceptance criteria with clinical workflow validation'
      ]
    };
  }
}
