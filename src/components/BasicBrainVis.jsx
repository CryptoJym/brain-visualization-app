import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function BasicBrainVis() {
  const mountRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Create simple brain regions
    const regions = [
      { name: 'Frontal Lobe', pos: [0, 2, 3], color: 0x0066ff, size: 1.5 },
      { name: 'Amygdala', pos: [-2, -1, 1], color: 0xff0000, size: 0.5 },
      { name: 'Hippocampus', pos: [2, -1, 1], color: 0x00ff00, size: 0.7 },
      { name: 'Brain Stem', pos: [0, -3, 0], color: 0xffff00, size: 0.8 }
    ];

    const meshes = [];
    regions.forEach(region => {
      const geometry = new THREE.SphereGeometry(region.size, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: region.color,
        emissive: region.color,
        emissiveIntensity: 0.2
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...region.pos);
      mesh.userData = region;
      scene.add(mesh);
      meshes.push(mesh);
    });

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        setSelectedRegion(intersects[0].object.userData.name);
      }
    }

    window.addEventListener('click', onMouseClick);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    // Set loading to false after setup
    setIsLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener('click', onMouseClick);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={mountRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

      <div className="absolute top-4 left-4">
        <h1 className="text-white text-2xl font-bold">Brain Visualization</h1>
        <p className="text-gray-400">Click on regions to explore</p>
      </div>

      {selectedRegion && (
        <div className="absolute top-4 right-4 bg-gray-900 p-6 rounded-lg max-w-sm">
          <h2 className="text-white text-xl mb-2">{selectedRegion}</h2>
          <p className="text-gray-300">
            This is the {selectedRegion} region of the brain.
          </p>
          <button 
            onClick={() => setSelectedRegion(null)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}