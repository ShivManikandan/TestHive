import { Request, Response } from 'express';
import { QueryRefinementService } from '../services/queryRefinement';

interface RefineRequest {
  query: string;
}

export const refineHandler = async (req: Request, res: Response) => {
  try {
    const { query } = req.body as RefineRequest;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Query is required and must be a non-empty string',
      });
    }

    const refinementService = new QueryRefinementService();
    const refinedQuery = await refinementService.refineQuery(query.trim());

    res.json({ refinedQuery });
  } catch (error) {
    console.error('Query refinement error:', error);
    res.status(500).json({
      error: 'Refinement failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

