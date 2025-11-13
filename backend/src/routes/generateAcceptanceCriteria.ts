import { Request, Response } from 'express';
import { AcceptanceCriteriaService } from '../services/acceptanceCriteriaService';

interface GenerateAcceptanceCriteriaRequest {
  story: string;
  title?: string;
  includeInStory?: boolean;
}

export const generateAcceptanceCriteriaHandler = async (req: Request, res: Response) => {
  try {
    const { story, title, includeInStory = false } = req.body as GenerateAcceptanceCriteriaRequest;

    // Validation
    if (!story || typeof story !== 'string' || story.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'Story is required and must be a non-empty string' 
      });
    }

    // Generate acceptance criteria
    const criteriaService = new AcceptanceCriteriaService();
    const result = await criteriaService.generateAcceptanceCriteria(story.trim(), title?.trim());

    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to generate acceptance criteria',
        message: result.error || 'Unknown error occurred'
      });
    }

    // Prepare response based on user preference
    let enhancedStory = story.trim();
    
    if (includeInStory) {
      // Add acceptance criteria to the story
      enhancedStory += "\n\n" + result.formattedCriteria;
    }

    res.json({
      success: true,
      originalStory: story.trim(),
      enhancedStory: enhancedStory,
      acceptanceCriteria: {
        scenarios: result.criteria,
        formatted: result.formattedCriteria
      },
      includeInStory: includeInStory,
      metadata: {
        scenarioCount: result.criteria.length,
        hasHealthcareContext: /patient|doctor|nurse|medical|hospital|clinic|prescription|diagnosis|treatment|health|clinical|practitioner|pharmacy|lab|hipaa|compliance/i.test(story),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Acceptance criteria generation error:', error);
    res.status(500).json({ 
      error: 'Generation failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};