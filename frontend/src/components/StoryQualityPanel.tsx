import { RetrievalResult } from '../App';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface StoryQualityPanelProps {
  result: RetrievalResult;
}

const StoryQualityPanel = ({ result }: StoryQualityPanelProps) => {
  if (!result.quality) {
    return null;
  }

  const { quality } = result;

  const getScoreColor = (score: number) => {
    // Convert score from 0-20 to 0-10 for color calculation
    const normalizedScore = score / 2;
    if (normalizedScore >= 8) return 'text-green-600';
    if (normalizedScore >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressWidth = (score: number) => {
    // Convert score from 0-20 to percentage (0-100%)
    return `${(score / 20) * 100}%`;
  };

  return (
    <div className="border-t border-gray-200 pt-3">
      {/* Compact Quality Summary */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-800">Quality Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-extrabold text-blue-700">
            {quality.overallScore}/10
          </div>
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
            {quality.grade}
          </div>
        </div>
      </div>

      {/* Collapsible Detailed Analysis */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-semibold mb-2">
          <span className="group-open:hidden">Show detailed breakdown</span>
          <span className="hidden group-open:inline">Hide detailed breakdown</span>
        </summary>
        
        <div className="space-y-3">
          {/* Overall Score and Grade */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-extrabold text-blue-700 mb-1">
                  {quality.overallScore}/10
                </div>
                <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold mb-2">
                  Grade {quality.grade}
                </div>
            
            {/* Grade Scale Reference */}
            <div className="mt-3 p-3 bg-white bg-opacity-70 rounded-lg">
              <h6 className="text-xs font-bold text-gray-700 mb-2">Grade Scale:</h6>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">A+:</span>
                  <span className="text-green-600">9.5-10</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">A:</span>
                  <span className="text-green-600">9.0-9.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">A-:</span>
                  <span className="text-green-600">8.5-8.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">B+:</span>
                  <span className="text-blue-600">8.0-8.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">B:</span>
                  <span className="text-blue-600">7.5-7.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">B-:</span>
                  <span className="text-blue-600">7.0-7.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">C+:</span>
                  <span className="text-yellow-600">6.5-6.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">C:</span>
                  <span className="text-yellow-600">6.0-6.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">C-:</span>
                  <span className="text-yellow-600">5.5-5.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">D+:</span>
                  <span className="text-orange-600">5.0-5.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">D:</span>
                  <span className="text-orange-600">4.5-4.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">F:</span>
                  <span className="text-red-600">&lt;4.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white border-2 border-gray-300 rounded-xl p-5 mb-5 shadow-sm">
        <h5 className="text-base font-bold text-gray-800 mb-4">Score Breakdown (8 Criteria)</h5>
        <div className="mb-4 text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
          <strong>Total Score Calculation:</strong> {quality.clarity.score} + {quality.completeness.score} + {quality.acceptanceCriteria.score} + {quality.specificity.score} + {quality.structure.score} + {quality.businessValueAlignment.score} + {quality.testability.score} + {quality.technicalFeasibility.score} = {(quality.clarity.score + quality.completeness.score + quality.acceptanceCriteria.score + quality.specificity.score + quality.structure.score + quality.businessValueAlignment.score + quality.testability.score + quality.technicalFeasibility.score)} / 160 points
        </div>
        <div className="space-y-4">
          {/* Clarity */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Clarity</span>
              <span className={`text-sm font-bold ${getScoreColor(quality.clarity.score)}`}>
                {(quality.clarity.score / 2).toFixed(1)}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getScoreColor(quality.clarity.score)} bg-current`} style={{ width: getProgressWidth(quality.clarity.score) }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{quality.clarity.description}</p>
          </div>

          {/* Completeness */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Completeness</span>
              <span className={`text-sm font-bold ${getScoreColor(quality.completeness.score)}`}>
                {(quality.completeness.score / 2).toFixed(1)}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getScoreColor(quality.completeness.score)} bg-current`} style={{ width: getProgressWidth(quality.completeness.score) }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{quality.completeness.description}</p>
          </div>

          {/* Acceptance Criteria - Moved up for prominence */}
          <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Acceptance Criteria
              </span>
              <span className={`text-sm font-bold ${getScoreColor(quality.acceptanceCriteria.score)}`}>
                {(quality.acceptanceCriteria.score / 2).toFixed(1)}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getScoreColor(quality.acceptanceCriteria.score)} bg-current`}
                style={{ width: getProgressWidth(quality.acceptanceCriteria.score) }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{quality.acceptanceCriteria.description}</p>
            {quality.acceptanceCriteria.score === 0 && (
              <div className="mt-2 text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">
                💡 <strong>Tip:</strong> Add "Given/When/Then" scenarios to improve this score
              </div>
            )}
          </div>

          {/* Business Value Alignment */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Business Value Alignment</span>
              <span className={`text-sm font-bold ${getScoreColor(quality.businessValueAlignment.score)}`}>
                {(quality.businessValueAlignment.score / 2).toFixed(1)}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getScoreColor(quality.businessValueAlignment.score)} bg-current`} style={{ width: getProgressWidth(quality.businessValueAlignment.score) }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{quality.businessValueAlignment.description}</p>
          </div>

          {/* Testability */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Testability</span>
              <span className={`text-sm font-bold ${getScoreColor(quality.testability.score)}`}>
                {(quality.testability.score / 2).toFixed(1)}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getScoreColor(quality.testability.score)} bg-current`} style={{ width: getProgressWidth(quality.testability.score) }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{quality.testability.description}</p>
          </div>

          {/* Technical Feasibility */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Technical Feasibility</span>
              <span className={`text-sm font-bold ${getScoreColor(quality.technicalFeasibility.score)}`}>
                {(quality.technicalFeasibility.score / 2).toFixed(1)}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getScoreColor(quality.technicalFeasibility.score)} bg-current`} style={{ width: getProgressWidth(quality.technicalFeasibility.score) }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{quality.technicalFeasibility.description}</p>
          </div>


          {/* Specificity */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Specificity</span>
              <span className={`text-sm font-bold ${getScoreColor(quality.specificity.score)}`}>
                {(quality.specificity.score / 2).toFixed(1)}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getScoreColor(quality.specificity.score)} bg-current`}
                style={{ width: getProgressWidth(quality.specificity.score) }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{quality.specificity.description}</p>
          </div>

          {/* Structure */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Structure</span>
              <span className={`text-sm font-bold ${getScoreColor(quality.structure.score)}`}>
                {(quality.structure.score / 2).toFixed(1)}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getScoreColor(quality.structure.score)} bg-current`}
                style={{ width: getProgressWidth(quality.structure.score) }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{quality.structure.description}</p>
          </div>
        </div>
      </div>

          {/* Improvement Areas */}
          {quality.improvementAreas.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Areas for Improvement
              </h5>
              <ul className="list-disc list-inside space-y-1">
                {quality.improvementAreas.map((area, index) => (
                  <li key={index} className="text-xs text-gray-700">{area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {quality.recommendations && quality.recommendations.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Recommendations
              </h5>
              <ul className="list-disc list-inside space-y-1">
                {quality.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>
    </div>
  );
};

export default StoryQualityPanel;
