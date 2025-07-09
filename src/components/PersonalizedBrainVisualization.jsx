import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import EnterpriseBrainVisualization from './EnterpriseBrainVisualization';
import { analyzeTraumaImpact, brainRegions } from '../utils/traumaBrainMapping';

function PersonalizedBrainVisualization({ assessmentResults }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Analyze trauma impacts from assessment
  const traumaAnalysis = analyzeTraumaImpact(assessmentResults);
  const { brainImpacts, summary, recommendations } = traumaAnalysis;
  
  useEffect(() => {
    // Simulate loading
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-6 bg-gradient-to-b from-gray-900/90 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light text-white mb-2">
            Your Personalized Brain Map
          </h1>
          <p className="text-gray-400">
            Showing {summary.totalRegionsAffected} affected regions from {summary.totalACEs} ACEs
          </p>
        </div>
      </div>
      
      {/* Main visualization */}
      <div className="w-full h-full">
        <EnterpriseBrainVisualization 
          assessmentResults={assessmentResults}
          brainImpacts={brainImpacts}
          onRegionSelect={(regionKey, regionData) => {
            console.log('Selected region:', regionKey, regionData);
          }}
        />
      </div>
      
      {/* Impact Summary Panel */}
      <div className="absolute top-24 left-6 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <h2 className="text-lg font-medium text-white mb-4">Impact Summary</h2>
          
          {/* ACE Count */}
          <div className="mb-4 pb-4 border-b border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total ACEs</span>
              <span className="text-2xl font-light text-white">{summary.totalACEs}</span>
            </div>
          </div>
          
          {/* Most Affected Regions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Primary Impacts</h3>
            {summary.primaryImpacts.slice(0, 5).map((impact, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-1">{impact.region}</h4>
                <p className="text-xs text-gray-400 mb-1">
                  {impact.traumaCount} trauma{impact.traumaCount > 1 ? 's' : ''} • Ages {impact.ageRanges.join(', ')}
                </p>
                <p className="text-xs text-gray-500">{impact.mainEffect}</p>
              </div>
            ))}
          </div>
          
          {/* Developmental Periods */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Developmental Periods</h3>
            <div className="space-y-2">
              {Object.entries(summary.criticalPeriods).map(([period, affected]) => (
                affected && (
                  <div key={period} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-xs text-gray-400">
                      {period === 'earlyChildhood' ? 'Early Childhood (0-6)' :
                       period === 'middleChildhood' ? 'Middle Childhood (7-12)' :
                       period === 'adolescence' ? 'Adolescence (13-18)' :
                       'Throughout Childhood'}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend - Positioned to avoid conflicts */}
      <div className="absolute bottom-6 left-6 z-20">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-lg p-4 border border-white/20">
          <h3 className="text-sm font-medium text-white mb-3">Impact Severity</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-xs text-gray-400">High Impact (&gt;0.8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-xs text-gray-400">Moderate Impact (0.5-0.8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-400">Low Impact (&lt;0.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500" />
              <span className="text-xs text-gray-400">No Impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalizedBrainVisualization;