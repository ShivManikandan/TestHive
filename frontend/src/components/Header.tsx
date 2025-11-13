import { Info } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-lg border-b-2 border-amber-700/30">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center gap-4">
          {/* Enhanced Hive Logo - High Contrast Layered */}
          <div className="flex items-center justify-center w-18 h-18 bg-white/25 backdrop-blur-sm rounded-xl shadow-lg border-2 border-white/30 relative overflow-hidden">
            <svg
              className="w-12 h-12 text-white drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* High contrast layered hexagons */}
              {/* Outermost layer - Bold outline */}
              <path 
                d="M16 2L4 8v16l12 6 12-6V8L16 2z" 
                fill="rgba(255,255,255,0.3)" 
                stroke="rgba(255,255,255,0.6)" 
                strokeWidth="1.2"
              />
              
              {/* Middle layer - More prominent */}
              <path 
                d="M16 4L6 9v14l10 5 10-5V9L16 4z" 
                fill="rgba(255,255,255,0.6)" 
                stroke="rgba(255,255,255,0.8)" 
                strokeWidth="1"
              />
              
              {/* Core layer - Bright white */}
              <path 
                d="M16 6L8 10v12l8 4 8-4V10L16 6z" 
                fill="rgba(255,255,255,0.95)"
              />
              
              {/* Bold search magnifying glass overlay */}
              <g>
                {/* Outer search ring - Bold orange */}
                <circle 
                  cx="18" 
                  cy="14" 
                  r="4.5" 
                  fill="none" 
                  stroke="#ea580c" 
                  strokeWidth="3"
                />
                
                {/* Inner search ring - Bright orange */}
                <circle 
                  cx="18" 
                  cy="14" 
                  r="2.5" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="2"
                />
                
                {/* Search handle - Bold and prominent */}
                <path 
                  d="m21.5 17.5 4 4" 
                  stroke="#ea580c" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>

          {/* App Name */}
          <h1 className="text-4xl font-extrabold text-white drop-shadow-md tracking-tight">
            TestHive
          </h1>

          {/* Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-white/90 hover:text-white transition-colors p-2 -m-2"
              aria-label="Info about TestHive"
            >
              <Info className="w-6 h-6 drop-shadow-sm" />
            </button>
            {showTooltip && (
              <div className="fixed top-20 right-4 z-[100] w-80 p-4 bg-gray-900 text-white text-sm rounded-lg shadow-2xl border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="font-bold text-blue-400">TestHive - Hybrid Retrieval System</p>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  AI-powered healthcare user story analysis combining semantic vector search 
                  and keyword matching for comprehensive story retrieval and quality evaluation.
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  <span className="inline-block bg-gray-800 px-2 py-1 rounded mr-2">🔍 Hybrid Search</span>
                  <span className="inline-block bg-gray-800 px-2 py-1 rounded">📊 Quality Analysis</span>
                </div>
                {/* Arrow pointing to icon */}
                <div className="absolute -left-2 top-4 w-4 h-4 bg-gray-900 border-l border-b border-gray-700 transform rotate-45"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

