import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BrainImpactResults = ({ assessmentResults }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const brainMeshRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !assessmentResults) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 200);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Create brain regions based on impact data
    createBrainVisualization(scene, assessmentResults.brainImpacts);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (brainMeshRef.current) {
        brainMeshRef.current.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [assessmentResults]);

  const createBrainVisualization = (scene, brainImpacts) => {
    // Main brain container
    const brainGroup = new THREE.Group();
    brainMeshRef.current = brainGroup;

    // Base brain (healthy tissue)
    const brainGeometry = new THREE.SphereGeometry(60, 64, 64);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0x808080,
      opacity: 0.3,
      transparent: true
    });
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainGroup.add(brainMesh);

    // Brain region positions (simplified for visualization)
    const regionPositions = {
      'Prefrontal Cortex': { pos: [0, 40, 50], size: 20 },
      'Medial Prefrontal Cortex': { pos: [0, 35, 45], size: 15 },
      'Amygdala': { pos: [-20, -10, 0], size: 8 },
      'Hippocampus': { pos: [25, -15, 0], size: 12 },
      'Corpus Callosum': { pos: [0, 0, 0], size: 30 },
      'Anterior Cingulate': { pos: [0, 20, 30], size: 10 },
      'Visual Cortex': { pos: [0, -20, -50], size: 25 },
      'Temporal Lobe': { pos: [-40, -20, 0], size: 25 },
      'Sensory Cortex': { pos: [0, 50, 0], size: 20 },
      'Orbitofrontal Cortex': { pos: [0, 30, 40], size: 18 },
      'Cerebellum': { pos: [0, -50, -30], size: 30 },
      'Insula': { pos: [-30, 0, 0], size: 10 },
      'White Matter Integrity': { pos: [0, 0, 0], size: 50 },
      'Limbic System': { pos: [0, -20, 10], size: 25 },
      'Visual Association Areas': { pos: [-20, -15, -40], size: 15 }
    };

    // Add impacted regions
    Object.entries(brainImpacts).forEach(([regionName, impactData]) => {
      const region = regionPositions[regionName];
      if (!region) return;

      const impact = impactData.totalImpact;
      const isReduced = impact < 0;
      const impactMagnitude = Math.abs(impact);

      // Create region sphere
      const geometry = new THREE.SphereGeometry(
        region.size * (isReduced ? (100 - impactMagnitude) / 100 : 1),
        32,
        32
      );

      // Color based on impact type
      let color;
      if (isReduced) {
        // Blue gradient for volume reduction
        const intensity = Math.min(impactMagnitude / 30, 1);
        color = new THREE.Color(0.2, 0.2, 1 - intensity * 0.5);
      } else {
        // Red gradient for hyperactivity
        const intensity = Math.min(impactMagnitude / 30, 1);
        color = new THREE.Color(1, 0.2, 0.2);
      }

      const material = new THREE.MeshPhongMaterial({
        color,
        opacity: 0.7,
        transparent: true,
        emissive: color,
        emissiveIntensity: 0.3
      });

      const regionMesh = new THREE.Mesh(geometry, material);
      regionMesh.position.set(...region.pos);
      
      // Add pulsing for hyperactive regions
      if (!isReduced && impactMagnitude > 10) {
        regionMesh.userData = {
          isPulsing: true,
          baseScale: 1,
          pulseSpeed: 0.02 * (impactMagnitude / 20)
        };
      }

      // Store impact data for interaction
      regionMesh.userData.regionName = regionName;
      regionMesh.userData.impact = impact;
      regionMesh.userData.sources = impactData.sources;

      brainGroup.add(regionMesh);
    });

    scene.add(brainGroup);

    // Update pulsing regions in animation
    const pulsingRegions = brainGroup.children.filter(child => child.userData.isPulsing);
    if (pulsingRegions.length > 0) {
      const pulsate = () => {
        requestAnimationFrame(pulsate);
        pulsingRegions.forEach(region => {
          const scale = region.userData.baseScale + 
            Math.sin(Date.now() * region.userData.pulseSpeed) * 0.1;
          region.scale.setScalar(scale);
        });
      };
      pulsate();
    }
  };

  const getSeverityDescription = (severity) => {
    if (severity < 2) return 'Minimal Impact';
    if (severity < 4) return 'Mild Impact';
    if (severity < 6) return 'Moderate Impact';
    if (severity < 8) return 'Significant Impact';
    return 'Severe Impact';
  };

  const getSeverityColor = (severity) => {
    if (severity < 2) return 'text-green-400';
    if (severity < 4) return 'text-yellow-400';
    if (severity < 6) return 'text-orange-400';
    if (severity < 8) return 'text-red-400';
    return 'text-red-600';
  };

  if (!assessmentResults) {
    return <div>No assessment data available</div>;
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0" />

      {/* Results Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <div className="p-8 pointer-events-auto">
          <h1 className="text-4xl font-light text-white mb-2">
            Your Brain Impact Assessment
          </h1>
          <p className="text-gray-400">
            Based on neuroscience research from leading institutions
          </p>
        </div>

        {/* Key Metrics */}
        <div className="absolute top-8 right-8 bg-black/80 backdrop-blur-xl rounded-xl p-6 border border-white/10 pointer-events-auto">
          <div className="space-y-4">
            <div>
              <div className="text-gray-400 text-sm">ACE Score</div>
              <div className="text-3xl font-light text-white">
                {assessmentResults.aceScore}/10
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Overall Severity</div>
              <div className={`text-2xl font-light ${getSeverityColor(assessmentResults.overallSeverity)}`}>
                {getSeverityDescription(assessmentResults.overallSeverity)}
              </div>
              <div className="text-sm text-gray-500">
                {assessmentResults.overallSeverity.toFixed(1)}/10
              </div>
            </div>
            {assessmentResults.protectiveFactor && (
              <div className="pt-2 border-t border-white/10">
                <div className="text-green-400 text-sm">
                  ✓ Protective Factor Present
                </div>
                <div className="text-xs text-gray-500">
                  30% impact reduction applied
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Brain Impact Summary */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent pointer-events-auto">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-light text-white mb-4">
              Predicted Brain Changes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(assessmentResults.brainImpacts)
                .sort((a, b) => Math.abs(b[1].totalImpact) - Math.abs(a[1].totalImpact))
                .slice(0, 6)
                .map(([region, data]) => {
                  const impact = data.totalImpact;
                  const isReduced = impact < 0;
                  
                  return (
                    <div key={region} className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10">
                      <h3 className="text-white font-medium mb-1">{region}</h3>
                      <div className={`text-2xl font-light mb-2 ${isReduced ? 'text-blue-400' : 'text-red-400'}`}>
                        {isReduced ? '' : '+'}{impact.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {isReduced ? 'Volume/Activity Reduction' : 'Hyperactivity/Enlargement'}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Sources: {data.sources.map(s => s.trauma).join(', ')}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-6 text-sm text-gray-400">
              <p>
                This visualization represents predicted changes based on peer-reviewed research. 
                Individual outcomes vary significantly. These are population-level predictions, not diagnoses.
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-xl rounded-lg p-4 border border-white/10 pointer-events-auto">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-400">Reduced Volume/Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-400">Increased Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded opacity-30"></div>
              <span className="text-gray-400">Typical Brain Tissue</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainImpactResults;