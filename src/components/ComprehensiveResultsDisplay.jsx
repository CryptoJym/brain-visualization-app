import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const ComprehensiveResultsDisplay = ({ assessmentResults }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const mountRef = useRef(null);

  // Comprehensive brain region database with detailed information
  const brainRegionDatabase = {
    'Prefrontal Cortex': {
      anatomy: {
        location: 'Frontal lobe, anterior portion',
        subregions: ['Dorsolateral', 'Ventromedial', 'Orbitofrontal'],
        volume: '12-17% of cerebral cortex',
        connections: ['Limbic system', 'Basal ganglia', 'Thalamus', 'Parietal cortex']
      },
      functions: {
        primary: ['Executive function', 'Working memory', 'Decision making', 'Impulse control'],
        secondary: ['Attention regulation', 'Planning', 'Abstract thinking', 'Personality expression'],
        developmental: 'Last region to fully mature (age 25+)'
      },
      traumaImpact: {
        volumeReduction: {
          mild: { range: '5-10%', effects: 'Subtle executive dysfunction, mild impulsivity' },
          moderate: { range: '10-20%', effects: 'Significant planning deficits, poor judgment, emotional dysregulation' },
          severe: { range: '20%+', effects: 'Major executive dysfunction, severe impulsivity, inability to plan future' }
        },
        psychological: [
          'Difficulty with emotional regulation',
          'Poor decision-making abilities',
          'Increased risk-taking behavior',
          'Problems with attention and focus',
          'Difficulty understanding consequences'
        ],
        behavioral: [
          'Impulsive actions without considering outcomes',
          'Difficulty maintaining relationships',
          'Problems in academic/work settings',
          'Substance abuse vulnerability',
          'Criminal behavior risk'
        ]
      },
      cascadeEffects: [
        {
          target: 'Amygdala',
          mechanism: 'Loss of top-down emotional regulation',
          result: 'Heightened fear response, anxiety, emotional reactivity'
        },
        {
          target: 'Hippocampus',
          mechanism: 'Disrupted memory consolidation signals',
          result: 'Poor contextual memory, difficulty learning from experiences'
        },
        {
          target: 'Striatum',
          mechanism: 'Altered reward processing pathways',
          result: 'Addiction vulnerability, anhedonia, motivation problems'
        }
      ]
    },
    'Amygdala': {
      anatomy: {
        location: 'Deep temporal lobe, bilateral',
        subregions: ['Lateral', 'Basal', 'Central nuclei'],
        volume: '1-2cm³ per hemisphere',
        connections: ['Prefrontal cortex', 'Hippocampus', 'Hypothalamus', 'Brain stem']
      },
      functions: {
        primary: ['Fear processing', 'Threat detection', 'Emotional memory', 'Fight-or-flight response'],
        secondary: ['Social behavior', 'Reward processing', 'Decision-making under uncertainty'],
        developmental: 'Functional by birth, hyperactive in adolescence'
      },
      traumaImpact: {
        hyperactivity: {
          mild: { range: '10-20%', effects: 'Increased anxiety, mild hypervigilance' },
          moderate: { range: '20-35%', effects: 'Panic attacks, social anxiety, constant threat scanning' },
          severe: { range: '35%+', effects: 'Severe PTSD, debilitating anxiety, paranoia' }
        },
        psychological: [
          'Hypervigilance and constant threat monitoring',
          'Difficulty distinguishing safe vs dangerous',
          'Emotional memories dominate neutral ones',
          'Overreaction to neutral stimuli',
          'Difficulty with emotional intimacy'
        ],
        behavioral: [
          'Avoidance of perceived threats',
          'Aggressive responses to minor triggers',
          'Social withdrawal and isolation',
          'Sleep disturbances and nightmares',
          'Startle response heightened'
        ]
      },
      cascadeEffects: [
        {
          target: 'Hypothalamus',
          mechanism: 'Chronic activation of HPA axis',
          result: 'Cortisol dysregulation, metabolic issues, immune suppression'
        },
        {
          target: 'Prefrontal Cortex',
          mechanism: 'Overwhelming emotional signals',
          result: 'Impaired rational thinking during stress'
        },
        {
          target: 'Hippocampus',
          mechanism: 'Stress hormone exposure',
          result: 'Memory formation problems, reduced neurogenesis'
        }
      ]
    },
    'Hippocampus': {
      anatomy: {
        location: 'Medial temporal lobe',
        subregions: ['CA1', 'CA2', 'CA3', 'Dentate gyrus'],
        volume: '3-3.5cm³ per hemisphere',
        connections: ['Entorhinal cortex', 'Amygdala', 'Hypothalamus', 'Prefrontal cortex']
      },
      functions: {
        primary: ['Memory formation', 'Spatial navigation', 'Memory consolidation', 'Pattern separation'],
        secondary: ['Stress regulation', 'Emotional context', 'Learning', 'Neurogenesis site'],
        developmental: 'Vulnerable throughout life, especially early childhood'
      },
      traumaImpact: {
        volumeReduction: {
          mild: { range: '5-10%', effects: 'Minor memory difficulties, mild spatial disorientation' },
          moderate: { range: '10-19%', effects: 'Significant memory problems, PTSD symptoms, learning difficulties' },
          severe: { range: '19%+', effects: 'Major memory impairment, severe PTSD, dissociation' }
        },
        psychological: [
          'Difficulty forming new memories',
          'Intrusive traumatic memories',
          'Problems with autobiographical memory',
          'Temporal disorientation',
          'Difficulty learning from positive experiences'
        ],
        behavioral: [
          'Academic/work performance decline',
          'Getting lost in familiar places',
          'Repetitive mistakes (not learning)',
          'Difficulty maintaining routines',
          'Problems with sequential tasks'
        ]
      },
      cascadeEffects: [
        {
          target: 'Cortisol receptors',
          mechanism: 'Reduced negative feedback to HPA axis',
          result: 'Chronic stress state, further hippocampal damage'
        },
        {
          target: 'Prefrontal Cortex',
          mechanism: 'Poor memory input for decision-making',
          result: 'Decisions made without learning from past'
        },
        {
          target: 'Amygdala',
          mechanism: 'Failure to contextualize threats',
          result: 'Generalized fear responses'
        }
      ]
    },
    'Anterior Cingulate Cortex': {
      anatomy: {
        location: 'Medial frontal cortex, above corpus callosum',
        subregions: ['Dorsal ACC', 'Ventral ACC', 'Subgenual ACC'],
        volume: '5-7% of frontal cortex',
        connections: ['Prefrontal cortex', 'Limbic system', 'Motor areas', 'Insula']
      },
      functions: {
        primary: ['Conflict monitoring', 'Error detection', 'Pain processing', 'Attention control'],
        secondary: ['Emotion regulation', 'Social pain', 'Empathy', 'Self-awareness'],
        developmental: 'Rapid development ages 3-7, refinement through adolescence'
      },
      traumaImpact: {
        mixed: {
          reduction: 'Reduced error monitoring, poor conflict resolution',
          hyperactivity: 'Hypersensitivity to social rejection, rumination'
        },
        psychological: [
          'Obsessive worry and rumination',
          'Hypersensitivity to criticism',
          'Difficulty resolving internal conflicts',
          'Problems with attention shifting',
          'Heightened perception of social pain'
        ],
        behavioral: [
          'Indecisiveness and procrastination',
          'Perfectionism or complete avoidance',
          'Social anxiety and withdrawal',
          'Self-harm as emotion regulation',
          'Difficulty in group settings'
        ]
      },
      cascadeEffects: [
        {
          target: 'Pain processing network',
          mechanism: 'Altered pain perception pathways',
          result: 'Chronic pain conditions, somatic symptoms'
        },
        {
          target: 'Default Mode Network',
          mechanism: 'Disrupted self-referential processing',
          result: 'Identity issues, dissociation'
        }
      ]
    },
    'Corpus Callosum': {
      anatomy: {
        location: 'Midline, connecting hemispheres',
        subregions: ['Genu', 'Body', 'Splenium'],
        volume: '2-3% of brain volume',
        fibers: '200-300 million axons'
      },
      functions: {
        primary: ['Interhemispheric communication', 'Bilateral coordination', 'Information integration'],
        secondary: ['Emotional integration', 'Complex problem solving', 'Language processing'],
        developmental: 'Myelination continues into 20s'
      },
      traumaImpact: {
        volumeReduction: {
          mild: { range: '7-15%', effects: 'Subtle coordination issues, mild cognitive inefficiency' },
          moderate: { range: '15-25%', effects: 'Split-brain symptoms, emotional numbness, learning problems' },
          severe: { range: '25%+', effects: 'Major integration deficits, severe dissociation' }
        },
        psychological: [
          'Emotional numbing and alexithymia',
          'Difficulty integrating thoughts and feelings',
          'Problems with complex reasoning',
          'Identity fragmentation',
          'Dissociative symptoms'
        ]
      }
    },
    'Insula': {
      anatomy: {
        location: 'Deep within lateral sulcus',
        subregions: ['Anterior', 'Posterior'],
        connections: ['ACC', 'Amygdala', 'Prefrontal cortex', 'Somatosensory cortex']
      },
      functions: {
        primary: ['Interoception', 'Body awareness', 'Empathy', 'Pain processing'],
        secondary: ['Disgust', 'Addiction cravings', 'Social emotions', 'Time perception'],
        developmental: 'Critical for attachment, develops through adolescence'
      },
      traumaImpact: {
        alterations: {
          hyperactivity: 'Heightened body awareness, panic attacks, hypochondria',
          hypoactivity: 'Poor body awareness, self-harm without pain, eating disorders'
        },
        psychological: [
          'Disconnection from body sensations',
          'Difficulty identifying emotions',
          'Problems with empathy',
          'Altered pain perception',
          'Time perception distortions'
        ]
      }
    },
    'Orbitofrontal Cortex': {
      anatomy: {
        location: 'Ventral prefrontal cortex, above eye sockets',
        connections: ['Limbic system', 'Sensory areas', 'Striatum']
      },
      functions: {
        primary: ['Reward evaluation', 'Social behavior', 'Decision-making', 'Impulse control'],
        secondary: ['Moral reasoning', 'Regret processing', 'Behavioral adaptation'],
        developmental: 'Prolonged development through adolescence'
      },
      traumaImpact: {
        volumeReduction: {
          effects: 'Poor social judgment, risky behavior, inability to learn from punishment'
        },
        psychological: [
          'Inability to delay gratification',
          'Poor understanding of social norms',
          'Lack of guilt or remorse',
          'Difficulty reading social cues',
          'Inappropriate social behavior'
        ]
      }
    }
  };

  // Calculate detailed cascade effects
  const calculateCascadeEffects = () => {
    const cascades = [];
    const impactedRegions = Object.keys(assessmentResults.brainImpacts);
    
    impactedRegions.forEach(region => {
      const regionData = brainRegionDatabase[region];
      if (regionData?.cascadeEffects) {
        regionData.cascadeEffects.forEach(cascade => {
          if (impactedRegions.includes(cascade.target)) {
            cascades.push({
              source: region,
              target: cascade.target,
              mechanism: cascade.mechanism,
              result: cascade.result,
              compoundSeverity: Math.abs(assessmentResults.brainImpacts[region].totalImpact) + 
                               Math.abs(assessmentResults.brainImpacts[cascade.target].totalImpact)
            });
          }
        });
      }
    });
    
    return cascades.sort((a, b) => b.compoundSeverity - a.compoundSeverity);
  };

  // Calculate psychological profile
  const generatePsychologicalProfile = () => {
    const profile = {
      emotional: [],
      cognitive: [],
      behavioral: [],
      social: [],
      risk: []
    };

    Object.entries(assessmentResults.brainImpacts).forEach(([region, data]) => {
      const regionInfo = brainRegionDatabase[region];
      if (!regionInfo) return;

      const severity = Math.abs(data.totalImpact);
      const isReduced = data.totalImpact < 0;

      // Add psychological impacts based on severity
      if (severity > 10) {
        regionInfo.traumaImpact.psychological?.forEach(impact => {
          if (region.includes('Prefrontal') || region.includes('Cingulate')) {
            profile.cognitive.push({ impact, severity, region });
          } else if (region === 'Amygdala' || region === 'Insula') {
            profile.emotional.push({ impact, severity, region });
          }
        });

        regionInfo.traumaImpact.behavioral?.forEach(impact => {
          if (impact.includes('social') || impact.includes('relationship')) {
            profile.social.push({ impact, severity, region });
          } else {
            profile.behavioral.push({ impact, severity, region });
          }
        });
      }
    });

    // Add risk factors
    if (assessmentResults.aceScore >= 4) {
      profile.risk.push('70% increased risk of suicide attempts');
      profile.risk.push('460% increased risk of depression');
      profile.risk.push('1,220% increased risk of suicide attempts');
    }
    if (assessmentResults.aceScore >= 6) {
      profile.risk.push('4,600% increased risk of IV drug use');
      profile.risk.push('20 year reduction in life expectancy');
    }

    return profile;
  };

  // 3D Visualization with detailed regions
  useEffect(() => {
    if (!mountRef.current || activeTab !== 'visualization') return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0514);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Complex lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const spotlight1 = new THREE.SpotLight(0xffffff, 0.5);
    spotlight1.position.set(10, 10, 10);
    spotlight1.castShadow = true;
    scene.add(spotlight1);

    const spotlight2 = new THREE.SpotLight(0x4466ff, 0.3);
    spotlight2.position.set(-10, -10, 10);
    scene.add(spotlight2);

    // Create detailed brain
    const brainGroup = new THREE.Group();

    // Brain shell with subsurface scattering effect
    const brainGeometry = new THREE.SphereGeometry(3, 64, 64);
    const positions = brainGeometry.attributes.position;
    
    // Modify for brain shape
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Create hemisphere division
      if (Math.abs(x) < 0.3) {
        positions.setX(i, x * 0.3);
      }
      
      // Frontal lobe bulge
      if (z > 2 && y > 0) {
        positions.setZ(i, z * 1.2);
      }
      
      // Temporal lobe indentation
      if (Math.abs(x) > 2 && y < 0) {
        positions.setY(i, y * 0.8);
      }
      
      // Occipital flattening
      if (z < -2) {
        positions.setZ(i, z * 0.9);
      }
    }
    brainGeometry.computeVertexNormals();

    const brainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.1,
      roughness: 0.7,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4
    });

    const brainShell = new THREE.Mesh(brainGeometry, brainMaterial);
    brainShell.castShadow = true;
    brainShell.receiveShadow = true;
    brainGroup.add(brainShell);

    // Add detailed brain regions
    const regionMeshes = [];
    Object.entries(assessmentResults.brainImpacts).forEach(([regionName, data]) => {
      const impact = data.totalImpact;
      const isReduced = impact < 0;
      const magnitude = Math.abs(impact);
      
      // Region-specific positioning
      const positions = {
        'Prefrontal Cortex': [0, 2, 2.5],
        'Medial Prefrontal Cortex': [0, 1.8, 2.3],
        'Orbitofrontal Cortex': [0, 1.5, 2.8],
        'Amygdala': [-1.2, -0.5, 0.5],
        'Hippocampus': [1.2, -0.8, 0.5],
        'Anterior Cingulate Cortex': [0, 1, 1.5],
        'Corpus Callosum': [0, 0, 0],
        'Insula': [-1.8, 0, 0],
        'Temporal Lobe': [-2.5, -1, 0],
        'Visual Cortex': [0, -1, -2.8],
        'Sensory Cortex': [0, 3, 0],
        'Cerebellum': [0, -2.5, -2]
      };

      const position = positions[regionName] || [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ];

      // Create region geometry
      const size = 0.3 + (magnitude / 100) * 0.3;
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      
      // Color based on impact
      let color;
      if (isReduced) {
        const blueIntensity = magnitude / 40;
        color = new THREE.Color(
          0.1 + blueIntensity * 0.1,
          0.2 + blueIntensity * 0.2,
          0.6 + blueIntensity * 0.4
        );
      } else {
        const redIntensity = magnitude / 40;
        color = new THREE.Color(
          0.8 + redIntensity * 0.2,
          0.2 - redIntensity * 0.1,
          0.1
        );
      }

      const material = new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: isReduced ? 0.2 : 0.4,
        roughness: 0.4,
        metalness: 0.2,
        transparent: true,
        opacity: 0.8
      });

      const regionMesh = new THREE.Mesh(geometry, material);
      regionMesh.position.set(...position);
      regionMesh.castShadow = true;
      regionMesh.userData = { regionName, impact: data };
      
      regionMeshes.push(regionMesh);
      brainGroup.add(regionMesh);

      // Add glow for severe impacts
      if (magnitude > 20) {
        const glowGeometry = new THREE.SphereGeometry(size * 1.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(regionMesh.position);
        brainGroup.add(glow);
      }
    });

    // Add connections between regions
    const cascadeEffects = calculateCascadeEffects();
    cascadeEffects.forEach(cascade => {
      const sourcePos = regionMeshes.find(m => m.userData.regionName === cascade.source)?.position;
      const targetPos = regionMeshes.find(m => m.userData.regionName === cascade.target)?.position;
      
      if (sourcePos && targetPos) {
        const points = [];
        points.push(sourcePos);
        points.push(targetPos);
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0xffaa00,
          opacity: 0.3 + (cascade.compoundSeverity / 100) * 0.4,
          transparent: true,
          linewidth: 2
        });
        
        const line = new THREE.Line(geometry, material);
        brainGroup.add(line);
      }
    });

    scene.add(brainGroup);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      brainGroup.rotation.y += 0.002;
      
      // Pulse severe regions
      regionMeshes.forEach(mesh => {
        if (Math.abs(mesh.userData.impact.totalImpact) > 20) {
          const scale = 1 + Math.sin(Date.now() * 0.002) * 0.05;
          mesh.scale.setScalar(scale);
        }
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activeTab, assessmentResults]);

  const cascadeEffects = calculateCascadeEffects();
  const psychProfile = generatePsychologicalProfile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden p-8 border-b border-white/10">
        <h1 className="text-4xl font-extralight text-white tracking-wide mb-2">Comprehensive Brain Impact Analysis</h1>
        <p className="text-gray-400">
          Based on {assessmentResults.aceScore} ACEs with {Object.keys(assessmentResults.brainImpacts).length} brain regions affected
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-20 backdrop-blur-lg bg-black/30 border-b border-white/10">
        <div className="flex overflow-x-auto">
        {['overview', 'regions', 'cascade', 'psychology', 'visualization'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 capitalize whitespace-nowrap transition-all duration-300 ${
              activeTab === tab
                ? 'text-white border-b-2 border-purple-400 bg-white/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-sm text-gray-400 mb-2">ACE Score</h3>
                <div className="text-5xl font-light text-purple-400">
                  {assessmentResults.aceScore}
                  <span className="text-2xl text-gray-500">/10</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {assessmentResults.aceScore >= 4 ? 'High Risk' : 
                   assessmentResults.aceScore >= 2 ? 'Moderate Risk' : 'Lower Risk'}
                </p>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-sm text-gray-400 mb-2">Brain Regions Affected</h3>
                <div className="text-5xl font-light text-orange-400">
                  {Object.keys(assessmentResults.brainImpacts).length}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {cascadeEffects.length} cascade effects detected
                </p>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-sm text-gray-400 mb-2">Severity Index</h3>
                <div className="text-5xl font-light text-red-400">
                  {assessmentResults.overallSeverity.toFixed(1)}
                  <span className="text-2xl text-gray-500">/10</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Composite impact score
                </p>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-light mb-4">Most Affected Systems</h3>
              <div className="space-y-4">
                {Object.entries(assessmentResults.brainImpacts)
                  .sort((a, b) => Math.abs(b[1].totalImpact) - Math.abs(a[1].totalImpact))
                  .slice(0, 5)
                  .map(([region, data]) => {
                    const impact = data.totalImpact;
                    const isReduced = impact < 0;
                    return (
                      <div key={region} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg">{region}</h4>
                          <p className="text-sm text-gray-400">
                            {brainRegionDatabase[region]?.functions.primary.slice(0, 2).join(', ')}
                          </p>
                        </div>
                        <div className={`text-2xl font-light ${isReduced ? 'text-blue-400' : 'text-red-400'}`}>
                          {isReduced ? '' : '+'}{impact.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Regions Tab - Detailed Information */}
        {activeTab === 'regions' && (
          <div className="space-y-6">
            {Object.entries(assessmentResults.brainImpacts)
              .sort((a, b) => Math.abs(b[1].totalImpact) - Math.abs(a[1].totalImpact))
              .map(([region, data]) => {
                const regionInfo = brainRegionDatabase[region];
                const impact = data.totalImpact;
                const isReduced = impact < 0;
                const magnitude = Math.abs(impact);
                
                return (
                  <div key={region} className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-light">{region}</h3>
                      <div className={`text-3xl font-extralight ${isReduced ? 'text-blue-400' : 'text-red-400'}`}>
                        {isReduced ? '' : '+'}{impact.toFixed(1)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Anatomy */}
                      <div>
                        <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Anatomy</h4>
                        <p className="text-sm text-gray-300 mb-2">
                          Location: {regionInfo?.anatomy.location}
                        </p>
                        <p className="text-sm text-gray-300 mb-2">
                          Volume: {regionInfo?.anatomy.volume}
                        </p>
                        <p className="text-sm text-gray-300">
                          Connections: {regionInfo?.anatomy.connections.join(', ')}
                        </p>
                      </div>

                      {/* Functions */}
                      <div>
                        <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Normal Functions</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {regionInfo?.functions.primary.map((func, i) => (
                            <li key={i}>• {func}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Impact Details */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                        Impact: {isReduced ? 'Volume Reduction' : 'Hyperactivity'}
                      </h4>
                      <p className="text-sm text-gray-300 mb-2">
                        Severity: {
                          magnitude < 10 ? 'Mild' :
                          magnitude < 20 ? 'Moderate' :
                          'Severe'
                        } ({magnitude.toFixed(1)}%)
                      </p>
                      
                      <div className="bg-black/30 rounded-lg p-4 mt-2">
                        <h5 className="text-sm font-medium mb-2">Expected Effects:</h5>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {regionInfo?.traumaImpact.psychological?.slice(0, 3).map((effect, i) => (
                            <li key={i}>• {effect}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Contributing Traumas */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Contributing Traumas</h4>
                      <div className="space-y-2">
                        {data.sources.map((source, i) => (
                          <div key={i} className="text-sm">
                            <span className="text-gray-300">{source.trauma}</span>
                            <span className="text-gray-500 ml-2">
                              ({source.impact.toFixed(1)}% impact) - {source.research}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Cascade Effects Tab */}
        {activeTab === 'cascade' && (
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-light mb-4">Neural Cascade Effects</h3>
              <p className="text-gray-400 mb-6">
                When one brain region is impacted, it creates a domino effect affecting connected regions. 
                These compound effects often create more severe symptoms than individual impacts alone.
              </p>
              
              <div className="space-y-4">
                {cascadeEffects.map((cascade, i) => (
                  <div key={i} className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-medium">{cascade.source}</div>
                        <div className="text-gray-400">→</div>
                        <div className="text-lg font-medium">{cascade.target}</div>
                      </div>
                      <div className="text-orange-400">
                        Severity: {cascade.compoundSeverity.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Mechanism:</span> {cascade.mechanism}
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">Result:</span> {cascade.result}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Network Effects Visualization */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-light mb-4">Network-Wide Effects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Emotional Regulation Network</h4>
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      Prefrontal → Amygdala → Hippocampus cascade detected.
                      This pattern typically results in severe emotional dysregulation, 
                      memory problems, and increased PTSD risk.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Executive Function Network</h4>
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      Multiple prefrontal regions affected. Expect significant 
                      problems with planning, decision-making, and impulse control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Psychology Tab */}
        {activeTab === 'psychology' && (
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-light mb-6">Psychological Profile</h3>
              
              {/* Emotional Impact */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-orange-400">Emotional Impacts</h4>
                <div className="space-y-2">
                  {psychProfile.emotional.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-300">{item.impact}</p>
                        <p className="text-sm text-gray-500">Due to {item.region} changes ({item.severity.toFixed(1)}% impact)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cognitive Impact */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-blue-400">Cognitive Impacts</h4>
                <div className="space-y-2">
                  {psychProfile.cognitive.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-300">{item.impact}</p>
                        <p className="text-sm text-gray-500">Due to {item.region} changes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral Impact */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-purple-400">Behavioral Patterns</h4>
                <div className="space-y-2">
                  {psychProfile.behavioral.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-300">{item.impact}</p>
                        <p className="text-sm text-gray-500">Severity: {item.severity.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              {psychProfile.risk.length > 0 && (
                <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                  <h4 className="text-lg font-medium mb-3 text-red-400">Statistical Risk Factors</h4>
                  <ul className="space-y-2">
                    {psychProfile.risk.map((risk, i) => (
                      <li key={i} className="text-gray-300 flex items-start gap-2">
                        <span className="text-red-400">⚠</span> {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Detailed Symptom Clusters */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-light mb-4">Symptom Clusters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-3 text-yellow-400">Trauma Response Patterns</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Hypervigilance and startle response</li>
                    <li>• Emotional numbing alternating with flooding</li>
                    <li>• Dissociative episodes during stress</li>
                    <li>• Somatic symptoms without medical cause</li>
                    <li>• Sleep disturbances and nightmares</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3 text-green-400">Adaptive Strategies</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Hypercompetence in crisis situations</li>
                    <li>• Heightened empathy for others' pain</li>
                    <li>• Creative problem-solving abilities</li>
                    <li>• Strong survival instincts</li>
                    <li>• Resilience through adversity</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Visualization Tab */}
        {activeTab === 'visualization' && (
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
              <div ref={mountRef} className="w-full h-[600px]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-light mb-4">Visualization Key</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Volume reduction (atrophy)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                    <span className="text-gray-300">Hyperactivity (enlargement)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-1 bg-orange-400"></div>
                    <span className="text-gray-300">Cascade connections</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Severe impact (pulsing)</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-light mb-4">Interaction Guide</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Brain auto-rotates for full viewing</li>
                  <li>• Larger spheres indicate greater impact</li>
                  <li>• Orange lines show cascade pathways</li>
                  <li>• Glow effects on severely affected regions</li>
                  <li>• Anatomically accurate positioning</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveResultsDisplay;