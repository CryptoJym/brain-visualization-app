import React from 'react';

/**
 * Persistent color legend for brain visualization
 * Explains color coding, severity levels, and marker sizes
 */
const BrainLegend = ({ className = '', highContrastMode = false }) => {
  return (
    <div
      className={`absolute bottom-6 left-6 bg-black/75 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white text-sm shadow-2xl ${className}`}
      style={{
        maxWidth: '280px',
        zIndex: 10,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div className="mb-3 pb-2 border-b border-white/10">
        <h3 className="font-semibold text-base text-white/95 tracking-tight">
          Brain Impact Legend
        </h3>
      </div>

      {/* Impact Types */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-medium text-white/70 uppercase tracking-wider mb-2">
          Impact Types
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full shadow-lg ${
              highContrastMode
                ? 'bg-yellow-400 shadow-yellow-400/50'
                : 'bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/30'
            }`}
          />
          <span className="text-white/90 text-xs">
            <span className="font-medium">Hyperactivation</span>
            <span className="text-white/60 ml-1">(Overactive)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full shadow-lg ${
              highContrastMode
                ? 'bg-cyan-400 shadow-cyan-400/50'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30'
            }`}
          />
          <span className="text-white/90 text-xs">
            <span className="font-medium">Hypoactivity</span>
            <span className="text-white/60 ml-1">(Underactive)</span>
          </span>
        </div>
      </div>

      {/* Severity Scale */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-medium text-white/70 uppercase tracking-wider mb-2">
          Severity Levels
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs">Subtle</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="text-white/50 text-xs">10-25</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs">Notable</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white/70" />
              <span className="text-white/50 text-xs">25-45</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs">Moderate</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
              <span className="text-white/50 text-xs">45-70</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">Severe</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-white/90 shadow-lg" />
              <span className="text-white/50 text-xs">70+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Size Explanation */}
      <div className="pt-3 border-t border-white/10">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-white/70 text-xs leading-relaxed">
            Larger markers indicate greater impact magnitude. Hover over regions for detailed information.
          </p>
        </div>
      </div>

      {/* Optional: Anatomical Orientation Hints */}
      <div className="mt-3 pt-3 border-t border-white/10 hidden md:block">
        <div className="text-xs font-medium text-white/70 uppercase tracking-wider mb-2">
          Orientation
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
          <div>
            <span className="text-red-400">A</span> Anterior (Front)
          </div>
          <div>
            <span className="text-blue-400">P</span> Posterior (Back)
          </div>
          <div>
            <span className="text-green-400">L</span> Left Hemisphere
          </div>
          <div>
            <span className="text-purple-400">R</span> Right Hemisphere
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact mobile version of the legend
 */
export const CompactBrainLegend = ({ className = '' }) => {
  return (
    <div
      className={`absolute bottom-4 left-4 bg-black/80 backdrop-blur border border-white/20 rounded-lg p-3 text-white text-xs shadow-xl ${className}`}
      style={{
        maxWidth: '200px',
        zIndex: 10
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-orange-500" />
          <span className="text-white/90 text-xs">Overactive</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
          <span className="text-white/90 text-xs">Underactive</span>
        </div>

        <div className="pt-2 border-t border-white/10 text-white/60 text-xs">
          Size = Impact magnitude
        </div>
      </div>
    </div>
  );
};

export default BrainLegend;
