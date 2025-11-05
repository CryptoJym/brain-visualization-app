import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { brainRegions } from '../utils/traumaBrainMapping';

export default function WorkingBrainVisualization() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameId = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

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

    // Define region categories and colors
    const regionCategories = {
      'Emotional Processing': { color: 0xff4444, regions: ['amygdala', 'insula'] },
      'Memory & Learning': { color: 0x44ff44, regions: ['hippocampus', 'temporal_cortex'] },
      'Executive Function': { color: 0x4444ff, regions: ['dlPFC', 'vmPFC', 'OFC', 'ACC'] },
      'Sensory Processing': { color: 0xffff44, regions: ['occipital_cortex', 'somatosensory_cortex'] },
      'Motor Control': { color: 0xff44ff, regions: ['motor_cortex', 'cerebellum'] },
      'Basic Functions': { color: 0x44ffff, regions: ['brain_stem', 'thalamus', 'hypothalamus'] },
      'Integration': { color: 0xffffff, regions: ['parietal_cortex', 'corpus_callosum'] }
    };

    // Create comprehensive region list with proper categorization
    const regionMeshes = [];
    const labelSprites = [];
    const regions = [
      { id: 'amygdala_left', name: 'Left Amygdala', position: [-3, -1, 2], category: 'Emotional Processing', size: 1.5 },
      { id: 'amygdala_right', name: 'Right Amygdala', position: [3, -1, 2], category: 'Emotional Processing', size: 1.5 },
      { id: 'hippocampus_left', name: 'Left Hippocampus', position: [-3.5, -1.5, 0], category: 'Memory & Learning', size: 1.8 },
      { id: 'hippocampus_right', name: 'Right Hippocampus', position: [3.5, -1.5, 0], category: 'Memory & Learning', size: 1.8 },
      { id: 'dlPFC', name: 'Dorsolateral PFC', position: [-2, 3, 5], category: 'Executive Function', size: 2.0 },
      { id: 'vmPFC', name: 'Ventromedial PFC', position: [0, 2.5, 5.5], category: 'Executive Function', size: 1.8 },
      { id: 'OFC', name: 'Orbitofrontal Cortex', position: [0, 0.5, 6], category: 'Executive Function', size: 1.5 },
      { id: 'ACC', name: 'Anterior Cingulate', position: [0, 1, 3.5], category: 'Executive Function', size: 1.5 },
      { id: 'temporal_left', name: 'Left Temporal Lobe', position: [-6, 0, 0], category: 'Memory & Learning', size: 1.8 },
      { id: 'temporal_right', name: 'Right Temporal Lobe', position: [6, 0, 0], category: 'Memory & Learning', size: 1.8 },
      { id: 'occipital', name: 'Occipital Lobe', position: [0, 0, -6.5], category: 'Sensory Processing', size: 1.8 },
      { id: 'parietal', name: 'Parietal Lobe', position: [0, 4.5, -2], category: 'Integration', size: 1.8 },
      { id: 'insula_left', name: 'Left Insula', position: [-4, 0, 1], category: 'Emotional Processing', size: 1.5 },
      { id: 'insula_right', name: 'Right Insula', position: [4, 0, 1], category: 'Emotional Processing', size: 1.5 },
      { id: 'motor_cortex', name: 'Motor Cortex', position: [-2, 4, 0], category: 'Motor Control', size: 1.5 },
      { id: 'somatosensory', name: 'Somatosensory Cortex', position: [2, 4, 0], category: 'Sensory Processing', size: 1.5 },
      { id: 'cerebellum', name: 'Cerebellum', position: [0, -3.5, -3.5], category: 'Motor Control', size: 2.0 },
      { id: 'brain_stem', name: 'Brain Stem', position: [0, -5, -1.5], category: 'Basic Functions', size: 1.2 },
      { id: 'thalamus', name: 'Thalamus', position: [0, 0, 0], category: 'Basic Functions', size: 1.0 },
      { id: 'hypothalamus', name: 'Hypothalamus', position: [0, -0.5, 1], category: 'Basic Functions', size: 0.8 }
    ];

    // Create label texture function
    const createLabelTexture = (text) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      
      // Draw rounded rectangle background (browser-compatible)
      context.fillStyle = 'rgba(0, 0, 0, 0.8)';
      context.beginPath();
      const x = 0, y = 0, w = 256, h = 64, r = 10;
      context.moveTo(x + r, y);
      context.lineTo(x + w - r, y);
      context.quadraticCurveTo(x + w, y, x + w, y + r);
      context.lineTo(x + w, y + h - r);
      context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      context.lineTo(x + r, y + h);
      context.quadraticCurveTo(x, y + h, x, y + h - r);
      context.lineTo(x, y + r);
      context.quadraticCurveTo(x, y, x + r, y);
      context.closePath();
      context.fill();
      
      context.font = '24px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 128, 32);
      
      return new THREE.CanvasTexture(canvas);
    };

    regions.forEach(region => {
      const categoryColor = regionCategories[region.category].color;
      
      // Create sphere for the region
      const sphereGeometry = new THREE.SphereGeometry(region.size * 0.6, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: categoryColor,
        emissive: categoryColor,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(...region.position);
      sphere.userData = { 
        id: region.id,
        name: region.name, 
        category: region.category,
        originalColor: categoryColor 
      };
      
      // Add outer ring for better visibility
      const ringGeometry = new THREE.TorusGeometry(region.size * 0.8, 0.1, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: categoryColor,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      sphere.add(ring);
      
      // Add label sprite
      const labelTexture = createLabelTexture(region.name);
      const labelMaterial = new THREE.SpriteMaterial({ 
        map: labelTexture,
        transparent: true,
        opacity: showLabels ? 0.9 : 0
      });
      const labelSprite = new THREE.Sprite(labelMaterial);
      labelSprite.position.copy(sphere.position);
      labelSprite.position.y += region.size * 1.2;
      labelSprite.scale.set(4, 1, 1);
      labelSprite.userData = { category: region.category };
      
      brainGroup.add(sphere);
      brainGroup.add(labelSprite);
      regionMeshes.push(sphere);
      labelSprites.push(labelSprite);
    });
    
    // Create connection lines between related regions
    const createConnection = (start, end, opacity = 0.3) => {
      const points = [];
      points.push(new THREE.Vector3(...start));
      points.push(new THREE.Vector3(...end));
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: opacity
      });
      
      return new THREE.Line(geometry, material);
    };
    
    // Add key connections
    const connections = [
      { start: [-3, -1, 2], end: [3, -1, 2] }, // Between amygdalae
      { start: [-3.5, -1.5, 0], end: [3.5, -1.5, 0] }, // Between hippocampi
      { start: [0, 1, 3.5], end: [0, 2.5, 5.5] }, // ACC to vmPFC
    ];
    
    connections.forEach(conn => {
      const line = createConnection(conn.start, conn.end);
      brainGroup.add(line);
    });

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
      if (hoveredRegion && (!intersects.length || hoveredRegion !== intersects[0].object)) {
        hoveredRegion.material.emissiveIntensity = 0.2;
        hoveredRegion.scale.setScalar(1);
        renderer.domElement.style.cursor = 'default';
        setHoveredRegion(null);
      }
      
      // Apply hover effect
      if (intersects.length > 0) {
        const hovered = intersects[0].object;
        hoveredRegion = hovered;
        hovered.material.emissiveIntensity = 0.6;
        hovered.scale.setScalar(1.2);
        renderer.domElement.style.cursor = 'pointer';
        setHoveredRegion(hovered.userData);
      } else {
        hoveredRegion = null;
      }
    };
    
    // Click handler
    const onClick = (event) => {
      if (hoveredRegion) {
        setSelectedRegion(hoveredRegion.userData);
        
        // Highlight selected region
        regionMeshes.forEach(mesh => {
          if (mesh === hoveredRegion) {
            mesh.material.emissiveIntensity = 0.8;
            mesh.material.opacity = 1;
          } else {
            mesh.material.emissiveIntensity = 0.1;
            mesh.material.opacity = 0.3;
          }
        });
      }
    };
    
    // Update visibility based on category filter
    const updateVisibility = () => {
      regionMeshes.forEach((mesh, index) => {
        const isVisible = selectedCategory === 'all' || mesh.userData.category === selectedCategory;
        mesh.visible = isVisible;
        if (labelSprites[index]) {
          labelSprites[index].visible = isVisible && showLabels;
        }
      });
    };
    
    // Initial visibility update
    updateVisibility();
    
    // Store refs for external updates
    window.updateBrainVisibility = updateVisibility;
    
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Animation
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      controls.update();
      // Subtle rotation for depth perception
      if (!hoveredRegion && !selectedRegion) {
        brainGroup.rotation.y += 0.002;
      }
      
      // Update ring rotations
      regionMeshes.forEach((mesh) => {
        if (mesh.children[0]) { // Ring
          mesh.children[0].rotation.z += 0.01;
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
      renderer.dispose();
    };
  }, [selectedCategory, showLabels]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-light text-white mb-2">Interactive Brain Map</h2>
          <p className="text-gray-400 text-sm">Click regions to explore • Hover for details</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowLabels(!showLabels);
              if (window.updateBrainVisibility) {
                setTimeout(() => window.updateBrainVisibility(), 0);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showLabels 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {showLabels ? 'Hide' : 'Show'} Labels
          </button>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <h3 className="text-white text-sm font-medium mb-3">Filter by Function</h3>
        <div className="flex flex-wrap gap-2 max-w-md">
          <button
            onClick={() => {
              setSelectedCategory('all');
              if (window.updateBrainVisibility) {
                setTimeout(() => window.updateBrainVisibility(), 0);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All Regions
          </button>
          {Object.entries(regionCategories).map(([category, data]) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                if (window.updateBrainVisibility) {
                  setTimeout(() => window.updateBrainVisibility(), 0);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
              style={{
                borderLeft: selectedCategory === category ? `4px solid #${data.color.toString(16)}` : 'none'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Hover Info */}
      {hoveredRegion && (
        <div className="absolute top-24 left-4 bg-black/90 backdrop-blur-xl rounded-xl p-4 border border-white/20 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: `#${regionCategories[hoveredRegion.category].color.toString(16)}` }}
            />
            <h3 className="text-white font-medium">{hoveredRegion.name}</h3>
          </div>
          <p className="text-gray-400 text-sm">{hoveredRegion.category}</p>
          <p className="text-gray-500 text-xs mt-1">Click for detailed information</p>
        </div>
      )}
      
      {/* Selected Region Panel */}
      {selectedRegion && (
        <div className="absolute top-4 right-4 w-96 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 animate-slideUp">
          <div 
            className="p-4 border-b border-white/10 flex justify-between items-center"
            style={{
              background: `linear-gradient(to right, #${regionCategories[selectedRegion.category].color.toString(16)}20, transparent)`
            }}
          >
            <div>
              <h3 className="text-xl font-medium text-white">{selectedRegion.name}</h3>
              <p className="text-gray-400 text-sm">{selectedRegion.category}</p>
            </div>
            <button 
              onClick={() => {
                setSelectedRegion(null);
                // Reset all regions
                regionMeshes.forEach(mesh => {
                  mesh.material.emissiveIntensity = 0.2;
                  mesh.material.opacity = 0.8;
                });
              }}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <span className="text-white text-lg">×</span>
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {brainRegions[selectedRegion.id] && (
              <>
                <div>
                  <h4 className="text-white text-sm font-medium mb-2">Primary Functions</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {brainRegions[selectedRegion.id].description || 'This region plays a crucial role in neural processing and brain function.'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-white text-sm font-medium mb-2">Impact of Trauma</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Adverse experiences during critical developmental windows can affect this region's structure and function.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-white text-sm font-medium mb-2">Vulnerable Periods</h4>
                  <div className="flex flex-wrap gap-2">
                    {brainRegions[selectedRegion.id].vulnerablePeriods?.map(period => (
                      <span 
                        key={period}
                        className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                      >
                        {period}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}