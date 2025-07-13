import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export default function LiveBrainVisualization({ brainData = {}, isLive = false, conversationActive = false }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const regionsRef = useRef({});
  const animationRef = useRef(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 10, 50);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 25);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    mountRef.current.appendChild(renderer.domElement);

    // Post-processing for glow effects
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.5, // strength
      0.4, // radius
      0.85  // threshold
    );
    composer.addPass(bloomPass);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 15;
    controls.maxDistance = 40;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Point lights for dramatic effect
    const topLight = new THREE.PointLight(0x9966ff, 0.8, 50);
    topLight.position.set(0, 20, 0);
    scene.add(topLight);

    const frontLight = new THREE.PointLight(0x6644ff, 0.5, 50);
    frontLight.position.set(0, 0, 20);
    scene.add(frontLight);

    // Create brain structure
    const brainGroup = new THREE.Group();
    
    // Brain regions with positions and sizes
    const regions = [
      // Frontal regions
      { name: 'Prefrontal Cortex', position: [0, 6, 5], size: [8, 4, 6], baseColor: 0x4477ff },
      { name: 'Motor Cortex', position: [0, 4, 3], size: [10, 3, 4], baseColor: 0x5588ff },
      
      // Temporal regions
      { name: 'Temporal Lobe', position: [-6, -1, 0], size: [4, 6, 8], baseColor: 0xff7744, bilateral: true },
      { name: 'Hippocampus', position: [-4, -2, 1], size: [2, 1.5, 3], baseColor: 0xffaa44, bilateral: true },
      { name: 'Amygdala', position: [-3, -2, 3], size: [1.5, 1.5, 1.5], baseColor: 0xff5544, bilateral: true },
      
      // Parietal regions
      { name: 'Parietal Cortex', position: [0, 5, -3], size: [8, 4, 5], baseColor: 0x44ff77 },
      { name: 'Sensory Cortex', position: [0, 4, -1], size: [9, 3, 3], baseColor: 0x66ff99 },
      
      // Occipital regions
      { name: 'Occipital Lobe', position: [0, 2, -6], size: [6, 5, 4], baseColor: 0xffff44 },
      
      // Central structures
      { name: 'Thalamus', position: [0, 0, 0], size: [3, 2, 3], baseColor: 0xff44ff },
      { name: 'Hypothalamus', position: [0, -1.5, 0], size: [2, 1, 2], baseColor: 0xff66ff },
      { name: 'Brain Stem', position: [0, -4, -1], size: [2, 5, 2], baseColor: 0x44ffff },
      
      // Cingulate regions
      { name: 'Anterior Cingulate Cortex', position: [0, 2, 2], size: [4, 2, 3], baseColor: 0xff9944 },
      { name: 'Posterior Cingulate Cortex', position: [0, 2, -2], size: [4, 2, 3], baseColor: 0xffbb44 },
      
      // Cerebellum
      { name: 'Cerebellum', position: [0, -3, -5], size: [7, 4, 4], baseColor: 0x9944ff },
      
      // Insula
      { name: 'Insula', position: [-4, 1, 1], size: [2, 3, 2], baseColor: 0xff4499, bilateral: true }
    ];

    // Create region meshes
    regions.forEach(region => {
      const createRegionMesh = (position, isRight = false) => {
        // Create organic shape using sphere geometry with noise
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const positions = geometry.attributes.position;
        
        // Apply noise for organic look
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          const noise = (Math.sin(x * 2) * Math.cos(y * 2) * Math.sin(z * 2)) * 0.1;
          positions.setXYZ(i, x + noise, y + noise, z + noise);
        }
        
        geometry.computeVertexNormals();
        geometry.scale(...region.size.map(s => s * 0.5));

        // Material with emissive glow
        const material = new THREE.MeshPhongMaterial({
          color: region.baseColor,
          emissive: region.baseColor,
          emissiveIntensity: 0.0,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          position[0] * (isRight ? -1 : 1),
          position[1],
          position[2]
        );
        
        mesh.userData = { 
          name: isRight ? `${region.name} (Right)` : region.name,
          baseName: region.name,
          baseEmissive: 0.0,
          targetEmissive: 0.0,
          pulsePhase: Math.random() * Math.PI * 2
        };

        return mesh;
      };

      // Create left/single hemisphere
      const mesh = createRegionMesh(region.position);
      brainGroup.add(mesh);
      regionsRef.current[region.name] = mesh;

      // Create right hemisphere if bilateral
      if (region.bilateral) {
        const rightMesh = createRegionMesh(region.position, true);
        brainGroup.add(rightMesh);
        regionsRef.current[`${region.name} (Right)`] = rightMesh;
      }
    });

    // Add brain stem connection lines
    const createConnection = (start, end, color = 0x444444) => {
      const points = [];
      points.push(new THREE.Vector3(...start));
      points.push(new THREE.Vector3(...end));
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.3
      });
      
      return new THREE.Line(geometry, material);
    };

    // Add some key connections
    brainGroup.add(createConnection([0, 0, 0], [0, 6, 5])); // Thalamus to PFC
    brainGroup.add(createConnection([-4, -2, 1], [0, 2, 2])); // Hippocampus to ACC
    brainGroup.add(createConnection([4, -2, 1], [0, 2, 2])); // Right Hippocampus to ACC

    scene.add(brainGroup);

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      time += 0.016; // ~60fps

      // Update controls
      controls.update();

      // Rotate brain slowly when conversation is active
      if (conversationActive) {
        brainGroup.rotation.y += 0.001;
      }

      // Update region emissive based on brain data
      Object.entries(regionsRef.current).forEach(([regionName, mesh]) => {
        const baseName = mesh.userData.baseName;
        const impactData = brainData[baseName] || brainData[regionName];
        
        if (impactData) {
          // Set target emissive based on impact
          mesh.userData.targetEmissive = impactData.impact || 0;
          
          // Smooth transition to target
          const currentEmissive = mesh.material.emissiveIntensity;
          const diff = mesh.userData.targetEmissive - currentEmissive;
          mesh.material.emissiveIntensity += diff * 0.05;
          
          // Pulse effect for active regions
          if (isLive && mesh.userData.targetEmissive > 0) {
            const pulse = Math.sin(time * 2 + mesh.userData.pulsePhase) * 0.1 + 0.1;
            mesh.material.emissiveIntensity += pulse * mesh.userData.targetEmissive;
          }
          
          // Update opacity based on impact
          mesh.material.opacity = 0.3 + (mesh.userData.targetEmissive * 0.5);
        } else {
          // Fade out regions with no impact
          mesh.material.emissiveIntensity *= 0.95;
          mesh.material.opacity = Math.max(0.2, mesh.material.opacity * 0.98);
        }
      });

      // Check for hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(regionsRef.current));
      
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        setHoveredRegion(hoveredMesh.userData.name);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredRegion(null);
        renderer.domElement.style.cursor = 'default';
      }

      // Render
      composer.render();
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [brainData, isLive, conversationActive]);

  // Helper function to get impact description
  const getImpactInfo = (regionName) => {
    const data = brainData[regionName];
    if (!data) return null;

    const impactLevel = data.impact || 0;
    let description = '';
    
    if (impactLevel >= 0.8) description = 'Severe impact detected';
    else if (impactLevel >= 0.6) description = 'High impact detected';
    else if (impactLevel >= 0.4) description = 'Moderate impact detected';
    else if (impactLevel >= 0.2) description = 'Mild impact detected';
    else description = 'Minimal impact';

    return {
      level: Math.round(impactLevel * 100),
      description,
      traumaTypes: data.traumaTypes || []
    };
  };

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header overlay */}
      <div className="absolute top-6 left-6 right-6">
        <h2 className="text-2xl font-light text-white mb-2">
          {isLive ? 'Live Brain Mapping' : 'Your Brain Map'}
        </h2>
        <p className="text-gray-400 text-sm">
          {conversationActive 
            ? 'Your brain map updates as you share your story'
            : 'Hover over regions to see details'
          }
        </p>
      </div>

      {/* Region info tooltip */}
      {hoveredRegion && (
        <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl rounded-lg p-4 border border-white/10 max-w-sm">
          <h3 className="text-white font-medium mb-2">{hoveredRegion}</h3>
          {getImpactInfo(hoveredRegion) ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-gray-300">
                  {getImpactInfo(hoveredRegion).description}
                </span>
              </div>
              <p className="text-gray-400">
                Impact level: {getImpactInfo(hoveredRegion).level}%
              </p>
              {getImpactInfo(hoveredRegion).traumaTypes.length > 0 && (
                <p className="text-xs text-gray-500">
                  Related to: {getImpactInfo(hoveredRegion).traumaTypes.join(', ')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No significant impact detected</p>
          )}
        </div>
      )}

      {/* Live indicator */}
      {isLive && conversationActive && (
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-500 text-sm font-medium">LIVE</span>
        </div>
      )}
    </div>
  );
}