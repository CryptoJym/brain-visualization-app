import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { brainRegions } from '../utils/traumaBrainMapping';

export default function WorkingPersonalizedBrain({ brainImpacts = {}, onRegionClick }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameId = useRef(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 10;
    controls.maxDistance = 35;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4169e1, 0.5);
    pointLight.position.set(-10, 10, -10);
    scene.add(pointLight);

    // Create brain structure
    const brainGroup = new THREE.Group();

    // Main brain hemispheres
    const hemisphereGeometry = new THREE.SphereGeometry(3.5, 64, 64);
    hemisphereGeometry.scale(1.2, 1, 1.4);

    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffb3ba,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });

    const leftHemisphere = new THREE.Mesh(hemisphereGeometry, brainMaterial);
    leftHemisphere.position.x = -0.8;
    leftHemisphere.castShadow = true;
    leftHemisphere.receiveShadow = true;
    brainGroup.add(leftHemisphere);

    const rightHemisphere = new THREE.Mesh(hemisphereGeometry.clone(), brainMaterial.clone());
    rightHemisphere.position.x = 0.8;
    rightHemisphere.castShadow = true;
    rightHemisphere.receiveShadow = true;
    brainGroup.add(rightHemisphere);

    // Cerebellum
    const cerebellumGeometry = new THREE.SphereGeometry(2, 32, 32);
    cerebellumGeometry.scale(1.8, 0.8, 1.2);
    const cerebellumMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd4e5,
      transparent: true,
      opacity: 0.15
    });
    const cerebellum = new THREE.Mesh(cerebellumGeometry, cerebellumMaterial);
    cerebellum.position.set(0, -2.5, -2.5);
    cerebellum.castShadow = true;
    brainGroup.add(cerebellum);

    // Brain stem
    const stemGeometry = new THREE.CylinderGeometry(0.8, 1.2, 3);
    const stemMaterial = new THREE.MeshPhongMaterial({
      color: 0xffe4e1,
      transparent: true,
      opacity: 0.15
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(0, -3.5, -1.5);
    stem.rotation.x = 0.3;
    brainGroup.add(stem);

    scene.add(brainGroup);

    // Add region markers based on impacts
    const regionSpheres = {};
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // More comprehensive region positions
    const regionPositions = {
      amygdala: { pos: [-3, -1, 2], scale: 1.2, name: 'Amygdala' },
      hippocampus: { pos: [3, -1, 2], scale: 1.2, name: 'Hippocampus' },
      dlPFC: { pos: [-2, 3, 5], scale: 1.8, name: 'Dorsolateral PFC' },
      vmPFC: { pos: [0, 2.5, 5.5], scale: 1.5, name: 'Ventromedial PFC' },
      ACC: { pos: [0, 1, 3], scale: 1.2, name: 'Anterior Cingulate' },
      insula: { pos: [-4.5, 0, 0], scale: 1.0, name: 'Insula' },
      temporal_cortex: { pos: [-6, -0.5, 0], scale: 1.5, name: 'Temporal Cortex' },
      parietal_cortex: { pos: [0, 4.5, -3], scale: 1.8, name: 'Parietal Cortex' },
      occipital_cortex: { pos: [0, 0, -6.5], scale: 1.5, name: 'Occipital Cortex' },
      cerebellum: { pos: [0, -3.5, -3.5], scale: 2.0, name: 'Cerebellum' },
      OFC: { pos: [0, 0.5, 6], scale: 1.3, name: 'Orbitofrontal Cortex' },
      somatosensory_cortex: { pos: [3, 4, 0], scale: 1.3, name: 'Somatosensory Cortex' },
      motor_cortex: { pos: [-3, 4, 0], scale: 1.3, name: 'Motor Cortex' },
      brain_stem: { pos: [0, -5, -1.5], scale: 1.2, name: 'Brain Stem' },
      thalamus: { pos: [0, 0, 0], scale: 0.9, name: 'Thalamus' },
      hypothalamus: { pos: [0, -0.5, 1], scale: 0.8, name: 'Hypothalamus' },
      corpus_callosum: { pos: [0, 0.5, 0], scale: 2.0, name: 'Corpus Callosum' }
    };

    // Add ALL regions, highlighting impacted ones
    Object.entries(regionPositions).forEach(([regionKey, regionInfo]) => {
      const impactData = brainImpacts[regionKey];
      const isImpacted = !!impactData;
      const impactStrength = impactData?.impactStrength || 0;
      
      // Color based on impact
      const color = isImpacted ? (
        impactStrength > 0.8 ? 0xff0000 :
        impactStrength > 0.5 ? 0xffa500 :
        impactStrength > 0 ? 0xffff00 : 0x666666
      ) : 0x4444ff; // Blue for non-impacted regions

      const sphereGeometry = new THREE.SphereGeometry(regionInfo.scale * 0.7, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: isImpacted ? 0.3 : 0.1,
        transparent: true,
        opacity: isImpacted ? 0.9 : 0.4
      });

      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(...regionInfo.pos);
      sphere.userData = { 
        regionKey, 
        regionName: regionInfo.name,
        impactData,
        isImpacted 
      };
      
      // Add glow for impacted regions
      if (isImpacted) {
        const glowGeometry = new THREE.SphereGeometry(regionInfo.scale * 0.85, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        sphere.add(glow);
      }
      
      brainGroup.add(sphere);
      regionSpheres[regionKey] = sphere;
    });

    // Mouse interaction
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(regionSpheres));

      if (intersects.length > 0) {
        const regionData = intersects[0].object.userData;
        setHoveredRegion(regionData.regionName);
        renderer.domElement.style.cursor = 'pointer';
        
        // Highlight on hover
        intersects[0].object.material.emissiveIntensity = 0.5;
        intersects[0].object.scale.setScalar(1.1);
      } else {
        setHoveredRegion(null);
        renderer.domElement.style.cursor = 'default';
        
        // Reset all regions
        Object.values(regionSpheres).forEach(sphere => {
          sphere.material.emissiveIntensity = sphere.userData.isImpacted ? 0.3 : 0.1;
          sphere.scale.setScalar(1);
        });
      }
    };

    const onClick = (event) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(regionSpheres));

      if (intersects.length > 0 && onRegionClick) {
        const { regionKey, impactData } = intersects[0].object.userData;
        onRegionClick(regionKey, impactData);
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Animation
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      controls.update();

      // Pulse impacted regions
      const time = Date.now() * 0.001;
      Object.values(regionSpheres).forEach(sphere => {
        const baseScale = regionPositions[sphere.userData.regionKey]?.scale || 0.8;
        const pulse = Math.sin(time * 2) * 0.1 + 1;
        sphere.scale.setScalar(baseScale * 0.7 * pulse);
      });

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
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [brainImpacts, onRegionClick]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%'
        }} 
      />
      {hoveredRegion && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          {hoveredRegion}
        </div>
      )}
    </div>
  );
}