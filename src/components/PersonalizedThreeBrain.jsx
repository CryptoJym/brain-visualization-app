import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PersonalizedThreeBrain = () => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 150);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Create a placeholder brain (sphere for now)
    const brainGeometry = new THREE.SphereGeometry(50, 32, 32);
    const brainMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffc0cb,
      opacity: 0.7,
      transparent: true
    });
    const brain = new THREE.Mesh(brainGeometry, brainMaterial);
    scene.add(brain);

    // Add the blue marker sphere
    const markerGeometry = new THREE.SphereGeometry(4, 32, 32);
    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(-10, 5, 2);
    scene.add(marker);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      brain.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  const handleBrainClick = (event) => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    if (!scene || !camera || !renderer) {
      console.warn('Scene or camera or renderer not ready yet.');
      return;
    }

    try {
      console.log('Brain clicked at:', event.clientX, event.clientY);
    } catch (err) {
      console.error('Click error:', err);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleBrainClick}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    />
  );
};

export default PersonalizedThreeBrain;