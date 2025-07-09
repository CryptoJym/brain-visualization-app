import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

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

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

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
    let rotationSpeed = 0.001;
    let currentRotation = { x: 0, y: 0 };

    const handlePointerDown = (e) => {
      isDragging = true;
      autoRotate = false;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      previousPosition = { x: clientX, y: clientY };
      
      // Store current rotation
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
      // Don't reset autoRotate on click
      if (moved >= 5) {
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
          currentRotation.y += rotationSpeed;
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
  }, [selectedRegion]);

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
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gray-900/90 backdrop-blur-sm p-4 border-b border-gray-800">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
          Neuroscience of Adversity: How Trauma Shapes the Brain
        </h1>
        <p className="text-gray-300 text-xs md:text-sm mb-3">
          Click brain regions to explore how childhood experiences create lasting neural changes
        </p>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowSynergy(!showSynergy)}
            className={`px-3 py-1.5 text-sm rounded ${showSynergy ? 'bg-blue-600' : 'bg-gray-700'} text-white transition-all`}
          >
            {showSynergy ? 'Hide' : 'Show'} Neural Connections
          </button>
          <button
            onClick={() => setShowPerspective(!showPerspective)}
            className={`px-3 py-1.5 text-sm rounded ${showPerspective ? 'bg-purple-600' : 'bg-gray-700'} text-white transition-all`}
          >
            Internal Experience
          </button>
        </div>
      </div>

      {/* Main 3D View */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Region Information Panel */}
      {selectedRegion && brainRegions[selectedRegion] && (
        <div className="absolute top-28 right-4 w-96 max-w-[calc(100%-2rem)] bg-gray-900/95 backdrop-blur-md p-6 rounded-xl border border-gray-700 shadow-2xl">
          <button
            onClick={() => setSelectedRegion(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          
          <h2 className="text-2xl font-bold text-white mb-4 pr-8">
            {brainRegions[selectedRegion].name}
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
              <h3 className="text-blue-400 font-semibold text-sm mb-1">Normal Function</h3>
              <p className="text-white text-sm">{brainRegions[selectedRegion].function}</p>
            </div>
            
            <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700/30">
              <h3 className="text-yellow-400 font-semibold text-sm mb-1">Early Trauma Impact</h3>
              <p className="text-yellow-100 text-sm">{brainRegions[selectedRegion].earlyImpact}</p>
            </div>
            
            <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-700/30">
              <h3 className="text-orange-400 font-semibold text-sm mb-1">Later Impact</h3>
              <p className="text-orange-100 text-sm">{brainRegions[selectedRegion].lateImpact}</p>
            </div>
            
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/30">
              <h3 className="text-red-400 font-semibold text-sm mb-1">Brain Changes</h3>
              <p className="text-red-100 text-sm">{brainRegions[selectedRegion].outcome}</p>
            </div>
            
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
              <h3 className="text-green-400 font-semibold text-sm mb-1">How It Shows Up</h3>
              <p className="text-green-100 text-sm">{brainRegions[selectedRegion].behavior}</p>
            </div>
          </div>
          
          {showSynergy && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h3 className="text-white font-semibold text-sm mb-2">Connected Systems</h3>
              <div className="space-y-2">
                {synergyConnections
                  .filter(conn => conn.from === selectedRegion || conn.to === selectedRegion)
                  .map((conn, idx) => (
                    <div key={idx} className="text-xs bg-gray-800/50 p-2 rounded">
                      <p className="text-cyan-400">{conn.description}</p>
                      <p className="text-gray-300 mt-1">{conn.impact}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hover Information */}
      {hoveredRegion && !selectedRegion && brainRegions[hoveredRegion] && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur px-4 py-2 rounded-lg">
          <p className="text-white font-medium">{brainRegions[hoveredRegion].name}</p>
          <p className="text-gray-300 text-sm">Click to explore</p>
        </div>
      )}

      {/* Navigation Instructions */}
      <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg text-xs text-gray-300">
        <p className="font-semibold text-white mb-1">Navigation</p>
        <p>🖱️ Drag to rotate brain</p>
        <p>👆 Click regions to learn more</p>
        <p>🔗 Enable connections to see interactions</p>
      </div>

      {/* Internal Perspective Panel */}
      {showPerspective && (
        <div className="absolute bottom-4 right-4 w-96 max-w-[calc(100%-2rem)] bg-purple-900/90 backdrop-blur-md p-5 rounded-xl border border-purple-700">
          <h3 className="text-lg font-bold text-white mb-3">The Internal Experience</h3>
          <div className="space-y-3 text-sm">
            <p className="text-purple-100 italic">
              "The world feels like a high-stakes chess game where threats hide in every pattern. 
              My brain sees danger where others see nothing."
            </p>
            <p className="text-purple-100 italic">
              "I can shut down all emotion and focus with superhuman intensity - but sometimes 
              the dam breaks and years of suppressed feelings explode at once."
            </p>
            <p className="text-purple-100 italic">
              "Inefficiency physically hurts. Solutions appear as crystal-clear diagrams while 
              human emotions remain an unsolvable puzzle."
            </p>
            <p className="text-purple-100 italic">
              "Every critical word echoes with the weight of a thousand childhood wounds, 
              driving an obsessive need to be undeniably excellent."
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrainVisualization;