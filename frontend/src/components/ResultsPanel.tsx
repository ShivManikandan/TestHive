import { RetrievalResult } from '../App';
import { TrendingUp, FileText, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react';
import StoryQualityPanel from './StoryQualityPanel';
import { useState } from 'react';

interface ResultsPanelProps {
  results: RetrievalResult[];
  loading: boolean;
  error: string | null;
  enhancedStory?: {
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
  } | null;
  vectorWeight?: number;
  bm25Weight?: number;
}

const ResultsPanel = ({ results, loading, error, enhancedStory, vectorWeight = 0.7, bm25Weight = 0.3 }: ResultsPanelProps) => {
  const [loadingQuality, setLoadingQuality] = useState<{ [key: string]: boolean }>({});
  const [qualityData, setQualityData] = useState<{ [key: string]: any }>({});
  const [analysisError, setAnalysisError] = useState<{ [key: string]: string }>({});

  // Debug logging
  console.log('ResultsPanel render:', {
    resultsCount: results?.length || 0,
    loading,
    error,
    hasEnhancedStory: !!enhancedStory,
    results: results
  });

  const analyzeStoryQuality = async (result: RetrievalResult) => {
    setLoadingQuality(prev => ({ ...prev, [result.id]: true }));
    setAnalysisError(prev => ({ ...prev, [result.id]: '' }));
    
    try {
      const response = await fetch('http://localhost:4000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: result.content, title: result.title }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Analyze API Response:', data);
        console.log('🔍 Overall Score Object:', data.overallScore);
        console.log('🔍 Overall Score Value:', data.overallScore?.score);
        
        let qualityDataObj = null;
        
        if (data.qualityEvaluation) {
          const params = data.qualityEvaluation.parameters;
          if (params && Array.isArray(params)) {
            const overallScoreValue = parseFloat(data.overallScore?.score);
            console.log('🔍 Parsed Overall Score:', overallScoreValue);
            
            qualityDataObj = {
              clarity: { score: params.find((p: any) => p.parameter === 'Clarity')?.score || 0, description: params.find((p: any) => p.parameter === 'Clarity')?.evaluation || '' },
              completeness: { score: params.find((p: any) => p.parameter === 'Completeness')?.score || 0, description: params.find((p: any) => p.parameter === 'Completeness')?.evaluation || '' },
              acceptanceCriteria: { score: params.find((p: any) => p.parameter === 'Acceptance Criteria')?.score || 0, description: params.find((p: any) => p.parameter === 'Acceptance Criteria')?.evaluation || '' },
              specificity: { score: params.find((p: any) => p.parameter === 'Specificity')?.score || 0, description: params.find((p: any) => p.parameter === 'Specificity')?.evaluation || '' },
              structure: { score: params.find((p: any) => p.parameter === 'Structure')?.score || 0, description: params.find((p: any) => p.parameter === 'Structure')?.evaluation || '' },
              businessValueAlignment: { score: params.find((p: any) => p.parameter === 'Business Value Alignment')?.score || 0, description: params.find((p: any) => p.parameter === 'Business Value Alignment')?.evaluation || '' },
              testability: { score: params.find((p: any) => p.parameter === 'Testability')?.score || 0, description: params.find((p: any) => p.parameter === 'Testability')?.evaluation || '' },
              technicalFeasibility: { score: params.find((p: any) => p.parameter === 'Technical Feasibility')?.score || 0, description: params.find((p: any) => p.parameter === 'Technical Feasibility')?.evaluation || '' },
              overallScore: overallScoreValue,
              grade: data.overallScore?.grade || 'C',
              improvementAreas: data.improvementRecommendations?.specificRecommendations || [],
              recommendations: data.improvementRecommendations?.recommendedActions || []
            };
          }
        } else if (data.clarity) {
          qualityDataObj = data;
        }

        if (qualityDataObj) {
          console.log('🔍 Final Quality Data Object:', qualityDataObj);
          setQualityData(prev => ({ ...prev, [result.id]: qualityDataObj }));
        }
      } else {
        await response.json();
        setAnalysisError(prev => ({ ...prev, [result.id]: `Failed: ${response.status}` }));
      }
    } catch (error) {
      setAnalysisError(prev => ({ ...prev, [result.id]: error instanceof Error ? error.message : 'Unknown error' }));
    } finally {
      setLoadingQuality(prev => ({ ...prev, [result.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Results</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Retrieving user stories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Results</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6 text-red-700">
            <p className="font-semibold">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Results</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No user stories found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Results</h2>
        <span className="text-base font-semibold text-gray-600 bg-amber-100 px-3 py-1.5 rounded-lg">
          {results.length} {results.length === 1 ? 'story' : 'stories'} found
        </span>
      </div>

      {/* Enhanced Story Section */}
      {enhancedStory && (
        <div className="mb-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-amber-900">Enhanced Story</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-amber-700">Quality:</span>
              <span className="bg-amber-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                {enhancedStory.qualityScore}/10 ({enhancedStory.qualityGrade})
              </span>
            </div>
          </div>

          {/* Quality Score Breakdown */}
          {enhancedStory.scoreBreakdown && enhancedStory.scoreBreakdown.length > 0 && (
            <div className="mb-3 p-3 bg-white/90 rounded-lg border border-amber-200">
              <h4 className="text-sm font-bold text-amber-900 mb-2">📊 Score Breakdown (8 Criteria)</h4>
              <div className="grid grid-cols-2 gap-2">
                {enhancedStory.scoreBreakdown.map((item, idx) => {
                  const percentage = (item.score / item.maxScore) * 100;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 font-medium truncate" title={item.name}>
                        {item.name}:
                      </span>
                      <span className={`font-bold ml-2 ${
                        percentage >= 80 ? 'text-green-600' :
                        percentage >= 60 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {item.score}/{item.maxScore}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-amber-200 text-xs text-gray-600">
                <span className="font-semibold">Total: </span>
                {enhancedStory.scoreBreakdown.reduce((sum, item) => sum + item.score, 0)}/
                {enhancedStory.scoreBreakdown.reduce((sum, item) => sum + item.maxScore, 0)} = {' '}
                <span className="font-bold text-amber-700">{enhancedStory.qualityScore}/10</span>
              </div>
            </div>
          )}

          {/* Metadata Section for Refined Story */}
          <div className="mb-3 p-3 bg-white/80 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {enhancedStory.storyId && (
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded border border-amber-300">
                    {enhancedStory.storyId}
                  </span>
                )}
                {enhancedStory.title && (
                  <span className="text-sm font-bold text-gray-800">{enhancedStory.title}</span>
                )}
              </div>
            </div>
            
            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2">
              {enhancedStory.priority && (
                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Priority: {enhancedStory.priority}
                </span>
              )}
              {enhancedStory.risk && (
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  enhancedStory.risk === 'Critical' ? 'bg-red-100 text-red-800' :
                  enhancedStory.risk === 'High' ? 'bg-orange-100 text-orange-800' :
                  enhancedStory.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Risk: {enhancedStory.risk}
                </span>
              )}
              {enhancedStory.status && (
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  enhancedStory.status === 'Done' ? 'bg-green-100 text-green-800' :
                  enhancedStory.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Status: {enhancedStory.status}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Original Story */}
            <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <h4 className="font-semibold text-gray-700 text-sm">Original Story</h4>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{enhancedStory.original}</p>
            </div>

            {/* Refined Story */}
            <div className="bg-white/90 rounded-lg p-3 border-2 border-amber-300 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-amber-900 text-sm">✨ Refined Version (Improved Wording)</h4>
              </div>
              <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap leading-relaxed mb-3">
                {enhancedStory.content || enhancedStory.refined}
              </p>
              
              {/* Acceptance Criteria for Refined Story */}
              {enhancedStory.acceptanceCriteria && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-900 mb-2">📋 Acceptance Criteria:</h4>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{enhancedStory.acceptanceCriteria}</pre>
                </div>
              )}
            </div>

            {/* Normalized Story */}
            <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-blue-700 text-sm">Normalized Version</h4>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{enhancedStory.normalized}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {results.map((result, index) => {
          const hasQuality = result.quality || qualityData[result.id];
          const isAnalyzing = loadingQuality[result.id];
          
          return (
            <div key={result.id} className="bg-gradient-to-br from-white to-amber-50/30 border-2 border-amber-200/50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200">
              {/* Compact Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{result.title}</h3>
                    <span className="text-xs font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded border">{result.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-amber-600 flex-shrink-0">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-lg font-bold">{(result.hybrid_score * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Metadata badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {result.priority && (
                  <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Priority: {result.priority}
                  </span>
                )}
                {result.risk && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    result.risk === 'Critical' ? 'bg-red-100 text-red-800' :
                    result.risk === 'High' ? 'bg-orange-100 text-orange-800' :
                    result.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Risk: {result.risk}
                  </span>
                )}
                {result.statusCategory && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    result.statusCategory === 'Done' ? 'bg-green-100 text-green-800' :
                    result.statusCategory === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    Status: {result.statusCategory}
                  </span>
                )}
                {result.projectName && (
                  <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {result.projectName}
                  </span>
                )}
              </div>

              {/* Collapsible Content */}
              <details className="group">
                <summary className="cursor-pointer text-gray-700 text-sm mb-3 leading-relaxed line-clamp-2 hover:text-gray-900 transition-colors">
                  {result.content.length > 150 ? `${result.content.substring(0, 150)}...` : result.content}
                  <span className="ml-2 text-blue-600 font-semibold group-open:hidden">Show more</span>
                  <span className="ml-2 text-blue-600 font-semibold hidden group-open:inline">Show less</span>
                </summary>
                <div className="pl-4 border-l-2 border-blue-200 mb-4">
                  <p className="text-gray-700 text-sm mb-2 leading-relaxed">{result.content}</p>
                  
                  {result.acceptanceCriteria && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-xs font-bold text-blue-900 mb-2">Acceptance Criteria:</h4>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">{result.acceptanceCriteria}</pre>
                    </div>
                  )}

                  {(result.createdDate || result.lastModifiedDate) && (
                    <div className="mt-3 text-xs text-gray-500 flex gap-4">
                      {result.createdDate && <span>Created: {result.createdDate}</span>}
                      {result.lastModifiedDate && <span>Modified: {result.lastModifiedDate}</span>}
                    </div>
                  )}
                </div>
              </details>
              {/* Compact Score Display */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold mb-3">
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                  <span className="text-gray-600">Vector:</span>
                  <span className="text-blue-700">{(result.vector_score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                  <span className="text-gray-600">BM25:</span>
                  <span className="text-green-700">{(result.bm25_score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded">
                  <span className="text-gray-600">Hybrid:</span>
                  <span className="text-purple-700 font-bold">{(result.hybrid_score * 100).toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  ({(result.vector_score * 100).toFixed(1)}% × {(vectorWeight * 100).toFixed(0)}%) + ({(result.bm25_score * 100).toFixed(1)}% × {(bm25Weight * 100).toFixed(0)}%)
                </div>
              </div>

              {/* Quality Analysis Actions */}
              <div className="flex items-center justify-between">
                {!hasQuality && !isAnalyzing && (
                  <button
                    onClick={() => analyzeStoryQuality(result)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors duration-200 flex items-center gap-1"
                  >
                    <BarChart3 className="w-3 h-3" />
                    Analyze Quality
                  </button>
                )}
                
                {hasQuality && !isAnalyzing && (
                  <button
                    onClick={() => analyzeStoryQuality(result)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors duration-200 flex items-center gap-1"
                  >
                    <BarChart3 className="w-3 h-3" />
                    Re-analyze
                  </button>
                )}
              </div>

              {isAnalyzing && (
                <div className="mt-2 flex items-center gap-2 text-xs text-blue-700">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing quality...</span>
                </div>
              )}
              
              {analysisError[result.id] && !isAnalyzing && (
                <div className="mt-2 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                  Error: {analysisError[result.id]}
                </div>
              )}
              
              {hasQuality && !isAnalyzing && (
                <div className="mt-3">
                  <StoryQualityPanel result={{ ...result, quality: hasQuality }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsPanel;
