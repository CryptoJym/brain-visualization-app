import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const DetailedBrainImpactResults = ({ assessmentResults }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const brainMeshRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'regions', 'research'
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Comprehensive brain region mapping with anatomical accuracy
  const brainRegions = {
    'Prefrontal Cortex': {
      position: [0, 45, 55],
      size: 25,
      color: 0x4A90E2,
      functions: ['Executive function', 'Decision making', 'Impulse control', 'Planning'],
      traumaEffects: 'Reduced volume impairs judgment, increases impulsivity, and disrupts emotional regulation'
    },
    'Medial Prefrontal Cortex': {
      position: [0, 40, 48],
      size: 18,
      color: 0x5BA0F2,
      functions: ['Self-awareness', 'Social cognition', 'Emotional regulation'],
      traumaEffects: 'Disruption leads to difficulty understanding self and others, emotional dysregulation'
    },
    'Orbitofrontal Cortex': {
      position: [-15, 35, 50],
      size: 20,
      color: 0x6BB0FF,
      functions: ['Reward processing', 'Risk assessment', 'Social behavior'],
      traumaEffects: 'Damage increases risk-taking, impairs social judgment, disrupts reward processing'
    },
    'Anterior Cingulate Cortex': {
      position: [0, 25, 35],
      size: 15,
      color: 0x7BC0FF,
      functions: ['Conflict monitoring', 'Error detection', 'Attention', 'Pain processing'],
      traumaEffects: 'Hyperactivity increases anxiety, hypervigilance; reduction impairs attention'
    },
    'Amygdala': {
      position: [-22, -5, 5],
      size: 10,
      color: 0xFF6B6B,
      functions: ['Fear processing', 'Threat detection', 'Emotional memory'],
      traumaEffects: 'Enlargement causes hypervigilance, anxiety, heightened fear response'
    },
    'Hippocampus': {
      position: [25, -10, 5],
      size: 14,
      color: 0x4ECDC4,
      functions: ['Memory formation', 'Spatial navigation', 'Stress regulation'],
      traumaEffects: 'Volume reduction impairs memory, increases PTSD risk, disrupts stress response'
    },
    'Corpus Callosum': {
      position: [0, 5, 0],
      size: 35,
      color: 0xF7B731,
      functions: ['Interhemispheric communication', 'Coordination', 'Integration'],
      traumaEffects: 'Thinning disrupts brain hemisphere coordination, affects emotional integration'
    },
    'Insula': {
      position: [-35, 5, 0],
      size: 12,
      color: 0xEB3B5A,
      functions: ['Interoception', 'Empathy', 'Body awareness', 'Pain'],
      traumaEffects: 'Alterations affect body awareness, empathy, and pain perception'
    },
    'Temporal Lobe': {
      position: [-45, -15, 0],
      size: 30,
      color: 0x8854D0,
      functions: ['Auditory processing', 'Language', 'Memory', 'Emotion'],
      traumaEffects: 'Changes affect language processing, auditory memory, emotional processing'
    },
    'Visual Cortex': {
      position: [0, -15, -55],
      size: 28,
      color: 0x3867D6,
      functions: ['Visual processing', 'Pattern recognition'],
      traumaEffects: 'Alterations from witnessing trauma affect visual processing and hypervigilance'
    },
    'Sensory Cortex': {
      position: [0, 55, 10],
      size: 25,
      color: 0x20BF6B,
      functions: ['Touch', 'Temperature', 'Pain', 'Body mapping'],
      traumaEffects: 'Changes affect body perception, pain sensitivity, touch processing'
    },
    'Cerebellum': {
      position: [0, -55, -35],
      size: 35,
      color: 0xFA8231,
      functions: ['Motor control', 'Balance', 'Coordination', 'Learning'],
      traumaEffects: 'Volume reduction affects motor skills, balance, procedural learning'
    },
    'Brain Stem': {
      position: [0, -35, -15],
      size: 20,
      color: 0xFD9644,
      functions: ['Vital functions', 'Arousal', 'Sleep-wake', 'Basic survival'],
      traumaEffects: 'Dysregulation affects sleep, arousal, basic physiological functions'
    },
    'Thalamus': {
      position: [0, -5, 0],
      size: 15,
      color: 0xA55EEA,
      functions: ['Sensory relay', 'Consciousness', 'Sleep', 'Alertness'],
      traumaEffects: 'Disruption affects sensory processing, sleep patterns, consciousness'
    },
    'Hypothalamus': {
      position: [0, -15, 8],
      size: 8,
      color: 0xFC5C65,
      functions: ['Hormones', 'Temperature', 'Hunger', 'Stress response'],
      traumaEffects: 'Dysregulation of HPA axis, disrupted stress hormones, metabolic changes'
    }
  };

  // Enhanced color mapping for impact visualization
  const getImpactColor = (impact, isReduced) => {
    const magnitude = Math.abs(impact);
    
    if (isReduced) {
      // Blue spectrum for volume reduction
      if (magnitude < 5) return new THREE.Color(0.7, 0.8, 1.0);      // Light blue
      if (magnitude < 10) return new THREE.Color(0.4, 0.6, 1.0);     // Medium blue
      if (magnitude < 20) return new THREE.Color(0.2, 0.4, 0.9);     // Deep blue
      if (magnitude < 30) return new THREE.Color(0.1, 0.2, 0.8);     // Dark blue
      return new THREE.Color(0.0, 0.1, 0.6);                         // Very dark blue
    } else {
      // Red/orange spectrum for hyperactivity
      if (magnitude < 5) return new THREE.Color(1.0, 0.9, 0.7);      // Light orange
      if (magnitude < 10) return new THREE.Color(1.0, 0.7, 0.4);     // Orange
      if (magnitude < 20) return new THREE.Color(1.0, 0.5, 0.2);     // Deep orange
      if (magnitude < 30) return new THREE.Color(1.0, 0.3, 0.1);     // Red-orange
      return new THREE.Color(0.9, 0.1, 0.1);                         // Deep red
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !assessmentResults || viewMode !== '3d') return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 200, 600);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 250);

    // Renderer with better quality
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Enhanced lighting for better visualization
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(100, 100, 50);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x4444ff, 0.3);
    directionalLight2.position.set(-100, -50, -50);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 100, 0);
    scene.add(pointLight);

    // Create detailed brain visualization
    createDetailedBrain(scene, assessmentResults.brainImpacts);

    // Mouse interaction
    const handleMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleClick = (event) => {
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      
      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        if (clicked.userData.regionName) {
          setSelectedRegion(clicked.userData);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation loop with hover effects
    let hoveredObject = null;
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotation
      if (brainMeshRef.current) {
        brainMeshRef.current.rotation.y += 0.002;
      }

      // Hover detection
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      
      if (intersects.length > 0 && intersects[0].object.userData.regionName) {
        const newHovered = intersects[0].object;
        if (hoveredObject !== newHovered) {
          if (hoveredObject) {
            hoveredObject.scale.setScalar(hoveredObject.userData.originalScale || 1);
          }
          hoveredObject = newHovered;
          hoveredObject.userData.originalScale = hoveredObject.scale.x;
          hoveredObject.scale.setScalar(1.1);
        }
        document.body.style.cursor = 'pointer';
      } else {
        if (hoveredObject) {
          hoveredObject.scale.setScalar(hoveredObject.userData.originalScale || 1);
          hoveredObject = null;
        }
        document.body.style.cursor = 'default';
      }

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

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [assessmentResults, viewMode]);

  const createDetailedBrain = (scene, brainImpacts) => {
    const brainGroup = new THREE.Group();
    brainMeshRef.current = brainGroup;

    // Create glass-like brain shell
    const brainGeometry = new THREE.SphereGeometry(80, 128, 128);
    
    // Modify vertices for more brain-like shape
    const positions = brainGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Create hemispheric division
      if (Math.abs(x) < 5) {
        positions.setX(i, x * 0.3);
      }
      
      // Flatten bottom slightly
      if (y < -40) {
        positions.setY(i, y * 0.8);
      }
      
      // Create frontal lobe protrusion
      if (z > 40 && y > 0) {
        positions.setZ(i, z * 1.1);
      }
    }
    brainGeometry.computeVertexNormals();

    const brainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x888888,
      metalness: 0.1,
      roughness: 0.4,
      opacity: 0.15,
      transparent: true,
      side: THREE.DoubleSide,
      envMapIntensity: 0.4
    });

    const brainShell = new THREE.Mesh(brainGeometry, brainMaterial);
    brainShell.castShadow = true;
    brainShell.receiveShadow = true;
    brainGroup.add(brainShell);

    // Add midline
    const midlineGeometry = new THREE.BoxGeometry(2, 100, 100);
    const midlineMaterial = new THREE.MeshPhongMaterial({
      color: 0x444444,
      opacity: 0.3,
      transparent: true
    });
    const midline = new THREE.Mesh(midlineGeometry, midlineMaterial);
    brainGroup.add(midline);

    // Add brain regions with impacts
    Object.entries(brainImpacts).forEach(([regionName, impactData]) => {
      const regionInfo = brainRegions[regionName];
      if (!regionInfo) return;

      const impact = impactData.totalImpact;
      const isReduced = impact < 0;
      const magnitude = Math.abs(impact);

      // Create region geometry
      const geometry = new THREE.SphereGeometry(
        regionInfo.size * (isReduced ? (100 - magnitude * 0.5) / 100 : (100 + magnitude * 0.3) / 100),
        32,
        32
      );

      const color = getImpactColor(impact, isReduced);
      
      const material = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.2,
        roughness: 0.6,
        opacity: 0.8,
        transparent: true,
        emissive: color,
        emissiveIntensity: isReduced ? 0.1 : 0.3
      });

      const regionMesh = new THREE.Mesh(geometry, material);
      regionMesh.position.set(...regionInfo.position);
      regionMesh.castShadow = true;
      regionMesh.receiveShadow = true;

      // Add outer glow for severely impacted regions
      if (magnitude > 20) {
        const glowGeometry = new THREE.SphereGeometry(
          regionInfo.size * 1.2,
          16,
          16
        );
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: color,
          opacity: 0.2,
          transparent: true
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.copy(regionMesh.position);
        brainGroup.add(glowMesh);
      }

      // Store all data for interaction
      regionMesh.userData = {
        regionName,
        impact,
        isReduced,
        sources: impactData.sources,
        functions: regionInfo.functions,
        traumaEffects: regionInfo.traumaEffects,
        research: impactData.sources.map(s => s.research).join(', ')
      };

      brainGroup.add(regionMesh);
    });

    // Add connections between related regions
    const connections = [
      ['Amygdala', 'Hippocampus'],
      ['Amygdala', 'Prefrontal Cortex'],
      ['Hippocampus', 'Prefrontal Cortex'],
      ['Anterior Cingulate Cortex', 'Prefrontal Cortex'],
      ['Thalamus', 'Sensory Cortex'],
      ['Hypothalamus', 'Amygdala']
    ];

    connections.forEach(([region1, region2]) => {
      const r1 = brainRegions[region1];
      const r2 = brainRegions[region2];
      if (r1 && r2 && brainImpacts[region1] && brainImpacts[region2]) {
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          ...r1.position,
          ...r2.position
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        const material = new THREE.LineBasicMaterial({
          color: 0xffffff,
          opacity: 0.2,
          transparent: true
        });
        
        const line = new THREE.Line(geometry, material);
        brainGroup.add(line);
      }
    });

    scene.add(brainGroup);
  };

  const getComprehensiveImpactDescription = (region) => {
    if (!region) return null;
    
    const { regionName, impact, isReduced, sources, functions, traumaEffects, research } = region;
    
    return (
      <div className="space-y-3">
        <h3 className="text-2xl font-light text-white">{regionName}</h3>
        
        <div className={`text-3xl font-light ${isReduced ? 'text-blue-400' : 'text-red-400'}`}>
          {isReduced ? '' : '+'}{impact.toFixed(1)}% {isReduced ? 'reduction' : 'hyperactivity'}
        </div>
        
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Normal Functions:</h4>
          <p className="text-white text-sm">{functions.join(', ')}</p>
        </div>
        
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Trauma Effects:</h4>
          <p className="text-white text-sm">{traumaEffects}</p>
        </div>
        
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Contributing Traumas:</h4>
          <ul className="text-sm space-y-1">
            {sources.map((source, idx) => (
              <li key={idx} className="text-gray-300">
                • {source.trauma} 
                <span className="text-gray-500 text-xs ml-2">
                  ({source.impact.toFixed(1)}% impact)
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Research:</h4>
          <p className="text-gray-300 text-xs">{research}</p>
        </div>
      </div>
    );
  };

  if (!assessmentResults) {
    return <div>No assessment data available</div>;
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* View mode tabs */}
      <div className="absolute top-8 left-8 z-20">
        <div className="flex gap-2 bg-black/80 backdrop-blur-xl rounded-lg p-1 border border-white/10">
          {['3d', 'regions', 'research'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {mode === '3d' ? '3D Brain' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 3D View */}
      {viewMode === '3d' && (
        <>
          <canvas ref={canvasRef} className="fixed inset-0" />
          
          {/* Selected region details */}
          {selectedRegion && (
            <div className="absolute top-24 left-8 max-w-md bg-black/90 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              {getComprehensiveImpactDescription(selectedRegion)}
              <button
                onClick={() => setSelectedRegion(null)}
                className="mt-4 text-gray-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>
          )}

          {/* Interactive legend */}
          <div className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-xl rounded-lg p-6 border border-white/10">
            <h3 className="text-white font-medium mb-3">Brain Impact Visualization</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[5, 10, 20, 30, 40].map(val => (
                    <div
                      key={val}
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: getImpactColor(-val, true).getStyle() }}
                    />
                  ))}
                </div>
                <span className="text-gray-400">Volume Reduction</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[5, 10, 20, 30, 40].map(val => (
                    <div
                      key={val}
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: getImpactColor(val, false).getStyle() }}
                    />
                  ))}
                </div>
                <span className="text-gray-400">Hyperactivity</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Click on brain regions for detailed information
              </p>
            </div>
          </div>

          {/* Key metrics */}
          <div className="absolute top-8 right-8 bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-sm">Traditional ACE Score</div>
                <div className="text-4xl font-light text-white">
                  {assessmentResults.aceScore}/10
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Expanded ACE Score</div>
                <div className="text-3xl font-light text-purple-400">
                  {assessmentResults.expandedACEScore}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Brain Regions Affected</div>
                <div className="text-2xl font-light text-orange-400">
                  {Object.keys(assessmentResults.brainImpacts).length}
                </div>
              </div>
              {assessmentResults.protectiveFactors.length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <div className="text-green-400 text-sm">
                    {assessmentResults.protectiveFactors.length} Protective Factors
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.abs(assessmentResults.protectiveFactors.reduce((sum, pf) => sum + pf.mitigation, 0))}% total mitigation
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Detailed regions view */}
      {viewMode === 'regions' && (
        <div className="p-8 overflow-y-auto h-screen">
          <h1 className="text-4xl font-light text-white mb-8">
            Detailed Brain Region Analysis
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {Object.entries(assessmentResults.brainImpacts)
              .sort((a, b) => Math.abs(b[1].totalImpact) - Math.abs(a[1].totalImpact))
              .map(([region, data]) => {
                const regionInfo = brainRegions[region] || {};
                const impact = data.totalImpact;
                const isReduced = impact < 0;
                
                return (
                  <div
                    key={region}
                    className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:border-white/20 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-light text-white">{region}</h3>
                      <div className={`text-2xl font-light ${isReduced ? 'text-blue-400' : 'text-red-400'}`}>
                        {isReduced ? '' : '+'}{impact.toFixed(1)}%
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Functions</h4>
                        <p className="text-sm text-gray-300">
                          {regionInfo.functions?.join(' • ') || 'Various cognitive and emotional functions'}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Impact</h4>
                        <p className="text-sm text-gray-300">
                          {regionInfo.traumaEffects || `${isReduced ? 'Reduced' : 'Increased'} activity affecting normal function`}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contributing Factors</h4>
                        <div className="space-y-1">
                          {data.sources.map((source, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="text-gray-400">{source.trauma}</span>
                              <div className="text-gray-500">
                                Impact: {source.impact.toFixed(1)}% • Research: {source.research}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Research view */}
      {viewMode === 'research' && (
        <div className="p-8 overflow-y-auto h-screen">
          <h1 className="text-4xl font-light text-white mb-8">
            Research Foundation
          </h1>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h2 className="text-2xl font-light text-white mb-4">Key Research Findings</h2>
              
              <div className="space-y-4">
                {Object.entries(assessmentResults.brainImpacts).map(([region, data]) => {
                  const uniqueResearch = [...new Set(data.sources.map(s => s.research))];
                  
                  return (
                    <div key={region} className="border-l-2 border-purple-500/50 pl-4">
                      <h3 className="text-lg text-white">{region}</h3>
                      <div className="text-sm text-gray-400 space-y-1">
                        {uniqueResearch.map((research, idx) => (
                          <p key={idx}>• {research}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h2 className="text-2xl font-light text-white mb-4">Understanding Your Results</h2>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  This visualization represents predicted brain changes based on extensive neuroscience research. 
                  The impacts shown are population-level averages from peer-reviewed studies.
                </p>
                
                <div>
                  <h3 className="text-white font-medium mb-2">Volume Reduction (Blue)</h3>
                  <p className="text-sm">
                    Indicates decreased gray matter volume or reduced activity. Often associated with:
                    Impaired function, delayed development, reduced connectivity.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-2">Hyperactivity (Red/Orange)</h3>
                  <p className="text-sm">
                    Indicates increased activity or enlargement. Often associated with:
                    Hypervigilance, anxiety, overactive threat detection, emotional dysregulation.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-2">Important Notes</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Individual outcomes vary significantly</li>
                    <li>• Brain plasticity allows for healing and adaptation</li>
                    <li>• Protective factors can mitigate impacts</li>
                    <li>• This is not a medical diagnosis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedBrainImpactResults;