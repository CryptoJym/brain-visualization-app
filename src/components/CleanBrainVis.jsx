import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function CleanBrainVis({ brainImpacts = {} }) {
  const mountRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Comprehensive brain regions (40+)
  const brainRegions = {
    // Cortical Regions
    'Prefrontal Cortex': { 
      position: [0, 3, 4], 
      color: 0x4169e1, 
      size: 2.0,
      info: {
        function: 'Executive Function',
        description: 'Planning, decision-making, personality',
        trauma: 'Impaired emotional regulation and impulse control'
      }
    },
    'Dorsolateral PFC': { 
      position: [-2, 3.5, 3.5], 
      color: 0x5179f1, 
      size: 1.5,
      info: {
        function: 'Working Memory',
        description: 'Cognitive control and abstract reasoning',
        trauma: 'Executive dysfunction and attention deficits'
      }
    },
    'Ventromedial PFC': { 
      position: [0, 2.5, 4.5], 
      color: 0x6189ff, 
      size: 1.3,
      info: {
        function: 'Emotional Decision Making',
        description: 'Self-referential thinking and social cognition',
        trauma: 'Poor emotional decision-making'
      }
    },
    'Orbitofrontal Cortex': { 
      position: [0, 1, 4.8], 
      color: 0x7199ff, 
      size: 1.2,
      info: {
        function: 'Reward Processing',
        description: 'Value-based decision making',
        trauma: 'Impaired reward processing and risk assessment'
      }
    },
    
    // Temporal Regions
    'Superior Temporal': { 
      position: [-5, 0.5, 0], 
      color: 0xff4444, 
      size: 1.6,
      info: {
        function: 'Auditory Processing',
        description: 'Sound and language comprehension',
        trauma: 'Auditory processing difficulties'
      }
    },
    'Middle Temporal': { 
      position: [-5, -0.5, -1], 
      color: 0xff5555, 
      size: 1.4,
      info: {
        function: 'Semantic Memory',
        description: 'Word and object recognition',
        trauma: 'Memory retrieval issues'
      }
    },
    'Inferior Temporal': { 
      position: [-5, -1.5, -0.5], 
      color: 0xff6666, 
      size: 1.3,
      info: {
        function: 'Visual Recognition',
        description: 'Complex visual processing',
        trauma: 'Face recognition difficulties'
      }
    },
    
    // Parietal Regions
    'Superior Parietal': { 
      position: [0, 4, -2], 
      color: 0x44ff44, 
      size: 1.8,
      info: {
        function: 'Spatial Awareness',
        description: 'Visual-spatial processing',
        trauma: 'Spatial navigation problems'
      }
    },
    'Inferior Parietal': { 
      position: [-2, 3.5, -2], 
      color: 0x55ff55, 
      size: 1.5,
      info: {
        function: 'Language & Math',
        description: 'Symbolic thinking and calculation',
        trauma: 'Learning difficulties'
      }
    },
    'Precuneus': { 
      position: [0, 3, -3], 
      color: 0x66ff66, 
      size: 1.2,
      info: {
        function: 'Consciousness',
        description: 'Self-awareness and consciousness',
        trauma: 'Dissociation and self-perception issues'
      }
    },
    
    // Occipital Regions
    'Primary Visual (V1)': { 
      position: [0, 0, -5.5], 
      color: 0xffff44, 
      size: 1.5,
      info: {
        function: 'Basic Vision',
        description: 'Edge and motion detection',
        trauma: 'Visual processing disruption'
      }
    },
    'Secondary Visual (V2)': { 
      position: [-1, 0.5, -5], 
      color: 0xffff55, 
      size: 1.3,
      info: {
        function: 'Pattern Recognition',
        description: 'Color and depth perception',
        trauma: 'Complex visual deficits'
      }
    },
    
    // Limbic System
    'Left Amygdala': { 
      position: [-2.5, -1, 1.5], 
      color: 0xff4500, 
      size: 0.8,
      info: {
        function: 'Fear Processing',
        description: 'Threat detection and fear memories',
        trauma: 'Hypervigilance and anxiety'
      }
    },
    'Right Amygdala': { 
      position: [2.5, -1, 1.5], 
      color: 0xff4500, 
      size: 0.8,
      info: {
        function: 'Emotional Processing',
        description: 'Emotional significance detection',
        trauma: 'Emotional dysregulation'
      }
    },
    'Left Hippocampus': { 
      position: [-3, -1.5, 0.5], 
      color: 0x32cd32, 
      size: 1.0,
      info: {
        function: 'Verbal Memory',
        description: 'Formation of declarative memories',
        trauma: 'Memory fragmentation'
      }
    },
    'Right Hippocampus': { 
      position: [3, -1.5, 0.5], 
      color: 0x32cd32, 
      size: 1.0,
      info: {
        function: 'Spatial Memory',
        description: 'Spatial navigation and memory',
        trauma: 'Spatial memory deficits'
      }
    },
    'Anterior Cingulate': { 
      position: [0, 1, 2], 
      color: 0xff69b4, 
      size: 1.2,
      info: {
        function: 'Conflict Monitoring',
        description: 'Error detection and attention',
        trauma: 'Attention and error processing issues'
      }
    },
    'Posterior Cingulate': { 
      position: [0, 0.5, -1], 
      color: 0xff79c4, 
      size: 1.0,
      info: {
        function: 'Self-Reflection',
        description: 'Autobiographical memory',
        trauma: 'Self-referential processing disruption'
      }
    },
    
    // Subcortical
    'Thalamus': { 
      position: [0, 0, 0], 
      color: 0x9370db, 
      size: 1.0,
      info: {
        function: 'Sensory Relay',
        description: 'Gateway for sensory information',
        trauma: 'Sensory processing disruption'
      }
    },
    'Hypothalamus': { 
      position: [0, -0.8, 0.5], 
      color: 0xa380eb, 
      size: 0.6,
      info: {
        function: 'Homeostasis',
        description: 'Hormones and autonomic regulation',
        trauma: 'Stress hormone dysregulation'
      }
    },
    'Caudate': { 
      position: [-1.5, 0.5, 1], 
      color: 0x4682b4, 
      size: 0.8,
      info: {
        function: 'Habit Formation',
        description: 'Motor control and habits',
        trauma: 'Compulsive behaviors'
      }
    },
    'Putamen': { 
      position: [1.5, 0.5, 1], 
      color: 0x5692c4, 
      size: 0.8,
      info: {
        function: 'Motor Learning',
        description: 'Movement regulation',
        trauma: 'Motor learning difficulties'
      }
    },
    
    // Brainstem & Cerebellum
    'Midbrain': { 
      position: [0, -2.5, -0.5], 
      color: 0xffd700, 
      size: 0.8,
      info: {
        function: 'Arousal & Reflexes',
        description: 'Eye movement and arousal',
        trauma: 'Hyperarousal states'
      }
    },
    'Pons': { 
      position: [0, -3, -1], 
      color: 0xffe720, 
      size: 0.7,
      info: {
        function: 'Sleep & Arousal',
        description: 'REM sleep and facial sensations',
        trauma: 'Sleep disturbances'
      }
    },
    'Medulla': { 
      position: [0, -3.5, -0.5], 
      color: 0xfff740, 
      size: 0.6,
      info: {
        function: 'Vital Functions',
        description: 'Heart rate and breathing',
        trauma: 'Autonomic dysregulation'
      }
    },
    'Cerebellum': { 
      position: [0, -3, -3], 
      color: 0xdda0dd, 
      size: 2.2,
      info: {
        function: 'Movement Coordination',
        description: 'Balance and fine motor control',
        trauma: 'Coordination and learning issues'
      }
    }
  };
  
  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (!mountRef.current) return;
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    scene.fog = new THREE.Fog(0x000814, 10, 50);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, isMobile ? 20 : 15);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
    rimLight.position.set(-5, 0, -5);
    scene.add(rimLight);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 30;
    controls.minDistance = 8;
    controls.enablePan = false;
    
    // Brain container group
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);
    
    // Brain outline with subtle glow
    const brainGeometry = new THREE.SphereGeometry(6, 64, 64);
    brainGeometry.scale(1.2, 1, 1.3);
    const brainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03,
      metalness: 0.1,
      roughness: 0.9,
      transmission: 0.9,
      thickness: 2,
      side: THREE.DoubleSide
    });
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainGroup.add(brainMesh);
    
    // Add subtle inner glow
    const glowGeometry = new THREE.SphereGeometry(5.5, 32, 32);
    glowGeometry.scale(1.2, 1, 1.3);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    brainGroup.add(glowMesh);
    
    // Create all brain regions
    const regionMeshes = [];
    Object.entries(brainRegions).forEach(([name, region]) => {
      const isAffected = brainImpacts[name];
      
      const geometry = new THREE.SphereGeometry(region.size * 0.5, 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: isAffected ? 0xff3366 : region.color,
        emissive: isAffected ? 0xff0044 : region.color,
        emissiveIntensity: isAffected ? 0.4 : 0.1,
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,
        opacity: isAffected ? 0.9 : 0.6
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...region.position);
      mesh.userData = { name, ...region, isAffected };
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      brainGroup.add(mesh);
      regionMeshes.push(mesh);
      
      // Add subtle pulsing animation for affected regions
      if (isAffected) {
        mesh.userData.pulse = 0;
      }
    });
    
    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh = null;
    
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);
      
      // Reset previous hover
      if (hoveredMesh && hoveredMesh !== selectedRegion) {
        hoveredMesh.scale.setScalar(1);
        hoveredMesh.material.emissiveIntensity = hoveredMesh.userData.isAffected ? 0.4 : 0.1;
      }
      
      // Apply hover effect
      if (intersects.length > 0) {
        hoveredMesh = intersects[0].object;
        if (hoveredMesh !== selectedRegion) {
          hoveredMesh.scale.setScalar(1.15);
          hoveredMesh.material.emissiveIntensity = 0.6;
        }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredMesh = null;
        renderer.domElement.style.cursor = 'grab';
      }
    };
    
    const onClick = (event) => {
      if (hoveredMesh) {
        // Reset previous selection
        regionMeshes.forEach(mesh => {
          if (mesh !== hoveredMesh) {
            mesh.scale.setScalar(1);
            mesh.material.emissiveIntensity = mesh.userData.isAffected ? 0.4 : 0.1;
          }
        });
        
        setSelectedRegion(hoveredMesh.userData.name);
        hoveredMesh.scale.setScalar(1.3);
        hoveredMesh.material.emissiveIntensity = 0.8;
        
        if (isMobile) {
          setShowPanel(true);
        }
      }
    };
    
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.style.cursor = 'grab';
    
    // Touch support
    renderer.domElement.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);
      
      if (intersects.length > 0) {
        onClick({ target: intersects[0].object });
      }
    });
    
    // Create orientation cube helper
    const orientationScene = new THREE.Scene();
    const orientationCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    orientationCamera.position.set(0, 0, 4);
    orientationCamera.lookAt(0, 0, 0);
    
    // Orientation cube
    const cubeSize = 1;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    
    // Create face materials with labels
    const createFaceMaterial = (color, label) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      // Background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 128, 128);
      
      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 126, 126);
      
      // Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 64, 64);
      
      const texture = new THREE.CanvasTexture(canvas);
      return new THREE.MeshBasicMaterial({ map: texture, opacity: 0.9, transparent: true });
    };
    
    const cubeMaterials = [
      createFaceMaterial('#e74c3c', 'R'),    // Right (red)
      createFaceMaterial('#c0392b', 'L'),    // Left (dark red)
      createFaceMaterial('#2ecc71', 'T'),    // Top (green)
      createFaceMaterial('#27ae60', 'B'),    // Bottom (dark green)
      createFaceMaterial('#3498db', 'F'),    // Front (blue)
      createFaceMaterial('#2980b9', 'Bk')    // Back (dark blue)
    ];
    
    const orientationCube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    orientationScene.add(orientationCube);
    
    // Add lighting to orientation scene
    const orientationLight = new THREE.AmbientLight(0xffffff, 0.8);
    orientationScene.add(orientationLight);
    
    // Add floor grid for spatial reference (subtle)
    const gridSize = 15;
    const gridDivisions = 15;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222);
    gridHelper.position.y = -5;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Add subtle directional indicators
    const createDirectionLabel = (text, position, color) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      ctx.font = '32px Arial';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 64);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture, 
        opacity: 0.3,
        transparent: true
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(3, 1.5, 1);
      return sprite;
    };
    
    // Add subtle labels at edges
    const frontLabel = createDirectionLabel('Frontal', new THREE.Vector3(0, -4.5, 7), '#3498db');
    const backLabel = createDirectionLabel('Occipital', new THREE.Vector3(0, -4.5, -7), '#e74c3c');
    scene.add(frontLabel);
    scene.add(backLabel);
    
    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      controls.update();
      
      // Subtle brain rotation
      brainGroup.rotation.y = Math.sin(time * 0.2) * 0.05;
      
      // Pulse affected regions
      regionMeshes.forEach(mesh => {
        if (mesh.userData.isAffected && mesh.userData.pulse !== undefined) {
          mesh.userData.pulse += 0.02;
          const pulseFactor = 1 + Math.sin(mesh.userData.pulse) * 0.05;
          if (mesh !== hoveredMesh && mesh.userData.name !== selectedRegion) {
            mesh.scale.setScalar(pulseFactor);
          }
        }
      });
      
      // Update orientation cube to show scene rotation
      const cameraQuaternion = new THREE.Quaternion();
      camera.getWorldQuaternion(cameraQuaternion);
      orientationCube.quaternion.copy(cameraQuaternion).invert();
      
      // Render main scene
      renderer.render(scene, camera);
      
      // Render orientation cube overlay
      const orientationSize = 80;
      renderer.setScissorTest(true);
      renderer.setScissor(width - orientationSize - 20, height - orientationSize - 20, orientationSize, orientationSize);
      renderer.setViewport(width - orientationSize - 20, height - orientationSize - 20, orientationSize, orientationSize);
      renderer.render(orientationScene, orientationCamera);
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, width, height);
    };
    
    // Start animation after a brief delay
    setTimeout(() => {
      setIsLoading(false);
      animate();
    }, 100);
    
    // Handle resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', checkMobile);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [brainImpacts]);
  
  const InfoPanel = () => {
    const region = selectedRegion ? brainRegions[selectedRegion] : null;
    
    return (
      <div className={`
        ${isMobile ? 'fixed inset-x-0 bottom-0 rounded-t-3xl' : 'absolute top-20 right-6 w-96 rounded-2xl'}
        bg-gray-900/95 backdrop-blur-2xl p-6 border border-white/10
        transform transition-all duration-500 ease-out
        ${isMobile && !showPanel ? 'translate-y-full' : 'translate-y-0'}
        ${!selectedRegion && !isMobile ? 'opacity-70' : ''}
      `}>
        {selectedRegion && region ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-light text-white">{selectedRegion}</h2>
              <button
                onClick={() => {
                  setSelectedRegion(null);
                  setShowPanel(false);
                }}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="text-blue-400 font-medium mb-1 text-sm">Primary Function</h3>
                <p className="text-white">{region.info.function}</p>
              </div>
              
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="text-green-400 font-medium mb-1 text-sm">Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {region.info.description}
                </p>
              </div>
              
              {region.info.trauma && (
                <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <h3 className="text-orange-400 font-medium mb-1 text-sm">Impact of Trauma</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {region.info.trauma}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-light text-white mb-2">
              Explore Brain Regions
            </h2>
            <p className="text-gray-400 text-sm">
              {isMobile ? 'Tap' : 'Click'} on any glowing region to learn more
            </p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="w-full h-screen relative bg-gradient-radial from-gray-900 via-black to-black overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-400 animate-pulse">Loading brain visualization...</p>
          </div>
        </div>
      )}
      
      {/* 3D Visualization Container */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Minimal Header */}
      <div className="absolute top-6 left-6 max-w-md">
        <h1 className="text-2xl md:text-3xl font-extralight text-white mb-2 tracking-wide">
          Neural Architecture
        </h1>
        <p className="text-sm text-gray-500 font-light">
          {Object.keys(brainImpacts).length > 0 
            ? `${Object.keys(brainImpacts).length} regions affected by trauma`
            : 'Interactive brain exploration'
          }
        </p>
      </div>
      
      {/* Orientation Compass */}
      <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="font-medium text-white mb-1">Orientation</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Front = Frontal Lobe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Back = Occipital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Top = Parietal</span>
          </div>
        </div>
      </div>
      
      {/* Orientation Cube Label */}
      <div className="absolute bottom-6 right-6 pointer-events-none">
        <div className="text-xs text-gray-500 text-right mb-1">Orientation Cube</div>
      </div>
      
      {/* Info Panel */}
      <InfoPanel />
    </div>
  );
}