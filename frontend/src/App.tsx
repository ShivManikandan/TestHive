import { useState } from 'react';
import Header from './components/Header';
import QueryPanel from './components/QueryPanel';
import ResultsPanel from './components/ResultsPanel';
import ConfigPanel from './components/ConfigPanel';
import { retrieveStories, generateAcceptanceCriteria, analyzeStory } from './services/api';

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

export interface RetrievalResult {
  id: string;
  title: string;
  content: string;
  hybrid_score: number;
  vector_score: number;
  bm25_score: number;
  priority?: string;
  quality?: StoryQuality;
  // Additional MongoDB fields
  acceptanceCriteria?: string;
  risk?: string;
  status?: string;
  statusCategory?: string;
  projectName?: string;
  parentSummary?: string;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface RetrievalResponse {
  results: RetrievalResult[];
  total: number;
  query: string;
  weights: {
    vector: number;
    bm25: number;
  };
}

function App() {
  const [query, setQuery] = useState('');
  const [vectorWeight, setVectorWeight] = useState(0.7);
  const [bm25Weight, setBM25Weight] = useState(0.3);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [enableQualityEvaluation, setEnableQualityEvaluation] = useState(false);
  const [maxResults, setMaxResults] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [generatingCriteria, setGeneratingCriteria] = useState(false);
  
  // Enhanced story state
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedStory, setEnhancedStory] = useState<{
    storyId?: string;
    title?: string;
    original: string;
    normalized: string;
    refined: string;
    content?: string;
    acceptanceCriteria?: string;
    priority?: string;
    risk?: string;
    status?: string;
    qualityScore: number;
    qualityGrade: string;
    scoreBreakdown?: Array<{ name: string; score: number; maxScore: number }>;
  } | null>(null);

  const handleEnhanceStory = async () => {
    if (!query.trim()) {
      setError('Please enter a user story to enhance');
      return;
    }

    setEnhancing(true);
    setError(null);

    try {
      // Call the analyze API to get comprehensive analysis including related stories
      const data = await analyzeStory(query, 'Story Enhancement', vectorWeight, bm25Weight);
      
      console.log('📊 Analyze API Response:', data);
      
      // Extract refined story safely
      let refinedStoryText = query;
      if (data.refinedStory) {
        if (typeof data.refinedStory === 'string') {
          refinedStoryText = data.refinedStory;
        } else if (data.refinedStory.refinedStory?.story) {
          refinedStoryText = data.refinedStory.refinedStory.story;
        } else if (data.refinedStory.story) {
          refinedStoryText = data.refinedStory.story;
        }
      }
      
      // Calculate quality score breakdown
      const qualityParams = data.qualityEvaluation?.parameters || [];
      const scoreBreakdown = qualityParams.map((param: any) => ({
        name: param.parameter,
        score: param.score,
        maxScore: param.maxScore || 20
      }));
      
      // Set the enhanced story data with all metadata
      setEnhancedStory({
        storyId: data.refinedStory?.storyId,
        title: data.refinedStory?.title,
        original: query,
        normalized: data.normalizedStory || query,
        refined: refinedStoryText,
        content: data.refinedStory?.content,
        acceptanceCriteria: data.refinedStory?.acceptanceCriteria,
        priority: data.refinedStory?.priority,
        risk: data.refinedStory?.risk,
        status: data.refinedStory?.status,
        qualityScore: parseFloat(data.overallScore?.score || '0'),
        qualityGrade: data.overallScore?.grade || 'N/A',
        scoreBreakdown: scoreBreakdown
      });

      // Also set the related stories in the results
      console.log('🔍 Related stories check:', {
        hasRelatedStories: !!data.relatedStories,
        isArray: Array.isArray(data.relatedStories),
        length: data.relatedStories?.length,
        firstStory: data.relatedStories?.[0]
      });
      
      if (data.relatedStories && Array.isArray(data.relatedStories) && data.relatedStories.length > 0) {
        console.log('✅ Setting related stories from analysis:', data.relatedStories.length);
        setResults(data.relatedStories);
      } else {
        console.log('⚠️ No related stories found in analysis response');
        setResults([]);
      }
    } catch (err) {
      console.error('❌ Enhancement error:', err);
      setError(err instanceof Error ? err.message : 'Failed to enhance story');
      setResults([]);
    } finally {
      setEnhancing(false);
    }
  };

  const handleGenerateAcceptanceCriteria = async (includeInStory: boolean) => {
    if (!query.trim()) {
      setError('Please enter a user story first');
      return;
    }

    setGeneratingCriteria(true);
    setError(null);

    try {
      const response = await generateAcceptanceCriteria(query, includeInStory);
      
      if (includeInStory && response.updatedStory) {
        setQuery(response.updatedStory);
        // Show success message
        setError(null);
        console.log('User story updated with acceptance criteria');
      } else {
        // For viewing separately, create a formatted dialog
        const formattedCriteria = response.acceptanceCriteria
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n');
          
        // Create a more user-friendly display
        const message = `🎯 Generated Acceptance Criteria\n\n${formattedCriteria}\n\n💡 Tip: Use "Add to Story" to automatically include these criteria in your user story.`;
        
        alert(message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate acceptance criteria');
    } finally {
      setGeneratingCriteria(false);
    }
  };

  const handleReset = () => {
    // Reset all form fields and state
    setQuery('');
    setResults([]);
    setError(null);
    setVectorWeight(0.7);
    setBM25Weight(0.3);
    setMaxResults(10);
    setEnableQualityEvaluation(false);
    // Clear any ongoing operations
    setLoading(false);
    setGeneratingCriteria(false);
  };

  const handleRetrieve = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await retrieveStories(query, vectorWeight, bm25Weight, enableQualityEvaluation, maxResults);
      console.log('Retrieved results:', response.results.length);
      console.log('Results with quality:', response.results.filter(r => r.quality).length);
      console.log('Sample result:', response.results[0] ? {
        id: response.results[0].id,
        title: response.results[0].title,
        hasQuality: !!response.results[0].quality,
        qualityScore: response.results[0].quality?.overallScore
      } : 'No results');
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve stories');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200">
      <Header />
      
      {/* Sticky Control Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-amber-200/50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <QueryPanel
            query={query}
            setQuery={setQuery}
            vectorWeight={vectorWeight}
            setVectorWeight={setVectorWeight}
            bm25Weight={bm25Weight}
            setBM25Weight={setBM25Weight}
            onRetrieve={handleRetrieve}
            onEnhance={handleEnhanceStory}
            loading={loading}
            enhancing={enhancing}
            enableQualityEvaluation={enableQualityEvaluation}
            setEnableQualityEvaluation={setEnableQualityEvaluation}
            maxResults={maxResults}
            setMaxResults={setMaxResults}
            onGenerateAcceptanceCriteria={handleGenerateAcceptanceCriteria}
            generatingCriteria={generatingCriteria}
            onReset={handleReset}
            isCompact={true}
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-amber-200/50 p-6">
              <ResultsPanel
                results={results}
                loading={loading}
                error={error}
                enhancedStory={enhancedStory}
                vectorWeight={vectorWeight}
                bm25Weight={bm25Weight}
              />
            </div>
          </div>

          {/* Sidebar - Configuration */}
          <div className="xl:col-span-1">
            <div className="sticky top-32 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-amber-200/50 p-6">
              <ConfigPanel
                vectorWeight={vectorWeight}
                bm25Weight={bm25Weight}
                totalResults={results.length}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

 
