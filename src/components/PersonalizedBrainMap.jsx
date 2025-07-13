import React, { useState, useEffect } from 'react';
import BrainCanvas from './BrainVisualization/BrainCanvas';
import { convertAssessmentToVisualData } from '../utils/brainRegionMapping';
import { analyzeProfessionalTraumaImpact } from '../utils/professionalTraumaBrainMapping';

export default function PersonalizedBrainMap({ surveyResults }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [brainData, setBrainData] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [viewMode, setViewMode] = useState('impact'); // 'impact' or 'timeline'
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    if (surveyResults) {
      // Analyze the survey results
      const analysisResult = analyzeProfessionalTraumaImpact(surveyResults);
      setAnalysis(analysisResult);
      
      // Convert to visual format for the brain canvas
      const visualData = convertAssessmentToVisualData(analysisResult);
      setBrainData(visualData);
    }
  }, [surveyResults]);

  const handleRegionClick = (regionName, regionData) => {
    setSelectedRegion({ name: regionName, data: regionData });
  };

  const getImpactDescription = (severity) => {
    const descriptions = {
      severe: 'Severe impact - Significant alterations expected',
      high: 'High impact - Notable changes in function',
      moderate: 'Moderate impact - Some functional changes',
      mild: 'Mild impact - Minor alterations possible',
      normal: 'Minimal impact - Within normal range'
    };
    return descriptions[severity] || 'Impact level unknown';
  };

  const exportBrainMap = () => {
    // Create a summary for download
    const summary = {
      date: new Date().toISOString(),
      totalACEs: analysis?.summary?.totalACEs || 0,
      regionsAffected: analysis?.summary?.totalRegionsAffected || 0,
      primaryImpacts: analysis?.summary?.primaryImpacts || [],
      brainData: brainData
    };
    
    const dataStr = JSON.stringify(summary, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `brain-map-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!surveyResults || !analysis) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Processing your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light">Your Personalized Brain Impact Map</h1>
            <p className="text-gray-400 text-sm mt-1">
              Based on {analysis.summary.totalACEs} identified ACEs affecting {analysis.summary.totalRegionsAffected} brain regions
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
            <button
              onClick={exportBrainMap}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
            >
              Export Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Brain Visualization */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-950">
          <div className="w-full max-w-4xl">
            <BrainCanvas
              brainData={brainData}
              onRegionClick={handleRegionClick}
              selectedRegion={selectedRegion?.name}
            />
          </div>
        </div>

        {/* Details Panel */}
        {showDetails && (
          <div className="w-96 bg-gray-900 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              {/* View Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setViewMode('impact')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'impact' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Impact View
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'timeline' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Timeline View
                </button>
              </div>

              {/* Selected Region Details */}
              {selectedRegion && (
                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">{selectedRegion.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getColorForSeverity(selectedRegion.data.severity) }}
                      />
                      <span className="text-sm">
                        {getImpactDescription(selectedRegion.data.severity)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Impact Score: {Math.round((selectedRegion.data.impact || 0) * 100)}%
                    </p>
                    {selectedRegion.data.description && (
                      <p className="text-sm text-gray-300 mt-2">
                        {selectedRegion.data.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Impact or Timeline View */}
              {viewMode === 'impact' ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                    Regions by Impact Level
                  </h3>
                  
                  {Object.entries(brainData)
                    .sort((a, b) => (b[1].impact || 0) - (a[1].impact || 0))
                    .map(([regionName, regionData]) => (
                      <div
                        key={regionName}
                        className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => setSelectedRegion({ name: regionName, data: regionData })}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{regionName}</span>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getColorForSeverity(regionData.severity) }}
                          />
                        </div>
                        <div className="text-sm text-gray-400">
                          {Math.round((regionData.impact || 0) * 100)}% impact
                        </div>
                        {regionData.traumaTypes && regionData.traumaTypes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {regionData.traumaTypes.slice(0, 3).map((type, idx) => (
                              <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded">
                                {type.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                    Developmental Timeline
                  </h3>
                  
                  {['0-3', '3-5', '6-11', '11-13', '14-18'].map(ageRange => {
                    const regionsInPeriod = Object.entries(analysis.brainImpacts || {})
                      .filter(([_, data]) => data.developmentalPeriods?.includes(ageRange));
                    
                    if (regionsInPeriod.length === 0) return null;
                    
                    return (
                      <div key={ageRange} className="p-3 bg-gray-800 rounded-lg">
                        <h4 className="font-medium mb-2 text-purple-400">Ages {ageRange}</h4>
                        <div className="space-y-1">
                          {regionsInPeriod.map(([region, data]) => (
                            <div key={region} className="text-sm text-gray-300">
                              {region} ({Math.round(data.impact * 100)}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                  Summary
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400">Total ACEs</div>
                    <div className="text-xl font-medium">{analysis.summary.totalACEs}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400">Regions Affected</div>
                    <div className="text-xl font-medium">{analysis.summary.totalRegionsAffected}</div>
                  </div>
                </div>
                
                {analysis.summary.hasProtectiveFactors && (
                  <div className="mt-3 p-3 bg-green-900/20 border border-green-700/30 rounded text-sm text-green-400">
                    ✓ Protective factors present
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get color based on severity
function getColorForSeverity(severity) {
  const colors = {
    severe: '#dc2626',
    high: '#ea580c',
    moderate: '#f59e0b',
    mild: '#65a30d',
    normal: '#e5e7eb'
  };
  return colors[severity] || '#6b7280';
}