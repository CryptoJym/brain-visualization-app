import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export default function ProfessionalBrainVis({ brainImpacts = {} }) {
  const mountRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Professional brain regions based on neuroanatomical atlases
  // Using Desikan-Killiany atlas regions as reference
  const brainRegions = {
    // Frontal Lobe Regions
    'Superior Frontal': {
      position: [0, 4.5, 3.5],
      color: 0x4169e1,
      size: 2.5,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Executive Control',
        description: 'Higher-order executive functions, working memory, and attention control',
        trauma: 'Executive dysfunction, attention deficits, planning difficulties'
      }
    },
    'Rostral Middle Frontal': {
      position: [-3, 3.5, 4],
      color: 0x5179f1,
      size: 2.0,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Cognitive Control',
        description: 'Cognitive flexibility and abstract reasoning',
        trauma: 'Impaired cognitive flexibility and problem-solving'
      }
    },
    'Caudal Middle Frontal': {
      position: [-4, 2.5, 2],
      color: 0x6189ff,
      size: 1.8,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Motor Planning',
        description: 'Premotor cortex for movement planning',
        trauma: 'Motor planning and sequencing difficulties'
      }
    },
    'Pars Opercularis': {
      position: [-4.5, 1, 2],
      color: 0x7199ff,
      size: 1.2,
      atlas: 'Desikan-Killiany',
      info: {
        function: "Broca's Area",
        description: 'Speech production and language processing',
        trauma: 'Expressive language difficulties'
      }
    },
    'Pars Triangularis': {
      position: [-4, 1.5, 2.5],
      color: 0x81a9ff,
      size: 1.0,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Language Processing',
        description: 'Semantic and phonological processing',
        trauma: 'Language comprehension issues'
      }
    },
    'Pars Orbitalis': {
      position: [-3, 0.5, 4],
      color: 0x91b9ff,
      size: 0.9,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Emotional Language',
        description: 'Integration of emotion with language',
        trauma: 'Emotional expression difficulties'
      }
    },
    'Lateral Orbitofrontal': {
      position: [-2, -0.5, 4.5],
      color: 0xa1c9ff,
      size: 1.3,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Decision Making',
        description: 'Risk assessment and reward processing',
        trauma: 'Poor decision-making and impulse control'
      }
    },
    'Medial Orbitofrontal': {
      position: [0, -0.5, 4.8],
      color: 0xb1d9ff,
      size: 1.2,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Emotional Regulation',
        description: 'Emotional valuation and regulation',
        trauma: 'Emotional dysregulation and mood instability'
      }
    },
    'Precentral': {
      position: [-2, 2, 0],
      color: 0xc1e9ff,
      size: 2.0,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Primary Motor',
        description: 'Voluntary movement control',
        trauma: 'Motor control difficulties'
      }
    },
    'Paracentral': {
      position: [0, 3, 0],
      color: 0xd1f9ff,
      size: 1.5,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Sensorimotor Integration',
        description: 'Integration of sensory and motor functions',
        trauma: 'Sensorimotor coordination issues'
      }
    },
    
    // Temporal Lobe Regions
    'Superior Temporal': {
      position: [-5, 0, -1],
      color: 0xff4444,
      size: 2.0,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Auditory Processing',
        description: 'Primary auditory cortex and language comprehension',
        trauma: 'Auditory processing and language understanding deficits'
      }
    },
    'Middle Temporal': {
      position: [-5.5, -1.5, -1],
      color: 0xff5555,
      size: 1.8,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Semantic Memory',
        description: 'Word meaning and object recognition',
        trauma: 'Semantic memory and word-finding difficulties'
      }
    },
    'Inferior Temporal': {
      position: [-5, -2.5, -0.5],
      color: 0xff6666,
      size: 1.6,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Visual Recognition',
        description: 'Complex visual processing and face recognition',
        trauma: 'Face recognition and visual memory deficits'
      }
    },
    'Fusiform': {
      position: [-3.5, -3, -1],
      color: 0xff7777,
      size: 1.4,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Face Processing',
        description: 'Specialized for face and object recognition',
        trauma: 'Prosopagnosia (face blindness) and object recognition issues'
      }
    },
    'Transverse Temporal': {
      position: [-4, 0.5, -0.5],
      color: 0xff8888,
      size: 0.8,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Primary Auditory',
        description: "Heschl's gyrus - primary auditory processing",
        trauma: 'Basic auditory processing disruption'
      }
    },
    'Entorhinal': {
      position: [-2.5, -2, 1],
      color: 0xff9999,
      size: 1.0,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Memory Gateway',
        description: 'Gateway between hippocampus and neocortex',
        trauma: 'Memory encoding and consolidation deficits'
      }
    },
    'Temporal Pole': {
      position: [-3, -1, 3],
      color: 0xffaaaa,
      size: 1.2,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Social Cognition',
        description: 'Social and emotional processing',
        trauma: 'Social cognition and theory of mind deficits'
      }
    },
    'Parahippocampal': {
      position: [-3, -2.5, 0],
      color: 0xffbbbb,
      size: 1.3,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Spatial Memory',
        description: 'Scene recognition and spatial context',
        trauma: 'Spatial memory and navigation difficulties'
      }
    },
    
    // Parietal Lobe Regions
    'Superior Parietal': {
      position: [0, 3.5, -3],
      color: 0x44ff44,
      size: 2.2,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Spatial Processing',
        description: 'Spatial attention and visuomotor integration',
        trauma: 'Spatial neglect and coordination issues'
      }
    },
    'Inferior Parietal': {
      position: [-3, 2.5, -3.5],
      color: 0x55ff55,
      size: 2.0,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Multimodal Integration',
        description: 'Integration of sensory information',
        trauma: 'Sensory integration and mathematical difficulties'
      }
    },
    'Supramarginal': {
      position: [-4.5, 1.5, -2],
      color: 0x66ff66,
      size: 1.5,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Phonological Processing',
        description: 'Phonological loop and language processing',
        trauma: 'Reading and phonological awareness deficits'
      }
    },
    'Postcentral': {
      position: [-2, 2, -1.5],
      color: 0x77ff77,
      size: 2.0,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Primary Somatosensory',
        description: 'Touch, pressure, and proprioception',
        trauma: 'Sensory processing and body awareness issues'
      }
    },
    'Precuneus': {
      position: [0, 2.5, -4],
      color: 0x88ff88,
      size: 1.8,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Self-Awareness',
        description: 'Consciousness and self-referential processing',
        trauma: 'Self-awareness and consciousness alterations'
      }
    },
    
    // Occipital Lobe Regions
    'Lateral Occipital': {
      position: [-3, 0, -5],
      color: 0xffff44,
      size: 1.8,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Object Recognition',
        description: 'Complex visual object processing',
        trauma: 'Object recognition and visual agnosia'
      }
    },
    'Lingual': {
      position: [-1.5, -1.5, -4.5],
      color: 0xffff55,
      size: 1.6,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Visual Processing',
        description: 'Color and letter recognition',
        trauma: 'Color perception and reading difficulties'
      }
    },
    'Cuneus': {
      position: [0, 1, -5.5],
      color: 0xffff66,
      size: 1.4,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Basic Vision',
        description: 'Primary visual processing',
        trauma: 'Visual field defects'
      }
    },
    'Pericalcarine': {
      position: [0, 0, -6],
      color: 0xffff77,
      size: 1.2,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Primary Visual',
        description: 'V1 - basic visual feature detection',
        trauma: 'Cortical blindness and visual processing disruption'
      }
    },
    
    // Cingulate Regions
    'Rostral Anterior Cingulate': {
      position: [0, 1, 3],
      color: 0xff69b4,
      size: 1.3,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Emotional Regulation',
        description: 'Emotion processing and regulation',
        trauma: 'Emotional dysregulation and mood disorders'
      }
    },
    'Caudal Anterior Cingulate': {
      position: [0, 1.5, 1.5],
      color: 0xff79c4,
      size: 1.2,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Conflict Monitoring',
        description: 'Error detection and conflict resolution',
        trauma: 'Attention and error monitoring deficits'
      }
    },
    'Posterior Cingulate': {
      position: [0, 1, -2],
      color: 0xff89d4,
      size: 1.4,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Self-Referential',
        description: 'Autobiographical memory and self-awareness',
        trauma: 'Memory retrieval and self-referential processing issues'
      }
    },
    'Isthmus Cingulate': {
      position: [0, 0, -3],
      color: 0xff99e4,
      size: 1.0,
      atlas: 'Desikan-Killiany',
      info: {
        function: 'Memory Integration',
        description: 'Connection between memory systems',
        trauma: 'Memory integration deficits'
      }
    },
    
    // Subcortical Structures
    'Hippocampus': {
      position: [-3, -1.5, 0],
      color: 0x32cd32,
      size: 1.2,
      atlas: 'Subcortical',
      info: {
        function: 'Memory Formation',
        description: 'Episodic memory encoding and spatial navigation',
        trauma: 'Memory formation deficits, PTSD-related volume reduction'
      }
    },
    'Amygdala': {
      position: [-2.5, -1, 1.5],
      color: 0xff4500,
      size: 1.0,
      atlas: 'Subcortical',
      info: {
        function: 'Fear & Emotion',
        description: 'Fear processing and emotional memory',
        trauma: 'Hypervigilance, anxiety, emotional dysregulation'
      }
    },
    'Thalamus': {
      position: [0, 0, 0],
      color: 0x9370db,
      size: 1.3,
      atlas: 'Subcortical',
      info: {
        function: 'Sensory Relay',
        description: 'Sensory information gateway to cortex',
        trauma: 'Sensory processing disruption, attention deficits'
      }
    },
    'Caudate': {
      position: [-1.5, 0.5, 0.5],
      color: 0x4682b4,
      size: 1.0,
      atlas: 'Subcortical',
      info: {
        function: 'Reward & Habits',
        description: 'Reward processing and habit formation',
        trauma: 'Addiction vulnerability, compulsive behaviors'
      }
    },
    'Putamen': {
      position: [-2.5, 0, 0],
      color: 0x5692c4,
      size: 1.1,
      atlas: 'Subcortical',
      info: {
        function: 'Motor Control',
        description: 'Motor skill learning and execution',
        trauma: 'Motor learning difficulties, movement disorders'
      }
    },
    'Globus Pallidus': {
      position: [-2, 0, -0.5],
      color: 0x6702d4,
      size: 0.8,
      atlas: 'Subcortical',
      info: {
        function: 'Motor Regulation',
        description: 'Regulation of voluntary movement',
        trauma: 'Movement regulation issues'
      }
    },
    'Nucleus Accumbens': {
      position: [-1, -0.5, 1.5],
      color: 0xffa500,
      size: 0.6,
      atlas: 'Subcortical',
      info: {
        function: 'Reward Center',
        description: 'Motivation and reward processing',
        trauma: 'Anhedonia, addiction vulnerability'
      }
    },
    
    // Brainstem
    'Midbrain': {
      position: [0, -2, -0.5],
      color: 0xffd700,
      size: 1.0,
      atlas: 'Brainstem',
      info: {
        function: 'Arousal & Reflexes',
        description: 'Sleep-wake cycle and reflexive responses',
        trauma: 'Sleep disturbances, hyperarousal'
      }
    },
    'Pons': {
      position: [0, -2.5, -1],
      color: 0xffe720,
      size: 0.9,
      atlas: 'Brainstem',
      info: {
        function: 'Vital Functions',
        description: 'Breathing, sleep, and facial sensation',
        trauma: 'Sleep disorders, sensory disruption'
      }
    },
    'Medulla': {
      position: [0, -3, -0.5],
      color: 0xfff740,
      size: 0.8,
      atlas: 'Brainstem',
      info: {
        function: 'Autonomic Control',
        description: 'Heart rate, breathing, and reflexes',
        trauma: 'Autonomic dysregulation, stress response alterations'
      }
    },
    
    // Cerebellum
    'Cerebellar Cortex': {
      position: [0, -3, -3.5],
      color: 0xdda0dd,
      size: 2.5,
      atlas: 'Cerebellum',
      info: {
        function: 'Coordination',
        description: 'Motor coordination and balance',
        trauma: 'Coordination difficulties, balance issues'
      }
    },
    'Cerebellar Vermis': {
      position: [0, -2.5, -3],
      color: 0xedb0ed,
      size: 1.0,
      atlas: 'Cerebellum',
      info: {
        function: 'Balance & Posture',
        description: 'Midline motor control',
        trauma: 'Postural instability, gait issues'
      }
    }
  };
  
  useEffect(() => {
    console.log('ProfessionalBrainVis: Starting initialization');
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (!mountRef.current) {
      console.error('ProfessionalBrainVis: Mount ref is null');
      return;
    }
    
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported');
      setIsLoading(false);
      return;
    }
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    scene.fog = new THREE.Fog(0x000814, 10, 50);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, isMobile ? 22 : 18);
    
    // Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      mountRef.current.appendChild(renderer.domElement);
      console.log('ProfessionalBrainVis: WebGL renderer created successfully');
    } catch (error) {
      console.error('ProfessionalBrainVis: Failed to create WebGL renderer:', error);
      setIsLoading(false);
      return;
    }
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);
    
    const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
    rimLight.position.set(-5, 0, -5);
    scene.add(rimLight);
    
    const backLight = new THREE.DirectionalLight(0x8844aa, 0.2);
    backLight.position.set(0, -5, -5);
    scene.add(backLight);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotationSpeed = 0.8;
    controls.maxDistance = 35;
    controls.minDistance = 10;
    controls.enablePan = false;
    
    // Brain container
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);
    
    // Add a test cube to verify rendering works
    const testGeometry = new THREE.BoxGeometry(2, 2, 2);
    const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(0, 0, 0);
    scene.add(testCube);
    
    // Professional brain mesh (simplified representation)
    const brainGeometry = new THREE.IcosahedronGeometry(6, 3);
    const positions = brainGeometry.attributes.position;
    
    // Deform to look more brain-like
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Make it wider in x, compress in y slightly
      positions.setX(i, x * 1.3);
      positions.setY(i, y * 0.9);
      positions.setZ(i, z * 1.1);
      
      // Add some noise for organic look
      const noise = (Math.random() - 0.5) * 0.3;
      positions.setX(i, positions.getX(i) + noise);
      positions.setY(i, positions.getY(i) + noise * 0.8);
      positions.setZ(i, positions.getZ(i) + noise * 0.9);
    }
    
    brainGeometry.computeVertexNormals();
    
    const brainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffdddd,
      transparent: true,
      opacity: 0.08,
      roughness: 0.8,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainMesh.castShadow = true;
    brainMesh.receiveShadow = true;
    brainGroup.add(brainMesh);
    
    // Add brain hemispheres indicator
    const hemisphereGeometry = new THREE.PlaneGeometry(0.1, 12);
    const hemisphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    const hemisphereDivider = new THREE.Mesh(hemisphereGeometry, hemisphereMaterial);
    hemisphereDivider.rotation.y = Math.PI / 2;
    brainGroup.add(hemisphereDivider);
    
    // Create brain regions
    const regionMeshes = [];
    const regionGroups = {};
    console.log('ProfessionalBrainVis: Creating brain regions, total:', Object.keys(brainRegions).length);
    
    Object.entries(brainRegions).forEach(([name, region]) => {
      const isAffected = brainImpacts[name];
      
      // Create region mesh
      const geometry = new THREE.SphereGeometry(region.size * 0.4, 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: isAffected ? 0xff3366 : region.color,
        emissive: isAffected ? 0xff0044 : region.color,
        emissiveIntensity: isAffected ? 0.4 : 0.15,
        metalness: 0.2,
        roughness: 0.6,
        transparent: true,
        opacity: isAffected ? 0.85 : 0.65,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...region.position);
      mesh.userData = { name, ...region, isAffected };
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Add to atlas group
      if (!regionGroups[region.atlas]) {
        regionGroups[region.atlas] = new THREE.Group();
        brainGroup.add(regionGroups[region.atlas]);
      }
      regionGroups[region.atlas].add(mesh);
      regionMeshes.push(mesh);
      
      // Add pulse animation for affected regions
      if (isAffected) {
        mesh.userData.pulse = 0;
      }
    });
    
    console.log('ProfessionalBrainVis: Created region meshes:', regionMeshes.length);
    
    // Add anatomical planes for reference
    const planeGeometry = new THREE.PlaneGeometry(15, 15);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4444ff,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      visible: false
    });
    
    const sagittalPlane = new THREE.Mesh(planeGeometry, planeMaterial.clone());
    sagittalPlane.rotation.y = Math.PI / 2;
    sagittalPlane.name = 'sagittal';
    scene.add(sagittalPlane);
    
    const coronalPlane = new THREE.Mesh(planeGeometry, planeMaterial.clone());
    coronalPlane.name = 'coronal';
    scene.add(coronalPlane);
    
    const axialPlane = new THREE.Mesh(planeGeometry, planeMaterial.clone());
    axialPlane.rotation.x = Math.PI / 2;
    axialPlane.name = 'axial';
    scene.add(axialPlane);
    
    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh = null;
    let selectedMesh = null;
    
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);
      
      // Reset previous hover
      if (hoveredMesh && hoveredMesh !== selectedMesh) {
        hoveredMesh.scale.setScalar(1);
        hoveredMesh.material.emissiveIntensity = hoveredMesh.userData.isAffected ? 0.4 : 0.15;
      }
      
      // Apply hover effect
      if (intersects.length > 0) {
        hoveredMesh = intersects[0].object;
        if (hoveredMesh !== selectedMesh) {
          hoveredMesh.scale.setScalar(1.15);
          hoveredMesh.material.emissiveIntensity = 0.6;
        }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredMesh = null;
        renderer.domElement.style.cursor = 'grab';
      }
    };
    
    const onClick = (event) => {
      if (hoveredMesh) {
        // Reset previous selection
        if (selectedMesh && selectedMesh !== hoveredMesh) {
          selectedMesh.scale.setScalar(1);
          selectedMesh.material.emissiveIntensity = selectedMesh.userData.isAffected ? 0.4 : 0.15;
        }
        
        selectedMesh = hoveredMesh;
        setSelectedRegion(hoveredMesh.userData.name);
        hoveredMesh.scale.setScalar(1.25);
        hoveredMesh.material.emissiveIntensity = 0.8;
        
        if (isMobile) {
          setShowPanel(true);
        }
      }
    };
    
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.style.cursor = 'grab';
    
    // Touch support
    renderer.domElement.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);
      
      if (intersects.length > 0) {
        onClick({ target: intersects[0].object });
      }
    });
    
    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      controls.update();
      
      // Subtle brain rotation
      brainGroup.rotation.y = Math.sin(time * 0.1) * 0.02;
      
      // Pulse affected regions
      regionMeshes.forEach(mesh => {
        if (mesh.userData.isAffected && mesh.userData.pulse !== undefined) {
          mesh.userData.pulse += 0.02;
          const pulseFactor = 1 + Math.sin(mesh.userData.pulse) * 0.05;
          if (mesh !== selectedMesh && mesh !== hoveredMesh) {
            mesh.scale.setScalar(pulseFactor);
          }
        }
      });
      
      renderer.render(scene, camera);
    };
    
    // Start animation immediately
    console.log('ProfessionalBrainVis: Starting animation loop');
    animate();
    
    // Simulate loading
    let progress = 0;
    const loadingInterval = setInterval(() => {
      progress += 15; // More predictable increment
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadingInterval);
        setTimeout(() => {
          console.log('ProfessionalBrainVis: Loading complete, hiding loading screen');
          setIsLoading(false);
        }, 300);
      }
      setLoadingProgress(progress);
    }, 100); // Faster updates
    
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
      console.log('ProfessionalBrainVis: Cleanup running');
      clearInterval(loadingInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', checkMobile);
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onClick);
        if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      regionMeshes.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });
      if (brainGeometry) brainGeometry.dispose();
      if (brainMaterial) brainMaterial.dispose();
    };
  }, [brainImpacts, isMobile]);
  
  const InfoPanel = () => {
    const region = selectedRegion ? brainRegions[selectedRegion] : null;
    
    return (
      <div className={`
        ${isMobile ? 'fixed inset-x-0 bottom-0 rounded-t-3xl' : 'absolute top-20 right-6 w-96 rounded-2xl'}
        bg-gray-900/95 backdrop-blur-2xl p-6 border border-white/10
        transform transition-all duration-500 ease-out
        ${isMobile && !showPanel ? 'translate-y-full' : 'translate-y-0'}
        ${!selectedRegion && !isMobile ? 'opacity-70' : ''}
      `}>
        {selectedRegion && region ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-light text-white">{selectedRegion}</h2>
                <p className="text-xs text-gray-500 mt-1">Atlas: {region.atlas}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedRegion(null);
                  setShowPanel(false);
                }}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="text-blue-400 font-medium mb-1 text-sm">Primary Function</h3>
                <p className="text-white">{region.info.function}</p>
              </div>
              
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="text-green-400 font-medium mb-1 text-sm">Neuroanatomy</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {region.info.description}
                </p>
              </div>
              
              {region.info.trauma && (
                <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <h3 className="text-orange-400 font-medium mb-1 text-sm">Trauma Impact</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {region.info.trauma}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-light text-white mb-2">
              Professional Brain Atlas
            </h2>
            <p className="text-gray-400 text-sm">
              {isMobile ? 'Tap' : 'Click'} on any region to explore
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Based on Desikan-Killiany parcellation
            </p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="w-full h-screen relative bg-gradient-radial from-gray-900 via-black to-black overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
                style={{
                  animationDuration: '1.5s'
                }}
              ></div>
              <div className="absolute inset-2 border-4 border-blue-500/10 rounded-full"></div>
              <div 
                className="absolute inset-2 border-4 border-transparent border-b-blue-400 rounded-full animate-spin"
                style={{
                  animationDuration: '2s',
                  animationDirection: 'reverse'
                }}
              ></div>
            </div>
            <div className="mb-4">
              <div className="text-2xl font-light text-white mb-2">
                Loading Brain Atlas
              </div>
              <div className="text-sm text-gray-400">
                Preparing {Object.keys(brainRegions).length} anatomical regions
              </div>
            </div>
            <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {Math.round(loadingProgress)}%
            </div>
          </div>
        </div>
      )}
      
      {/* 3D Visualization Container */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Professional Header */}
      <div className="absolute top-6 left-6 max-w-md">
        <h1 className="text-2xl md:text-3xl font-extralight text-white mb-2 tracking-wide">
          Neuroanatomical Atlas
        </h1>
        <p className="text-sm text-gray-500 font-light">
          {Object.keys(brainImpacts).length > 0 
            ? `${Object.keys(brainImpacts).length} regions affected by ACE exposure`
            : 'Professional brain parcellation system'
          }
        </p>
      </div>
      
      {/* Atlas Legend */}
      <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="text-xs space-y-1">
          <div className="font-medium text-white mb-1">Brain Atlases</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-400">Cortical (Desikan-Killiany)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-400">Subcortical Structures</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-400">Brainstem</span>
          </div>
        </div>
      </div>
      
      {/* Orientation indicator */}
      <div className="absolute bottom-6 right-6 text-xs text-gray-500">
        <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
          <span>Anterior</span>
          <span>•</span>
          <span>Posterior</span>
        </div>
      </div>
      
      {/* Info Panel */}
      <InfoPanel />
    </div>
  );
}