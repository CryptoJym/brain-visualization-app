import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function SimpleBrainVisualization() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

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
      // Create sphere
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
      mesh.userData = { name: region.name, color: region.color };
      
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
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header */}
      <div className="absolute top-4 left-4">
        <h2 className="text-2xl font-light text-white mb-1">Brain Regions</h2>
        <p className="text-gray-400 text-sm">Hover to highlight • Click for details</p>
      </div>

      {/* Region List */}
      <div className="absolute top-20 left-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 border border-white/10 max-w-xs">
        <h3 className="text-white text-sm font-medium mb-3">Major Regions</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-300 text-xs">Frontal Lobe - Executive Function</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-300 text-xs">Parietal Lobe - Sensory Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-300 text-xs">Temporal Lobes - Memory & Language</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-300 text-xs">Occipital Lobe - Vision</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-300 text-xs">Amygdala - Fear & Emotion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#88ff44'}} />
            <span className="text-gray-300 text-xs">Hippocampus - Memory Formation</span>
          </div>
        </div>
      </div>

      {/* Selected Region Info */}
      {selectedRegion && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-xl rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-white font-medium">{selectedRegion}</h3>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}