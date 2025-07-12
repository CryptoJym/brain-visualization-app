import React, { useState, useEffect } from 'react';
import IntegratedBrainSurvey from './IntegratedBrainSurvey';
import NeurableIntegration from './NeurableIntegration';
import { analyzeProfessionalTraumaImpact } from '../utils/professionalTraumaBrainMapping';

export default function CombinedBrainAnalysis({ surveyResults }) {
  const [eegAnalysis, setEegAnalysis] = useState(null);
  const [combinedAnalysis, setCombinedAnalysis] = useState(null);
  const [showEEG, setShowEEG] = useState(false);
  const [viewMode, setViewMode] = useState('survey'); // 'survey', 'eeg', 'combined'
  
  // Process survey results
  const surveyAnalysis = surveyResults ? analyzeProfessionalTraumaImpact(surveyResults) : null;
  
  // Handle EEG data from Neurable
  const handleEEGData = (analysis) => {
    setEegAnalysis(analysis);
    
    // Combine survey and EEG analysis
    if (surveyAnalysis) {
      const combined = combineAnalyses(surveyAnalysis, analysis);
      setCombinedAnalysis(combined);
    }
  };
  
  // Combine survey and EEG analyses
  const combineAnalyses = (survey, eeg) => {
    const combined = {
      regions: {},
      confidence: 'high',
      recommendations: new Set()
    };
    
    // Map EEG regions to anatomical regions
    const eegToAnatomical = {
      frontal: ['Superior Frontal', 'Rostral Middle Frontal', 'Medial Orbitofrontal'],
      temporal: ['Superior Temporal', 'Middle Temporal', 'Hippocampus', 'Amygdala'],
      occipital: ['Pericalcarine', 'Lateral Occipital']
    };
    
    // Process survey impacts
    Object.entries(survey.brainImpacts).forEach(([region, data]) => {
      combined.regions[region] = {
        surveyImpact: data.impact,
        eegImpact: 0,
        combined: data.impact,
        traumaTypes: data.traumaTypes,
        developmentalPeriods: data.developmentalPeriods,
        eegMarkers: []
      };
    });
    
    // Add EEG data
    Object.entries(eeg.regions).forEach(([eegRegion, eegData]) => {
      const anatomicalRegions = eegToAnatomical[eegRegion] || [];
      
      anatomicalRegions.forEach(anatomicalRegion => {
        if (combined.regions[anatomicalRegion]) {
          combined.regions[anatomicalRegion].eegImpact = eegData.score;
          combined.regions[anatomicalRegion].eegMarkers = eegData.markers;
          
          // Weighted combination (70% survey, 30% EEG)
          combined.regions[anatomicalRegion].combined = 
            (combined.regions[anatomicalRegion].surveyImpact * 0.7) + 
            (eegData.score * 0.3);
        }
      });
    });
    
    // Add recommendations
    [...(survey.summary.recommendations || []), ...(eeg.recommendations || [])]
      .forEach(rec => combined.recommendations.add(rec));
    
    return combined;
  };
  
  return (
    <div className="h-screen bg-black text-white flex">
      {/* Left sidebar - Controls */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
        <h1 className="text-2xl font-light mb-6">Brain Analysis Dashboard</h1>
        
        {/* View mode selector */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-2">Analysis Mode</h3>
          <div className="space-y-2">
            <button
              onClick={() => setViewMode('survey')}
              className={`w-full px-4 py-2 rounded text-left transition-colors ${
                viewMode === 'survey' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="font-medium">Survey Analysis</div>
              <div className="text-xs text-gray-300">Based on your questionnaire</div>
            </button>
            
            <button
              onClick={() => setViewMode('eeg')}
              className={`w-full px-4 py-2 rounded text-left transition-colors ${
                viewMode === 'eeg' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="font-medium">EEG Analysis</div>
              <div className="text-xs text-gray-300">Real-time brain activity</div>
            </button>
            
            <button
              onClick={() => setViewMode('combined')}
              disabled={!eegAnalysis}
              className={`w-full px-4 py-2 rounded text-left transition-colors ${
                viewMode === 'combined' ? 'bg-blue-600' : 
                !eegAnalysis ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' :
                'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="font-medium">Combined Analysis</div>
              <div className="text-xs text-gray-300">
                {eegAnalysis ? 'Survey + EEG data' : 'Record EEG first'}
              </div>
            </button>
          </div>
        </div>
        
        {/* Neurable Integration */}
        <div className="mb-6">
          <NeurableIntegration onEEGData={handleEEGData} />
        </div>
        
        {/* Analysis Summary */}
        {surveyAnalysis && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Analysis Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total ACEs:</span>
                <span className="font-medium">{surveyAnalysis.summary.totalACEs}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Regions affected:</span>
                <span className="font-medium">{surveyAnalysis.summary.totalRegionsAffected}</span>
              </div>
              
              {eegAnalysis && (
                <>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">EEG Score:</span>
                      <span className="font-medium">
                        {(eegAnalysis.overallScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {surveyAnalysis.summary.hasProtectiveFactors && (
                <div className="mt-3 p-2 bg-green-900/20 border border-green-700/30 rounded">
                  <span className="text-xs text-green-400">
                    ✓ Protective factors present
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Main content area */}
      <div className="flex-1">
        {viewMode === 'survey' && surveyResults && (
          <IntegratedBrainSurvey surveyResults={surveyResults} />
        )}
        
        {viewMode === 'eeg' && (
          <div className="h-full flex items-center justify-center p-8">
            {eegAnalysis ? (
              <div className="max-w-4xl w-full">
                <h2 className="text-3xl font-light mb-8">EEG Analysis Results</h2>
                
                <div className="grid grid-cols-3 gap-6">
                  {Object.entries(eegAnalysis.regions).map(([region, data]) => (
                    <div key={region} className="bg-gray-900 rounded-lg p-6">
                      <h3 className="text-xl font-medium mb-4 capitalize">{region}</h3>
                      
                      <div className="space-y-3">
                        {data.markers.map((marker, idx) => (
                          <div key={idx} className="bg-gray-800 rounded p-3">
                            <div className="font-medium text-sm">{marker.type}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {marker.description}
                            </div>
                            <div className={`text-xs mt-2 ${
                              marker.severity === 'high' ? 'text-red-400' :
                              marker.severity === 'moderate' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              Severity: {marker.severity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {eegAnalysis.recommendations.length > 0 && (
                  <div className="mt-8 bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {eegAnalysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-light mb-4">No EEG Data Yet</h2>
                <p className="text-gray-400">
                  Connect your Neurable device and start recording to see EEG analysis
                </p>
              </div>
            )}
          </div>
        )}
        
        {viewMode === 'combined' && combinedAnalysis && (
          <div className="h-full p-8 overflow-y-auto">
            <h2 className="text-3xl font-light mb-8">Combined Analysis</h2>
            
            <div className="max-w-6xl mx-auto">
              {/* Top affected regions */}
              <div className="mb-8">
                <h3 className="text-xl mb-4">Most Affected Brain Regions</h3>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(combinedAnalysis.regions)
                    .sort((a, b) => b[1].combined - a[1].combined)
                    .slice(0, 6)
                    .map(([region, data]) => (
                      <div key={region} className="bg-gray-900 rounded-lg p-6">
                        <h4 className="text-lg font-medium mb-3">{region}</h4>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-light">
                              {Math.round(data.surveyImpact * 100)}%
                            </div>
                            <div className="text-xs text-gray-400">Survey</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-light">
                              {Math.round(data.eegImpact * 100)}%
                            </div>
                            <div className="text-xs text-gray-400">EEG</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-light text-purple-400">
                              {Math.round(data.combined * 100)}%
                            </div>
                            <div className="text-xs text-gray-400">Combined</div>
                          </div>
                        </div>
                        
                        {data.eegMarkers.length > 0 && (
                          <div className="border-t border-gray-800 pt-3">
                            <p className="text-xs text-gray-400 mb-2">EEG Markers:</p>
                            <div className="space-y-1">
                              {data.eegMarkers.map((marker, idx) => (
                                <div key={idx} className="text-xs">
                                  {marker.type} - {marker.description}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Comprehensive recommendations */}
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-6">
                <h3 className="text-xl font-medium mb-4">
                  Personalized Recommendations
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-purple-400 mb-3">
                      Based on Survey Results
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Trauma-focused cognitive behavioral therapy</li>
                      <li>• EMDR for specific traumatic memories</li>
                      <li>• Mindfulness-based stress reduction</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-purple-400 mb-3">
                      Based on EEG Patterns
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {Array.from(combinedAnalysis.recommendations).map((rec, idx) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}