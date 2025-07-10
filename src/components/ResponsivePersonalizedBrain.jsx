import React, { useState, useEffect } from 'react';
import ResponsiveBrainVis from './ResponsiveBrainVis';
import LoadingScreen from './LoadingScreen';
import { analyzeTraumaImpact } from '../utils/traumaBrainMapping';

export default function ResponsivePersonalizedBrain({ assessmentResults }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Analyze trauma impacts
  const traumaAnalysis = analyzeTraumaImpact(assessmentResults);
  const { brainImpacts = {}, summary = {
    totalACEs: 0,
    totalRegionsAffected: 0,
    primaryImpacts: [],
    criticalPeriods: {},
    genderSpecificRisks: [],
    networkImpacts: [],
    doseResponseCategory: 'baseline'
  }} = traumaAnalysis || {};
  
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
  
  const SummaryPanel = () => (
    <div className={`
      ${isMobile 
        ? 'fixed inset-x-0 bottom-0 max-h-[70vh] rounded-t-2xl' 
        : 'absolute top-24 left-6 w-full max-w-md lg:w-96 max-h-[calc(100vh-8rem)] rounded-xl'
      }
      bg-black/90 backdrop-blur-xl border border-white/10 overflow-y-auto
      transform transition-transform duration-300
      ${isMobile && !showSummary ? 'translate-y-full' : 'translate-y-0'}
    `}>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-medium text-white">Your Impact Analysis</h2>
          {isMobile && (
            <button
              onClick={() => setShowSummary(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          )}
        </div>
        
        {/* ACE Count */}
        <div className="mb-4 pb-4 border-b border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Total ACEs</span>
            <span className="text-2xl font-light text-white">{summary.totalACEs}</span>
          </div>
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-xs font-medium text-purple-300">
              {summary.totalRegionsAffected} brain regions affected
            </p>
          </div>
        </div>
        
        {/* Primary Impacts */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Primary Impacts</h3>
          {(summary.primaryImpacts || []).slice(0, isMobile ? 3 : 5).map((impact, idx) => (
            <div key={idx} className="bg-white/5 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-1">{impact.region}</h4>
              <p className="text-xs text-gray-400">
                {impact.traumaCount} trauma{impact.traumaCount > 1 ? 's' : ''} • 
                Ages {impact.ageRanges.join(', ')}
              </p>
              {impact.criticalPeriodAffected && (
                <p className="text-xs text-red-400 mt-1">⚠️ Critical period affected</p>
              )}
            </div>
          ))}
        </div>
        
        {/* Critical Periods */}
        {Object.keys(summary.criticalPeriods || {}).length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Developmental Periods</h3>
            <div className="space-y-1 text-xs">
              {Object.entries(summary.criticalPeriods).map(([period, affected]) => (
                affected && (
                  <div key={period} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-gray-400 capitalize">{period}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 md:p-6 bg-gradient-to-b from-gray-900/90 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-light text-white mb-2">
            Your Personalized Brain Map
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Showing {summary.totalRegionsAffected} affected regions from {summary.totalACEs} ACEs
          </p>
        </div>
      </div>
      
      {/* Brain Visualization */}
      <ResponsiveBrainVis brainImpacts={brainImpacts} />
      
      {/* Summary Panel */}
      <SummaryPanel />
      
      {/* Mobile Toggle Button */}
      {isMobile && !showSummary && (
        <button
          onClick={() => setShowSummary(true)}
          className="fixed bottom-6 left-6 bg-purple-600 text-white rounded-full px-4 py-2 text-sm shadow-lg"
        >
          View Analysis
        </button>
      )}
    </div>
  );
}