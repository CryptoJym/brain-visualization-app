import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import LoadingScreen from './LoadingScreen';

// Brain region data with anatomically correct positions
const brainRegions = {
  amygdala: {
    position: { left: [-2.0, -1.0, 0.5], right: [2.0, -1.0, 0.5] },
    color: 0xff6b6b,
    type: 'region',
    size: 0.3,
    name: 'Amygdala',
    function: 'Threat Detection & Emotional Salience',
    earlyImpact: 'Bullying (6-11 yrs) → Blunted fear response',
    lateImpact: 'Verbal abuse (14-18 yrs) → Hypersensitive reactions',
    outcome: 'Oscillates between fearlessness and explosive reactivity',
    behavior: 'Takes massive risks but can explode when threatened'
  },
  hippocampus: {
    position: { left: [-1.8, -1.2, 0], right: [1.8, -1.2, 0] },
    color: 0x4ecdc4,
    type: 'region',
    size: 0.4,
    name: 'Hippocampus',
    function: 'Memory Formation & Stress Regulation',
    earlyImpact: 'Trauma at 3-5 yrs → Volume reduction',
    lateImpact: 'Bullying at 11-13 yrs → Altered activation',
    outcome: 'Reduced volume, unstable context encoding',
    behavior: 'Prefers concrete data over interpersonal nuance'
  },
  corpusCallosum: {
    position: { center: [0, 0, 0] },
    color: 0x95e1d3,
    type: 'pathway',
    name: 'Corpus Callosum',
    function: 'Inter-hemispheric Communication Bridge',
    earlyImpact: 'Early neglect (0-8 yrs) → Reduced thickness',
    lateImpact: 'Especially impacted in males',
    outcome: 'Reduced cross-talk between analytical and emotional brain',
    behavior: 'Can hyperfocus while "turning off" empathy'
  },
  prefrontalCortex: {
    position: { center: [0, 1.5, 2.2] },
    color: 0xa8e6cf,
    type: 'region',
    size: 0.8,
    name: 'Prefrontal Cortex',
    function: 'Executive Function & Emotional Regulation',
    earlyImpact: 'Neglect at 2 yrs → dACC thinning',
    lateImpact: 'Abuse at 14-17 yrs → vmPFC alterations',
    outcome: 'Weaker emotional brakes, enhanced goal persistence',
    behavior: '"All gas, no brakes" execution style'
  },
  visualCortex: {
    position: { center: [0, -0.5, -2.5] },
    color: 0xffd3b6,
    type: 'region',
    size: 0.6,
    name: 'Visual Cortex',
    function: 'Visual Processing Center',
    earlyImpact: 'Witnessing violence (5-8 yrs) → Enhanced threat scanning',
    lateImpact: 'Heightened visual vigilance',
    outcome: 'Rapid visual pattern recognition, hypervigilance',
    behavior: 'Sees problems in visual/spatial terms, not interpersonal'
  },
  visualLimbicPathway: {
    position: { from: [0, -0.5, -2.5], to: [-2.0, -1.0, 0.5] },
    color: 0xffa500,
    type: 'pathway',
    name: 'Visual-Limbic Pathway',
    function: 'Connects Visual Input to Emotional Centers',
    earlyImpact: 'Violence exposure (5-8 yrs) → Pathway strengthening',
    lateImpact: 'Direct visual-to-fear connection',
    outcome: 'Instant threat assessment from visual cues',
    behavior: 'Rapid pattern recognition, sees danger everywhere'
  },
  auditoryCortex: {
    position: { left: [-2.5, 0.5, -0.5], right: [2.5, 0.5, -0.5] },
    color: 0xffaaa5,
    type: 'region',
    size: 0.5,
    name: 'Auditory Cortex',
    function: 'Sound Processing & Language',
    earlyImpact: 'Verbal abuse (9-18 yrs) → Cortical thinning',
    lateImpact: 'Hypersensitivity to critical tones',
    outcome: 'Enhanced technical verbal skills, sensitivity to criticism',
    behavior: 'Communicates in blunt data, not diplomatic language'
  }
};

// Synergy connections with descriptions
const synergyConnections = [
  { 
    from: 'amygdala', 
    to: 'hippocampus', 
    strength: 0.8, 
    description: 'Fear memories become concrete and lasting',
    impact: 'Creates vivid, unshakeable threat memories'
  },
  { 
    from: 'amygdala', 
    to: 'prefrontalCortex', 
    strength: 0.5, 
    description: 'Emotional regulation circuit weakened',
    impact: 'Emotions can overwhelm rational thought'
  },
  { 
    from: 'corpusCallosum', 
    to: 'prefrontalCortex', 
    strength: 0.4, 
    description: 'Split-brain processing',
    impact: 'Can completely disconnect logic from emotion'
  },
  { 
    from: 'visualCortex', 
    to: 'amygdala', 
    strength: 0.9, 
    description: 'Instant visual threat detection',
    impact: 'Sees danger in patterns others miss'
  },
  { 
    from: 'auditoryCortex', 
    to: 'amygdala', 
    strength: 0.7, 
    description: 'Voice tone triggers fear',
    impact: 'Criticism feels like physical attack'
  }
];

function BrainVisualization() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const brainMeshes = useRef({});
  const connectionMeshes = useRef([]);
  const labelSprites = useRef({});
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const brainGroup = useRef(null);
  
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showSynergy, setShowSynergy] = useState(false);
  const [showPerspective, setShowPerspective] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [activeConnection, setActiveConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(false);
  const [showTour, setShowTour] = useState(true);
  const [tourStep, setTourStep] = useState(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Simulate loading progress
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
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 15, 40);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      25,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 25);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    const rimLight = new THREE.PointLight(0x4e94ce, 0.6);
    rimLight.position.set(-5, 0, -5);
    scene.add(rimLight);
    
    // Add a front light to better illuminate the brain structure
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.4);
    frontLight.position.set(0, 2, 10);
    scene.add(frontLight);

    // Create brain group
    const brainGroupMesh = new THREE.Group();
    brainGroup.current = brainGroupMesh;
    scene.add(brainGroupMesh);

    // Create anatomical brain shape
    const createBrainMesh = () => {
      // Main brain body (cerebrum)
      const brainGeometry = new THREE.SphereGeometry(3, 32, 32);
      const positions = brainGeometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        // Shape it to look more like a brain
        let newX = x * 0.85;
        let newY = y * 0.9;
        let newZ = z;
        
        // Create the longitudinal fissure (split between hemispheres)
        if (Math.abs(x) < 0.3 && y > -1) {
          newY *= 0.85;
        }
        
        // Flatten the bottom
        if (y < -1.5) {
          newY = -1.5 + (y + 1.5) * 0.3;
        }
        
        // Make frontal lobe more prominent
        if (z > 1 && y > 0) {
          newZ *= 1.1;
        }
        
        positions.setXYZ(i, newX, newY, newZ);
      }
      
      brainGeometry.computeVertexNormals();
      
      const brainMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x4a5f7f,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        metalness: 0.1,
        roughness: 0.3,
        clearcoat: 1.0,
        clearcoatRoughness: 0.4,
        reflectivity: 0.5,
        envMapIntensity: 0.5
      });
      
      const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
      brainGroupMesh.add(brainMesh);
      
      // Add edge highlight for better definition
      const edgeGeometry = new THREE.EdgesGeometry(brainGeometry, 30);
      const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x6a7f9f, 
        transparent: true, 
        opacity: 0.2,
        linewidth: 1 
      });
      const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      brainGroupMesh.add(edgeLines);
      
      // Add brain stem
      const stemGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.5, 16);
      const stemMesh = new THREE.Mesh(stemGeometry, brainMaterial);
      stemMesh.position.set(0, -2.5, -0.5);
      stemMesh.rotation.x = 0.3;
      brainGroupMesh.add(stemMesh);
      
      // Add cerebellum
      const cerebellumGeometry = new THREE.SphereGeometry(1, 16, 16);
      const cerebellumMesh = new THREE.Mesh(cerebellumGeometry, brainMaterial);
      cerebellumMesh.position.set(0, -1.8, -1.5);
      cerebellumMesh.scale.set(1.2, 0.8, 0.8);
      brainGroupMesh.add(cerebellumMesh);
    };
    
    createBrainMesh();

    // Create brain regions
    Object.entries(brainRegions).forEach(([key, data]) => {
      if (data.type === 'region') {
        // Create regions (some bilateral, some central)
        const createRegionMesh = (position, side = '') => {
          const geometry = new THREE.SphereGeometry(data.size || 0.4, 32, 32);
          const material = new THREE.MeshPhongMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.9,
            shininess: 100
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(...position);
          mesh.userData = { regionKey: key, side, ...data };
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          // Store mesh reference
          const meshKey = side ? `${key}_${side}` : key;
          brainMeshes.current[meshKey] = mesh;
          brainGroupMesh.add(mesh);
          
          // Add glow
          const glowGeometry = new THREE.SphereGeometry((data.size || 0.4) + 0.1, 16, 16);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.1
          });
          const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
          glowMesh.position.copy(mesh.position);
          glowMesh.isGlowMesh = true; // Mark as glow mesh to exclude from raycasting
          mesh.glowMesh = glowMesh;
          brainGroupMesh.add(glowMesh);
        };
        
        // Create bilateral or single regions
        if (data.position.left && data.position.right) {
          createRegionMesh(data.position.left, 'left');
          createRegionMesh(data.position.right, 'right');
        } else if (data.position.center) {
          createRegionMesh(data.position.center);
        }
      } else if (data.type === 'pathway') {
        // Create pathways
        if (data.name === 'Corpus Callosum') {
          // Create corpus callosum as a flattened cylinder connecting hemispheres
          const geometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 8);
          const material = new THREE.MeshPhongMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.6
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.rotation.z = Math.PI / 2;
          mesh.position.set(0, 0, 0);
          mesh.scale.set(1, 0.3, 1);
          mesh.userData = { regionKey: key, ...data };
          
          brainMeshes.current[key] = mesh;
          brainGroupMesh.add(mesh);
        } else if (data.name === 'Visual-Limbic Pathway') {
          // Create visual-limbic pathway as a tube
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(...data.position.from),
            new THREE.Vector3(-1, -0.8, -1),
            new THREE.Vector3(...data.position.to)
          ]);
          
          const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.15, 8, false);
          const material = new THREE.MeshPhongMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.6
          });
          
          const mesh = new THREE.Mesh(tubeGeometry, material);
          mesh.userData = { regionKey: key, ...data };
          
          brainMeshes.current[key] = mesh;
          brainGroupMesh.add(mesh);
        }
      }
    });

    // Mouse/Touch interaction
    let isDragging = false;
    let previousPosition = { x: 0, y: 0 };
    let autoRotate = true;
    let baseRotationSpeed = 0.001;
    let currentRotation = { x: 0, y: 0 };

    const handlePointerDown = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      previousPosition = { x: clientX, y: clientY };
      
      // Always preserve current rotation state
      if (brainGroup.current) {
        currentRotation.x = brainGroup.current.rotation.x;
        currentRotation.y = brainGroup.current.rotation.y;
      }
    };

    const handlePointerUp = (e) => {
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      
      // Check if it was a click (not a drag)
      const moved = Math.abs(clientX - previousPosition.x) + Math.abs(clientY - previousPosition.y);
      if (moved < 5) {
        handleClick(clientX, clientY);
      }
      
      isDragging = false;
      // Only pause auto-rotate on drag, not on click
      if (moved >= 5) {
        autoRotate = false;
        setTimeout(() => { autoRotate = true; }, 3000);
      }
    };

    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      // Update mouse for hover
      const rect = mountRef.current.getBoundingClientRect();
      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      
      // Handle rotation
      if (isDragging) {
        const deltaX = clientX - previousPosition.x;
        const deltaY = clientY - previousPosition.y;
        
        currentRotation.y += deltaX * 0.005;
        currentRotation.x = Math.max(
          -Math.PI/4, 
          Math.min(Math.PI/4, currentRotation.x + deltaY * 0.005)
        );
        
        previousPosition = { x: clientX, y: clientY };
      }
    };

    const handleClick = (clientX, clientY) => {
      const rect = mountRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
      
      // Get all meshes that are brain regions (exclude glow meshes and pathways)
      const clickableMeshes = Object.values(brainMeshes.current).filter(mesh => 
        mesh.userData.type === 'region' && mesh.material && !mesh.isGlowMesh
      );
      
      const intersects = raycaster.current.intersectObjects(clickableMeshes, true);
      
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const regionKey = clickedMesh.userData.regionKey;
        if (regionKey) {
          setSelectedRegion(regionKey);
          // Keep current rotation values
          if (brainGroup.current) {
            currentRotation.x = brainGroup.current.rotation.x;
            currentRotation.y = brainGroup.current.rotation.y;
          }
        }
      } else {
        // Click on empty space - deselect
        setSelectedRegion(null);
      }
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handlePointerDown);
    renderer.domElement.addEventListener('mouseup', handlePointerUp);
    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('touchstart', handlePointerDown);
    renderer.domElement.addEventListener('touchend', handlePointerUp);
    renderer.domElement.addEventListener('touchmove', handlePointerMove);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      // Auto-rotate - always update currentRotation
      if (brainGroup.current) {
        if (autoRotate) {
          currentRotation.y += baseRotationSpeed * rotationSpeed;
        }
        // Always apply the current rotation (whether auto-rotating or not)
        brainGroup.current.rotation.x = currentRotation.x;
        brainGroup.current.rotation.y = currentRotation.y;
      }
      
      // Update hover effects
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      
      // Only check hover on actual region meshes
      const hoverableMeshes = Object.values(brainMeshes.current).filter(mesh => 
        mesh.userData.type === 'region' && mesh.material && !mesh.isGlowMesh
      );
      
      const intersects = raycaster.current.intersectObjects(hoverableMeshes, true);
      
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
        
        // Pulsing effect
        const targetScale = isSelected ? 1.2 : isHovered ? 1.1 : 1;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        
        // Glow effect
        if (mesh.glowMesh) {
          mesh.glowMesh.material.opacity = isSelected ? 0.4 : isHovered ? 0.2 : 0.05;
          mesh.glowMesh.scale.copy(mesh.scale);
        }
        
        // Emissive intensity
        if (mesh.material.emissive) {
          mesh.material.emissiveIntensity = isSelected ? 0.4 : isHovered ? 0.25 : 0.1;
        }
      });
      
      // Animate connections
      connectionMeshes.current.forEach((connection, index) => {
        if (connection.material) {
          const baseOpacity = 0.3;
          connection.material.opacity = baseOpacity + 0.2 * Math.sin(elapsedTime * 2 + index);
          connection.material.emissiveIntensity = 0.3 + 0.2 * Math.sin(elapsedTime * 2 + index);
        }
      });
      
      renderer.render(scene, cameraRef.current);
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
      renderer.domElement.removeEventListener('mousedown', handlePointerDown);
      renderer.domElement.removeEventListener('mouseup', handlePointerUp);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('touchstart', handlePointerDown);
      renderer.domElement.removeEventListener('touchend', handlePointerUp);
      renderer.domElement.removeEventListener('touchmove', handlePointerMove);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedRegion, rotationSpeed, showLabels]);

  // Update synergy connections
  useEffect(() => {
    if (!brainGroup.current) return;
    
    // Clear old connections
    connectionMeshes.current.forEach(mesh => {
      brainGroup.current.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    connectionMeshes.current = [];
    
    if (showSynergy && selectedRegion) {
      // Show connections for selected region
      const relevantConnections = synergyConnections.filter(
        conn => conn.from === selectedRegion || conn.to === selectedRegion
      );
      
      relevantConnections.forEach((connection, index) => {
        const fromMesh = brainMeshes.current[connection.from] || 
                        brainMeshes.current[`${connection.from}_left`];
        const toMesh = brainMeshes.current[connection.to] || 
                      brainMeshes.current[`${connection.to}_left`];
        
        if (fromMesh && toMesh) {
          const startPos = fromMesh.position;
          const endPos = toMesh.position;
          
          // Create animated tube connection
          const curve = new THREE.CatmullRomCurve3([
            startPos,
            new THREE.Vector3(
              (startPos.x + endPos.x) / 2,
              (startPos.y + endPos.y) / 2 + 0.5,
              (startPos.z + endPos.z) / 2
            ),
            endPos
          ]);
          
          const tubeGeometry = new THREE.TubeGeometry(curve, 30, 0.1, 8, false);
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.3
          });
          
          const mesh = new THREE.Mesh(tubeGeometry, material);
          mesh.userData = connection;
          brainGroup.current.add(mesh);
          connectionMeshes.current.push(mesh);
        }
      });
    }
  }, [showSynergy, selectedRegion]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black overflow-hidden">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen progress={loadingProgress} />}
      
      {/* Header with Glassmorphism */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-gray-900/80 to-transparent backdrop-blur-xl p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-white mb-1 tracking-wide">
                Neuroscience of Adversity
              </h1>
              <p className="text-gray-300 text-sm md:text-base opacity-90">
                Interactive exploration of trauma's impact on neural development
              </p>
            </div>
            
            {/* Professional Control Panel */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 backdrop-blur">
                <button
                  onClick={() => setShowSynergy(!showSynergy)}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                    showSynergy 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Connections
                </button>
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                    showLabels 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Labels
                </button>
                <button
                  onClick={() => setShowPerspective(!showPerspective)}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                    showPerspective 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Insights
                </button>
              </div>
              
              {/* Speed Control */}
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 backdrop-blur">
                <span className="text-xs text-gray-400">Speed</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          {/* Mobile Controls */}
          <div className="md:hidden flex gap-2 mt-4">
            <button
              onClick={() => setShowSynergy(!showSynergy)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all ${
                showSynergy ? 'bg-blue-600/80 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              Connections
            </button>
            <button
              onClick={() => setShowPerspective(!showPerspective)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all ${
                showPerspective ? 'bg-purple-600/80 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              Insights
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D View */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* 3D Labels Overlay */}
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none">
          {Object.entries(brainRegions).map(([key, region]) => {
            if (region.type !== 'region') return null;
            
            // For bilateral regions, only show one label
            const position = region.position.center || region.position.left;
            if (!position) return null;
            
            return (
              <div
                key={key}
                className="absolute text-white text-xs bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(${position[0] * 20}px, ${-position[1] * 20 - 100}px) translate(-50%, -50%)`,
                  zIndex: 10
                }}
              >
                {region.name}
              </div>
            );
          })}
        </div>
      )}

      {/* Region Information Panel with Glassmorphism - Moved to LEFT side */}
      {selectedRegion && brainRegions[selectedRegion] && (
        <div className="absolute top-32 left-6 w-96 max-w-[calc(100%-3rem)] animate-fadeIn md:max-w-sm lg:max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-white/10">
              <button
                onClick={() => setSelectedRegion(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className="text-2xl font-light text-white mb-1 pr-8">
                {brainRegions[selectedRegion].name}
              </h2>
              <p className="text-sm text-gray-300 opacity-80">Neural Region Analysis</p>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-3">
              {/* Normal Function */}
              <div className="group hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4 rounded-xl border border-blue-500/20">
                  <h3 className="text-blue-400 font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    Normal Function
                  </h3>
                  <p className="text-gray-100 text-sm leading-relaxed">{brainRegions[selectedRegion].function}</p>
                </div>
              </div>
              
              {/* Early Impact */}
              <div className="group hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 p-4 rounded-xl border border-yellow-500/20">
                  <h3 className="text-yellow-400 font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Early Trauma Impact
                  </h3>
                  <p className="text-gray-100 text-sm leading-relaxed">{brainRegions[selectedRegion].earlyImpact}</p>
                </div>
              </div>
              
              {/* Later Impact */}
              <div className="group hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 p-4 rounded-xl border border-orange-500/20">
                  <h3 className="text-orange-400 font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                    Later Development Impact
                  </h3>
                  <p className="text-gray-100 text-sm leading-relaxed">{brainRegions[selectedRegion].lateImpact}</p>
                </div>
              </div>
              
              {/* Neurological Changes */}
              <div className="group hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-gradient-to-r from-red-500/10 to-rose-600/10 p-4 rounded-xl border border-red-500/20">
                  <h3 className="text-red-400 font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    Neurological Changes
                  </h3>
                  <p className="text-gray-100 text-sm leading-relaxed">{brainRegions[selectedRegion].outcome}</p>
                </div>
              </div>
              
              {/* Behavioral Manifestation */}
              <div className="group hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 p-4 rounded-xl border border-green-500/20">
                  <h3 className="text-green-400 font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Behavioral Manifestation
                  </h3>
                  <p className="text-gray-100 text-sm leading-relaxed">{brainRegions[selectedRegion].behavior}</p>
                </div>
              </div>
            </div>
          
            {/* Neural Connections */}
            {showSynergy && (
              <div className="border-t border-white/10 p-6">
                <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  Neural Connections
                </h3>
                <div className="space-y-2">
                  {synergyConnections
                    .filter(conn => conn.from === selectedRegion || conn.to === selectedRegion)
                    .map((conn, idx) => (
                      <div key={idx} className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-300">
                        <p className="text-cyan-400 text-sm font-medium">{conn.description}</p>
                        <p className="text-gray-300 text-xs mt-1 opacity-80">{conn.impact}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hover Information */}
      {hoveredRegion && !selectedRegion && brainRegions[hoveredRegion] && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-xl">
            <p className="text-white font-light text-lg">{brainRegions[hoveredRegion].name}</p>
            <p className="text-gray-300 text-sm text-center opacity-80">Click to explore</p>
          </div>
        </div>
      )}

      {/* Professional Navigation Guide */}
      <div className="absolute bottom-6 left-6 animate-slideUp">
        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-xl">
          <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quick Guide
          </h4>
          <div className="space-y-1 text-xs">
            <p className="text-gray-300 flex items-center gap-2">
              <span className="text-white opacity-60">Drag</span> Rotate view
            </p>
            <p className="text-gray-300 flex items-center gap-2">
              <span className="text-white opacity-60">Click</span> Select region
            </p>
            <p className="text-gray-300 flex items-center gap-2">
              <span className="text-white opacity-60">Scroll</span> Zoom in/out
            </p>
          </div>
        </div>
      </div>

      {/* Internal Perspective Panel - Professional Glassmorphism */}
      {showPerspective && (
        <div className="absolute bottom-6 right-6 w-96 max-w-[calc(100%-3rem)] animate-slideUp md:max-w-sm lg:max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-4 border-b border-white/10">
              <h3 className="text-lg font-light text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                The Internal Experience
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full opacity-50"></div>
                <p className="text-gray-100 text-sm italic leading-relaxed pl-4">
                  "The world feels like a high-stakes chess game where threats hide in every pattern. 
                  My brain sees danger where others see nothing."
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full opacity-50"></div>
                <p className="text-gray-100 text-sm italic leading-relaxed pl-4">
                  "I can shut down all emotion and focus with superhuman intensity - but sometimes 
                  the dam breaks and years of suppressed feelings explode at once."
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full opacity-50"></div>
                <p className="text-gray-100 text-sm italic leading-relaxed pl-4">
                  "Inefficiency physically hurts. Solutions appear as crystal-clear diagrams while 
                  human emotions remain an unsolvable puzzle."
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full opacity-50"></div>
                <p className="text-gray-100 text-sm italic leading-relaxed pl-4">
                  "Every critical word echoes with the weight of a thousand childhood wounds, 
                  driving an obsessive need to be undeniably excellent."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrainVisualization;