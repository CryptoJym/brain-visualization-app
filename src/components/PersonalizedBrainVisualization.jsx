import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import WorkingPersonalizedBrain from './WorkingPersonalizedBrain';
import { analyzeTraumaImpact, brainRegions } from '../utils/traumaBrainMapping';

function PersonalizedBrainVisualization({ assessmentResults }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Debug logging
  console.log('PersonalizedBrainVisualization - assessmentResults:', assessmentResults);
  
  // Analyze trauma impacts from assessment
  const traumaAnalysis = analyzeTraumaImpact(assessmentResults);
  console.log('PersonalizedBrainVisualization - traumaAnalysis:', traumaAnalysis);
  
  const { brainImpacts = {}, summary = {
    totalACEs: 0,
    totalRegionsAffected: 0,
    primaryImpacts: [],
    criticalPeriods: {},
    genderSpecificRisks: [],
    networkImpacts: [],
    doseResponseCategory: 'baseline'
  }, recommendations = [] } = traumaAnalysis || {};
  
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
      
      {/* Main visualization - full screen */}
      <div className="absolute inset-0">
        <WorkingPersonalizedBrain 
          brainImpacts={brainImpacts}
          onRegionClick={(regionKey, regionData) => {
            console.log('Selected region:', regionKey, regionData);
          }}
        />
      </div>
      
      {/* Enhanced Impact Summary Panel with Research Data */}
      <div className="absolute top-24 right-6 w-full max-w-md lg:w-96 max-h-[calc(100vh-8rem)] overflow-y-auto pointer-events-none">
        <div className="pointer-events-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <h2 className="text-lg font-medium text-white mb-4">Impact Analysis</h2>
          
          {/* ACE Count and Dose Response */}
          <div className="mb-4 pb-4 border-b border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Total ACEs</span>
              <span className="text-2xl font-light text-white">{summary.totalACEs}</span>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-xs font-medium text-purple-300">Dose-Response Category: {summary.doseResponseCategory}</p>
              <p className="text-xs text-gray-300 mt-1">{traumaAnalysis?.researchFindings?.doseResponse || 'Calculating dose response...'}</p>
            </div>
          </div>
          
          {/* Most Affected Regions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Primary Impacts</h3>
            {(summary.primaryImpacts || []).slice(0, 5).map((impact, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white mb-1">{impact.region}</h4>
                    <p className="text-xs text-gray-400 mb-1">
                      {impact.traumaCount} trauma{impact.traumaCount > 1 ? 's' : ''} • Ages {impact.ageRanges.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">{impact.mainEffect}</p>
                    {impact.criticalPeriodAffected && (
                      <p className="text-xs text-red-400">⚠️ Affected during critical period</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Research-Based Developmental Periods */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Critical Periods Affected</h3>
            <div className="space-y-2">
              {Object.entries(summary.criticalPeriods || {}).map(([period, affected]) => (
                affected && (
                  <div key={period} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1" />
                    <span className="text-xs text-gray-400">
                      {period === 'infancy' ? 'Infancy (0-3): HPA axis programming' :
                       period === 'preschool' ? 'Preschool (3-5): Hippocampal vulnerability' :
                       period === 'schoolAge' ? 'School Age (6-11): Amygdala peak at 10-11' :
                       period === 'earlyAdolescence' ? 'Early Adolescence (11-13): 2nd hippocampal window' :
                       period === 'adolescence' ? 'Adolescence (14-18): Prefrontal maturation' :
                       period === 'chronic' ? 'Chronic: Cumulative epigenetic changes' :
                       'Throughout Childhood'}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
          
          {/* Gender-Specific Risks */}
          {summary.genderSpecificRisks && summary.genderSpecificRisks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Gender-Specific Vulnerabilities</h3>
              <div className="space-y-2">
                {summary.genderSpecificRisks.map((risk, idx) => (
                  <div key={idx} className="bg-pink-500/10 rounded-lg p-2 border border-pink-500/20">
                    <p className="text-xs text-gray-300">
                      <span className="font-medium">{risk.region || risk.system}:</span> {risk.risk}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Epigenetic Risk */}
          {traumaAnalysis?.researchFindings?.epigeneticRisk && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Epigenetic Risk Assessment</h3>
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-xs text-gray-300">{traumaAnalysis?.researchFindings?.epigeneticRisk}</p>
              </div>
            </div>
          )}
          
          {/* Network Impacts */}
          {summary.networkImpacts && summary.networkImpacts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Brain Network Alterations</h3>
              <div className="space-y-2">
                {summary.networkImpacts.map((network, idx) => (
                  <div key={idx} className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
                    <p className="text-xs font-medium text-blue-300">{network.network}</p>
                    <p className="text-xs text-gray-300 mt-1">{network.effects}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalizedBrainVisualization;