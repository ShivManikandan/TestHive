import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface EnhancedStoryData {
  normalizedStory: string;
  refinedStory: string;
  originalStory: string;
}

interface EnhancedStoryPanelProps {
  data: EnhancedStoryData | null;
  onAnalyzeQuality?: (story: string) => void;
  qualityScore?: number;
  qualityGrade?: string;
  isAnalyzing?: boolean;
}

const EnhancedStoryPanel = ({ 
  data, 
  onAnalyzeQuality, 
  qualityScore, 
  qualityGrade,
  isAnalyzing 
}: EnhancedStoryPanelProps) => {
  const [selectedVersion, setSelectedVersion] = useState<'normalized' | 'refined'>('refined');

  console.log('🎨 EnhancedStoryPanel rendering:', { 
    hasData: !!data, 
    qualityScore, 
    qualityGrade 
  });

  if (!data) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Enhanced Story</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Enhanced story will appear here after analysis</p>
          </div>
        </div>
      </div>
    );
  }

  const displayStory = selectedVersion === 'normalized' 
    ? (data.normalizedStory || 'No normalized version available') 
    : (data.refinedStory || 'No refined version available');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Enhanced Story
        </h2>
      </div>

      {/* Version Toggle */}
      <div className="mb-4">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedVersion('normalized')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              selectedVersion === 'normalized'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Normalized
          </button>
          <button
            onClick={() => setSelectedVersion('refined')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              selectedVersion === 'refined'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Refined
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Enhanced Story Display */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-800">
              {selectedVersion === 'normalized' ? 'Normalized Version' : 'Refined Version'}
            </h3>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{displayStory}</p>
        </div>

        {/* Original Story for Comparison */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-gray-600 text-sm">Original Story</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{data.originalStory || 'No original story'}</p>
        </div>

        {/* Quality Analysis Section */}
        <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4">Enhanced Story Quality</h3>
          
          {qualityScore !== undefined && qualityGrade ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-extrabold text-purple-700 mb-1">
                  {qualityScore}/10
                </div>
                <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  Grade {qualityGrade}
                </div>
              </div>
              {onAnalyzeQuality && (
                <button
                  onClick={() => onAnalyzeQuality(displayStory)}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              {onAnalyzeQuality && (
                <button
                  onClick={() => onAnalyzeQuality(displayStory)}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing Quality...
                    </span>
                  ) : (
                    'Analyze Enhanced Story Quality'
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Tip:</span> The{' '}
            <span className="font-semibold">Normalized</span> version applies healthcare
            terminology standardization. The <span className="font-semibold">Refined</span>{' '}
            version improves clarity and structure based on best practices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStoryPanel;
