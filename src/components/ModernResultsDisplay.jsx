import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const ModernResultsDisplay = ({ assessmentResults }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const mountRef = useRef(null);
  
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

  // Get impacted regions with simplified data
  const getImpactedRegions = () => {
    return Object.entries(assessmentResults.brainImpacts)
      .map(([region, data]) => ({
        name: region,
        impact: data.totalImpact,
        sources: data.sources || []
      }))
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  };

  // Calculate summary statistics
  const calculateStats = () => {
    const regions = getImpactedRegions();
    const volumeReductions = regions.filter(r => r.impact < 0);
    const hyperactivations = regions.filter(r => r.impact > 0);
    
    return {
      totalRegions: regions.length,
      volumeReductions: volumeReductions.length,
      hyperactivations: hyperactivations.length,
      maxImpact: Math.max(...regions.map(r => Math.abs(r.impact))),
      avgImpact: regions.reduce((sum, r) => sum + Math.abs(r.impact), 0) / regions.length
    };
  };

  const stats = calculateStats();
  const impactedRegions = getImpactedRegions();

  // 3D Brain Visualization
  useEffect(() => {
    if (activeTab !== 'visualization' || !mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create brain regions as spheres
    const regions = [];
    impactedRegions.forEach((region, index) => {
      const magnitude = Math.abs(region.impact) / 50;
      const geometry = new THREE.SphereGeometry(0.3 + magnitude, 32, 32);
      
      const material = new THREE.MeshPhongMaterial({
        color: region.impact < 0 ? 0x3b82f6 : 0xef4444,
        emissive: region.impact < 0 ? 0x1e40af : 0x991b1b,
        emissiveIntensity: 0.3,
        shininess: 100,
        transparent: true,
        opacity: 0.8
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      const angle = (index / impactedRegions.length) * Math.PI * 2;
      const radius = 2;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = Math.sin(angle) * radius;
      mesh.position.z = (Math.random() - 0.5) * 2;
      
      scene.add(mesh);
      regions.push({ mesh, baseY: mesh.position.y });
    });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate scene
      scene.rotation.y += 0.003;
      
      // Float effect for regions
      regions.forEach((region, i) => {
        region.mesh.position.y = region.baseY + Math.sin(Date.now() * 0.001 + i) * 0.1;
        region.mesh.rotation.x += 0.01;
        region.mesh.rotation.y += 0.01;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activeTab]);

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
                        <span className="text-white">{region.name}</span>
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
                      <h3 className="text-xl font-light text-white">{region.name}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        region.impact < 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {region.impact > 0 ? '+' : ''}{region.impact.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-gray-300 text-sm">
                          {region.impact < 0 ? 'Structural volume reduction' : 'Functional hyperactivation'}
                        </span>
                      </div>
                      
                      {region.sources && region.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-400 mb-2">Contributing Factors</p>
                          <div className="flex flex-wrap gap-2">
                            {region.sources.slice(0, 3).map((source, j) => (
                              <span key={j} className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-300">
                                {source.trauma}
                              </span>
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
                    {['0-2 years', '3-5 years', '6-11 years', '12-17 years'].map((period, i) => {
                      const traumas = Object.entries(assessmentResults.ageData)
                        .filter(([_, ages]) => {
                          const ageArray = Array.isArray(ages) ? ages : [ages];
                          return ageArray.some(age => {
                            if (period === '0-2 years') return age === '0-2';
                            if (period === '3-5 years') return age === '3-5';
                            if (period === '6-11 years') return age === '6-8' || age === '9-11';
                            if (period === '12-17 years') return age === '12-14' || age === '15-17';
                            return false;
                          });
                        });
                      
                      return (
                        <div key={i} className="relative flex items-start gap-6">
                          <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{i + 1}</span>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-light text-white mb-2">{period}</h3>
                            {traumas.length > 0 ? (
                              <div className="space-y-2">
                                {traumas.map(([traumaId], j) => (
                                  <div key={j} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <span className="text-gray-300 text-sm">
                                      {traumaId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No trauma reported</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                <h2 className="text-2xl font-light text-white mb-6">3D Neural Network Visualization</h2>
                <div ref={mountRef} className="w-full h-[600px] rounded-2xl overflow-hidden bg-black/50" />
                <div className="mt-6 flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                    <span className="text-gray-300 text-sm">Volume Reduction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span className="text-gray-300 text-sm">Hyperactivity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernResultsDisplay;