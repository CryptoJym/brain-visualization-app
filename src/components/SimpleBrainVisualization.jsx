import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { analyzeQuestionnaireImpacts } from '../utils/transformQuestionnaireData';

export default function SimpleBrainVisualization({ assessmentResults, brainImpacts }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  // If assessmentResults provided, analyze them
  const impacts = brainImpacts || (assessmentResults ? analyzeQuestionnaireImpacts(assessmentResults) : {});
  
  // Region information
  const regionInfo = {
    'Frontal Lobe': {
      function: 'Executive Function',
      description: 'Controls planning, decision-making, voluntary movement, and personality',
      trauma: 'ACEs can impair emotional regulation and impulse control'
    },
    'Parietal Lobe': {
      function: 'Sensory Integration',
      description: 'Processes sensory information and spatial awareness',
      trauma: 'Early trauma may affect body awareness and sensory processing'
    },
    'Temporal Lobe (L)': {
      function: 'Language & Memory',
      description: 'Processes auditory information, language comprehension, and memory formation',
      trauma: 'Stress can impact verbal memory and language processing'
    },
    'Temporal Lobe (R)': {
      function: 'Non-verbal Memory',
      description: 'Processes visual memory, facial recognition, and emotional tone',
      trauma: 'May affect emotional memory and social cue recognition'
    },
    'Occipital Lobe': {
      function: 'Visual Processing',
      description: 'Primary visual cortex processes visual information',
      trauma: 'Trauma can heighten visual vigilance and threat detection'
    },
    'Cerebellum': {
      function: 'Motor Control & Learning',
      description: 'Coordinates movement, balance, and motor learning',
      trauma: 'Chronic stress affects motor coordination and procedural learning'
    },
    'Brain Stem': {
      function: 'Basic Life Functions',
      description: 'Controls breathing, heart rate, and arousal',
      trauma: 'Hypervigilance and altered stress response patterns'
    },
    'Amygdala (L)': {
      function: 'Fear & Emotion',
      description: 'Processes fear, emotional memories, and threat detection',
      trauma: 'Becomes hyperactive with chronic stress, increasing fear responses'
    },
    'Amygdala (R)': {
      function: 'Emotional Processing',
      description: 'Processes emotional significance and social emotions',
      trauma: 'Overactivation leads to heightened emotional reactivity'
    },
    'Hippocampus (L)': {
      function: 'Verbal Memory',
      description: 'Forms new memories and processes verbal/narrative memory',
      trauma: 'Chronic stress can reduce volume and impair memory formation'
    },
    'Hippocampus (R)': {
      function: 'Spatial Memory',
      description: 'Processes spatial memory and navigation',
      trauma: 'Early trauma affects spatial processing and memory consolidation'
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Brain regions with clear positions and labels
    const regions = [
      { name: 'Frontal Lobe', position: [0, 3, 4], color: 0x4444ff, size: 2.5 },
      { name: 'Parietal Lobe', position: [0, 4, -2], color: 0x44ff44, size: 2.0 },
      { name: 'Temporal Lobe (L)', position: [-5, 0, 0], color: 0xff4444, size: 2.0 },
      { name: 'Temporal Lobe (R)', position: [5, 0, 0], color: 0xff4444, size: 2.0 },
      { name: 'Occipital Lobe', position: [0, 0, -5], color: 0xffff44, size: 1.8 },
      { name: 'Cerebellum', position: [0, -3, -3], color: 0xff44ff, size: 2.2 },
      { name: 'Brain Stem', position: [0, -4, 0], color: 0x44ffff, size: 1.0 },
      { name: 'Amygdala (L)', position: [-2, -1, 2], color: 0xff8844, size: 0.8 },
      { name: 'Amygdala (R)', position: [2, -1, 2], color: 0xff8844, size: 0.8 },
      { name: 'Hippocampus (L)', position: [-3, -1.5, 0], color: 0x88ff44, size: 1.0 },
      { name: 'Hippocampus (R)', position: [3, -1.5, 0], color: 0x88ff44, size: 1.0 }
    ];

    // Create brain outline
    const brainGroup = new THREE.Group();
    
    // Simple brain shape
    const brainGeometry = new THREE.SphereGeometry(6, 32, 32);
    brainGeometry.scale(1.2, 1, 1.3);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaaaa,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainGroup.add(brainMesh);

    // Create region markers
    const regionMeshes = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    regions.forEach(region => {
      // Check if this region is impacted
      const impactData = impacts[region.name];
      const isImpacted = impactData && impactData.impactLevel > 0;
      const impactLevel = isImpacted ? impactData.impactLevel : 0;
      
      // Color based on impact level
      let color = region.color;
      let emissiveIntensity = 0.2;
      let opacity = 0.8;
      
      if (isImpacted) {
        // Red gradient based on impact level
        const hue = 0; // Red
        const saturation = 0.8 + (impactLevel * 0.2);
        const lightness = 0.6 - (impactLevel * 0.3);
        color = new THREE.Color().setHSL(hue, saturation, lightness);
        emissiveIntensity = 0.3 + (impactLevel * 0.4);
        opacity = 0.8 + (impactLevel * 0.2);
      }
      
      // Create sphere
      const geometry = new THREE.SphereGeometry(region.size, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: emissiveIntensity,
        transparent: true,
        opacity: opacity
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...region.position);
      mesh.userData = { 
        name: region.name, 
        originalColor: region.color,
        isImpacted: isImpacted,
        impactLevel: impactLevel,
        impactData: impactData
      };
      
      brainGroup.add(mesh);
      regionMeshes.push(mesh);
    });

    scene.add(brainGroup);

    // Mouse interaction
    let hoveredObject = null;
    
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);

      // Reset previous hover
      if (hoveredObject) {
        hoveredObject.scale.setScalar(1);
        hoveredObject.material.emissiveIntensity = 0.2;
      }

      // Apply hover effect
      if (intersects.length > 0) {
        hoveredObject = intersects[0].object;
        hoveredObject.scale.setScalar(1.2);
        hoveredObject.material.emissiveIntensity = 0.5;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredObject = null;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = (event) => {
      if (hoveredObject) {
        setSelectedRegion(hoveredObject.userData.name);
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Animation loop
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
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [impacts]);

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header */}
      <div className="absolute top-4 left-4">
        <h2 className="text-2xl font-light text-white mb-1">Brain Regions</h2>
        <p className="text-gray-400 text-sm">Hover to highlight • Click for details</p>
      </div>

      {/* Region Info Panel */}
      <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 border border-white/10 max-w-sm">
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
                <p className="text-white text-sm">{regionInfo[selectedRegion]?.function}</p>
              </div>
              
              <div>
                <h4 className="text-green-400 text-sm font-medium mb-1">Description</h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {regionInfo[selectedRegion]?.description}
                </p>
              </div>
              
              <div>
                <h4 className="text-orange-400 text-sm font-medium mb-1">Impact of Trauma</h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {regionInfo[selectedRegion]?.trauma}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-white text-sm font-medium mb-3">Brain Regions</h3>
            <p className="text-gray-400 text-xs mb-3">Click on any region to learn more</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-300 text-xs">Frontal Lobe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-300 text-xs">Parietal Lobe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-300 text-xs">Temporal Lobes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-300 text-xs">Occipital Lobe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-gray-300 text-xs">Amygdala</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#88ff44'}} />
                <span className="text-gray-300 text-xs">Hippocampus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-gray-300 text-xs">Cerebellum</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-gray-300 text-xs">Brain Stem</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}