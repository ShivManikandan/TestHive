import { Search, Sparkles, FileText, RotateCcw } from 'lucide-react';

interface QueryPanelProps {
  query: string;
  setQuery: (query: string) => void;
  vectorWeight: number;
  setVectorWeight: (weight: number) => void;
  bm25Weight: number;
  setBM25Weight: (weight: number) => void;
  onRetrieve: () => void;
  onEnhance: () => void;
  loading: boolean;
  enhancing: boolean;
  enableQualityEvaluation: boolean;
  setEnableQualityEvaluation: (enabled: boolean) => void;
  maxResults: number;
  setMaxResults: (maxResults: number) => void;
  onGenerateAcceptanceCriteria: (includeInStory: boolean) => void;
  generatingCriteria: boolean;
  onReset: () => void;
  isCompact?: boolean;
}

const QueryPanel = ({
  query,
  setQuery,
  vectorWeight,
  setVectorWeight,
  bm25Weight,
  setBM25Weight,
  onRetrieve,
  onEnhance,
  loading,
  enhancing,
  enableQualityEvaluation,
  setEnableQualityEvaluation,
  maxResults,
  setMaxResults,
  onGenerateAcceptanceCriteria,
  generatingCriteria,
  onReset,
  isCompact = false,
}: QueryPanelProps) => {
  if (isCompact) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        {/* Query Input - Compact */}
        <div className="flex-1 min-w-96">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your healthcare user story..."
            className="w-full h-16 p-3 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none shadow-sm"
            disabled={loading}
          />
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRetrieve}
            disabled={loading || !query.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? 'Searching...' : 'Search'}
          </button>

          <button
            onClick={onEnhance}
            disabled={enhancing || !query.trim()}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            {enhancing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {enhancing ? 'Enhancing...' : 'Enhance'}
          </button>

          {/* Acceptance Criteria Buttons - Compact */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
            <button
              onClick={() => onGenerateAcceptanceCriteria(false)}
              disabled={generatingCriteria || !query.trim()}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 shadow-lg"
              title="Generate acceptance criteria for viewing"
            >
              {generatingCriteria ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FileText className="w-3 h-3" />
              )}
              {generatingCriteria ? 'Generating...' : 'Generate AC'}
            </button>
            
            <button
              onClick={() => onGenerateAcceptanceCriteria(true)}
              disabled={generatingCriteria || !query.trim()}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 shadow-lg"
              title="Generate and add acceptance criteria to story"
            >
              Add to Story
            </button>
          </div>

          <button
            onClick={onReset}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg border-l border-gray-300 ml-2 pl-3"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Quick Settings - Compact */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <label className="text-gray-600 font-medium">Results:</label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-amber-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label 
              className="text-gray-600 font-medium cursor-help" 
              title="Enable automatic quality evaluation during story retrieval"
            >
              Auto Quality:
            </label>
            <button
              onClick={() => setEnableQualityEvaluation(!enableQualityEvaluation)}
              className={`w-8 h-4 rounded-full transition-colors ${
                enableQualityEvaluation ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              title={enableQualityEvaluation ? 'Auto quality evaluation ON - Stories will be automatically scored' : 'Auto quality evaluation OFF - Manual quality analysis required'}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                enableQualityEvaluation ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </button>
            <span className={`text-xs font-medium ${enableQualityEvaluation ? 'text-purple-600' : 'text-gray-400'}`}>
              {enableQualityEvaluation ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Query Input</h2>
        
        {/* Query Input */}
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your query to search user stories..."
            className="w-full h-36 p-5 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none shadow-inner"
            disabled={loading}
          />
        </div>
      </div>

      {/* Quality Evaluation Toggle */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <label className="text-base font-bold text-gray-800 cursor-pointer flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span>Enable Story Quality Evaluation</span>
            </label>
            <p className="text-xs text-gray-600">
              Use LLM to evaluate story quality (format, structure, content)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEnableQualityEvaluation(!enableQualityEvaluation)}
            disabled={loading}
            className={`relative inline-flex h-7 w-14 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              enableQualityEvaluation ? 'bg-purple-600' : 'bg-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label="Toggle quality evaluation"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                enableQualityEvaluation ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Acceptance Criteria Generation */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 mb-4 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-600" />
          🎯 Generate Acceptance Criteria
        </h3>
        <p className="text-sm text-gray-700 mb-4 font-medium">
          Create professional Given/When/Then scenarios to enhance your user story quality
        </p>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onGenerateAcceptanceCriteria(false)}
            disabled={loading || generatingCriteria || !query.trim()}
            className="py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {generatingCriteria ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>👀 Preview Criteria Separately</span>
              </>
            )}
          </button>
          <button
            onClick={() => onGenerateAcceptanceCriteria(true)}
            disabled={loading || generatingCriteria || !query.trim()}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {generatingCriteria ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>📝 Add Criteria to Story</span>
              </>
            )}
          </button>
        </div>
        <div className="mt-3 text-xs text-green-700 bg-green-100 rounded-lg p-2">
          💡 <strong>Tip:</strong> Adding acceptance criteria will significantly improve your story's quality scores!
        </div>
      </div>

      {/* Max Results Control */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="text-base font-semibold text-gray-800">
            Max Results
          </label>
          <span className="text-base font-bold text-purple-600">
            {maxResults}
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={maxResults}
          onChange={(e) => setMaxResults(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          disabled={loading}
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
          <span>5</span>
          <span>25</span>
          <span>50</span>
        </div>
      </div>

      {/* Weight Controls */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 mb-4 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>⚖️ Search Balance Control</span>
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700" title="Controls semantic similarity search weight - higher values prioritize meaning over exact keywords">
              🧠 Vector Weight (Semantic Understanding)
            </label>
            <span className="text-lg font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              {(vectorWeight * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={vectorWeight}
            onChange={(e) => {
              const newVectorWeight = parseFloat(e.target.value);
              setVectorWeight(newVectorWeight);
              setBM25Weight(1 - newVectorWeight);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            disabled={loading}
            title="Semantic similarity search weight"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-blue-700 mt-2 font-medium bg-blue-100 rounded px-2 py-1">
            💡 Higher = Better for conceptual/meaning-based search
          </p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700" title="Controls keyword matching weight - higher values prioritize exact word matches">
              🔤 BM25 Weight (Exact Keywords)
            </label>
            <span className="text-lg font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
              {(bm25Weight * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={bm25Weight}
            onChange={(e) => {
              const newBM25Weight = parseFloat(e.target.value);
              setBM25Weight(newBM25Weight);
              setVectorWeight(1 - newBM25Weight);
            }}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:bg-gray-300 transition-colors"
            disabled={loading}
            title="Keyword matching search weight"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-green-700 mt-2 font-medium bg-green-100 rounded px-2 py-1">
            💡 Higher = Better for exact keyword/term matching
          </p>
        </div>
        
        {/* Balance Indicator */}
        <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-green-100 rounded-lg p-3 border border-purple-200">
          <div className="text-center">
            <span className="text-sm font-bold text-gray-800">Current Balance:</span>
            <div className="text-lg font-bold mt-1">
              {vectorWeight > 0.6 ? (
                <span className="text-blue-600">🧠 Semantic Focus</span>
              ) : bm25Weight > 0.6 ? (
                <span className="text-green-600">🔤 Keyword Focus</span>
              ) : (
                <span className="text-purple-600">⚖️ Balanced Search</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Max Results Control */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="text-base font-semibold text-gray-800">
            Max Results
          </label>
          <span className="text-base font-bold text-purple-600">
            {maxResults}
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={maxResults}
          onChange={(e) => setMaxResults(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          disabled={loading}
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
          <span>5</span>
          <span>25</span>
          <span>50</span>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Actions
        </h3>
        
        {/* Primary Actions */}
        <div className="space-y-3 mb-4">
          <button
            onClick={onRetrieve}
            disabled={loading || !query.trim()}
            className="w-full py-3 px-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-base font-bold rounded-xl shadow-lg hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Retrieving Stories...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>🔍 Search & Retrieve Stories</span>
              </>
            )}
          </button>

          <button
            onClick={onEnhance}
            disabled={enhancing || !query.trim()}
            className="w-full py-3 px-5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white text-base font-bold rounded-xl shadow-lg hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {enhancing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enhancing Story...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>✨ Enhance & Refine Story</span>
              </>
            )}
          </button>
        </div>

        {/* Utility Actions */}
        <div className="flex gap-2">
          <button
            onClick={onReset}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🔄 Reset All</span>
          </button>
          
          <button
            onClick={() => setQuery('')}
            disabled={loading || !query.trim()}
            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>🗑️ Clear Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueryPanel;


