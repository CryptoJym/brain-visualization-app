import React, { useState, useEffect } from 'react';
import { analyzeProfessionalTraumaImpact } from '../utils/professionalTraumaBrainMapping';

export default function IntegratedBrainSurvey({ surveyResults }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [highlightedRegions, setHighlightedRegions] = useState({});
  const [activeViewer, setActiveViewer] = useState('brainfacts');
  const [showOverlay, setShowOverlay] = useState(true);
  const [viewMode, setViewMode] = useState('impact'); // 'impact' or 'timeline'
  
  const viewers = {
    brainfacts: {
      name: 'BrainFacts 3D Brain',
      url: 'https://www.brainfacts.org/3d-brain',
      description: 'Interactive 3D brain with clickable regions. Your trauma impacts are shown below.',
      searchable: true
    },
    scalable: {
      name: 'Scalable Brain Atlas',
      url: 'https://scalablebrainatlas.incf.org/human/NMM1103',
      description: 'Professional brain atlas with detailed anatomical regions.',
      searchable: true
    },
    allen: {
      name: 'Allen Brain Atlas',
      url: 'https://atlas.brain-map.org/',
      description: 'Research-grade brain atlas from the Allen Institute.',
      searchable: false
    }
  };

  // Process survey results to get affected regions
  useEffect(() => {
    if (surveyResults) {
      const analysis = analyzeProfessionalTraumaImpact(surveyResults);
      setHighlightedRegions(analysis.brainImpacts);
    }
  }, [surveyResults]);

  // Get color based on impact level
  const getImpactColor = (impact) => {
    if (impact >= 0.8) return '#ef4444'; // Red - severe
    if (impact >= 0.6) return '#f97316'; // Orange - high
    if (impact >= 0.4) return '#eab308'; // Yellow - moderate
    return '#10b981'; // Green - mild
  };

  // Get age range color
  const getAgeColor = (ageRange) => {
    const colors = {
      '0-3': '#9333ea', // Purple - infancy
      '3-5': '#3b82f6', // Blue - preschool
      '6-11': '#06b6d4', // Cyan - school age
      '11-13': '#10b981', // Green - early adolescence
      '14-18': '#f97316', // Orange - adolescence
      'throughout': '#ef4444', // Red - chronic
      'multiple': '#ec4899' // Pink - multiple periods
    };
    return colors[ageRange] || '#6b7280';
  };

  // Format region name for search
  const formatRegionForSearch = (region) => {
    const searchTerms = {
      'Amygdala': 'amygdala',
      'Hippocampus': 'hippocampus',
      'Superior Frontal': 'frontal cortex',
      'Rostral Middle Frontal': 'prefrontal cortex',
      'Medial Orbitofrontal': 'orbitofrontal cortex',
      'Lateral Orbitofrontal': 'orbitofrontal cortex',
      'Caudal Anterior Cingulate': 'anterior cingulate',
      'Rostral Anterior Cingulate': 'anterior cingulate',
      'Posterior Cingulate': 'posterior cingulate',
      'Superior Temporal': 'temporal lobe',
      'Postcentral': 'somatosensory cortex',
      'Pericalcarine': 'visual cortex',
      'Lateral Occipital': 'visual cortex',
      'Caudate': 'caudate nucleus',
      'Nucleus Accumbens': 'nucleus accumbens',
      'Midbrain': 'midbrain',
      'Pons': 'pons',
      'Cerebellar Cortex': 'cerebellum',
      'Cerebellar Vermis': 'cerebellum'
    };
    return searchTerms[region] || region.toLowerCase();
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <h1 className="text-2xl font-light mb-2">Your Personalized Brain Impact Map</h1>
        <p className="text-gray-400 text-sm mb-4">
          Based on your survey responses, showing regions affected by trauma
        </p>
        
        {/* Viewer selector */}
        <div className="flex gap-2 mb-4">
          {Object.entries(viewers).map(([key, viewer]) => (
            <button
              key={key}
              onClick={() => setActiveViewer(key)}
              className={`px-4 py-2 rounded transition-colors ${
                activeViewer === key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {viewer.name}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('impact')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'impact' ? 'bg-purple-600' : 'bg-gray-800'
            }`}
          >
            Impact View
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'timeline' ? 'bg-purple-600' : 'bg-gray-800'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="px-3 py-1 rounded text-sm bg-gray-800 ml-auto"
          >
            {showOverlay ? 'Hide' : 'Show'} Analysis
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Brain viewer iframe */}
        <iframe
          key={activeViewer}
          src={viewers[activeViewer].url}
          className="w-full h-full border-0"
          allow="fullscreen"
          title={viewers[activeViewer].name}
        />

        {/* Overlay with impact analysis */}
        {showOverlay && (
          <div className="absolute top-0 right-0 w-96 h-full bg-gray-900/95 border-l border-gray-800 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">
                {viewMode === 'impact' ? 'Impact Analysis' : 'Developmental Timeline'}
              </h2>

              {viewMode === 'impact' ? (
                // Impact view - regions sorted by severity
                <div className="space-y-3">
                  {Object.entries(highlightedRegions)
                    .sort((a, b) => b[1].impact - a[1].impact)
                    .map(([region, data]) => (
                      <div
                        key={region}
                        className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => setSelectedRegion(region)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{region}</h3>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getImpactColor(data.impact) }}
                          />
                        </div>
                        
                        <div className="text-sm text-gray-400 mb-2">
                          Impact: {Math.round(data.impact * 100)}%
                        </div>

                        {viewers[activeViewer].searchable && (
                          <button
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              // This would ideally communicate with the iframe
                              alert(`Search for "${formatRegionForSearch(region)}" in the brain viewer`);
                            }}
                          >
                            → Find in viewer
                          </button>
                        )}

                        {selectedRegion === region && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-sm mb-2">Affected by:</p>
                            <div className="flex flex-wrap gap-1">
                              {data.traumaTypes.map((type, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-700 px-2 py-1 rounded"
                                >
                                  {type.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                            
                            {data.developmentalPeriods.length > 0 && (
                              <>
                                <p className="text-sm mt-2 mb-1">During ages:</p>
                                <div className="flex flex-wrap gap-1">
                                  {data.developmentalPeriods.map((period, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 rounded"
                                      style={{ backgroundColor: getAgeColor(period) + '40' }}
                                    >
                                      {period}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                // Timeline view - grouped by age ranges
                <div className="space-y-4">
                  {['0-3', '3-5', '6-11', '11-13', '14-18'].map(ageRange => {
                    const regionsInPeriod = Object.entries(highlightedRegions)
                      .filter(([_, data]) => data.developmentalPeriods.includes(ageRange));
                    
                    if (regionsInPeriod.length === 0) return null;
                    
                    return (
                      <div key={ageRange} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getAgeColor(ageRange) }}
                          />
                          <h3 className="font-medium">Ages {ageRange}</h3>
                        </div>
                        
                        <div className="space-y-2">
                          {regionsInPeriod.map(([region, data]) => (
                            <div key={region} className="text-sm">
                              <span className="text-gray-300">{region}</span>
                              <span className="text-gray-500 ml-2">
                                ({Math.round(data.impact * 100)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-400">Total regions affected: </span>
            <span className="text-white font-medium">
              {Object.keys(highlightedRegions).length}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Impact levels:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Severe</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Mild</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}