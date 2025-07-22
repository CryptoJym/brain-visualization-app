import React, { useEffect, useRef } from 'react';
import RAVE from '@rave-ieeg/three-brain';
import * as THREE from 'three';

const PersonalizedThreeBrain = () => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new RAVE.Viewer({ container: containerRef.current });
    viewerRef.current = viewer;

    viewer.loadDefaultBrain().then(() => {
      const canvas = viewer.canvas;
      if (canvas) {
        sceneRef.current = canvas.scene;
        cameraRef.current = canvas.camera;
        rendererRef.current = canvas.renderer;

        const geometry = new THREE.SphereGeometry(4, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(-10, 5, 2);
        canvas.scene.add(marker);

        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 10);
        canvas.scene.add(light);

        viewer.render();
      }
    });
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