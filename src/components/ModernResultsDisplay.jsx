import React, { useMemo, useState } from 'react';
import AIGeneratedBrainVisualization from './visualization/AIGeneratedBrainVisualization';
import { getBrainRegionMetadata } from '../utils/brainRegionAtlas';

const ModernResultsDisplay = ({ assessmentResults }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modern color palette
  const colors = {
    primary: '#6366f1', // Indigo
    secondary: '#8b5cf6', // Purple
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
    dark: '#0f172a',
    light: '#f8fafc'
  };

  // Calculate severity levels
  const getSeverityColor = (impact) => {
    const abs = Math.abs(impact);
    if (abs < 10) return colors.success;
    if (abs < 20) return colors.warning;
    return colors.danger;
  };

  const describeImpact = (impact) => {
    const abs = Math.abs(impact);
    if (abs > 45) return 'Severe intensity';
    if (abs > 25) return 'Significant intensity';
    if (abs > 10) return 'Notable change';
    return 'Subtle modulation';
  };

  // Get impacted regions with simplified data
  const getImpactedRegions = () => {
    const impacts = Object.entries(assessmentResults.brainImpacts || {})
      .map(([region, data]) => {
        const metadata = getBrainRegionMetadata(region);
        const hotspots = data.hotspots || data.sources || [];
        return {
          name: region,
          impact: data.totalImpact,
          hotspots,
          sources: hotspots,
          system: metadata.system,
          paletteColor: metadata.paletteColor,
          description: metadata.description
        };
      })
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    return impacts;
  };

  // Calculate summary statistics
  const calculateStats = () => {
    const regions = getImpactedRegions();
    const volumeReductions = regions.filter(r => r.impact < 0);
    const hyperactivations = regions.filter(r => r.impact > 0);
    const magnitudes = regions.map(r => Math.abs(r.impact));

    const maxImpact = magnitudes.length ? Math.max(...magnitudes) : 0;
    const avgImpact = magnitudes.length
      ? magnitudes.reduce((sum, value) => sum + value, 0) / magnitudes.length
      : 0;
    
    return {
      totalRegions: regions.length,
      volumeReductions: volumeReductions.length,
      hyperactivations: hyperactivations.length,
      maxImpact,
      avgImpact
    };
  };

  const stats = useMemo(() => calculateStats(), [assessmentResults.brainImpacts]);
  const impactedRegions = useMemo(() => getImpactedRegions(), [assessmentResults.brainImpacts]);

  const systemHighlights = useMemo(() => {
    const summary = assessmentResults.systemSummary || {};
    return Object.values(summary)
      .map(system => ({
        ...system,
        magnitude: Math.abs(system.totalImpact || 0)
      }))
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, 4);
  }, [assessmentResults.systemSummary]);

  const timelineBuckets = useMemo(() => {
    const entries = assessmentResults.timeline || [];
    const buckets = [
      { label: '0-2 years', matcher: (ages = []) => ages.includes('0-2') },
      { label: '3-5 years', matcher: (ages = []) => ages.includes('3-5') },
      { label: '6-11 years', matcher: (ages = []) => ages.includes('6-8') || ages.includes('9-11') },
      { label: '12-17 years', matcher: (ages = []) => ages.includes('12-14') || ages.includes('15-17') },
      { label: 'Throughout childhood', matcher: (ages = []) => ages.includes('throughout') }
    ];

    return buckets.map(bucket => ({
      label: bucket.label,
      entries: entries.filter(item => bucket.matcher(item.ages || []))
    }));
  }, [assessmentResults.timeline]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative z-10 p-8">
          <h1 className="text-4xl font-extralight text-white mb-2">
            Neurological Impact Assessment
          </h1>
          <p className="text-lg text-gray-300">
            {assessmentResults.gender === 'female' ? 'Female' : 'Male'} • 
            ACE Score: {assessmentResults.aceScore} • 
            {stats.totalRegions} Regions Affected
          </p>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="sticky top-0 z-20 backdrop-blur-lg bg-black/30 border-b border-white/10">
        <div className="flex overflow-x-auto">
          {['overview', 'regions', 'cascade', 'timeline', 'visualization'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 capitalize whitespace-nowrap transition-all duration-300 ${
                activeTab === tab 
                  ? 'text-white border-b-2 border-purple-400 bg-white/5' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Overall Severity', value: assessmentResults.overallSeverity?.toFixed(1) || '0', color: colors.danger },
                { label: 'Regions Affected', value: stats.totalRegions, color: colors.primary },
                { label: 'Volume Reductions', value: stats.volumeReductions, color: colors.info },
                { label: 'Hyperactivations', value: stats.hyperactivations, color: colors.warning }
              ].map((stat, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-4xl font-light" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Impact Summary */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-2xl" />
              <div className="relative bg-black/40 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-light text-white mb-6">Neural Architecture Impact</h2>
                <div className="space-y-4">
                  {impactedRegions.slice(0, 5).map((region, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${region.impact < 0 ? 'bg-blue-400' : 'bg-red-400'}`} />
                        <div>
                          <span className="text-white block">{region.name}</span>
                          <span className="text-xs text-gray-400">{region.system}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-light" style={{ color: getSeverityColor(region.impact) }}>
                            {region.impact > 0 ? '+' : ''}{region.impact.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-400">
                            {region.impact < 0 ? 'Volume Reduction' : 'Hyperactivity'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {systemHighlights.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                  <h2 className="text-2xl font-light text-white mb-6">System-Level Cascades</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {systemHighlights.map((system, index) => (
                      <div key={system.system} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-white text-lg font-light">{system.system}</div>
                          <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: `${system.color}33`, color: system.color }}>
                            {system.totalImpact > 0 ? '+' : ''}{system.totalImpact.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Regions</p>
                        <div className="flex flex-wrap gap-2">
                          {system.regions.slice(0, 4).map((region, idx) => (
                            <span key={`${system.system}-${region.name}-${idx}`} className="text-xs px-2 py-1 rounded-lg bg-white/10 text-gray-200">
                              {region.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === 'regions' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {impactedRegions.map((region, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-light text-white">{region.name}</h3>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mt-1">{region.system}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        region.impact < 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {region.impact > 0 ? '+' : ''}{region.impact.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: region.paletteColor }} />
                        <span className="text-gray-300 text-sm">
                          {region.impact < 0 ? 'Structural volume reduction' : 'Functional hyperactivation'} — {describeImpact(region.impact)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span>Dominant cascades anchored in this system</span>
                      </div>
                      {region.hotspots && region.hotspots.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-white/10">
                          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-3">Key Drivers</p>
                          <div className="space-y-2">
                            {region.hotspots.slice(0, 3).map((hotspot, j) => (
                              <div key={`${hotspot.questionId}-${j}`} className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-sm text-gray-200">{hotspot.summary || hotspot.title}</p>
                                  <p className="text-xs text-gray-500">
                                    {hotspot.ages && hotspot.ages.length > 0 ? `Ages: ${hotspot.ages.join(', ')}` : 'Across multiple ages'}
                                    {hotspot.frequency && hotspot.frequency !== 'unspecified' ? ` • Frequency: ${hotspot.frequency.replace('_', ' ')}` : ''}
                                  </p>
                                </div>
                                <span className={`text-sm ${hotspot.impact >= 0 ? 'text-orange-300' : 'text-blue-300'}`}>
                                  {hotspot.impact >= 0 ? '+' : ''}{hotspot.impact.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cascade Effects Tab */}
        {activeTab === 'cascade' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-2xl" />
              <div className="relative bg-black/40 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-light text-white mb-6">Neural Cascade Effects</h2>
                
                {/* Executive-Limbic Cascade */}
                <div className="space-y-6">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg text-purple-300">Executive-Limbic Decoupling</h3>
                      <span className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                        Primary Cascade
                      </span>
                    </div>
                    <div className="pl-4 border-l-2 border-purple-500/30">
                      <p className="text-gray-300 mb-3">
                        Reduced prefrontal control combined with amygdala hyperactivity creates a fundamental 
                        imbalance in emotional regulation systems.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-purple-500/30" />
                          <span className="text-sm text-gray-400">Impaired emotion regulation</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-purple-500/30" />
                          <span className="text-sm text-gray-400">Heightened stress reactivity</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-purple-500/30" />
                          <span className="text-sm text-gray-400">Difficulty with impulse control</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Memory-Stress Cascade */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg text-blue-300">Memory-Stress Dysregulation</h3>
                      <span className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                        Secondary Cascade
                      </span>
                    </div>
                    <div className="pl-4 border-l-2 border-blue-500/30">
                      <p className="text-gray-300 mb-3">
                        Hippocampal damage impairs stress hormone regulation, creating a self-perpetuating 
                        cycle of neural damage.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-blue-500/30" />
                          <span className="text-sm text-gray-400">Disrupted memory consolidation</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-blue-500/30" />
                          <span className="text-sm text-gray-400">Elevated cortisol levels</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-blue-500/30" />
                          <span className="text-sm text-gray-400">Progressive neural damage</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-2xl" />
              <div className="relative bg-black/40 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-light text-white mb-8">Developmental Timeline</h2>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500" />
                  
                  {/* Timeline events */}
                  <div className="space-y-8">
                    {timelineBuckets.map((bucket, i) => (
                      <div key={bucket.label} className="relative flex items-start gap-6">
                        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{i + 1}</span>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-light text-white mb-2">{bucket.label}</h3>
                          {bucket.entries.length > 0 ? (
                            <div className="space-y-3">
                              {bucket.entries.map((entry, j) => (
                                <div key={`${bucket.label}-${j}`} className="flex items-start justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                                  <div>
                                    <p className="text-sm text-gray-200">{entry.summary || entry.title}</p>
                                    <p className="text-xs text-gray-400 flex flex-wrap gap-2">
                                      <span>{entry.region}</span>
                                      {entry.frequency && entry.frequency !== 'unspecified' && (
                                        <span>Frequency: {entry.frequency.replace('_', ' ')}</span>
                                      )}
                                      <span>Severity: {entry.severity || describeImpact(entry.impact)}</span>
                                    </p>
                                  </div>
                                  <span className={`text-sm ${entry.impact >= 0 ? 'text-orange-300' : 'text-blue-300'}`}>
                                    {entry.impact >= 0 ? '+' : ''}{entry.impact.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No trauma reported</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Visualization Tab */}
        {activeTab === 'visualization' && (
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-2xl" />
              <div className="relative bg-black/40 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <AIGeneratedBrainVisualization assessmentResults={assessmentResults} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernResultsDisplay;