import { Request, Response } from 'express';
import { ComprehensiveStoryAnalysisService } from '../services/comprehensiveAnalysis';

interface AnalyzeStoryRequest {
  story: string;
  title?: string;
  vector_weight?: number;
  bm25_weight?: number;
}

export const analyzeStoryHandler = async (req: Request, res: Response) => {
  try {
    const { story, title, vector_weight = 0.7, bm25_weight = 0.3 } = req.body as AnalyzeStoryRequest;

    // Validation
    if (!story || typeof story !== 'string' || story.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'Story is required and must be a non-empty string' 
      });
    }

    if (typeof vector_weight !== 'number' || vector_weight < 0 || vector_weight > 1) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'vector_weight must be a number between 0 and 1' 
      });
    }

    if (typeof bm25_weight !== 'number' || bm25_weight < 0 || bm25_weight > 1) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'bm25_weight must be a number between 0 and 1' 
      });
    }

    // Normalize weights (ensure they sum to 1)
    const totalWeight = vector_weight + bm25_weight;
    const normalizedVectorWeight = totalWeight > 0 ? vector_weight / totalWeight : 0.7;
    const normalizedBM25Weight = totalWeight > 0 ? bm25_weight / totalWeight : 0.3;

    // Perform comprehensive analysis
    const analysisService = new ComprehensiveStoryAnalysisService();
    
    try {
      const result = await analysisService.analyzeStory(
        story.trim(),
        title?.trim(),
        normalizedVectorWeight,
        normalizedBM25Weight
      );

      // Format response according to prompt requirements
      const response = {
        // 1. The normalized version of the new user story
        normalizedStory: result.normalizedStory,
        
        // 2. The top 5–6 related or overlapping stories (ranked by hybrid score)
        relatedStories: result.relatedStories,
        
        // 3. A parameter-wise quality evaluation table (each /20)
        qualityEvaluation: {
          parameters: [
            {
              parameter: 'Clarity',
              description: 'Is it unambiguous and easy to understand?',
              score: result.qualityEvaluation.clarity.score,
              maxScore: 20,
              evaluation: result.qualityEvaluation.clarity.description
            },
            {
              parameter: 'Completeness', 
              description: 'Are acceptance criteria and preconditions defined?',
              score: result.qualityEvaluation.completeness.score,
              maxScore: 20,
              evaluation: result.qualityEvaluation.completeness.description
            },
            {
              parameter: 'Acceptance Criteria',
              description: 'Are there explicit Given/When/Then scenarios or testable conditions?',
              score: result.qualityEvaluation.acceptanceCriteria.score,
              maxScore: 20,
              evaluation: result.qualityEvaluation.acceptanceCriteria.description
            },
            {
              parameter: 'Specificity',
              description: 'Are requirements specific and well-defined?',
              score: result.qualityEvaluation.specificity.score,
              maxScore: 20,
              evaluation: result.qualityEvaluation.specificity.description
            },
            {
              parameter: 'Structure',
              description: 'Does it follow standard user story format (As a/I want/So that)?',
              score: result.qualityEvaluation.structure.score,
              maxScore: 20,
              evaluation: result.qualityEvaluation.structure.description
            },
            {
              parameter: 'Business Value Alignment',
              description: 'Does it address clear healthcare value (safety, compliance, efficiency)?',
              score: result.qualityEvaluation.businessValueAlignment.score,
              maxScore: 20,
              evaluation: result.qualityEvaluation.businessValueAlignment.description
            },
            {
              parameter: 'Testability',
              description: 'Can QA easily derive test cases?',
              score: result.qualityEvaluation.testability.score,
              maxScore: 20,
              evaluation: result.qualityEvaluation.testability.description
            },
            {
              parameter: 'Technical Feasibility',
              description: 'Is it implementable under typical healthcare constraints?',
              score: result.qualityEvaluation.technicalFeasibility.score,
              maxScore: 20,
              evaluation: result.qualityEvaluation.technicalFeasibility.description
            }
          ]
        },
        
        // 4. The overall story quality score (/10) - converted from 160
        overallScore: {
          score: (result.qualityEvaluation.overallScore / 16).toFixed(1),
          maxScore: 10,
          grade: result.qualityEvaluation.grade,
          interpretation: result.qualityEvaluation.overallScore >= 80 ? 'Excellent' :
                         result.qualityEvaluation.overallScore >= 70 ? 'Good' :
                         result.qualityEvaluation.overallScore >= 60 ? 'Satisfactory' :
                         result.qualityEvaluation.overallScore >= 50 ? 'Needs Improvement' : 'Poor'
        },
        
        // 5. Actionable improvement recommendations for weaker parameters
        improvementRecommendations: {
          priorityImprovements: result.summary.priorityImprovements,
          specificRecommendations: result.qualityEvaluation.improvementAreas,
          recommendedActions: result.summary.recommendedActions
        },
        
        // 6. A refined version of the user story with improved clarity and structure
        refinedStory: result.refinedStory,
        
        // Additional metadata
        analysis: {
          originalStory: result.originalStory,
          structureValidation: result.structureValidation,
          summary: result.summary,
          retrievalMetadata: result.retrievalMetadata
        }
      };

      res.json(response);
    } finally {
      await analysisService.close();
    }

  } catch (error) {
    console.error('Story analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};