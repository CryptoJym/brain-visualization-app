import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function SimplifiedBrain() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedElectrode, setSelectedElectrode] = useState(null);

  useEffect(() => {
    console.log('SimplifiedBrain mounting...');
    const currentMount = mountRef.current;
    let animationId;
    
    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050510);
      scene.fog = new THREE.Fog(0x050510, 200, 600);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        60,
        currentMount.clientWidth / currentMount.clientHeight,
        0.1,
        1000
      );
      camera.position.set(180, 120, 180);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      currentMount.appendChild(renderer.domElement);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      controls.minDistance = 100;
      controls.maxDistance = 400;
      controls.maxPolarAngle = Math.PI * 0.8;

      // Lighting setup
      const ambientLight = new THREE.AmbientLight(0x404050, 0.4);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(100, 150, 100);
      mainLight.castShadow = true;
      mainLight.shadow.camera.near = 0.1;
      mainLight.shadow.camera.far = 500;
      mainLight.shadow.camera.left = -150;
      mainLight.shadow.camera.right = 150;
      mainLight.shadow.camera.top = 150;
      mainLight.shadow.camera.bottom = -150;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0x8090ff, 0.3);
      fillLight.position.set(-100, 50, -100);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
      rimLight.position.set(0, -100, -150);
      scene.add(rimLight);

      // Add hemisphere light for realistic ambient
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444466, 0.3);
      hemiLight.position.set(0, 200, 0);
      scene.add(hemiLight);

      // Create brain group
      const brainGroup = new THREE.Group();

      // Helper function to create brain surface with details
      function createBrainSurface(geometry, material) {
        // Add surface irregularities for realism
        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positions.count; i++) {
          vertex.fromBufferAttribute(positions, i);
          
          // Create gyri and sulci patterns
          const noise1 = Math.sin(vertex.x * 0.1) * Math.cos(vertex.y * 0.15) * 2;
          const noise2 = Math.sin(vertex.y * 0.2) * Math.cos(vertex.z * 0.1) * 1.5;
          const noise3 = Math.cos(vertex.x * 0.3) * Math.sin(vertex.z * 0.2) * 1;
          
          const totalNoise = (noise1 + noise2 + noise3) * 0.5;
          
          vertex.normalize();
          vertex.multiplyScalar(50 + totalNoise);
          
          positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();
        
        return new THREE.Mesh(geometry, material);
      }

      // Brain material with realistic properties
      const brainMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffb5b5,
        metalness: 0.0,
        roughness: 0.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        reflectivity: 0.5,
        side: THREE.DoubleSide,
        envMapIntensity: 0.5
      });

      // Left hemisphere
      const leftHemisphereGeometry = new THREE.SphereGeometry(50, 64, 48, 0, Math.PI);
      leftHemisphereGeometry.scale(1.2, 1.0, 1.35);
      leftHemisphereGeometry.translate(-3, 5, 0);
      const leftHemisphere = createBrainSurface(leftHemisphereGeometry, brainMaterial.clone());
      leftHemisphere.castShadow = true;
      leftHemisphere.receiveShadow = true;
      brainGroup.add(leftHemisphere);

      // Right hemisphere
      const rightHemisphereGeometry = new THREE.SphereGeometry(50, 64, 48, Math.PI, Math.PI);
      rightHemisphereGeometry.scale(1.2, 1.0, 1.35);
      rightHemisphereGeometry.translate(3, 5, 0);
      const rightHemisphere = createBrainSurface(rightHemisphereGeometry, brainMaterial.clone());
      rightHemisphere.castShadow = true;
      rightHemisphere.receiveShadow = true;
      brainGroup.add(rightHemisphere);

      // Corpus callosum (connection between hemispheres)
      const corpusGeometry = new THREE.BoxGeometry(10, 5, 40);
      const corpusMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.6,
        opacity: 0.8,
        transparent: true
      });
      const corpus = new THREE.Mesh(corpusGeometry, corpusMaterial);
      corpus.position.set(0, 0, 0);
      brainGroup.add(corpus);

      // Brain stem with anatomical accuracy
      const brainStemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -20, -5),
        new THREE.Vector3(0, -35, -10),
        new THREE.Vector3(0, -50, -15),
        new THREE.Vector3(0, -65, -18)
      ]);
      
      const brainStemGeometry = new THREE.TubeGeometry(brainStemCurve, 20, 12, 12, false);
      const brainStemMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xcc9999,
        metalness: 0.1,
        roughness: 0.6,
        clearcoat: 0.3
      });
      const brainStem = new THREE.Mesh(brainStemGeometry, brainStemMaterial);
      brainStem.castShadow = true;
      brainGroup.add(brainStem);

      // Cerebellum with detailed folding
      const cerebellumGroup = new THREE.Group();
      const cerebellumGeometry = new THREE.SphereGeometry(30, 32, 24);
      cerebellumGeometry.scale(1.8, 0.9, 1.2);
      
      // Add cerebellar folds
      const cerebellumMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xddaaaa,
        metalness: 0.05,
        roughness: 0.5,
        clearcoat: 0.4,
        clearcoatRoughness: 0.3,
        bumpScale: 0.005
      });
      
      const cerebellum = createBrainSurface(cerebellumGeometry, cerebellumMaterial);
      cerebellum.position.set(0, -25, -35);
      cerebellum.castShadow = true;
      cerebellumGroup.add(cerebellum);
      
      // Add cerebellar details
      for (let i = 0; i < 8; i++) {
        const foldGeometry = new THREE.BoxGeometry(
          35 - i * 2,
          2,
          3
        );
        const fold = new THREE.Mesh(foldGeometry, cerebellumMaterial);
        fold.position.set(0, -25 - i * 2, -35);
        fold.rotation.x = Math.PI / 8;
        cerebellumGroup.add(fold);
      }
      
      brainGroup.add(cerebellumGroup);

      // Add subcortical structures
      // Thalamus
      const thalamusGeometry = new THREE.SphereGeometry(12, 16, 12);
      thalamusGeometry.scale(1.2, 0.8, 1.1);
      const thalamusMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x6666ff,
        metalness: 0.2,
        roughness: 0.7,
        opacity: 0.7,
        transparent: true
      });
      
      const leftThalamus = new THREE.Mesh(thalamusGeometry, thalamusMaterial);
      leftThalamus.position.set(-10, -5, 5);
      brainGroup.add(leftThalamus);
      
      const rightThalamus = new THREE.Mesh(thalamusGeometry.clone(), thalamusMaterial.clone());
      rightThalamus.position.set(10, -5, 5);
      brainGroup.add(rightThalamus);

      scene.add(brainGroup);

      // EEG Electrodes with 10-20 system
      const electrodeGroup = new THREE.Group();
      const electrodeData = [
        // Frontal
        { name: 'Fp1', pos: [-20, 65, 45], color: 0xff0000 },
        { name: 'Fp2', pos: [20, 65, 45], color: 0xff0000 },
        { name: 'F7', pos: [-60, 40, 35], color: 0xff0000 },
        { name: 'F3', pos: [-35, 45, 55], color: 0xff0000 },
        { name: 'Fz', pos: [0, 50, 65], color: 0xff0000 },
        { name: 'F4', pos: [35, 45, 55], color: 0xff0000 },
        { name: 'F8', pos: [60, 40, 35], color: 0xff0000 },
        
        // Temporal
        { name: 'T3', pos: [-75, 0, 0], color: 0x00ff00 },
        { name: 'T4', pos: [75, 0, 0], color: 0x00ff00 },
        { name: 'T5', pos: [-65, -40, -10], color: 0x00ff00 },
        { name: 'T6', pos: [65, -40, -10], color: 0x00ff00 },
        
        // Central
        { name: 'C3', pos: [-45, 5, 70], color: 0x0000ff },
        { name: 'Cz', pos: [0, 10, 80], color: 0x0000ff },
        { name: 'C4', pos: [45, 5, 70], color: 0x0000ff },
        
        // Parietal
        { name: 'P3', pos: [-35, -35, 55], color: 0xffff00 },
        { name: 'Pz', pos: [0, -40, 65], color: 0xffff00 },
        { name: 'P4', pos: [35, -35, 55], color: 0xffff00 },
        
        // Occipital
        { name: 'O1', pos: [-20, -65, 20], color: 0xff00ff },
        { name: 'O2', pos: [20, -65, 20], color: 0xff00ff }
      ];

      // Raycaster for electrode interaction
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      electrodeData.forEach(({ name, pos, color }) => {
        // Electrode sphere
        const electrodeGeometry = new THREE.SphereGeometry(4, 24, 24);
        const electrodeMaterial = new THREE.MeshPhysicalMaterial({
          color: color,
          metalness: 0.9,
          roughness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
          emissive: color,
          emissiveIntensity: 0.3
        });
        
        const electrode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
        electrode.position.set(...pos);
        electrode.castShadow = true;
        electrode.userData = { name, type: 'electrode', originalColor: color };
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(6, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        electrode.add(glow);
        
        electrodeGroup.add(electrode);
        
        // Add label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, 128, 64);
        context.font = 'Bold 24px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(name, 64, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ 
          map: texture,
          depthTest: false,
          depthWrite: false
        });
        
        const label = new THREE.Sprite(labelMaterial);
        label.position.set(...pos);
        label.position.y += 10;
        label.scale.set(20, 10, 1);
        electrodeGroup.add(label);
      });

      scene.add(electrodeGroup);

      // Mouse interaction
      function onMouseMove(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      }

      function onClick(event) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(electrodeGroup.children.filter(child => child.type === 'Mesh'));
        
        if (intersects.length > 0) {
          const electrode = intersects[0].object;
          if (electrode.userData.type === 'electrode') {
            setSelectedElectrode(electrode.userData.name);
            
            // Highlight effect
            electrode.material.emissiveIntensity = 0.8;
            setTimeout(() => {
              electrode.material.emissiveIntensity = 0.3;
            }, 500);
          }
        }
      }

      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onClick);

      // Animation
      const clock = new THREE.Clock();
      
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        // Subtle brain pulsing
        brainGroup.scale.setScalar(1 + Math.sin(elapsedTime * 2) * 0.01);
        
        // Electrode pulsing
        electrodeGroup.children.forEach((child, index) => {
          if (child.type === 'Mesh' && child.userData.type === 'electrode') {
            child.scale.setScalar(1 + Math.sin(elapsedTime * 3 + index) * 0.1);
          }
        });
        
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
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onClick);
        cancelAnimationFrame(animationId);
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
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div ref={mountRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <div className="text-white text-xl">Loading Brain Visualization...</div>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 text-white border border-white/10">
        <h2 className="text-2xl font-light mb-2">EEG Brain Visualization</h2>
        <p className="text-sm text-gray-400 mb-3">Anatomically accurate 3D brain model</p>
        <div className="space-y-1 text-xs text-gray-500">
          <p>• Click electrodes to select</p>
          <p>• Scroll to zoom</p>
          <p>• Drag to rotate</p>
        </div>
      </div>
      
      {selectedElectrode && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 text-white border border-white/10">
          <h3 className="text-lg font-medium mb-1">Selected Electrode</h3>
          <p className="text-xl text-blue-400">{selectedElectrode}</p>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur rounded-lg px-3 py-2">
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Frontal</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Temporal</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Central</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Parietal</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>Occipital</span>
          </div>
        </div>
      </div>
    </div>
  );
}