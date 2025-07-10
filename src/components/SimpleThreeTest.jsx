import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function SimpleThreeTest() {
  const mountRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  const regionInfo = {
    'Frontal': {
      function: 'Executive Function & Decision Making',
      description: 'Controls planning, decision-making, voluntary movement, and personality. The command center of the brain.',
      trauma: 'Early trauma can impair emotional regulation, impulse control, and executive functioning'
    },
    'Amygdala': {
      function: 'Fear & Emotional Processing',
      description: 'Processes fear, emotional memories, and threat detection. Acts as the brain\'s alarm system.',
      trauma: 'Becomes hyperactive with chronic stress, leading to heightened fear responses and anxiety'
    },
    'Hippocampus': {
      function: 'Memory Formation',
      description: 'Critical for forming new memories and learning. Helps contextualize experiences.',
      trauma: 'Chronic stress can reduce hippocampal volume, impairing memory formation and stress regulation'
    },
    'Brain Stem': {
      function: 'Basic Life Functions',
      description: 'Controls breathing, heart rate, blood pressure, and arousal. Connects brain to spinal cord.',
      trauma: 'Early trauma can lead to dysregulated arousal, hypervigilance, and altered stress responses'
    }
  };
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    
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
    
    // Brain outline (transparent)
    const brainGeometry = new THREE.SphereGeometry(5, 32, 32);
    brainGeometry.scale(1.2, 1, 1.3);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffcccc,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    scene.add(brainMesh);
    
    // Brain regions
    const regions = [
      { name: 'Frontal', position: [0, 2, 3], color: 0x4169e1, size: 2.0 },
      { name: 'Amygdala', position: [-2, -1, 1], color: 0xff4500, size: 0.8 },
      { name: 'Hippocampus', position: [2, -1, 1], color: 0x32cd32, size: 1.0 },
      { name: 'Brain Stem', position: [0, -3.5, 0], color: 0xffd700, size: 1.0 }
    ];
    
    const regionMeshes = [];
    regions.forEach(region => {
      const geometry = new THREE.SphereGeometry(region.size, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: region.color,
        emissive: region.color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...region.position);
      mesh.userData = region;
      
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
        hoveredMesh.material.emissiveIntensity = 0.2;
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
      }
    };
    
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      // Gentle rotation
      brainMesh.rotation.y += 0.001;
      
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
  }, []);
  
  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-gray-900 to-black">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header */}
      <div className="absolute top-6 left-6">
        <h1 className="text-3xl font-light text-white mb-2">Interactive Brain Model</h1>
        <p className="text-gray-400">Hover and click regions to explore • Drag to rotate</p>
      </div>
      
      {/* Region Info Panel */}
      <div className="absolute top-24 right-6 max-w-md">
        <div className="bg-black/80 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          {selectedRegion ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-medium text-white">{selectedRegion}</h2>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-blue-400 font-medium mb-1">Function</h3>
                  <p className="text-white">{regionInfo[selectedRegion]?.function}</p>
                </div>
                
                <div>
                  <h3 className="text-green-400 font-medium mb-1">Description</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {regionInfo[selectedRegion]?.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-orange-400 font-medium mb-1">Impact of Trauma</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {regionInfo[selectedRegion]?.trauma}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-medium text-white mb-4">Brain Regions</h2>
              <p className="text-gray-400 text-sm mb-4">Click on any highlighted region to learn more</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-gray-300">Frontal Lobe</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                  <span className="text-gray-300">Amygdala</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">Hippocampus</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-300">Brain Stem</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}