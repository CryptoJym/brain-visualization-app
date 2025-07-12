import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function SimplifiedBrain() {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('SimplifiedBrain mounting...');
    const currentMount = mountRef.current;
    
    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050505);

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        currentMount.clientWidth / currentMount.clientHeight,
        0.1,
        1000
      );
      camera.position.set(150, 100, 150);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      currentMount.appendChild(renderer.domElement);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(50, 50, 50);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Create brain hemispheres
      const brainGroup = new THREE.Group();

      // Left hemisphere
      const leftHemisphereGeometry = new THREE.SphereGeometry(50, 32, 24, 0, Math.PI);
      leftHemisphereGeometry.scale(1.2, 0.9, 1.4);
      leftHemisphereGeometry.translate(-5, 0, 0);

      const leftMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffcccc,
        metalness: 0.1,
        roughness: 0.7,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        side: THREE.DoubleSide
      });

      const leftHemisphere = new THREE.Mesh(leftHemisphereGeometry, leftMaterial);
      brainGroup.add(leftHemisphere);

      // Right hemisphere
      const rightHemisphereGeometry = new THREE.SphereGeometry(50, 32, 24, Math.PI, Math.PI);
      rightHemisphereGeometry.scale(1.2, 0.9, 1.4);
      rightHemisphereGeometry.translate(5, 0, 0);

      const rightMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffcccc,
        metalness: 0.1,
        roughness: 0.7,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        side: THREE.DoubleSide
      });

      const rightHemisphere = new THREE.Mesh(rightHemisphereGeometry, rightMaterial);
      brainGroup.add(rightHemisphere);

      // Add brain stem
      const brainStemGeometry = new THREE.CylinderGeometry(15, 20, 40, 12);
      const brainStemMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x999999,
        metalness: 0.2,
        roughness: 0.8
      });
      const brainStem = new THREE.Mesh(brainStemGeometry, brainStemMaterial);
      brainStem.position.y = -40;
      brainStem.rotation.z = 0.1;
      brainGroup.add(brainStem);

      // Add cerebellum
      const cerebellumGeometry = new THREE.SphereGeometry(30, 16, 12);
      cerebellumGeometry.scale(1.5, 0.8, 1);
      const cerebellumMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xccaaaa,
        metalness: 0.15,
        roughness: 0.75
      });
      const cerebellum = new THREE.Mesh(cerebellumGeometry, cerebellumMaterial);
      cerebellum.position.set(0, -20, -30);
      brainGroup.add(cerebellum);

      scene.add(brainGroup);

      // Add EEG electrodes
      const electrodePositions = [
        { name: 'Fp1', pos: [-20, 50, 40] },
        { name: 'Fp2', pos: [20, 50, 40] },
        { name: 'C3', pos: [-50, 0, 30] },
        { name: 'C4', pos: [50, 0, 30] },
        { name: 'Cz', pos: [0, 10, 60] },
        { name: 'O1', pos: [-20, -40, -20] },
        { name: 'O2', pos: [20, -40, -20] }
      ];

      electrodePositions.forEach(({ name, pos }) => {
        const electrodeGeometry = new THREE.SphereGeometry(3, 16, 16);
        const electrodeMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffd700,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xffd700,
          emissiveIntensity: 0.2
        });
        const electrode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
        electrode.position.set(...pos);
        electrode.userData = { name, type: 'electrode' };
        scene.add(electrode);
      });

      // Animation
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      // Handle resize
      const handleResize = () => {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      // Start animation
      animate();
      setIsLoading(false);

      console.log('SimplifiedBrain initialized successfully');

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        currentMount.removeChild(renderer.domElement);
        scene.clear();
        renderer.dispose();
      };
    } catch (err) {
      console.error('Error in SimplifiedBrain:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Error Loading Brain Visualization</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={mountRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-white text-xl">Loading Brain Visualization...</div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur rounded-lg p-4 text-white">
        <h2 className="text-xl font-light mb-2">Simplified Brain Visualization</h2>
        <p className="text-sm text-gray-400">EEG-ready 3D brain model</p>
      </div>
    </div>
  );
}