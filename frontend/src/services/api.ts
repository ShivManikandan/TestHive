import { RetrievalResponse } from '../App';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const retrieveStories = async (
  query: string,
  vectorWeight: number,
  bm25Weight: number,
  enableQualityEvaluation: boolean = false,
  maxResults: number = 10
): Promise<RetrievalResponse> => {
  const response = await fetch(`${API_URL}/api/retrieve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      vector_weight: vectorWeight,
      bm25_weight: bm25Weight,
      enable_quality_evaluation: enableQualityEvaluation,
      max_results: maxResults,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const refineQuery = async (query: string): Promise<{ refinedQuery: string }> => {
  const response = await fetch(`${API_URL}/api/refine-query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const generateAcceptanceCriteria = async (
  userStory: string,
  includeInStory: boolean = false
): Promise<{ acceptanceCriteria: string; updatedStory?: string }> => {
  const response = await fetch(`${API_URL}/api/generate-acceptance-criteria`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      story: userStory,
      includeInStory,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  // Adapt backend response to frontend expected format
  return {
    acceptanceCriteria: result.acceptanceCriteria?.formatted || '',
    updatedStory: includeInStory ? result.enhancedStory : undefined
  };
};

export const analyzeStory = async (
  story: string,
  title?: string,
  vectorWeight: number = 0.7,
  bm25Weight: number = 0.3
): Promise<any> => {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      story,
      title,
      vector_weight: vectorWeight,
      bm25_weight: bm25Weight,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

