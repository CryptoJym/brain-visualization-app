import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function WorkingBrainVisualization() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameId = useRef(null);
  const [selectedRegion, setSelectedRegion] = React.useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 25);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Create brain-like structure
    const brainGroup = new THREE.Group();

    // Main brain (two hemispheres)
    const hemisphereGeometry = new THREE.SphereGeometry(4, 32, 32);
    hemisphereGeometry.scale(1.2, 1, 1.3);

    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0xff9999,
      shininess: 100,
      specular: 0x222222,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });

    const leftHemisphere = new THREE.Mesh(hemisphereGeometry, brainMaterial);
    leftHemisphere.position.x = -1;
    brainGroup.add(leftHemisphere);

    const rightHemisphere = new THREE.Mesh(hemisphereGeometry.clone(), brainMaterial.clone());
    rightHemisphere.position.x = 1;
    brainGroup.add(rightHemisphere);

    // Cerebellum
    const cerebellumGeometry = new THREE.SphereGeometry(2, 16, 16);
    cerebellumGeometry.scale(1.5, 0.8, 1);
    const cerebellumMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaaaa,
      transparent: true,
      opacity: 0.2
    });
    const cerebellum = new THREE.Mesh(cerebellumGeometry, cerebellumMaterial);
    cerebellum.position.set(0, -3, -3);
    brainGroup.add(cerebellum);

    // Brain stem
    const stemGeometry = new THREE.CylinderGeometry(1, 1.5, 3);
    const stemMaterial = new THREE.MeshPhongMaterial({
      color: 0xffbbbb,
      transparent: true,
      opacity: 0.2
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(0, -4, -1);
    stem.rotation.x = 0.3;
    brainGroup.add(stem);

    scene.add(brainGroup);

    // Add interactive region markers
    const regionMeshes = [];
    const regions = [
      { name: 'Amygdala (Left)', position: [-3, -1, 2], color: 0xff0000, size: 1.5 },
      { name: 'Amygdala (Right)', position: [3, -1, 2], color: 0xff0000, size: 1.5 },
      { name: 'Hippocampus (Left)', position: [-3.5, -1.5, 0], color: 0xff6600, size: 1.8 },
      { name: 'Hippocampus (Right)', position: [3.5, -1.5, 0], color: 0xff6600, size: 1.8 },
      { name: 'Prefrontal Cortex', position: [0, 2.5, 5.5], color: 0x00ff00, size: 2.0 },
      { name: 'Temporal Lobe (Left)', position: [-6, 0, 0], color: 0x0066ff, size: 1.8 },
      { name: 'Temporal Lobe (Right)', position: [6, 0, 0], color: 0x0066ff, size: 1.8 },
      { name: 'Occipital Lobe', position: [0, 0, -6.5], color: 0xffff00, size: 1.8 },
      { name: 'Parietal Lobe', position: [0, 4.5, -2], color: 0x00ffff, size: 1.8 },
      { name: 'ACC', position: [0, 1, 3.5], color: 0xff00ff, size: 1.5 },
      { name: 'Insula (Left)', position: [-4, 0, 1], color: 0xffa500, size: 1.5 },
      { name: 'Insula (Right)', position: [4, 0, 1], color: 0xffa500, size: 1.5 }
    ];

    regions.forEach(region => {
      // Create sphere for the region
      const sphereGeometry = new THREE.SphereGeometry(region.size * 0.7, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: region.color,
        emissive: region.color,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.9,
        shininess: 100
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(...region.position);
      sphere.userData = { name: region.name, originalColor: region.color };
      
      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(region.size * 0.85, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: region.color,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      sphere.add(glow);
      
      brainGroup.add(sphere);
      regionMeshes.push(sphere);
    });
    
    // Add labels for regions
    const labelContainer = document.createElement('div');
    labelContainer.style.position = 'absolute';
    labelContainer.style.top = '0';
    labelContainer.style.left = '0';
    labelContainer.style.pointerEvents = 'none';
    labelContainer.style.zIndex = '100';
    mountRef.current.appendChild(labelContainer);

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredRegion = null;
    
    // Mouse move handler
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);
      
      // Reset previous hover
      if (hoveredRegion && hoveredRegion !== intersects[0]?.object) {
        hoveredRegion.material.emissiveIntensity = 0.2;
        hoveredRegion.scale.setScalar(1);
        renderer.domElement.style.cursor = 'default';
      }
      
      // Apply hover effect
      if (intersects.length > 0) {
        hoveredRegion = intersects[0].object;
        hoveredRegion.material.emissiveIntensity = 0.5;
        hoveredRegion.scale.setScalar(1.3);
        renderer.domElement.style.cursor = 'pointer';
        
        // Update label
        updateLabel(hoveredRegion.userData.name);
      } else {
        hoveredRegion = null;
        updateLabel('');
      }
    };
    
    // Click handler
    const onClick = (event) => {
      if (hoveredRegion) {
        setSelectedRegion(hoveredRegion.userData.name);
      }
    };
    
    // Label update function
    const updateLabel = (text) => {
      if (labelContainer.firstChild) {
        labelContainer.removeChild(labelContainer.firstChild);
      }
      
      if (text) {
        const label = document.createElement('div');
        label.style.position = 'fixed';
        label.style.bottom = '20px';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.background = 'rgba(0, 0, 0, 0.8)';
        label.style.color = 'white';
        label.style.padding = '10px 20px';
        label.style.borderRadius = '20px';
        label.style.fontSize = '16px';
        label.style.fontWeight = 'bold';
        label.textContent = text;
        labelContainer.appendChild(label);
      }
    };
    
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Animation
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      controls.update();
      // brainGroup.rotation.y += 0.005; // Disabled auto-rotation for better interaction
      
      // Pulse effect for regions
      regionMeshes.forEach((mesh, index) => {
        const time = Date.now() * 0.001;
        const scale = 1 + Math.sin(time * 2 + index) * 0.05;
        if (mesh !== hoveredRegion) {
          mesh.scale.setScalar(scale);
        }
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
      mountRef.current?.removeChild(labelContainer);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }} 
      />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        Interactive Brain Regions
      </div>
      
      {selectedRegion && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '300px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{selectedRegion}</h3>
            <button 
              onClick={() => setSelectedRegion(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0',
                marginLeft: '10px'
              }}
            >×</button>
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
            Click on different brain regions to learn about their functions and how trauma affects them.
          </p>
        </div>
      )}
    </div>
  );
}