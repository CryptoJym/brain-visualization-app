import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { brainRegions } from '../utils/traumaBrainMapping';
import { 
  loadBrainMesh, 
  createRegionHighlight, 
  resetBrainHighlights,
  createFallbackBrainMesh 
} from '../utils/brainMeshLoader';

// Free brain model URLs (you can replace with actual model URLs)
const BRAIN_MODEL_URLS = {
  // These would be actual URLs to brain models
  // For now, we'll use the fallback
  default: null
};

export default function EnterpriseBrainVisualization({ 
  assessmentResults, 
  brainImpacts = {},
  onRegionSelect,
  selectedRegionId 
}) {
  console.log('EnterpriseBrainVisualization props:', { 
    assessmentResults, 
    brainImpacts, 
    hasAssessmentResults: !!assessmentResults,
    brainImpactsKeys: brainImpacts ? Object.keys(brainImpacts) : 'none' 
  });
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const brainModelRef = useRef(null);
  const regionSpheresRef = useRef({});
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(selectedRegionId);
  const [showLabels, setShowLabels] = useState(false);
  const [viewMode, setViewMode] = useState('lateral');
  const [regionLabels, setRegionLabels] = useState({});
  const [loadingError, setLoadingError] = useState(false);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Check WebGL support
    if (!window.WebGLRenderingContext) {
      console.error('WebGL not supported');
      setLoadingError(true);
      setIsLoading(false);
      return;
    }
    
    // Failsafe timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.error('Loading timeout - forcing completion');
        setLoadingError(true);
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    sceneRef.current = scene;
    
    console.log('Scene created:', scene);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Renderer setup with high quality settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Clear any existing canvas before appending
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    console.log('Renderer initialized, canvas added to DOM');
    
    // Controls with smooth damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 30;
    controls.minDistance = 5;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    controlsRef.current = controls;
    
    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight1.position.set(10, 20, 10);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.camera.near = 0.1;
    directionalLight1.shadow.camera.far = 50;
    directionalLight1.shadow.camera.left = -15;
    directionalLight1.shadow.camera.right = 15;
    directionalLight1.shadow.camera.top = 15;
    directionalLight1.shadow.camera.bottom = -15;
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0x4169e1, 0.6);
    directionalLight2.position.set(-10, -10, -10);
    scene.add(directionalLight2);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);
    
    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Update controls
      controlsRef.current?.update();
      
      // Animate impacted regions
      const time = Date.now() * 0.001;
      Object.entries(regionSpheresRef.current).forEach(([key, mesh]) => {
        if (mesh && mesh.userData && mesh.userData.isImpacted) {
          // Gentle pulsing effect
          const scale = 1 + Math.sin(time * 2) * 0.05;
          if (mesh.userData.regionKey !== selectedRegion) {
            mesh.scale.setScalar(scale);
          }
          
          // Rotate glow effect
          if (mesh.children && mesh.children[0]) {
            mesh.children[0].rotation.y = time * 0.5;
          }
        }
      });
      
      // Render
      rendererRef.current?.render(sceneRef.current, cameraRef.current);
    };

    // Add a test cube to verify rendering
    const testGeometry = new THREE.BoxGeometry(3, 3, 3);
    const testMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.2
    });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(0, 5, 0);
    scene.add(testCube);
    console.log('Test cube added to scene at position:', testCube.position);

    // Load or create brain model
    const loadBrain = async () => {
      try {
        console.log('Starting brain load...');
        setLoadingProgress(10);
        setLoadingError(false);
        
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        let brainModel;
        if (BRAIN_MODEL_URLS.default) {
          // Load real brain model
          console.log('Loading brain model from URL...');
          brainModel = await loadBrainMesh(BRAIN_MODEL_URLS.default);
        } else {
          // Use fallback brain mesh
          console.log('Creating fallback brain mesh...');
          brainModel = createFallbackBrainMesh();
        }
        
        setLoadingProgress(50);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Scale and position the brain
        brainModel.scale.set(1, 1, 1);
        brainModel.position.set(0, 0, 0);
        
        scene.add(brainModel);
        brainModelRef.current = brainModel;
        
        setLoadingProgress(70);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Add region markers
        console.log('Adding region markers...');
        addRegionMarkers(scene);
        
        setLoadingProgress(100);
        console.log('Brain loading complete');
        setTimeout(() => {
          setIsLoading(false);
          // Start animation after loading completes
          animate();
        }, 500);
        
      } catch (error) {
        console.error('Error loading brain model:', error);
        setLoadingProgress(100);
        
        // Use fallback on error
        try {
          const fallbackBrain = createFallbackBrainMesh();
          scene.add(fallbackBrain);
          brainModelRef.current = fallbackBrain;
          addRegionMarkers(scene);
        } catch (fallbackError) {
          console.error('Error creating fallback brain:', fallbackError);
        }
        
        setTimeout(() => {
          setIsLoading(false);
          // Start animation after loading completes
          animate();
        }, 500);
      }
    };
    
    // Start loading process
    loadBrain();
    
    // Add interactive region markers
    const addRegionMarkers = (scene) => {
      console.log('Adding region markers for', Object.keys(brainRegions).length, 'regions');
      Object.entries(brainRegions).forEach(([regionKey, region]) => {
        if (region.type !== 'region') return;
        
        const impactData = brainImpacts[regionKey];
        const isImpacted = !!impactData;
        const impactStrength = impactData?.impactStrength || 0;
        
        // Determine color based on impact
        let color = region.color || 0x4ecdc4;
        let emissiveIntensity = 0;
        
        if (isImpacted) {
          if (impactStrength > 0.8) {
            color = 0xff0000;
            emissiveIntensity = 0.5;
          } else if (impactStrength > 0.5) {
            color = 0xffa500;
            emissiveIntensity = 0.4;
          } else if (impactStrength > 0) {
            color = 0xffff00;
            emissiveIntensity = 0.3;
          }
        }
        
        // Create region markers
        const createMarker = (position, side = '') => {
          const size = (region.size || 0.3) * 0.8;
          const geometry = new THREE.SphereGeometry(size, 32, 32);
          
          const material = new THREE.MeshPhongMaterial({
            color,
            transparent: true,
            opacity: isImpacted ? 0.8 : 0.6,
            emissive: isImpacted ? color : 0x000000,
            emissiveIntensity: emissiveIntensity
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(...position);
          
          // Add glow effect for impacted regions
          if (isImpacted) {
            const glowGeometry = new THREE.SphereGeometry(size * 1.2, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity: 0.2,
              side: THREE.BackSide
            });
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            mesh.add(glowMesh);
          }
          
          // Store metadata
          mesh.userData = {
            regionKey,
            regionData: region,
            side,
            isImpacted,
            impactStrength
          };
          
          return mesh;
        };
        
        // Create markers based on position data
        if (region.position.center) {
          const marker = createMarker(region.position.center);
          scene.add(marker);
          regionSpheresRef.current[regionKey] = marker;
        } else if (region.position.left && region.position.right) {
          const leftMarker = createMarker(region.position.left, 'left');
          const rightMarker = createMarker(region.position.right, 'right');
          scene.add(leftMarker);
          scene.add(rightMarker);
          regionSpheresRef.current[`${regionKey}_left`] = leftMarker;
          regionSpheresRef.current[`${regionKey}_right`] = rightMarker;
        }
      });
    };
    
    // Mouse interaction handlers
    const handleMouseMove = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Raycast for hover detection
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        Object.values(regionSpheresRef.current)
      );
      
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        const regionKey = hoveredMesh.userData.regionKey;
        setHoveredRegion(regionKey);
        document.body.style.cursor = 'pointer';
        
        // Highlight on hover
        hoveredMesh.scale.setScalar(1.1);
      } else {
        setHoveredRegion(null);
        document.body.style.cursor = 'default';
        
        // Reset scale
        Object.values(regionSpheresRef.current).forEach(mesh => {
          if (mesh.userData.regionKey !== selectedRegion) {
            mesh.scale.setScalar(1.0);
          }
        });
      }
    };
    
    const handleClick = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        Object.values(regionSpheresRef.current)
      );
      
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const regionKey = clickedMesh.userData.regionKey;
        setSelectedRegion(regionKey);
        
        if (onRegionSelect) {
          onRegionSelect(regionKey, clickedMesh.userData.regionData);
        }
        
        // Visual feedback
        clickedMesh.scale.setScalar(1.2);
      }
    };
    
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      clearTimeout(loadingTimeout);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('click', handleClick);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // Dispose of Three.js resources
      Object.values(regionSpheresRef.current).forEach(mesh => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [brainImpacts, onRegionSelect]);
  
  // Camera view presets
  const setCameraView = (view) => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    const positions = {
      lateral: [15, 0, 0],
      medial: [-15, 0, 0],
      superior: [0, 15, 0],
      inferior: [0, -15, 0],
      anterior: [0, 0, 15],
      posterior: [0, 0, -15]
    };
    
    const targetPosition = positions[view] || positions.lateral;
    
    // Smooth camera transition
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(...targetPosition);
    let t = 0;
    
    const animateCamera = () => {
      t += 0.05;
      if (t >= 1) {
        camera.position.copy(endPos);
        controls.target.set(0, 0, 0);
        controls.update();
        setViewMode(view);
        return;
      }
      
      camera.position.lerpVectors(startPos, endPos, t);
      controls.update();
      requestAnimationFrame(animateCamera);
    };
    
    animateCamera();
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          {loadingError ? (
            <>
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-white text-lg">Error Loading Brain Model</p>
              <p className="text-gray-400 text-sm mt-2">WebGL or rendering issue detected</p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
              <p className="text-white text-lg">Loading Brain Model...</p>
              <p className="text-gray-400 text-sm mt-2">{Math.round(loadingProgress)}%</p>
            </>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" style={{ minHeight: '500px' }} />
      
      {/* Enhanced Controls */}
      <div className="absolute top-20 right-4 z-20 space-y-2 max-w-[200px]">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-lg p-3 border border-white/20">
          <p className="text-xs text-gray-400 mb-2 font-medium">View Angle</p>
          <div className="grid grid-cols-2 gap-1">
            {['lateral', 'medial', 'superior', 'inferior', 'anterior', 'posterior'].map(view => (
              <button
                key={view}
                onClick={() => setCameraView(view)}
                className={`px-2 py-1.5 text-xs rounded transition-all ${
                  viewMode === view 
                    ? 'bg-purple-600 text-white font-medium' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="w-full px-4 py-2 bg-gray-900/90 backdrop-blur-xl rounded-lg border border-white/20 text-white text-sm hover:bg-gray-800 transition-all"
        >
          {showLabels ? 'Hide' : 'Show'} Labels
        </button>
      </div>
      
      {/* Enhanced Region Info Panel with Research Data */}
      {selectedRegion && brainRegions[selectedRegion] && (
        <div className="absolute bottom-4 right-4 z-20 max-w-lg max-h-[70vh] bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 animate-fadeIn overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-white">
                {brainRegions[selectedRegion].name}
              </h3>
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-gray-400 hover:text-white transition-colors ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-300 mb-3">
              <span className="font-medium">Function:</span> {brainRegions[selectedRegion].function}
            </p>
            
            {/* Vulnerable Periods */}
            {brainRegions[selectedRegion].vulnerablePeriods && (
              <div className="mb-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-xs font-medium text-purple-300 mb-1">Critical Vulnerability Periods:</p>
                <p className="text-xs text-gray-300">
                  {brainRegions[selectedRegion].vulnerablePeriods.join(', ')}
                </p>
              </div>
            )}
            
            {/* Critical Research Notes */}
            {brainRegions[selectedRegion].criticalNotes && (
              <div className="mb-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xs font-medium text-blue-300 mb-1">Research Finding:</p>
                <p className="text-xs text-gray-300">
                  {brainRegions[selectedRegion].criticalNotes}
                </p>
              </div>
            )}
          </div>
          
          {brainImpacts[selectedRegion] && (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 200px)' }}>
              <div className="px-4 pb-4">
                <div className="pt-3 border-t border-white/20">
                  {/* Impact Summary */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      brainImpacts[selectedRegion].impactStrength > 0.8 ? 'bg-red-500' :
                      brainImpacts[selectedRegion].impactStrength > 0.5 ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                    <p className="text-sm text-white">
                      Impact Strength: {Math.round(brainImpacts[selectedRegion].impactStrength * 100)}%
                    </p>
                  </div>
                  
                  {/* Affected During Vulnerable Period */}
                  {brainImpacts[selectedRegion].affectedDuringVulnerablePeriod && (
                    <div className="mb-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-xs text-red-300">
                        ⚠️ Trauma occurred during critical developmental window
                      </p>
                    </div>
                  )}
                  
                  {/* Trauma Details */}
                  <div className="space-y-3">
                    {brainImpacts[selectedRegion].impacts.map((impact, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-300 mb-1">
                          {impact.trauma.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          Ages: {impact.ageRanges.join(', ')} • Duration: {impact.duration || 'Not specified'}
                        </p>
                        <p className="text-xs text-yellow-300 mb-1">
                          {impact.changes}
                        </p>
                        <p className="text-xs text-gray-400">
                          Behavioral Impact: {impact.behavior}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Structural Changes */}
                  {brainImpacts[selectedRegion].structuralChanges && brainImpacts[selectedRegion].structuralChanges.length > 0 && (
                    <div className="mt-3 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <p className="text-xs font-medium text-orange-300 mb-1">Structural Changes:</p>
                      {brainImpacts[selectedRegion].structuralChanges.map((change, idx) => (
                        <p key={idx} className="text-xs text-gray-300 mb-1">• {change}</p>
                      ))}
                    </div>
                  )}
                  
                  {/* Epigenetic Markers */}
                  {brainImpacts[selectedRegion].epigenetic && brainImpacts[selectedRegion].epigenetic.length > 0 && (
                    <div className="mt-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-xs font-medium text-green-300 mb-1">Epigenetic Changes:</p>
                      {brainImpacts[selectedRegion].epigenetic.map((marker, idx) => (
                        <p key={idx} className="text-xs text-gray-300 mb-1">
                          • {marker.marker}: {marker.effect}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Hover tooltip */}
      {hoveredRegion && brainRegions[hoveredRegion] && !selectedRegion && (
        <div className="pointer-events-none fixed" style={{ 
          left: mouseRef.current.x > 0 ? '60%' : '40%', 
          top: '50%', 
          transform: 'translate(-50%, -50%)' 
        }}>
          <div className="bg-black/90 backdrop-blur rounded-lg px-4 py-2 border border-white/20">
            <p className="text-white text-sm font-medium">{brainRegions[hoveredRegion].name}</p>
            <p className="text-gray-400 text-xs mt-1">Click to explore</p>
          </div>
        </div>
      )}
    </div>
  );
}