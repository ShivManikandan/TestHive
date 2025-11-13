import { Request, Response } from 'express';
import { HybridRetrievalService } from '../services/hybridRetrieval';
import { StoryNormalizationService } from '../services/storyNormalization';

interface RetrieveRequest {
  query: string;
  vector_weight: number;
  bm25_weight: number;
  enable_quality_evaluation?: boolean;
  normalize_query?: boolean; // New option to apply healthcare normalization
  max_results?: number; // Maximum number of results to return
}

export const retrieveHandler = async (req: Request, res: Response) => {
  try {
    const { query, vector_weight, bm25_weight, enable_quality_evaluation, normalize_query, max_results } = req.body as RetrieveRequest;

    // Validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'Query is required and must be a non-empty string' 
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
    const normalizedVectorWeight = totalWeight > 0 ? vector_weight / totalWeight : 0.5;
    const normalizedBM25Weight = totalWeight > 0 ? bm25_weight / totalWeight : 0.5;

    // Normalize query if requested (apply healthcare terminology processing)
    let processedQuery = query.trim();
    if (normalize_query) {
      const normalizationService = new StoryNormalizationService();
      const normalizedQuery = normalizationService.normalizeStory(processedQuery);
      console.log('Query normalization:', {
        original: processedQuery,
        normalized: normalizedQuery
      });
      processedQuery = normalizedQuery;
    }

    // Set quality evaluation flag (from request or env default)
    const shouldEvaluateQuality = enable_quality_evaluation !== undefined 
      ? enable_quality_evaluation 
      : process.env.ENABLE_QUALITY_EVALUATION !== 'false';
    
    console.log('Retrieve request - Quality evaluation:', {
      requestValue: enable_quality_evaluation,
      envValue: process.env.ENABLE_QUALITY_EVALUATION,
      finalValue: shouldEvaluateQuality
    });
    
    // Temporarily set env for this request
    const originalEnvValue = process.env.ENABLE_QUALITY_EVALUATION;
    process.env.ENABLE_QUALITY_EVALUATION = shouldEvaluateQuality.toString();
    
    // Perform hybrid retrieval using LangChain (with fallback to legacy implementation)
    const retrievalService = new HybridRetrievalService();
    const maxResultsValue = max_results && max_results > 0 ? Math.min(max_results, 50) : 10; // Cap at 50
    
    console.log('Using HybridRetrievalService with LangChain integration');
    
    let results;
    try {
      // This now uses LangChain by default, with legacy fallback
      results = await retrievalService.retrieve(
        processedQuery,
        normalizedVectorWeight,
        normalizedBM25Weight,
        maxResultsValue
      );
    } catch (error: any) {
      // Handle rate limiting by disabling quality evaluation and retrying
      if (error.message?.includes('Rate limit') || error.message?.includes('Too Many Requests')) {
        console.warn('Rate limit hit, retrying without quality evaluation');
        process.env.ENABLE_QUALITY_EVALUATION = 'false';
        
        results = await retrievalService.retrieve(
          processedQuery,
          normalizedVectorWeight,
          normalizedBM25Weight,
          maxResultsValue
        );
      } else {
        throw error;
      }
    }
    
    console.log('Retrieved results:', results.length);
    console.log('Results with quality:', results.filter(r => r.quality).length);
    
    // Convert quality scores from 0-160 scale to 0-10 scale for consistency with analyze endpoint
    const processedResults = results.map(result => {
      if (result.quality && result.quality.overallScore) {
        return {
          ...result,
          quality: {
            ...result.quality,
            overallScore: parseFloat((result.quality.overallScore / 16).toFixed(1))
          }
        };
      }
      return result;
    });
    
    // Restore original env value
    if (originalEnvValue !== undefined) {
      process.env.ENABLE_QUALITY_EVALUATION = originalEnvValue;
    } else {
      delete process.env.ENABLE_QUALITY_EVALUATION;
    }

    res.json({
      results: processedResults,
      total: processedResults.length,
      query: processedQuery,
      originalQuery: query.trim(),
      weights: {
        vector: normalizedVectorWeight,
        bm25: normalizedBM25Weight
      }
    });
  } catch (error) {
    console.error('Retrieval error:', error);
    res.status(500).json({ 
      error: 'Retrieval failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

