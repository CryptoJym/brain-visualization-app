import React, { useState } from 'react';

export default function DemoBrainHighlighting() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Demo data showing example trauma impacts
  const demoImpacts = {
    'Amygdala': {
      impact: 0.85,
      traumaTypes: ['physical_abuse', 'domestic_violence'],
      developmentalPeriods: ['0-3', '6-11'],
      description: 'Fear center - Hyperactive in PTSD, triggers fight-or-flight',
      location: { x: 0, y: -20, size: 'medium' }
    },
    'Hippocampus': {
      impact: 0.72,
      traumaTypes: ['chronic_stress', 'emotional_neglect'],
      developmentalPeriods: ['3-5', '11-13'],
      description: 'Memory formation - Can shrink from chronic stress',
      location: { x: -30, y: -15, size: 'medium' }
    },
    'Prefrontal Cortex': {
      impact: 0.65,
      traumaTypes: ['emotional_abuse'],
      developmentalPeriods: ['14-18'],
      description: 'Executive control - Underactive in trauma',
      location: { x: 0, y: 50, size: 'large' }
    },
    'Anterior Cingulate': {
      impact: 0.58,
      traumaTypes: ['physical_abuse'],
      developmentalPeriods: ['6-11'],
      description: 'Emotion regulation - Reduced volume in PTSD',
      location: { x: 0, y: 20, size: 'small' }
    },
    'Temporal Lobe': {
      impact: 0.45,
      traumaTypes: ['sexual_abuse'],
      developmentalPeriods: ['3-5'],
      description: 'Sensory processing - Altered in trauma',
      location: { x: 60, y: 0, size: 'large' }
    }
  };

  const getImpactColor = (impact) => {
    if (impact >= 0.8) return '#ef4444'; // Red
    if (impact >= 0.6) return '#f97316'; // Orange
    if (impact >= 0.4) return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  const getImpactColorRGB = (impact) => {
    if (impact >= 0.8) return 'rgb(239, 68, 68)';
    if (impact >= 0.6) return 'rgb(249, 115, 22)';
    if (impact >= 0.4) return 'rgb(234, 179, 8)';
    return 'rgb(16, 185, 129)';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-white/10 p-6">
        <h1 className="text-3xl font-light mb-2">Brain Trauma Visualization Demo</h1>
        <p className="text-gray-400">
          This demonstrates how the survey automatically highlights affected brain regions
        </p>
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
          <div className="bg-gray-900 rounded-lg p-8 max-w-2xl">
            <h2 className="text-2xl font-light mb-4">How This Works</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                When users complete your trauma survey, their responses are automatically 
                mapped to specific brain regions based on neuroscience research.
              </p>
              <p>
                The visualization shows:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <span className="text-red-400">Red regions</span> - Severe impact (80%+)
                </li>
                <li>
                  <span className="text-orange-400">Orange regions</span> - High impact (60-80%)
                </li>
                <li>
                  <span className="text-yellow-400">Yellow regions</span> - Moderate impact (40-60%)
                </li>
                <li>
                  <span className="text-green-400">Green regions</span> - Mild impact (below 40%)
                </li>
              </ul>
              <p>
                Click on any highlighted region to see details about the trauma impact.
              </p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              View Demo
            </button>
          </div>
        </div>
      )}

      {/* Main visualization area */}
      <div className="flex">
        {/* Brain visualization */}
        <div className="flex-1 relative h-[calc(100vh-100px)]">
          {/* SVG Brain representation */}
          <svg
            viewBox="-150 -150 300 300"
            className="w-full h-full"
            style={{ maxHeight: '600px', margin: 'auto' }}
          >
            {/* Brain outline */}
            <ellipse
              cx="0"
              cy="0"
              rx="100"
              ry="120"
              fill="none"
              stroke="#374151"
              strokeWidth="2"
            />
            
            {/* Brain stem */}
            <rect
              x="-15"
              y="90"
              width="30"
              height="40"
              fill="#1f2937"
              stroke="#374151"
              strokeWidth="1"
            />

            {/* Corpus callosum */}
            <path
              d="M -60 0 Q 0 -20 60 0"
              fill="none"
              stroke="#374151"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Highlighted regions */}
            {Object.entries(demoImpacts).map(([region, data]) => {
              const color = getImpactColorRGB(data.impact);
              const radius = data.location.size === 'large' ? 35 : 
                           data.location.size === 'medium' ? 25 : 20;
              
              return (
                <g key={region}>
                  {/* Glow effect */}
                  <circle
                    cx={data.location.x}
                    cy={data.location.y}
                    r={radius + 10}
                    fill={color}
                    opacity="0.2"
                    className="animate-pulse"
                  />
                  
                  {/* Main region circle */}
                  <circle
                    cx={data.location.x}
                    cy={data.location.y}
                    r={radius}
                    fill={color}
                    opacity="0.6"
                    stroke={color}
                    strokeWidth="2"
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedRegion(region)}
                  />
                  
                  {/* Region label */}
                  <text
                    x={data.location.x}
                    y={data.location.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    pointerEvents="none"
                    style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                  >
                    {region.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <g transform="translate(-140, -140)">
              <text x="0" y="0" fill="white" fontSize="12" fontWeight="bold">
                Impact Levels
              </text>
              <circle cx="10" cy="15" r="5" fill="#ef4444" />
              <text x="20" y="19" fill="#9ca3af" fontSize="10">Severe (80%+)</text>
              
              <circle cx="10" cy="30" r="5" fill="#f97316" />
              <text x="20" y="34" fill="#9ca3af" fontSize="10">High (60-80%)</text>
              
              <circle cx="10" cy="45" r="5" fill="#eab308" />
              <text x="20" y="49" fill="#9ca3af" fontSize="10">Moderate (40-60%)</text>
              
              <circle cx="10" cy="60" r="5" fill="#10b981" />
              <text x="20" y="64" fill="#9ca3af" fontSize="10">Mild (&lt;40%)</text>
            </g>
          </svg>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-gray-900/90 rounded-lg p-4 max-w-sm">
            <p className="text-sm text-gray-300">
              Click on any highlighted region to see how trauma affects that area
            </p>
          </div>
        </div>

        {/* Details panel */}
        <div className="w-96 bg-gray-900 border-l border-white/10 p-6 overflow-y-auto h-[calc(100vh-100px)]">
          <h2 className="text-xl font-medium mb-4">Region Analysis</h2>
          
          {selectedRegion ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">{selectedRegion}</h3>
                <div
                  className="h-2 rounded-full mb-4"
                  style={{ backgroundColor: getImpactColor(demoImpacts[selectedRegion].impact) }}
                >
                  <div className="h-full bg-white/30 rounded-full" 
                       style={{ width: `${demoImpacts[selectedRegion].impact * 100}%` }} />
                </div>
                <p className="text-sm text-gray-400">
                  Impact: {Math.round(demoImpacts[selectedRegion].impact * 100)}%
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Function</h4>
                <p className="text-sm text-gray-300">
                  {demoImpacts[selectedRegion].description}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Trauma Types</h4>
                <div className="flex flex-wrap gap-2">
                  {demoImpacts[selectedRegion].traumaTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-800 px-3 py-1 rounded-full"
                    >
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Affected During Ages</h4>
                <div className="flex flex-wrap gap-2">
                  {demoImpacts[selectedRegion].developmentalPeriods.map((period, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-purple-600/30 border border-purple-600/50 px-3 py-1 rounded-full"
                    >
                      {period} years
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="font-medium mb-2">Clinical Implications</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• May benefit from targeted therapy</li>
                  <li>• Consider neurofeedback training</li>
                  <li>• Monitor for related symptoms</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <p>Click on a highlighted brain region to see detailed analysis</p>
            </div>
          )}

          {/* Summary stats */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="font-medium mb-4">Overall Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Regions Affected:</span>
                <span className="font-medium">{Object.keys(demoImpacts).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Severe Impact Regions:</span>
                <span className="font-medium text-red-400">
                  {Object.values(demoImpacts).filter(d => d.impact >= 0.8).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Primary Trauma Period:</span>
                <span className="font-medium">0-11 years</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <div className="fixed bottom-4 right-4 bg-blue-600/20 border border-blue-600/50 rounded-lg p-4 max-w-sm">
        <p className="text-sm">
          <span className="font-medium">Demo Mode:</span> This shows example data. 
          Take the actual assessment to see your personalized brain map.
        </p>
        <button
          onClick={() => window.location.search = '?view=questionnaire'}
          className="mt-2 text-sm text-blue-400 hover:text-blue-300"
        >
          Start Real Assessment →
        </button>
      </div>
    </div>
  );
}