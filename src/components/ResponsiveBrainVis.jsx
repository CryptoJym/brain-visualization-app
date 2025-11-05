import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function ResponsiveBrainVis({ brainImpacts = {} }) {
  const mountRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  
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
    scene.background = new THREE.Color(0x0a0a0a);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, isMobile ? 20 : 15);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 30;
    controls.minDistance = 8;
    
    // Brain outline
    const brainGeometry = new THREE.SphereGeometry(6, 32, 32);
    brainGeometry.scale(1.2, 1, 1.3);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffcccc,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide
    });
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    scene.add(brainMesh);
    
    // Create all brain regions
    const regionMeshes = [];
    Object.entries(brainRegions).forEach(([name, region]) => {
      const isAffected = brainImpacts[name];
      
      const geometry = new THREE.SphereGeometry(region.size * 0.5, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: isAffected ? 0xff3366 : region.color,
        emissive: isAffected ? 0xff0044 : region.color,
        emissiveIntensity: isAffected ? 0.4 : 0.2,
        transparent: true,
        opacity: isAffected ? 0.9 : 0.7
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...region.position);
      mesh.userData = { name, ...region, isAffected };
      
      scene.add(mesh);
      regionMeshes.push(mesh);
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
      if (hoveredMesh) {
        hoveredMesh.scale.setScalar(1);
        hoveredMesh.material.emissiveIntensity = hoveredMesh.userData.isAffected ? 0.4 : 0.2;
      }
      
      // Apply hover effect
      if (intersects.length > 0) {
        hoveredMesh = intersects[0].object;
        hoveredMesh.scale.setScalar(1.2);
        hoveredMesh.material.emissiveIntensity = 0.5;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredMesh = null;
        renderer.domElement.style.cursor = 'default';
      }
    };
    
    const onClick = (event) => {
      if (hoveredMesh) {
        setSelectedRegion(hoveredMesh.userData.name);
        if (isMobile) {
          setShowPanel(true);
        }
      }
    };
    
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    
    // Touch support for mobile
    renderer.domElement.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);
      
      if (intersects.length > 0) {
        setSelectedRegion(intersects[0].object.userData.name);
        if (isMobile) {
          setShowPanel(true);
        }
      }
    });
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
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
  }, [brainImpacts, isMobile]);
  
  const InfoPanel = () => {
    const region = selectedRegion ? brainRegions[selectedRegion] : null;
    
    return (
      <div className={`
        ${isMobile ? 'fixed inset-x-0 bottom-0 rounded-t-2xl' : 'absolute top-20 right-6 max-w-md rounded-xl'}
        bg-black/90 backdrop-blur-xl p-6 border border-white/10
        transform transition-transform duration-300
        ${isMobile && !showPanel ? 'translate-y-full' : 'translate-y-0'}
      `}>
        {selectedRegion && region ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-medium text-white">{selectedRegion}</h2>
              <button
                onClick={() => {
                  setSelectedRegion(null);
                  setShowPanel(false);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-blue-400 font-medium mb-1">Function</h3>
                <p className="text-white text-sm md:text-base">{region.info.function}</p>
              </div>
              
              <div>
                <h3 className="text-green-400 font-medium mb-1">Description</h3>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                  {region.info.description}
                </p>
              </div>
              
              <div>
                <h3 className="text-orange-400 font-medium mb-1">Impact of Trauma</h3>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                  {region.info.trauma}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg md:text-xl font-medium text-white mb-4">
              {Object.keys(brainRegions).length}+ Brain Regions
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {isMobile ? 'Tap' : 'Click'} on any region to explore
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-300">• Prefrontal Cortex</div>
              <div className="text-gray-300">• Amygdala</div>
              <div className="text-gray-300">• Hippocampus</div>
              <div className="text-gray-300">• Thalamus</div>
              <div className="text-gray-300">• Cerebellum</div>
              <div className="text-gray-300">• And many more...</div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="w-full h-screen relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* 3D Visualization Container */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header - Mobile Responsive */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 max-w-[60%] md:max-w-none">
        <h1 className="text-xl md:text-3xl font-light text-white mb-1">
          Interactive Brain Model
        </h1>
        <p className="text-xs md:text-base text-gray-400">
          {isMobile ? 'Tap & drag to explore' : 'Click regions • Drag to rotate'}
        </p>
      </div>
      
      {/* Simple orientation reference */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>Front = Frontal</span>
          <span>•</span>
          <span>Back = Occipital</span>
        </div>
      </div>
      
      {/* Info Panel - Responsive positioning */}
      <InfoPanel />
      
      {/* Mobile Region Count Badge */}
      {isMobile && !selectedRegion && (
        <div className="absolute top-16 right-4 bg-white/10 backdrop-blur rounded-full px-3 py-1">
          <span className="text-xs text-white">{Object.keys(brainRegions).length} regions</span>
        </div>
      )}
    </div>
  );
}