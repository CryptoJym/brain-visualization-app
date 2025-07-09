import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import LoadingScreen from './LoadingScreen';
import { analyzeTraumaImpact, additionalBrainRegions } from '../utils/traumaBrainMapping';

// Enhanced brain regions with additional areas
const enhancedBrainRegions = {
  // Original regions
  amygdala: {
    position: { left: [-2.0, -1.0, 0.5], right: [2.0, -1.0, 0.5] },
    color: 0xff6b6b,
    type: 'region',
    size: 0.3,
    name: 'Amygdala',
    function: 'Threat Detection & Emotional Salience',
    baseImpact: 'Fear processing and emotional memory'
  },
  hippocampus: {
    position: { left: [-1.8, -1.2, 0], right: [1.8, -1.2, 0] },
    color: 0x4ecdc4,
    type: 'region',
    size: 0.4,
    name: 'Hippocampus',
    function: 'Memory Formation & Stress Regulation',
    baseImpact: 'Learning and memory consolidation'
  },
  prefrontalCortex: {
    position: { center: [0, 1.5, 2.2] },
    color: 0xa8e6cf,
    type: 'region',
    size: 0.8,
    name: 'Prefrontal Cortex',
    function: 'Executive Function & Emotional Regulation',
    baseImpact: 'Decision making and impulse control'
  },
  // Additional regions from trauma mapping
  insula: {
    position: { left: [-1.5, 0, 0.5], right: [1.5, 0, 0.5] },
    color: 0xff9999,
    type: 'region',
    size: 0.3,
    name: 'Insula',
    function: 'Interoception & Body Awareness',
    baseImpact: 'Body sensations and emotional awareness'
  },
  anteriorCingulate: {
    position: { center: [0, 0.5, 1.5] },
    color: 0xffcc99,
    type: 'region',
    size: 0.4,
    name: 'Anterior Cingulate Cortex',
    function: 'Conflict Monitoring & Attention',
    baseImpact: 'Error detection and emotional regulation'
  },
  temporalLobe: {
    position: { left: [-2.8, -0.5, 0], right: [2.8, -0.5, 0] },
    color: 0x99ccff,
    type: 'region',
    size: 0.6,
    name: 'Temporal Lobe',
    function: 'Language & Social Processing',
    baseImpact: 'Understanding speech and social cues'
  },
  parietalLobe: {
    position: { left: [-1.5, 1, -1.5], right: [1.5, 1, -1.5] },
    color: 0xcc99ff,
    type: 'region',
    size: 0.5,
    name: 'Parietal Lobe',
    function: 'Spatial Processing & Attention',
    baseImpact: 'Spatial awareness and sensory integration'
  },
  cerebellum: {
    position: { center: [0, -2, -2] },
    color: 0xffcccc,
    type: 'region',
    size: 0.7,
    name: 'Cerebellum',
    function: 'Motor Coordination & Learning',
    baseImpact: 'Balance and fine motor control'
  },
  thalamus: {
    position: { center: [0, -0.3, 0] },
    color: 0xccffcc,
    type: 'region',
    size: 0.25,
    name: 'Thalamus',
    function: 'Sensory Relay Station',
    baseImpact: 'Filters sensory information to cortex'
  },
  basalGanglia: {
    position: { left: [-1, -0.5, 0.5], right: [1, -0.5, 0.5] },
    color: 0xccccff,
    type: 'region',
    size: 0.35,
    name: 'Basal Ganglia',
    function: 'Movement & Habit Formation',
    baseImpact: 'Motor control and reward processing'
  },
  // Pathways
  corpusCallosum: {
    position: { center: [0, 0, 0] },
    color: 0x95e1d3,
    type: 'pathway',
    name: 'Corpus Callosum',
    function: 'Inter-hemispheric Communication',
    baseImpact: 'Connects left and right brain hemispheres'
  },
  defaultModeNetwork: {
    position: { from: [0, 1.5, 2.2], to: [0, 0.5, -1.5] },
    color: 0xffd700,
    type: 'pathway',
    name: 'Default Mode Network',
    function: 'Self-referential Processing',
    baseImpact: 'Self-awareness and introspection'
  },
  stressResponseSystem: {
    position: { from: [0, -0.3, 0], to: [-2.0, -1.0, 0.5] },
    color: 0xff4500,
    type: 'pathway',
    name: 'HPA Axis',
    function: 'Stress Response System',
    baseImpact: 'Cortisol regulation and stress response'
  }
};

function PersonalizedBrainVisualization({ assessmentResults }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const brainMeshes = useRef({});
  const connectionMeshes = useRef([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showImpacts, setShowImpacts] = useState(true);
  const [viewMode, setViewMode] = useState('impacts'); // 'impacts', 'connections', 'severity'
  
  // Analyze trauma impacts from assessment
  const traumaAnalysis = analyzeTraumaImpact(assessmentResults);
  const { brainImpacts, summary, recommendations } = traumaAnalysis;

  useEffect(() => {
    if (!mountRef.current) return;

    // Loading simulation
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    scene.fog = new THREE.Fog(0x000814, 10, 50);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 20);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting for better visualization
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);
    
    const rimLight = new THREE.PointLight(0x4e94ce, 0.5, 30);
    rimLight.position.set(-5, 0, -5);
    scene.add(rimLight);
    
    const fillLight = new THREE.PointLight(0xff6b6b, 0.3, 30);
    fillLight.position.set(5, -5, 5);
    scene.add(fillLight);

    // OrbitControls for better interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 10;
    controls.maxDistance = 40;
    controlsRef.current = controls;

    // Create brain group
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Enhanced brain mesh with better materials
    const createBrainMesh = () => {
      const brainGeometry = new THREE.SphereGeometry(3, 64, 64);
      const positions = brainGeometry.attributes.position;
      
      // More detailed brain shaping
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        let newX = x * 0.85;
        let newY = y * 0.9;
        let newZ = z;
        
        // Longitudinal fissure
        if (Math.abs(x) < 0.3 && y > -1) {
          newY *= 0.8;
        }
        
        // Flatten bottom
        if (y < -1.5) {
          newY = -1.5 + (y + 1.5) * 0.3;
        }
        
        // Frontal lobe prominence
        if (z > 1 && y > 0) {
          newZ *= 1.15;
        }
        
        // Temporal lobe indentation
        if (Math.abs(x) > 1.5 && y < 0 && y > -1) {
          newY *= 0.9;
        }
        
        positions.setXYZ(i, newX, newY, newZ);
      }
      
      brainGeometry.computeVertexNormals();
      
      // Glass-like material with subsurface scattering effect
      const brainMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3a4f6b,
        metalness: 0.1,
        roughness: 0.3,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        envMapIntensity: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        ior: 1.45,
        thickness: 1.5,
        transmission: 0.7
      });
      
      const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
      brainMesh.castShadow = true;
      brainMesh.receiveShadow = true;
      brainGroup.add(brainMesh);
      
      // Add subtle glow
      const glowGeometry = new THREE.SphereGeometry(3.2, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a5f7f,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      brainGroup.add(glowMesh);
    };
    
    createBrainMesh();

    // Create brain regions with trauma-based modifications
    Object.entries(enhancedBrainRegions).forEach(([key, data]) => {
      if (data.type === 'region') {
        const createRegionMesh = (position, side = '') => {
          const impact = brainImpacts[key] || brainImpacts[key.replace(/([A-Z])/g, '_$1').toLowerCase()];
          const hasImpact = !!impact;
          const severity = impact?.severity || 0;
          
          // Adjust size based on trauma impact
          const sizeModifier = hasImpact ? (severity > 5 ? 0.8 : severity > 2 ? 0.9 : 0.95) : 1;
          const actualSize = (data.size || 0.4) * sizeModifier;
          
          const geometry = new THREE.SphereGeometry(actualSize, 64, 64);
          
          // Color based on impact severity
          let color = data.color;
          if (hasImpact) {
            if (severity > 5) color = 0xff0000; // Severe - red
            else if (severity > 2) color = 0xff8800; // Moderate - orange
            else color = 0xffdd00; // Mild - yellow
          }
          
          const material = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: hasImpact ? 0.3 : 0.1,
            metalness: 0.2,
            roughness: 0.3,
            transparent: true,
            opacity: hasImpact ? 0.9 : 0.7,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(...position);
          mesh.userData = { 
            regionKey: key, 
            side, 
            ...data,
            impact: impact,
            hasTraumaImpact: hasImpact
          };
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          const meshKey = side ? `${key}_${side}` : key;
          brainMeshes.current[meshKey] = mesh;
          brainGroup.add(mesh);
          
          // Enhanced glow for impacted regions
          if (hasImpact) {
            const glowSize = actualSize + 0.2;
            const glowGeometry = new THREE.SphereGeometry(glowSize, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
              color: color,
              transparent: true,
              opacity: 0.2 + (severity * 0.02),
              side: THREE.BackSide
            });
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            glowMesh.position.copy(mesh.position);
            mesh.glowMesh = glowMesh;
            brainGroup.add(glowMesh);
          }
        };
        
        // Create bilateral or single regions
        if (data.position.left && data.position.right) {
          createRegionMesh(data.position.left, 'left');
          createRegionMesh(data.position.right, 'right');
        } else if (data.position.center) {
          createRegionMesh(data.position.center);
        }
      }
    });

    // Create pathways and connections
    const createConnections = () => {
      // Clear existing connections
      connectionMeshes.current.forEach(mesh => {
        brainGroup.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });
      connectionMeshes.current = [];
      
      // Create trauma-based connections
      Object.entries(brainImpacts).forEach(([region1, impact1]) => {
        if (impact1.severity > 2) {
          // Find related regions based on impact patterns
          Object.entries(brainImpacts).forEach(([region2, impact2]) => {
            if (region1 !== region2 && impact2.severity > 2) {
              const mesh1 = brainMeshes.current[region1] || brainMeshes.current[`${region1}_left`];
              const mesh2 = brainMeshes.current[region2] || brainMeshes.current[`${region2}_left`];
              
              if (mesh1 && mesh2) {
                const startPos = mesh1.position;
                const endPos = mesh2.position;
                
                const curve = new THREE.CatmullRomCurve3([
                  startPos,
                  new THREE.Vector3(
                    (startPos.x + endPos.x) / 2,
                    (startPos.y + endPos.y) / 2 + 1,
                    (startPos.z + endPos.z) / 2
                  ),
                  endPos
                ]);
                
                const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.08, 8, false);
                const connectionStrength = (impact1.severity + impact2.severity) / 10;
                
                const material = new THREE.MeshPhysicalMaterial({
                  color: 0xffffff,
                  emissive: 0xffffff,
                  emissiveIntensity: connectionStrength * 0.5,
                  metalness: 0.8,
                  roughness: 0.2,
                  transparent: true,
                  opacity: Math.min(0.6, connectionStrength),
                  clearcoat: 1.0
                });
                
                const mesh = new THREE.Mesh(tubeGeometry, material);
                brainGroup.add(mesh);
                connectionMeshes.current.push(mesh);
              }
            }
          });
        }
      });
    };
    
    if (viewMode === 'connections') {
      createConnections();
    }

    // Mouse interaction
    const handlePointerMove = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (event) => {
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(
        Object.values(brainMeshes.current).filter(mesh => mesh.userData.type === 'region')
      );
      
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        setSelectedRegion(clickedMesh.userData.regionKey);
      } else {
        setSelectedRegion(null);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      // Update controls
      controls.update();
      
      // Check hover
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(
        Object.values(brainMeshes.current).filter(mesh => mesh.userData.type === 'region')
      );
      
      let hoveredKey = null;
      if (intersects.length > 0) {
        hoveredKey = intersects[0].object.userData.regionKey;
      }
      setHoveredRegion(hoveredKey);
      
      // Animate regions
      Object.entries(brainMeshes.current).forEach(([meshKey, mesh]) => {
        const regionKey = mesh.userData.regionKey;
        const isHovered = regionKey === hoveredKey;
        const isSelected = regionKey === selectedRegion;
        const hasImpact = mesh.userData.hasTraumaImpact;
        
        // Pulsing for impacted regions
        if (hasImpact && showImpacts) {
          const pulseFactor = Math.sin(elapsedTime * 2) * 0.05 + 1;
          mesh.scale.setScalar(pulseFactor);
        }
        
        // Hover and selection effects
        const targetScale = isSelected ? 1.3 : isHovered ? 1.15 : 1;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        
        // Update glow
        if (mesh.glowMesh) {
          mesh.glowMesh.scale.copy(mesh.scale);
          if (hasImpact) {
            mesh.glowMesh.material.opacity = 
              isSelected ? 0.5 : isHovered ? 0.35 : 0.2 + Math.sin(elapsedTime * 3) * 0.1;
          }
        }
        
        // Emissive intensity
        if (mesh.material.emissive) {
          mesh.material.emissiveIntensity = 
            isSelected ? 0.6 : isHovered ? 0.4 : hasImpact ? 0.3 : 0.1;
        }
      });
      
      // Animate connections
      connectionMeshes.current.forEach((connection, index) => {
        if (connection.material) {
          connection.material.emissiveIntensity = 
            0.3 + 0.2 * Math.sin(elapsedTime * 2 + index);
        }
      });
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      controls.dispose();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedRegion, showImpacts, viewMode, brainImpacts]);

  // Get region-specific information including trauma impacts
  const getRegionInfo = (regionKey) => {
    const baseInfo = enhancedBrainRegions[regionKey];
    const impact = brainImpacts[regionKey] || brainImpacts[regionKey.replace(/([A-Z])/g, '_$1').toLowerCase()];
    
    if (!baseInfo) return null;
    
    return {
      ...baseInfo,
      traumaImpact: impact,
      hasImpact: !!impact
    };
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black overflow-hidden">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen progress={loadingProgress} />}
      
      {/* Header with Results Summary */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-gray-900/80 to-transparent backdrop-blur-xl p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-white mb-1">
                Your Personalized Brain Map
              </h1>
              <p className="text-gray-300 text-sm md:text-base opacity-90">
                Showing {summary.totalRegionsAffected} affected regions • 
                Severity: <span className={`font-medium ${
                  summary.severityLevel === 'severe' ? 'text-red-400' : 
                  summary.severityLevel === 'moderate' ? 'text-orange-400' : 
                  'text-yellow-400'
                }`}>{summary.severityLevel}</span>
              </p>
            </div>
            
            {/* View Mode Controls */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 backdrop-blur">
                <button
                  onClick={() => setViewMode('impacts')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                    viewMode === 'impacts' 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Trauma Impacts
                </button>
                <button
                  onClick={() => setViewMode('connections')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                    viewMode === 'connections' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Neural Connections
                </button>
                <button
                  onClick={() => setViewMode('severity')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                    viewMode === 'severity' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Severity Map
                </button>
              </div>
              
              <button
                onClick={() => setShowImpacts(!showImpacts)}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  showImpacts ? 'bg-orange-600/80 text-white' : 'bg-white/10 text-gray-300'
                }`}
              >
                {showImpacts ? 'Hide' : 'Show'} Pulsing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3D View */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Region Information Panel */}
      {selectedRegion && (
        <div className="absolute top-32 left-6 w-96 max-w-[calc(100%-3rem)] animate-fadeIn md:max-w-sm lg:max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {(() => {
              const regionInfo = getRegionInfo(selectedRegion);
              if (!regionInfo) return null;
              
              return (
                <>
                  {/* Header */}
                  <div className={`bg-gradient-to-r p-6 border-b border-white/10 ${
                    regionInfo.hasImpact 
                      ? 'from-red-600/20 to-orange-600/20' 
                      : 'from-purple-600/20 to-blue-600/20'
                  }`}>
                    <button
                      onClick={() => setSelectedRegion(null)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <h2 className="text-2xl font-light text-white mb-1 pr-8">
                      {regionInfo.name}
                    </h2>
                    <p className="text-sm text-gray-300 opacity-80">
                      {regionInfo.hasImpact ? 'Trauma-Affected Region' : 'Neural Region'}
                    </p>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Normal Function */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4 rounded-xl border border-blue-500/20">
                      <h3 className="text-blue-400 font-medium text-sm mb-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Normal Function
                      </h3>
                      <p className="text-gray-100 text-sm leading-relaxed">{regionInfo.function}</p>
                    </div>
                    
                    {/* Trauma Impacts */}
                    {regionInfo.hasImpact && regionInfo.traumaImpact && (
                      <>
                        <div className="bg-gradient-to-r from-red-500/10 to-orange-600/10 p-4 rounded-xl border border-red-500/20">
                          <h3 className="text-red-400 font-medium text-sm mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            Trauma Impacts
                          </h3>
                          <div className="space-y-2">
                            {regionInfo.traumaImpact.impacts.map((impact, idx) => (
                              <div key={idx} className="text-sm">
                                <p className="text-orange-300 font-medium">{impact.changes}</p>
                                <p className="text-gray-300 text-xs mt-1">{impact.behavior}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 p-4 rounded-xl border border-yellow-500/20">
                          <h3 className="text-yellow-400 font-medium text-sm mb-1 flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            Severity Level
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-500"
                                style={{ width: `${Math.min(100, regionInfo.traumaImpact.severity * 10)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-300">{regionInfo.traumaImpact.severity}/10</span>
                          </div>
                        </div>
                        
                        {regionInfo.traumaImpact.hasProtectiveFactor && (
                          <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 p-3 rounded-xl border border-green-500/20">
                            <p className="text-green-400 text-sm flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Protective factors present - reduced impact
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Recommendations Panel */}
      {recommendations.length > 0 && (
        <div className="absolute bottom-6 right-6 w-96 max-w-[calc(100%-3rem)] animate-slideUp">
          <div className="bg-white/5 backdrop-blur-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-4 border-b border-white/10">
              <h3 className="text-lg font-light text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Personalized Recommendations
              </h3>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
                  rec.priority === 'high' 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : 'bg-blue-500/10 border-blue-500/20'
                }`}>
                  <p className="text-sm text-gray-100">{rec.suggestion}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {rec.type === 'therapy' ? '🧠 Therapeutic' : 
                     rec.type === 'lifestyle' ? '🌱 Lifestyle' : 
                     '🎯 Skills'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hover Information */}
      {hoveredRegion && !selectedRegion && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-xl">
            <p className="text-white font-light text-lg">{enhancedBrainRegions[hoveredRegion]?.name}</p>
            <p className="text-gray-300 text-sm text-center opacity-80">
              {brainImpacts[hoveredRegion] ? 'Trauma-affected • Click to explore' : 'Click to explore'}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Guide */}
      <div className="absolute bottom-6 left-6 animate-slideUp">
        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-xl">
          <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Navigation
          </h4>
          <div className="space-y-1 text-xs">
            <p className="text-gray-300 flex items-center gap-2">
              <span className="text-white opacity-60">Left Click + Drag</span> Rotate view
            </p>
            <p className="text-gray-300 flex items-center gap-2">
              <span className="text-white opacity-60">Right Click + Drag</span> Pan view
            </p>
            <p className="text-gray-300 flex items-center gap-2">
              <span className="text-white opacity-60">Scroll</span> Zoom in/out
            </p>
            <p className="text-gray-300 flex items-center gap-2">
              <span className="text-white opacity-60">Click Region</span> View details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalizedBrainVisualization;