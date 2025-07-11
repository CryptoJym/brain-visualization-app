import React, { useRef, useEffect, useState } from 'react';
import { analyzeProfessionalTraumaImpact } from '../utils/professionalTraumaBrainMapping';
import { analyzeQuestionnaireImpacts } from '../utils/transformQuestionnaireData';

export default function PersonalizedThreeBrain({ assessmentResults, brainImpacts }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState('Loading library...');
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const regionMeshesRef = useRef([]);

  // If assessmentResults provided, analyze them
  const impacts = brainImpacts || (assessmentResults ? analyzeQuestionnaireImpacts(assessmentResults) : {});

  useEffect(() => {
    if (!containerRef.current) return;

    let script = null;
    let loadAttempt = 0;
    
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load from ${src}`));
        
        document.head.appendChild(script);
      });
    };
    
    const tryLoadLibrary = async () => {
      const sources = [
        // Primary: local file
        `${window.location.origin}/libs/threebrain-main.js`,
        // Fallback 1: without origin (relative)
        '/libs/threebrain-main.js',
        // Fallback 2: direct GitHub raw file (as last resort)
        'https://raw.githubusercontent.com/dipterix/threeBrain/master/inst/js_raws/dist/threebrain.js'
      ];
      
      for (const src of sources) {
        try {
          setLoadStatus(`Loading library from ${src.includes('github') ? 'CDN' : 'local'}...`);
          await loadScript(src);
          
          // Check if library loaded successfully
          if (window.threeBrain) {
            setLoadStatus('Library loaded, initializing...');
            initializeVisualization();
            return;
          }
        } catch (error) {
          console.warn(`Failed to load from ${src}:`, error);
          // Clean up failed script
          if (script && script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }
      }
      
      // All sources failed
      setError('Failed to load three-brain library from all sources');
      setIsLoading(false);
      
      // Dispatch event to trigger fallback
      window.dispatchEvent(new CustomEvent('brainVisualizationError', {
        detail: { fallbackToSimple: true }
      }));
    };
    
    const initializeVisualization = () => {
      if (!window.threeBrain) {
        setError('threeBrain not found on window');
        setIsLoading(false);
        return;
      }

      const { ViewerApp, ExternLibs } = window.threeBrain;
      const THREE = ExternLibs?.THREE;

      if (!ViewerApp || !THREE) {
        setError('ViewerApp or THREE not available');
        setIsLoading(false);
        return;
      }

      try {
        // Create viewer with correct parameter name
        const viewer = new ViewerApp({
          $wrapper: containerRef.current,
          width: window.innerWidth,
          height: window.innerHeight,
          debug: false,
          webgl2Enabled: true
        });

        viewerRef.current = viewer;
        setLoadStatus('Viewer created, setting up brain regions...');

        // The ViewerApp creates its own canvas property
        if (!viewer.canvas) {
          setError('Canvas not initialized');
          setIsLoading(false);
          return;
        }

        // Access scene from canvas
        const scene = viewer.canvas.scene;
        const camera = viewer.canvas.camera;
        
        if (!scene || !camera) {
          setError('Scene or camera not available');
          setIsLoading(false);
          return;
        }

        // Set background
        scene.background = new THREE.Color(0x000814);
        scene.fog = new THREE.Fog(0x000814, 100, 400);

        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(50, 50, 50);
        mainLight.castShadow = true;
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x4080ff, 0.3);
        fillLight.position.set(-50, 20, -50);
        scene.add(fillLight);

        // Create brain visualization
        const brainGroup = new THREE.Group();
        scene.add(brainGroup);

        // Main brain shape - icosahedron deformed to look brain-like
        const brainGeometry = new THREE.IcosahedronGeometry(60, 3);
        const positions = brainGeometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          // Deform to brain shape
          positions.setX(i, x * 1.2 * (1 + 0.1 * Math.sin(y * 0.1)));
          positions.setY(i, y * 1.4);
          positions.setZ(i, z * 0.9 * (1 + 0.1 * Math.cos(x * 0.1)));
        }
        positions.needsUpdate = true;
        brainGeometry.computeVertexNormals();

        const brainMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffcccc,
          transparent: true,
          opacity: 0.1,
          roughness: 0.8,
          metalness: 0.1,
          side: THREE.DoubleSide,
          depthWrite: false
        });

        const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
        brainGroup.add(brainMesh);

        // Professional brain regions with trauma impacts
        const regions = [
          // Frontal Lobe
          { name: 'Superior Frontal', pos: [0, 45, 35], color: 0x4169e1, size: 15 },
          { name: 'Rostral Middle Frontal', pos: [-30, 35, 40], color: 0x5179f1, size: 12 },
          { name: 'Caudal Middle Frontal', pos: [-40, 25, 20], color: 0x6189ff, size: 11 },
          { name: 'Lateral Orbitofrontal', pos: [-20, -5, 45], color: 0xa1c9ff, size: 8 },
          { name: 'Medial Orbitofrontal', pos: [0, -5, 48], color: 0xb1d9ff, size: 8 },
          { name: 'Precentral', pos: [-30, 20, 0], color: 0x7199ff, size: 12 },
          
          // Temporal Lobe
          { name: 'Superior Temporal', pos: [-50, 0, 0], color: 0xffa500, size: 13 },
          { name: 'Middle Temporal', pos: [-50, -15, 0], color: 0xffb520, size: 11 },
          { name: 'Inferior Temporal', pos: [-45, -25, 5], color: 0xffc540, size: 10 },
          { name: 'Temporal Pole', pos: [-35, -5, 35], color: 0xffd560, size: 8 },
          { name: 'Fusiform', pos: [-30, -35, -10], color: 0xffe580, size: 9 },
          
          // Parietal Lobe
          { name: 'Superior Parietal', pos: [0, 45, -30], color: 0x32cd32, size: 12 },
          { name: 'Inferior Parietal', pos: [-35, 35, -35], color: 0x42dd42, size: 11 },
          { name: 'Postcentral', pos: [-25, 30, -10], color: 0x52ed52, size: 11 },
          { name: 'Precuneus', pos: [0, 35, -40], color: 0x62fd62, size: 10 },
          
          // Occipital Lobe
          { name: 'Pericalcarine', pos: [0, 10, -50], color: 0xff69b4, size: 9 },
          { name: 'Lateral Occipital', pos: [-25, 5, -45], color: 0xff79c4, size: 10 },
          
          // Cingulate
          { name: 'Caudal Anterior Cingulate', pos: [0, 15, 15], color: 0xdda0dd, size: 8 },
          { name: 'Rostral Anterior Cingulate', pos: [0, 20, 25], color: 0xedb0ed, size: 8 },
          { name: 'Posterior Cingulate', pos: [0, 25, -15], color: 0xfdc0fd, size: 8 },
          
          // Subcortical - CRITICAL for trauma
          { name: 'Amygdala', pos: [-22, -10, 15], color: 0xff0000, size: 7 },
          { name: 'Amygdala', pos: [22, -10, 15], color: 0xff0000, size: 7 },
          { name: 'Hippocampus', pos: [-20, -15, 5], color: 0x9370db, size: 9 },
          { name: 'Hippocampus', pos: [20, -15, 5], color: 0x9370db, size: 9 },
          { name: 'Thalamus', pos: [0, -5, 0], color: 0x4682b4, size: 10 },
          { name: 'Caudate', pos: [-15, 5, 5], color: 0x5692c4, size: 7 },
          { name: 'Putamen', pos: [-25, 0, 0], color: 0x6702d4, size: 8 },
          { name: 'Nucleus Accumbens', pos: [-10, -5, 15], color: 0xffa500, size: 5 },
          
          // Brainstem
          { name: 'Midbrain', pos: [0, -20, -5], color: 0xffd700, size: 8 },
          { name: 'Pons', pos: [0, -25, -10], color: 0xffe720, size: 7 },
          { name: 'Medulla', pos: [0, -30, -5], color: 0xfff740, size: 6 },
          
          // Cerebellum
          { name: 'Cerebellar Cortex', pos: [0, -30, -35], color: 0xccaaff, size: 20 },
          { name: 'Cerebellar Vermis', pos: [0, -25, -30], color: 0xddbbff, size: 8 }
        ];

        const regionMeshes = [];
        
        regions.forEach((region, index) => {
          // Check if this region is impacted by trauma
          const impactData = impacts[region.name];
          const isImpacted = impactData && impactData.impactLevel > 0;
          const impactLevel = isImpacted ? impactData.impactLevel : 0;
          
          const geometry = new THREE.SphereGeometry(region.size, 32, 32);
          
          // Color based on impact level
          let color = region.color;
          let emissiveIntensity = 0.2;
          let opacity = 0.7;
          
          if (isImpacted) {
            // Red gradient based on impact level
            const hue = 0; // Red
            const saturation = 0.8 + (impactLevel * 0.2); // More saturated with higher impact
            const lightness = 0.6 - (impactLevel * 0.3); // Darker with higher impact
            color = new THREE.Color().setHSL(hue, saturation, lightness);
            emissiveIntensity = 0.3 + (impactLevel * 0.4);
            opacity = 0.8 + (impactLevel * 0.2);
          }
          
          const material = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: emissiveIntensity,
            transparent: true,
            opacity: opacity,
            roughness: 0.3,
            metalness: 0.2,
            clearcoat: isImpacted ? 0.5 : 0.3,
            clearcoatRoughness: 0.3
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(...region.pos);
          mesh.userData = { 
            name: region.name,
            originalColor: region.color,
            isImpacted: isImpacted,
            impactLevel: impactLevel,
            impactData: impactData
          };
          
          // Add glow effect for highly impacted regions
          if (impactLevel > 0.7) {
            mesh.userData.glow = true;
            mesh.userData.glowPhase = Math.random() * Math.PI * 2;
          }
          
          brainGroup.add(mesh);
          regionMeshes.push(mesh);
        });
        
        regionMeshesRef.current = regionMeshes;

        // Position camera
        camera.position.set(0, 0, 200);
        camera.lookAt(0, 0, 0);

        // Mouse interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredMesh = null;

        const handleMouseMove = (event) => {
          const rect = containerRef.current.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(regionMeshes);

          // Reset previous hover
          if (hoveredMesh && hoveredMesh !== selectedRegion) {
            hoveredMesh.scale.setScalar(1);
          }

          // Apply hover effect
          if (intersects.length > 0) {
            hoveredMesh = intersects[0].object;
            if (hoveredMesh !== selectedRegion) {
              hoveredMesh.scale.setScalar(1.1);
            }
            containerRef.current.style.cursor = 'pointer';
          } else {
            hoveredMesh = null;
            containerRef.current.style.cursor = 'grab';
          }
        };

        const handleClick = (event) => {
          if (hoveredMesh) {
            setSelectedRegion(hoveredMesh.userData);
          }
        };

        containerRef.current.addEventListener('mousemove', handleMouseMove);
        containerRef.current.addEventListener('click', handleClick);

        setLoadStatus('Brain visualization ready');

        // Start animation
        let animationId;
        let time = 0;
        
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          time += 0.01;
          
          // Gentle rotation
          brainGroup.rotation.y = Math.sin(time * 0.3) * 0.1;
          
          // Animate impacted regions
          regionMeshes.forEach(mesh => {
            if (mesh.userData.glow) {
              const glowScale = 1 + Math.sin(time * 2 + mesh.userData.glowPhase) * 0.05;
              if (mesh !== hoveredMesh && mesh !== selectedRegion) {
                mesh.scale.setScalar(glowScale);
              }
              // Pulse emissive intensity
              const baseIntensity = 0.3 + (mesh.userData.impactLevel * 0.4);
              mesh.material.emissiveIntensity = baseIntensity + Math.sin(time * 3 + mesh.userData.glowPhase) * 0.2;
            }
          });
          
          // Use viewer's render method
          if (viewer.canvas && viewer.canvas.needsUpdate) {
            viewer.canvas.needsUpdate = true;
            viewer.canvas.render();
          }
        };
        animate();

        setIsLoading(false);

        // Cleanup
        return () => {
          containerRef.current?.removeEventListener('mousemove', handleMouseMove);
          containerRef.current?.removeEventListener('click', handleClick);
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          viewer.dispose();
        };

      } catch (error) {
        console.error('Failed to initialize:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    // Start loading process
    tryLoadLibrary();

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [impacts]);

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-gray-900 via-purple-900/10 to-black">
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-light text-white mb-4">
              Loading Your Brain Map
            </div>
            <div className="text-lg text-gray-400 mb-2">
              {loadStatus}
            </div>
            <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-2xl font-light text-red-400 mb-4">
              Error
            </div>
            <div className="text-gray-400">
              {error}
            </div>
          </div>
        </div>
      )}
      
      <div ref={containerRef} className="w-full h-full" />
      
      {!isLoading && !error && (
        <>
          <div className="absolute top-6 left-6 pointer-events-none max-w-md">
            <h1 className="text-3xl font-light text-white mb-2">
              Your Neural Impact Map
            </h1>
            <p className="text-sm text-gray-400">
              {Object.keys(impacts).length > 0 
                ? `Showing ${Object.keys(impacts).length} regions affected by childhood experiences`
                : 'Interactive brain visualization'
              }
            </p>
          </div>

          {/* Selected region info */}
          {selectedRegion && (
            <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-xl p-6 rounded-xl border border-white/20 max-w-md">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-light text-white">{selectedRegion.name}</h2>
                  {selectedRegion.isImpacted && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-sm text-red-400">
                        Impact Level: {Math.round(selectedRegion.impactLevel * 100)}%
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {selectedRegion.impactData && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Affected By:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRegion.impactData.traumaTypes.map(type => (
                        <span key={type} className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedRegion.impactData.ageRanges && selectedRegion.impactData.ageRanges.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Critical Period:</h3>
                      <div className="text-sm text-gray-300">
                        Ages {selectedRegion.impactData.ageRanges.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      This region shows alterations based on your reported experiences during critical developmental periods.
                    </p>
                  </div>
                </div>
              )}
              
              {!selectedRegion.isImpacted && (
                <p className="text-sm text-gray-300">
                  This region shows typical development based on your assessment.
                </p>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-xs">
            <div className="font-medium text-white mb-2">Impact Visualization</div>
            <div className="space-y-1 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>High impact regions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Moderate impact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Typical development</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}