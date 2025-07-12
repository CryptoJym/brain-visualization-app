import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { analyzeQuestionnaireImpacts } from '../utils/transformQuestionnaireData';

export default function AnatomicalBrainVisualization({ assessmentResults, brainImpacts }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // If assessmentResults provided, analyze them
  const impacts = brainImpacts || (assessmentResults ? analyzeQuestionnaireImpacts(assessmentResults) : {});
  
  // Anatomically accurate brain regions with realistic positions
  const brainRegions = {
    // Cortical regions
    'Frontal Lobe': {
      position: [0, 4, 5],
      size: [4, 3, 3],
      color: 0x3b82f6,
      function: 'Executive Function & Planning',
      description: 'Controls decision-making, planning, personality, and voluntary movement',
      trauma: 'ACEs impair emotional regulation, impulse control, and executive function'
    },
    'Prefrontal Cortex': {
      position: [0, 5, 6],
      size: [3, 2, 2],
      color: 0x60a5fa,
      function: 'Higher Cognition',
      description: 'Manages complex cognitive behavior, personality expression, and social behavior',
      trauma: 'Chronic stress reduces gray matter volume and impairs decision-making'
    },
    'Motor Cortex': {
      position: [0, 6, 2],
      size: [5, 1, 2],
      color: 0x2563eb,
      function: 'Voluntary Movement',
      description: 'Controls voluntary muscle movements throughout the body',
      trauma: 'Trauma can affect motor planning and coordination'
    },
    'Parietal Lobe': {
      position: [0, 4, -3],
      size: [4, 3, 3],
      color: 0x10b981,
      function: 'Sensory Integration',
      description: 'Processes sensory information, spatial awareness, and navigation',
      trauma: 'Early trauma affects body awareness and sensory processing'
    },
    'Temporal Lobe (L)': {
      position: [-6, 0, 0],
      size: [3, 4, 4],
      color: 0xef4444,
      function: 'Language & Auditory',
      description: 'Processes auditory information, language comprehension, and memory',
      trauma: 'Stress impacts verbal memory and language processing'
    },
    'Temporal Lobe (R)': {
      position: [6, 0, 0],
      size: [3, 4, 4],
      color: 0xef4444,
      function: 'Non-verbal Processing',
      description: 'Processes visual memory, facial recognition, and emotional tone',
      trauma: 'Affects emotional memory and social cue recognition'
    },
    'Occipital Lobe': {
      position: [0, 1, -7],
      size: [3, 3, 2],
      color: 0xfbbf24,
      function: 'Visual Processing',
      description: 'Primary visual cortex processes all visual information',
      trauma: 'Trauma heightens visual vigilance and threat detection'
    },
    
    // Subcortical structures
    'Hippocampus (L)': {
      position: [-3, -1, 0],
      size: [1.5, 0.8, 2],
      color: 0x22c55e,
      function: 'Memory Formation',
      description: 'Critical for forming new memories and spatial navigation',
      trauma: 'Chronic stress causes volume reduction and memory impairment'
    },
    'Hippocampus (R)': {
      position: [3, -1, 0],
      size: [1.5, 0.8, 2],
      color: 0x22c55e,
      function: 'Spatial Memory',
      description: 'Processes spatial memory and emotional context',
      trauma: 'Early trauma affects memory consolidation'
    },
    'Amygdala (L)': {
      position: [-2.5, -1, 2],
      size: [0.8, 0.8, 0.8],
      color: 0xdc2626,
      function: 'Fear Processing',
      description: 'Processes fear, emotional memories, and threat detection',
      trauma: 'Becomes hyperactive with chronic stress, increasing fear responses'
    },
    'Amygdala (R)': {
      position: [2.5, -1, 2],
      size: [0.8, 0.8, 0.8],
      color: 0xdc2626,
      function: 'Emotional Processing',
      description: 'Processes emotional significance and social emotions',
      trauma: 'Overactivation leads to heightened emotional reactivity'
    },
    'Thalamus': {
      position: [0, -0.5, 0],
      size: [2, 1.5, 2],
      color: 0x8b5cf6,
      function: 'Sensory Relay',
      description: 'Relays sensory and motor signals to the cerebral cortex',
      trauma: 'Disrupted sensory processing and integration'
    },
    'Hypothalamus': {
      position: [0, -2, 1],
      size: [1, 0.8, 1],
      color: 0xa855f7,
      function: 'Homeostasis',
      description: 'Regulates body temperature, hunger, hormones, and circadian rhythms',
      trauma: 'Dysregulation of stress hormones and HPA axis'
    },
    'Basal Ganglia': {
      position: [0, 0, 0],
      size: [3, 2, 3],
      color: 0x6366f1,
      function: 'Motor Control & Habits',
      description: 'Controls voluntary motor movements, procedural learning, and habits',
      trauma: 'Affects habit formation and motor control'
    },
    
    // Brainstem structures
    'Midbrain': {
      position: [0, -3, -1],
      size: [1.5, 1, 1.5],
      color: 0x0891b2,
      function: 'Arousal & Reflexes',
      description: 'Controls eye movement, visual and auditory reflexes',
      trauma: 'Hypervigilance and altered arousal patterns'
    },
    'Pons': {
      position: [0, -4, -1],
      size: [1.2, 0.8, 1.2],
      color: 0x0e7490,
      function: 'Sleep & Arousal',
      description: 'Regulates sleep, arousal, and facial sensations',
      trauma: 'Sleep disturbances and altered REM patterns'
    },
    'Medulla': {
      position: [0, -5, -1],
      size: [1, 1, 1],
      color: 0x155e75,
      function: 'Vital Functions',
      description: 'Controls breathing, heart rate, and blood pressure',
      trauma: 'Dysregulated autonomic responses'
    },
    
    // Cerebellum
    'Cerebellum': {
      position: [0, -3, -4],
      size: [4, 3, 2],
      color: 0xec4899,
      function: 'Motor Coordination',
      description: 'Coordinates movement, balance, and motor learning',
      trauma: 'Affects motor coordination and procedural learning'
    },
    
    // Additional important regions
    'Anterior Cingulate': {
      position: [0, 2, 3],
      size: [1, 3, 1],
      color: 0xf97316,
      function: 'Conflict Monitoring',
      description: 'Monitors conflicts, pain processing, and emotional regulation',
      trauma: 'Impaired conflict resolution and emotional control'
    },
    'Insula': {
      position: [-4, 1, 1],
      size: [1, 2, 2],
      color: 0x84cc16,
      function: 'Interoception',
      description: 'Processes internal bodily sensations and emotional awareness',
      trauma: 'Disrupted body awareness and emotional processing'
    },
    'Corpus Callosum': {
      position: [0, 1, 0],
      size: [0.5, 2, 4],
      color: 0x06b6d4,
      function: 'Hemispheric Communication',
      description: 'Connects left and right brain hemispheres',
      trauma: 'Reduced volume affects interhemispheric communication'
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    console.log('AnatomicalBrainVisualization mounting, dimensions:', { width, height });

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 30, 100);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(15, 8, 15);
    camera.lookAt(0, 0, 0);

    // Renderer with better quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4444ff, 0.3);
    pointLight.position.set(-10, 10, -10);
    scene.add(pointLight);

    // Create brain container group
    const brainGroup = new THREE.Group();
    
    // Create overall brain shape (envelope)
    const brainEnvelope = new THREE.Group();
    
    // Main brain body
    const brainGeometry = new THREE.SphereGeometry(8, 64, 64);
    brainGeometry.scale(1.2, 1, 1.1);
    
    const brainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffcccc,
      transparent: true,
      opacity: 0.1,
      roughness: 0.7,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      side: THREE.DoubleSide
    });
    
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainMesh.castShadow = true;
    brainMesh.receiveShadow = true;
    brainEnvelope.add(brainMesh);
    
    // Add brain stem
    const stemGeometry = new THREE.CylinderGeometry(1.5, 2, 6, 16);
    const stemMesh = new THREE.Mesh(stemGeometry, brainMaterial);
    stemMesh.position.set(0, -5, -1);
    stemMesh.rotation.z = Math.PI * 0.1;
    brainEnvelope.add(stemMesh);
    
    brainGroup.add(brainEnvelope);

    // Create region meshes
    const regionMeshes = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    Object.entries(brainRegions).forEach(([name, region]) => {
      const impactData = impacts[name];
      const isImpacted = impactData && impactData.impactLevel > 0;
      const impactLevel = isImpacted ? impactData.impactLevel : 0;
      
      // Create more anatomically accurate shapes
      let geometry;
      if (name.includes('Hippocampus')) {
        // Curved shape for hippocampus
        geometry = new THREE.CylinderGeometry(
          region.size[0] * 0.3,
          region.size[0],
          region.size[1],
          16,
          1,
          false
        );
        geometry.rotateZ(Math.PI / 2);
        geometry.scale(1, region.size[2], 1);
      } else if (name.includes('Amygdala')) {
        // Almond shape for amygdala
        geometry = new THREE.SphereGeometry(region.size[0], 16, 16);
        geometry.scale(1, 0.8, 1.2);
      } else if (name === 'Corpus Callosum') {
        // Flat curved shape
        geometry = new THREE.BoxGeometry(...region.size);
        geometry.scale(1, 0.3, 1);
      } else if (name.includes('Cortex') || name.includes('Lobe')) {
        // Irregular shape for cortical regions
        geometry = new THREE.IcosahedronGeometry(region.size[0], 1);
        geometry.scale(
          region.size[0] / 2,
          region.size[1] / 2,
          region.size[2] / 2
        );
      } else {
        // Default ellipsoid shape
        geometry = new THREE.SphereGeometry(1, 32, 32);
        geometry.scale(...region.size);
      }
      
      // Color based on impact
      let color = new THREE.Color(region.color);
      if (isImpacted) {
        const hsl = {};
        color.getHSL(hsl);
        // Shift hue towards red and increase saturation based on impact
        hsl.h = hsl.h * (1 - impactLevel * 0.3);
        hsl.s = Math.min(1, hsl.s + impactLevel * 0.3);
        hsl.l = hsl.l * (1 - impactLevel * 0.2);
        color.setHSL(hsl.h, hsl.s, hsl.l);
      }
      
      const material = new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.1 + (impactLevel * 0.2),
        transparent: true,
        opacity: 0.7 + (impactLevel * 0.2),
        roughness: 0.4,
        metalness: 0.1,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...region.position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Add subtle animation based on impact
      mesh.userData = {
        name,
        originalPosition: region.position,
        originalScale: 1,
        isImpacted,
        impactLevel,
        impactData,
        pulsePhase: Math.random() * Math.PI * 2
      };
      
      brainGroup.add(mesh);
      regionMeshes.push(mesh);
    });

    scene.add(brainGroup);
    setIsLoading(false);

    // Add grid for reference
    const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // Mouse interaction
    let hoveredObject = null;
    
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);
      
      // Reset previous hover
      if (hoveredObject && hoveredObject !== intersects[0]?.object) {
        hoveredObject.scale.setScalar(hoveredObject.userData.originalScale);
        hoveredObject.material.emissiveIntensity = 0.1 + (hoveredObject.userData.impactLevel * 0.2);
      }

      // Apply hover effect
      if (intersects.length > 0) {
        hoveredObject = intersects[0].object;
        hoveredObject.scale.setScalar(1.1);
        hoveredObject.material.emissiveIntensity = 0.4;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredObject = null;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = (event) => {
      if (hoveredObject) {
        setSelectedRegion(hoveredObject.userData.name);
        
        // Focus camera on selected region
        const targetPosition = hoveredObject.position.clone();
        controls.target.copy(targetPosition);
        controls.update();
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate impacted regions with subtle pulsing
      regionMeshes.forEach(mesh => {
        if (mesh.userData.isImpacted) {
          const pulse = Math.sin(Date.now() * 0.001 + mesh.userData.pulsePhase) * 0.02;
          mesh.scale.setScalar(mesh.userData.originalScale + pulse * mesh.userData.impactLevel);
        }
      });
      
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
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [impacts]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '100vh' }}>
      <div ref={mountRef} className="w-full h-full" style={{ minHeight: '100vh' }} />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-xl">Loading anatomical brain model...</div>
        </div>
      )}
      
      {/* Header */}
      <div className="absolute top-4 left-4">
        <h2 className="text-2xl font-light text-white mb-1">Anatomical Brain Regions</h2>
        <p className="text-gray-400 text-sm">Interactive 3D model • Click regions for detailed information</p>
      </div>

      {/* Region Info Panel */}
      <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 border border-white/10 max-w-md">
        {selectedRegion ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-medium">{selectedRegion}</h3>
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-blue-400 text-sm font-medium mb-1">Primary Function</h4>
                <p className="text-white text-sm">{brainRegions[selectedRegion]?.function}</p>
              </div>
              
              <div>
                <h4 className="text-green-400 text-sm font-medium mb-1">Description</h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {brainRegions[selectedRegion]?.description}
                </p>
              </div>
              
              <div>
                <h4 className="text-orange-400 text-sm font-medium mb-1">Impact of Trauma</h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {brainRegions[selectedRegion]?.trauma}
                </p>
              </div>
              
              {impacts[selectedRegion] && (
                <div>
                  <h4 className="text-red-400 text-sm font-medium mb-1">Your Impact Level</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-red-500 h-full rounded-full transition-all"
                        style={{ width: `${impacts[selectedRegion].impactLevel * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300 text-xs">
                      {Math.round(impacts[selectedRegion].impactLevel * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-white text-sm font-medium mb-3">Brain Region Guide</h3>
            <p className="text-gray-400 text-xs mb-3">Click on any region to learn more</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(brainRegions).map(([name, region]) => (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: `#${region.color.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="text-gray-300">{name}</span>
                  {impacts[name] && (
                    <span className="text-red-400 ml-auto">
                      {Math.round(impacts[name].impactLevel * 100)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}