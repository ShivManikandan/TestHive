import { Settings, Info } from 'lucide-react';

interface ConfigPanelProps {
  vectorWeight: number;
  bm25Weight: number;
  totalResults: number;
}

const ConfigPanel = ({ vectorWeight, bm25Weight, totalResults }: ConfigPanelProps) => {
  const totalWeight = vectorWeight + bm25Weight;
  const normalizedVector = totalWeight > 0 ? (vectorWeight / totalWeight) * 100 : 0;
  const normalizedBM25 = totalWeight > 0 ? (bm25Weight / totalWeight) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-800">Configuration</h2>
      </div>

      {/* Current Weights */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-4">Current Weights</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Vector Similarity</span>
              <span className="font-bold">{normalizedVector.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${normalizedVector}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>BM25 Keyword</span>
              <span className="font-bold">{normalizedBM25.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${normalizedBM25}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 bg-gray-50 rounded-xl p-5 border-2 border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-gray-800">About Hybrid Retrieval</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong className="text-blue-600">Vector Similarity</strong> uses semantic embeddings
            to find stories with similar meaning, even if they use different words.
          </p>
          <p>
            <strong className="text-green-600">BM25</strong> uses keyword matching to find stories
            that contain specific terms from your query.
          </p>
          <p className="pt-2 border-t border-gray-200">
            Adjust the sliders to balance between semantic understanding and exact keyword matching
            based on your search needs.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
        <div className="text-center">
          <div className="text-3xl font-extrabold text-amber-700">{totalResults}</div>
          <div className="text-sm font-semibold text-gray-700 mt-2">
            {totalResults === 1 ? 'Result' : 'Results'} Retrieved
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;

