import dotenv from 'dotenv';
import { StoryQuality } from './qualityEvaluation';

dotenv.config();

export interface RefinedStory {
  storyId?: string;
  title?: string;
  originalStory: string;
  normalizedStory: string;
  refinedStory: string;
  content?: string; // Refined content
  acceptanceCriteria?: string;
  priority?: string;
  risk?: string;
  status?: string;
  improvementsMade: string[];
  refinementRationale: string;
}

export class StoryRefinementService {
  private mistralApiKey: string | undefined;
  private mongoClient: any = null;
  private dbName: string;
  private collectionName: string;

  constructor() {
    this.mistralApiKey = process.env.MISTRAL_API_KEY;
    this.dbName = process.env.MONGODB_DB || 'raguserstories';
    this.collectionName = process.env.MONGODB_COLLECTION || 'ragstories';
  }

  private async getMongoClient() {
    if (!this.mongoClient) {
      const { MongoClient } = await import('mongodb');
      let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userstories';
      uri = uri.replace(/^["']|["']$/g, '');
      this.mongoClient = new MongoClient(uri);
      await this.mongoClient.connect();
    }
    return this.mongoClient;
  }

  /**
   * Refine a user story based on quality evaluation results
   */
  async refineStory(
    originalStory: string,
    normalizedStory: string,
    qualityEvaluation: StoryQuality,
    title?: string,
    storyId?: string
  ): Promise<RefinedStory> {
    if (!this.mistralApiKey) {
      return await this.generateMockRefinedStory(originalStory, normalizedStory, qualityEvaluation, title, storyId);
    }

    try {
      const prompt = this.buildRefinementPrompt(originalStory, normalizedStory, qualityEvaluation, title);

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.mistralApiKey}`,
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_CHAT_MODEL || 'mistral-small-latest',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json() as { choices: Array<{ message: { content: string } }> };
        if (data.choices?.[0]?.message) {
          const content = data.choices[0].message.content.trim();
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const refinedData = JSON.parse(jsonMatch[0]);
            return await this.validateRefinedStory(originalStory, normalizedStory, refinedData, title, storyId);
          }
        }
      }
    } catch (error) {
      console.warn('Mistral AI story refinement failed, using fallback:', error);
    }

    return await this.generateMockRefinedStory(originalStory, normalizedStory, qualityEvaluation, title, storyId);
  }

  private buildRefinementPrompt(
    originalStory: string,
    normalizedStory: string,
    qualityEvaluation: StoryQuality,
    title?: string
  ): string {
    const improvementAreas = qualityEvaluation.improvementAreas.join(', ');
    
    return `You are a Senior Business Analyst with expertise in user story refinement and requirements engineering.

CRITICAL INSTRUCTION: You MUST preserve the original intent, context, and subject matter of the user's story. DO NOT create a completely different scenario or example. Your job is to IMPROVE what the user provided, not replace it.

Original Story Title: "${title || 'User Story'}"
Original Story: "${originalStory}"
Normalized Story: "${normalizedStory}"

Quality Evaluation Results:
- Clarity: ${qualityEvaluation.clarity.score}/20 - ${qualityEvaluation.clarity.description}
- Completeness: ${qualityEvaluation.completeness.score}/20 - ${qualityEvaluation.completeness.description}
- Business Value Alignment: ${qualityEvaluation.businessValueAlignment.score}/20 - ${qualityEvaluation.businessValueAlignment.description}
- Testability: ${qualityEvaluation.testability.score}/20 - ${qualityEvaluation.testability.description}
- Technical Feasibility: ${qualityEvaluation.technicalFeasibility.score}/20 - ${qualityEvaluation.technicalFeasibility.description}
Overall Score: ${qualityEvaluation.overallScore}/160

Key Areas for Improvement: ${improvementAreas}

YOUR TASK: Refine the EXACT story provided above by:
1. KEEPING the original subject matter, context, and intent
2. Converting it to proper user story format IF it's not already: "As a [role], I want [functionality] so that [benefit]"
3. If the original is vague or incomplete, EXPAND on the SAME topic (don't invent a new one)
4. Add clear acceptance criteria related to the ORIGINAL content
5. Make it more specific and testable while staying true to the original intent

IMPORTANT RULES:
✓ DO preserve the original topic/subject/domain from the user's input
✓ DO expand and clarify what the user meant
✓ DO add structure and details that support the original intent
✗ DO NOT create a completely different scenario
✗ DO NOT change the domain unless the original implies it
✗ DO NOT use healthcare examples unless the original story is healthcare-related
✗ DO NOT invent new functionality that wasn't mentioned or implied

If the original story is informal or a question (like "Is X really Y?"), interpret what the user might want to achieve and create a story around THAT specific topic.

Return your response in JSON format with:
- 'refinedStory': string (the improved user story based on the ORIGINAL content)
- 'improvementsMade': string[] (list of specific improvements you made)
- 'refinementRationale': string (explanation of how you preserved the original while improving it)

Return ONLY valid JSON, no additional text.`;
  }

  private async validateRefinedStory(
    originalStory: string,
    normalizedStory: string,
    refinedData: any,
    title?: string,
    storyId?: string
  ): Promise<RefinedStory> {
    const refinedStoryText = refinedData.refinedStory || this.createBasicRefinedStory(originalStory);
    const extractedData = this.extractMetadataFromRefinedStory(refinedStoryText);
    
    // Generate unique story ID if not provided
    let finalStoryId = storyId;
    if (!finalStoryId) {
      const mongoClient = await this.getMongoClient();
      finalStoryId = await this.generateUniqueStoryId(mongoClient, this.dbName, this.collectionName);
    }
    
    return {
      storyId: finalStoryId,
      title: title || 'Healthcare User Story',
      originalStory,
      normalizedStory,
      refinedStory: refinedStoryText,
      content: extractedData.content,
      acceptanceCriteria: extractedData.acceptanceCriteria,
      priority: extractedData.priority || 'P1',
      risk: extractedData.risk || 'High',
      status: extractedData.status || 'To Do',
      improvementsMade: Array.isArray(refinedData.improvementsMade) 
        ? refinedData.improvementsMade 
        : ['Applied basic refinement structure'],
      refinementRationale: refinedData.refinementRationale || 'Applied healthcare user story best practices'
    };
  }

  private async generateUniqueStoryId(mongoClient: any, dbName: string, collectionName: string): Promise<string> {
    const prefix = 'HC';
    const collection = mongoClient.db(dbName).collection(collectionName);
    
    // Get all existing story IDs with HC- prefix
    const existingStories = await collection.find({}, { projection: { storyId: 1, story_id: 1 } }).toArray();
    
    let maxNumber = 0;
    
    existingStories.forEach((story: any) => {
      const id = story.storyId || story.story_id;
      if (id && typeof id === 'string') {
        // Extract number from HC-XXX format
        const match = id.match(/^HC-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    });
    
    // Generate next sequential number
    const nextNumber = maxNumber + 1;
    const storyId = `${prefix}-${nextNumber}`;
    
    console.log(`Generated sequential story ID: ${storyId} (highest existing: HC-${maxNumber})`);
    return storyId;
  }

  private extractMetadataFromRefinedStory(refinedStory: string): {
    content: string;
    acceptanceCriteria: string;
    priority: string;
    risk: string;
    status: string;
  } {
    // Split the story into main content and acceptance criteria
    const acMatch = refinedStory.match(/Acceptance Criteria[:\s]*([\s\S]*)/i);
    let content = refinedStory;
    let acceptanceCriteria = '';
    
    if (acMatch) {
      // Extract the part before acceptance criteria as content
      content = refinedStory.substring(0, acMatch.index).trim();
      acceptanceCriteria = acMatch[1].trim();
    }
    
    // Determine priority based on keywords
    let priority = 'P1';
    if (refinedStory.match(/critical|urgent|immediate|high priority/i)) {
      priority = 'P1';
    } else if (refinedStory.match(/important|medium priority/i)) {
      priority = 'P2';
    } else if (refinedStory.match(/low priority|optional|nice to have/i)) {
      priority = 'P3';
    }
    
    // Determine risk based on keywords
    let risk = 'High';
    if (refinedStory.match(/critical|high risk|compliance|hipaa|safety/i)) {
      risk = 'Critical';
    } else if (refinedStory.match(/complex|integration|system/i)) {
      risk = 'High';
    } else if (refinedStory.match(/moderate|medium/i)) {
      risk = 'Medium';
    } else if (refinedStory.match(/simple|basic|low risk/i)) {
      risk = 'Low';
    }
    
    // Default status
    const status = 'To Do';
    
    return {
      content,
      acceptanceCriteria,
      priority,
      risk,
      status
    };
  }

  private async generateMockRefinedStory(
    originalStory: string,
    normalizedStory: string,
    qualityEvaluation: StoryQuality,
    title?: string,
    storyId?: string
  ): Promise<RefinedStory> {
    // Generate a refined story based on quality evaluation
    const refinedStoryText = this.createBasicRefinedStory(normalizedStory);
    const extractedData = this.extractMetadataFromRefinedStory(refinedStoryText);
    
    const improvementsMade: string[] = [];
    
    if (qualityEvaluation.clarity.score < 15) {
      improvementsMade.push('Clarified actor role and value proposition');
    }
    
    if (qualityEvaluation.completeness.score < 15) {
      improvementsMade.push('Added acceptance criteria and preconditions');
    }
    
    if (qualityEvaluation.businessValueAlignment.score < 15) {
      improvementsMade.push('Enhanced healthcare-specific business value');
    }
    
    if (qualityEvaluation.testability.score < 15) {
      improvementsMade.push('Added testable acceptance criteria');
    }
    
    if (qualityEvaluation.technicalFeasibility.score < 15) {
      improvementsMade.push('Included technical implementation details');
    }

    // Generate unique story ID if not provided
    let finalStoryId = storyId;
    if (!finalStoryId) {
      const mongoClient = await this.getMongoClient();
      finalStoryId = await this.generateUniqueStoryId(mongoClient, this.dbName, this.collectionName);
    }

    return {
      storyId: finalStoryId,
      title: title || 'Healthcare User Story',
      originalStory,
      normalizedStory,
      refinedStory: refinedStoryText,
      content: extractedData.content,
      acceptanceCriteria: extractedData.acceptanceCriteria,
      priority: extractedData.priority,
      risk: extractedData.risk,
      status: extractedData.status,
      improvementsMade: improvementsMade.length > 0 ? improvementsMade : ['Applied structural improvements'],
      refinementRationale: 'Enhanced the user story to follow healthcare domain best practices, improved clarity of healthcare roles, emphasized patient safety and compliance value, and added testable acceptance criteria for better QA validation.'
    };
  }

  private createBasicRefinedStory(story: string): string {
    // Extract key components and restructure while preserving original context
    const hasActor = /as a(n)?\s+([^,]+)/i.exec(story);
    const hasWant = /i want\s+to\s+([^.]+)/i.exec(story) || /i need\s+to\s+([^.]+)/i.exec(story);
    const hasValue = /so that\s+([^.]+)/i.exec(story) || /in order to\s+([^.]+)/i.exec(story);
    
    let actor = hasActor ? hasActor[2].trim() : 'user';
    let want = hasWant ? hasWant[1].trim() : story.trim();
    let value = hasValue ? hasValue[1].trim() : 'achieve the desired outcome';

    // Try to extract meaningful context from the original story
    // Only add domain-specific context if clearly implied
    if (story.match(/doctor|nurse|patient|physician|clinician|health|medical|ehr|hospital/i)) {
      // Healthcare context detected
      if (!actor.match(/doctor|nurse|patient|physician|clinician|administrator|technician|pharmacist/i)) {
        if (story.match(/prescription|medication|drug/i)) actor = 'doctor';
        else if (story.match(/patient care|bedside|vital signs/i)) actor = 'nurse';
        else if (story.match(/appointment|portal|record access/i)) actor = 'patient';
        else actor = 'healthcare professional';
      }
      if (!value.match(/patient|safety|compliance|care|health|clinical/i)) {
        value += ' and improve patient care';
      }
    }

    let refinedStory = `As a ${actor}, I want to ${want} so that ${value}.`;

    // Add basic acceptance criteria based on the content
    refinedStory += `\n\nAcceptance Criteria:\n`;
    refinedStory += `- Given the appropriate context is established\n`;
    refinedStory += `- When the specified action is performed\n`;
    refinedStory += `- Then the expected outcome is achieved\n`;
    refinedStory += `- And the result meets quality standards`;

    return refinedStory;
  }
}