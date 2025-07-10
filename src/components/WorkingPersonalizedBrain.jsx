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
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [viewMode, setViewMode] = useState('impact'); // 'impact' or 'anatomy'

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

    // Comprehensive region positions with bilateral regions
    const regionPositions = {
      amygdala_left: { pos: [-3, -1, 2], scale: 1.2, name: 'Left Amygdala', bilateral: 'amygdala' },
      amygdala_right: { pos: [3, -1, 2], scale: 1.2, name: 'Right Amygdala', bilateral: 'amygdala' },
      hippocampus_left: { pos: [-3.5, -1.5, 0], scale: 1.2, name: 'Left Hippocampus', bilateral: 'hippocampus' },
      hippocampus_right: { pos: [3.5, -1.5, 0], scale: 1.2, name: 'Right Hippocampus', bilateral: 'hippocampus' },
      dlPFC: { pos: [-2, 3, 5], scale: 1.8, name: 'Dorsolateral PFC' },
      vmPFC: { pos: [0, 2.5, 5.5], scale: 1.5, name: 'Ventromedial PFC' },
      ACC: { pos: [0, 1, 3], scale: 1.2, name: 'Anterior Cingulate' },
      insula_left: { pos: [-4.5, 0, 0], scale: 1.0, name: 'Left Insula', bilateral: 'insula' },
      insula_right: { pos: [4.5, 0, 0], scale: 1.0, name: 'Right Insula', bilateral: 'insula' },
      temporal_cortex_left: { pos: [-6, -0.5, 0], scale: 1.5, name: 'Left Temporal', bilateral: 'temporal_cortex' },
      temporal_cortex_right: { pos: [6, -0.5, 0], scale: 1.5, name: 'Right Temporal', bilateral: 'temporal_cortex' },
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

    // Create text labels
    const createTextSprite = (text, color) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;
      
      // Background
      context.fillStyle = 'rgba(0, 0, 0, 0.85)';
      context.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
      context.fill();
      
      // Border
      context.strokeStyle = color;
      context.lineWidth = 3;
      context.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
      context.stroke();
      
      // Text
      context.font = 'bold 32px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(5, 1.25, 1);
      
      return sprite;
    };

    // Add ALL regions, highlighting impacted ones
    Object.entries(regionPositions).forEach(([regionKey, regionInfo]) => {
      // Check for bilateral impacts
      const bilateralKey = regionInfo.bilateral;
      const impactData = brainImpacts[regionKey] || (bilateralKey && brainImpacts[bilateralKey]);
      const isImpacted = !!impactData;
      const impactStrength = impactData?.impactStrength || 0;
      
      // Color scheme based on impact severity
      let color, glowIntensity;
      if (viewMode === 'impact') {
        if (isImpacted) {
          if (impactStrength > 0.8) {
            color = 0xff0000; // Severe - Red
            glowIntensity = 0.8;
          } else if (impactStrength > 0.5) {
            color = 0xffa500; // Moderate - Orange
            glowIntensity = 0.6;
          } else {
            color = 0xffff00; // Mild - Yellow
            glowIntensity = 0.4;
          }
        } else {
          color = 0x4466ff; // Non-impacted - Blue
          glowIntensity = 0.2;
        }
      } else {
        // Anatomy mode - consistent coloring
        color = 0x88aaff;
        glowIntensity = 0.3;
      }

      const sphereGeometry = new THREE.SphereGeometry(regionInfo.scale * 0.6, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: glowIntensity * 0.5,
        transparent: true,
        opacity: isImpacted ? 0.85 : 0.35,
        shininess: 100
      });

      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(...regionInfo.pos);
      sphere.userData = { 
        regionKey, 
        regionName: regionInfo.name,
        impactData,
        isImpacted,
        impactStrength,
        color
      };
      
      // Add pulsing glow for impacted regions
      if (isImpacted && viewMode === 'impact') {
        const glowGeometry = new THREE.SphereGeometry(regionInfo.scale * 0.75, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        sphere.add(glow);
        
        // Add severity indicator ring
        const ringGeometry = new THREE.TorusGeometry(regionInfo.scale * 0.8, 0.08, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        sphere.add(ring);
      }
      
      // Add text label
      const label = createTextSprite(regionInfo.name, `#${color.toString(16).padStart(6, '0')}`);
      label.position.copy(sphere.position);
      label.position.y += regionInfo.scale * 1.2;
      
      brainGroup.add(sphere);
      brainGroup.add(label);
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
        const hoveredSphere = intersects[0].object;
        setHoveredRegion(hoveredSphere.userData);
        renderer.domElement.style.cursor = 'pointer';
        
        // Enhanced hover effect
        hoveredSphere.material.emissiveIntensity = 0.8;
        hoveredSphere.scale.setScalar(1.15);
        
        // Rotate rings faster on hover
        if (hoveredSphere.children[1]) {
          hoveredSphere.children[1].rotation.z += 0.05;
        }
      } else {
        setHoveredRegion(null);
        renderer.domElement.style.cursor = 'default';
        
        // Reset all regions
        Object.values(regionSpheres).forEach(sphere => {
          const baseIntensity = sphere.userData.isImpacted ? 0.4 : 0.2;
          sphere.material.emissiveIntensity = baseIntensity;
          sphere.scale.setScalar(1);
        });
      }
    };

    const onClick = (event) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(regionSpheres));

      if (intersects.length > 0) {
        const clickedSphere = intersects[0].object;
        setSelectedRegion(clickedSphere.userData);
        
        // Visual feedback for selection
        Object.values(regionSpheres).forEach(sphere => {
          if (sphere === clickedSphere) {
            sphere.material.opacity = 1;
            sphere.material.emissiveIntensity = 0.8;
          } else {
            sphere.material.opacity = 0.2;
            sphere.material.emissiveIntensity = 0.1;
          }
        });
        
        if (onRegionClick) {
          const { regionKey, impactData } = clickedSphere.userData;
          onRegionClick(regionKey, impactData);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Animation
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      controls.update();

      // Animate impacted regions
      const time = Date.now() * 0.001;
      Object.values(regionSpheres).forEach(sphere => {
        if (sphere.userData.isImpacted && viewMode === 'impact') {
          // Pulse effect for impacted regions
          const intensity = sphere.userData.impactStrength;
          const pulseSpeed = 2 + intensity * 2;
          const pulseAmount = 0.05 + intensity * 0.05;
          const pulse = Math.sin(time * pulseSpeed) * pulseAmount + 1;
          
          if (sphere !== hoveredRegion && !selectedRegion) {
            sphere.scale.setScalar(pulse);
          }
          
          // Rotate rings
          if (sphere.children[1]) {
            sphere.children[1].rotation.z += 0.01 * (1 + intensity);
          }
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
  }, [brainImpacts, onRegionClick]);

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* View Mode Toggle */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/80 backdrop-blur-xl rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setViewMode('impact')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'impact'
                ? 'bg-red-600 text-white'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            Impact View
          </button>
          <button
            onClick={() => setViewMode('anatomy')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'anatomy'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            Anatomy View
          </button>
        </div>
      </div>
      
      {/* Impact Legend */}
      {viewMode === 'impact' && (
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <h3 className="text-white text-sm font-medium mb-3">Impact Severity</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-gray-300 text-xs">Severe Impact (&gt;80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-gray-300 text-xs">Moderate Impact (50-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-gray-300 text-xs">Mild Impact (&lt;50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-gray-300 text-xs">No Detected Impact</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Hover Info */}
      {hoveredRegion && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-xl rounded-xl p-4 border border-white/20 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: `#${hoveredRegion.color.toString(16).padStart(6, '0')}` }}
            />
            <div>
              <h3 className="text-white font-medium">{hoveredRegion.regionName}</h3>
              {hoveredRegion.isImpacted && (
                <p className="text-gray-400 text-sm">
                  Impact Strength: {Math.round(hoveredRegion.impactStrength * 100)}%
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Region Details */}
      {selectedRegion && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-96 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 animate-slideUp">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">{selectedRegion.regionName}</h3>
            <button 
              onClick={() => {
                setSelectedRegion(null);
                // Reset opacity
                Object.values(regionSpheres).forEach(sphere => {
                  sphere.material.opacity = sphere.userData.isImpacted ? 0.85 : 0.35;
                  sphere.material.emissiveIntensity = sphere.userData.isImpacted ? 0.4 : 0.2;
                });
              }}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <span className="text-white">×</span>
            </button>
          </div>
          
          {selectedRegion.isImpacted && selectedRegion.impactData && (
            <div className="p-4 space-y-3">
              <div>
                <h4 className="text-white text-sm font-medium mb-1">Trauma Types</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.impactData.traumaTypes?.map(type => (
                    <span key={type} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white text-sm font-medium mb-1">Age Periods Affected</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.impactData.ageRanges?.map(age => (
                    <span key={age} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                      {age} years
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white text-sm font-medium mb-1">Research Findings</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedRegion.impactData.researchFindings || 
                   'This region shows structural and functional changes in response to early adversity.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}