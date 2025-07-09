import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { brainRegions } from '../utils/traumaBrainMapping';

// Create anatomically correct brain mesh
function createBrainMesh() {
  // Create brain shape using multiple geometries
  const group = new THREE.Group();
  
  // Main brain hemispheres
  const hemisphereGeometry = new THREE.SphereGeometry(3, 32, 32);
  hemisphereGeometry.scale(1.2, 1, 1.4);
  
  // Left hemisphere
  const leftHemisphere = new THREE.Mesh(
    hemisphereGeometry,
    new THREE.MeshPhongMaterial({ 
      color: 0xffc0cb,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
  );
  leftHemisphere.position.set(-0.8, 0, 0);
  group.add(leftHemisphere);
  
  // Right hemisphere  
  const rightHemisphere = new THREE.Mesh(
    hemisphereGeometry,
    new THREE.MeshPhongMaterial({ 
      color: 0xffc0cb,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
  );
  rightHemisphere.position.set(0.8, 0, 0);
  group.add(rightHemisphere);
  
  // Cerebellum
  const cerebellumGeometry = new THREE.SphereGeometry(1.5, 24, 24);
  cerebellumGeometry.scale(1.5, 0.8, 1.2);
  const cerebellum = new THREE.Mesh(
    cerebellumGeometry,
    new THREE.MeshPhongMaterial({ 
      color: 0xffd4e5,
      transparent: true,
      opacity: 0.4
    })
  );
  cerebellum.position.set(0, -2.5, -2.5);
  group.add(cerebellum);
  
  // Brain stem
  const brainStemGeometry = new THREE.CylinderGeometry(0.6, 0.8, 2.5, 16);
  const brainStem = new THREE.Mesh(
    brainStemGeometry,
    new THREE.MeshPhongMaterial({ 
      color: 0xffe4e1,
      transparent: true,
      opacity: 0.4
    })
  );
  brainStem.position.set(0, -2.5, -1);
  brainStem.rotation.x = Math.PI / 6;
  group.add(brainStem);
  
  return group;
}

// Create region marker with proper sizing based on region data
function createRegionMarker(region, isHighlighted = false, impactStrength = 0) {
  const size = region.size || 0.3;
  const geometry = new THREE.SphereGeometry(size * 0.8, 16, 16);
  
  let color = region.color || 0x4ecdc4;
  let opacity = 0.6;
  
  if (isHighlighted) {
    // Color based on impact strength
    if (impactStrength > 0.8) {
      color = 0xff0000; // Red for high impact
      opacity = 0.8;
    } else if (impactStrength > 0.5) {
      color = 0xffa500; // Orange for moderate impact
      opacity = 0.7;
    } else if (impactStrength > 0) {
      color = 0xffff00; // Yellow for low impact
      opacity = 0.6;
    }
  }
  
  const material = new THREE.MeshPhongMaterial({
    color,
    transparent: true,
    opacity,
    emissive: isHighlighted ? color : 0x000000,
    emissiveIntensity: isHighlighted ? 0.3 : 0
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  
  // Add outline for highlighted regions
  if (isHighlighted) {
    const outlineGeometry = new THREE.SphereGeometry(size * 0.85, 16, 16);
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
    mesh.add(outlineMesh);
  }
  
  return mesh;
}

export default function AnatomicalBrainVisualization({ assessmentResults, brainImpacts = {} }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const brainMeshRef = useRef(null);
  const regionMeshes = useRef({});
  const labelSprites = useRef({});
  
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [showLabels, setShowLabels] = useState(false);
  const [viewMode, setViewMode] = useState('lateral'); // lateral, medial, superior, inferior
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 5, 10);
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 30;
    controls.minDistance = 5;
    controlsRef.current = controls;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight1.position.set(5, 10, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0x4169e1, 0.3);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);
    
    // Add brain mesh
    const brainMesh = createBrainMesh();
    scene.add(brainMesh);
    brainMeshRef.current = brainMesh;
    
    // Add all brain regions
    Object.entries(brainRegions).forEach(([regionKey, region]) => {
      if (region.type !== 'region') return;
      
      const impactData = brainImpacts[regionKey];
      const isImpacted = !!impactData;
      const impactStrength = impactData?.impactStrength || 0;
      
      const regionMesh = createRegionMarker(region, isImpacted, impactStrength);
      
      // Position based on region data
      if (region.position.center) {
        regionMesh.position.set(...region.position.center);
      } else if (region.position.left && region.position.right) {
        // Create both left and right instances
        const leftMesh = regionMesh.clone();
        leftMesh.position.set(...region.position.left);
        leftMesh.userData = { regionKey, side: 'left', region };
        scene.add(leftMesh);
        regionMeshes.current[`${regionKey}_left`] = leftMesh;
        
        const rightMesh = createRegionMarker(region, isImpacted, impactStrength);
        rightMesh.position.set(...region.position.right);
        rightMesh.userData = { regionKey, side: 'right', region };
        scene.add(rightMesh);
        regionMeshes.current[`${regionKey}_right`] = rightMesh;
        return;
      }
      
      regionMesh.userData = { regionKey, region };
      scene.add(regionMesh);
      regionMeshes.current[regionKey] = regionMesh;
    });
    
    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const handleMouseMove = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(regionMeshes.current));
      
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        setHoveredRegion(hoveredMesh.userData.regionKey);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredRegion(null);
        document.body.style.cursor = 'default';
      }
    };
    
    const handleClick = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(regionMeshes.current));
      
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        setSelectedRegion(clickedMesh.userData.regionKey);
      }
    };
    
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      // Pulse impacted regions
      Object.entries(regionMeshes.current).forEach(([key, mesh]) => {
        const regionKey = mesh.userData.regionKey;
        if (brainImpacts[regionKey]) {
          const scale = 1 + Math.sin(Date.now() * 0.002) * 0.1;
          mesh.scale.setScalar(scale);
        }
      });
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [brainImpacts]);
  
  // Camera view presets
  const setCameraView = (view) => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    switch(view) {
      case 'lateral':
        camera.position.set(15, 0, 0);
        break;
      case 'medial':
        camera.position.set(-15, 0, 0);
        break;
      case 'superior':
        camera.position.set(0, 15, 0);
        break;
      case 'inferior':
        camera.position.set(0, -15, 0);
        break;
      case 'anterior':
        camera.position.set(0, 0, 15);
        break;
      case 'posterior':
        camera.position.set(0, 0, -15);
        break;
    }
    
    controls.target.set(0, 0, 0);
    controls.update();
    setViewMode(view);
  };
  
  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="bg-white/10 backdrop-blur-xl rounded-lg p-2 border border-white/20">
          <p className="text-xs text-gray-400 mb-2">View Angle</p>
          <div className="grid grid-cols-2 gap-1">
            {['lateral', 'medial', 'superior', 'inferior', 'anterior', 'posterior'].map(view => (
              <button
                key={view}
                onClick={() => setCameraView(view)}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  viewMode === view 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="w-full px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 text-white text-sm hover:bg-white/20 transition-all"
        >
          {showLabels ? 'Hide' : 'Show'} Labels
        </button>
      </div>
      
      {/* Region Info */}
      {selectedRegion && brainRegions[selectedRegion] && (
        <div className="absolute bottom-4 left-4 max-w-md bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
          <h3 className="text-lg font-medium text-white mb-2">
            {brainRegions[selectedRegion].name}
          </h3>
          <p className="text-sm text-gray-300 mb-2">
            {brainRegions[selectedRegion].function}
          </p>
          {brainImpacts[selectedRegion] && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-sm text-orange-400 mb-1">
                Impacted by {brainImpacts[selectedRegion].traumaTypes.length} trauma type(s)
              </p>
              <p className="text-xs text-gray-400">
                Ages affected: {brainImpacts[selectedRegion].ageRanges.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Hover tooltip */}
      {hoveredRegion && brainRegions[hoveredRegion] && !selectedRegion && (
        <div className="pointer-events-none fixed" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="bg-black/80 backdrop-blur rounded px-3 py-1">
            <p className="text-white text-sm">{brainRegions[hoveredRegion].name}</p>
          </div>
        </div>
      )}
    </div>
  );
}