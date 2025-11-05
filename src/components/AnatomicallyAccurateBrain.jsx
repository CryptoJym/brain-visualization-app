import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  EEG_10_20_POSITIONS, 
  EEG_10_10_POSITIONS,
  BRAIN_SURFACE_PARAMS,
  generateBrainSurface,
  getRegionColor 
} from '../utils/brainMeshData';

export default function AnatomicallyAccurateBrain() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Initializing...');
  const [error, setError] = useState(null);
  const [selectedElectrode, setSelectedElectrode] = useState(null);
  const [brainOpacity, setBrainOpacity] = useState(1.0);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const currentMount = mountRef.current;
    let animationId;
    
    async function init() {
      try {
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        // Camera - positioned for standard neurological view
        const camera = new THREE.PerspectiveCamera(
          45,
          currentMount.clientWidth / currentMount.clientHeight,
          0.1,
          2000
        );
        camera.position.set(0, 0, 300);
        camera.lookAt(0, 0, 0);

        // Renderer with high quality settings
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          logarithmicDepthBuffer: true,
          powerPreference: "high-performance"
        });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        currentMount.appendChild(renderer.domElement);

        // Controls - neurological convention (right is right)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.zoomSpeed = 1.0;
        controls.minDistance = 150;
        controls.maxDistance = 500;

        // Professional lighting for medical visualization
        setupMedicalLighting(scene);

        // Load brain surfaces
        setLoadingStage('Loading brain surfaces...');
        const brainMeshes = await loadBrainSurfaces(scene);

        // Load electrode positions
        setLoadingStage('Positioning EEG electrodes...');
        const electrodes = await setupEEGElectrodes(scene, showLabels);

        // Setup interactions
        setupInteractions(renderer, camera, scene, electrodes);

        // Animation loop
        function animate() {
          animationId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        }

        // Handle resize
        function handleResize() {
          camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        }
        window.addEventListener('resize', handleResize);

        animate();
        setIsLoading(false);

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationId);
          renderer.dispose();
          controls.dispose();
        };
      } catch (err) {
        console.error('Error initializing brain viewer:', err);
        setError(err.message);
        setIsLoading(false);
      }
    }

    init();
  }, [showLabels]);

  function setupMedicalLighting(scene) {
    // Clear existing lights
    scene.children.filter(child => child instanceof THREE.Light).forEach(light => {
      scene.remove(light);
    });

    // Ambient light for base visibility
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // Key light - main illumination from above
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
    keyLight.position.set(0, 200, 100);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 1000;
    keyLight.shadow.camera.left = -200;
    keyLight.shadow.camera.right = 200;
    keyLight.shadow.camera.top = 200;
    keyLight.shadow.camera.bottom = -200;
    scene.add(keyLight);

    // Fill light - soften shadows
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-100, 0, 100);
    scene.add(fillLight);

    // Back light - rim lighting for depth
    const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
    backLight.position.set(0, -100, -100);
    scene.add(backLight);

    // Hemisphere light for natural ambience
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.3);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);
  }

  async function loadBrainSurfaces(scene) {
    const brainGroup = new THREE.Group();
    brainGroup.name = 'BrainSurfaces';

    // Generate anatomically accurate brain surface
    const leftSurface = generateBrainSurface('left');
    const rightSurface = generateBrainSurface('right');

    // Material for brain surface - realistic gray/pink matter appearance
    const brainMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.9, 0.85, 0.85), // Pinkish-gray brain tissue
      metalness: 0.0,
      roughness: 0.4,
      clearcoat: 0.2,
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: brainOpacity
    });

    // Create left hemisphere
    const leftGeometry = new THREE.BufferGeometry();
    leftGeometry.setAttribute('position', new THREE.BufferAttribute(leftSurface.vertices, 3));
    leftGeometry.setAttribute('normal', new THREE.BufferAttribute(leftSurface.normals, 3));
    leftGeometry.setIndex(new THREE.BufferAttribute(leftSurface.faces, 1));
    leftGeometry.computeBoundingSphere();
    
    const leftHemisphere = new THREE.Mesh(leftGeometry, brainMaterial.clone());
    leftHemisphere.name = 'LeftHemisphere';
    leftHemisphere.position.x = -2; // Small gap between hemispheres
    leftHemisphere.castShadow = true;
    leftHemisphere.receiveShadow = true;
    brainGroup.add(leftHemisphere);

    // Create right hemisphere
    const rightGeometry = new THREE.BufferGeometry();
    rightGeometry.setAttribute('position', new THREE.BufferAttribute(rightSurface.vertices, 3));
    rightGeometry.setAttribute('normal', new THREE.BufferAttribute(rightSurface.normals, 3));
    rightGeometry.setIndex(new THREE.BufferAttribute(rightSurface.faces, 1));
    rightGeometry.computeBoundingSphere();
    
    const rightHemisphere = new THREE.Mesh(rightGeometry, brainMaterial.clone());
    rightHemisphere.name = 'RightHemisphere';
    rightHemisphere.position.x = 2;
    rightHemisphere.castShadow = true;
    rightHemisphere.receiveShadow = true;
    brainGroup.add(rightHemisphere);

    // Add anatomical structures
    addAnatomicalStructures(brainGroup);

    scene.add(brainGroup);
    return brainGroup;
  }


  function addAnatomicalStructures(brainGroup) {
    // Add major anatomical landmarks for reference
    
    // Corpus Callosum (connects hemispheres)
    const ccGeometry = new THREE.BoxGeometry(4, 10, 30);
    const ccMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      opacity: 0.7,
      transparent: true
    });
    const corpusCallosum = new THREE.Mesh(ccGeometry, ccMaterial);
    corpusCallosum.position.set(0, -10, 0);
    corpusCallosum.name = 'CorpusCallosum';
    brainGroup.add(corpusCallosum);

    // Brain Stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -40, 0),
      new THREE.Vector3(0, -50, -5),
      new THREE.Vector3(0, -60, -10),
      new THREE.Vector3(0, -70, -12)
    ]);
    
    const stemGeometry = new THREE.TubeGeometry(stemCurve, 20, 8, 8, false);
    const stemMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xccaaaa,
      roughness: 0.5
    });
    const brainStem = new THREE.Mesh(stemGeometry, stemMaterial);
    brainStem.name = 'BrainStem';
    brainGroup.add(brainStem);

    // Cerebellum
    const cerebellumGeometry = new THREE.SphereGeometry(35, 32, 24);
    cerebellumGeometry.scale(1.5, 0.8, 1);
    const cerebellumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xddbbbb,
      roughness: 0.4
    });
    const cerebellum = new THREE.Mesh(cerebellumGeometry, cerebellumMaterial);
    cerebellum.position.set(0, -45, -40);
    cerebellum.name = 'Cerebellum';
    brainGroup.add(cerebellum);
  }

  async function setupEEGElectrodes(scene, showLabels) {
    const electrodeGroup = new THREE.Group();
    electrodeGroup.name = 'EEGElectrodes';

    // Use anatomically accurate 10-20 positions

    // Create electrodes
    Object.entries(EEG_10_20_POSITIONS).forEach(([name, data]) => {
      // Electrode sphere
      const electrodeGeometry = new THREE.SphereGeometry(3, 16, 16);
      const electrodeMaterial = new THREE.MeshPhysicalMaterial({
        color: getRegionColor(data.region),
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0
      });
      
      const electrode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
      electrode.position.set(...data.coords);
      electrode.castShadow = true;
      electrode.userData = {
        name,
        region: data.region,
        description: data.description,
        fullName: data.fullName,
        type: 'electrode'
      };
      
      electrodeGroup.add(electrode);

      // Wire to scalp
      const wireGeometry = new THREE.CylinderGeometry(0.5, 0.5, 10);
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444
      });
      const wire = new THREE.Mesh(wireGeometry, wireMaterial);
      wire.position.copy(electrode.position);
      wire.position.y += 5;
      electrodeGroup.add(wire);

      // Label
      if (showLabels) {
        const label = createElectrodeLabel(name, data.coords, getRegionColor(data.region));
        electrodeGroup.add(label);
      }
    });

    scene.add(electrodeGroup);
    return electrodeGroup;
  }

  function createElectrodeLabel(text, position, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;
    
    // Background
    context.fillStyle = 'rgba(0,0,0,0.9)';
    context.roundRect(0, 0, 128, 64, 16);
    context.fill();
    
    // Border
    context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.lineWidth = 2;
    context.roundRect(2, 2, 124, 60, 14);
    context.stroke();
    
    // Text
    context.font = 'Bold 28px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 64, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(position[0], position[1] + 8, position[2]);
    sprite.scale.set(16, 8, 1);
    
    return sprite;
  }

  function setupInteractions(renderer, camera, scene, electrodeGroup) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onClick(event) {
      raycaster.setFromCamera(mouse, camera);
      
      const electrodes = electrodeGroup.children.filter(child => 
        child.type === 'Mesh' && child.userData.type === 'electrode'
      );
      
      const intersects = raycaster.intersectObjects(electrodes);
      
      if (intersects.length > 0) {
        const electrode = intersects[0].object;
        setSelectedElectrode({
          name: electrode.userData.name,
          region: electrode.userData.region,
          description: electrode.userData.description
        });
      }
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
  }

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
    <div className="relative w-full h-screen bg-black">
      <div ref={mountRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center text-white">
            <div className="mb-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h3 className="text-xl mb-2">{loadingStage}</h3>
            <div className="w-64 bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-xl rounded-lg p-4 text-white border border-white/10">
        <h1 className="text-2xl font-light mb-1">Anatomically Accurate Brain</h1>
        <p className="text-sm text-gray-400">EEG 10-20 System Visualization</p>
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-xl rounded-lg p-4 text-white border border-white/10 space-y-3">
        <div>
          <label className="text-sm text-gray-400">Brain Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={brainOpacity}
            onChange={(e) => {
              setBrainOpacity(parseFloat(e.target.value));
              // Update brain opacity
              if (sceneRef.current) {
                const brain = sceneRef.current.getObjectByName('BrainSurfaces');
                if (brain) {
                  brain.traverse((child) => {
                    if (child.isMesh && child.material) {
                      child.material.opacity = parseFloat(e.target.value);
                    }
                  });
                }
              }
            }}
            className="w-full mt-1"
          />
        </div>
        
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="form-checkbox"
            />
            <span className="text-sm">Show electrode labels</span>
          </label>
        </div>
      </div>
      
      {/* Selected electrode info */}
      {selectedElectrode && (
        <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-xl rounded-lg p-4 text-white border border-white/10">
          <h3 className="text-lg font-medium mb-2">Selected Electrode</h3>
          <div className="space-y-1">
            <p className="text-2xl text-blue-400">{selectedElectrode.name}</p>
            <p className="text-sm text-gray-400 capitalize">Region: {selectedElectrode.region}</p>
            <p className="text-xs text-gray-500">{selectedElectrode.description}</p>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-xl rounded-lg p-4 text-white border border-white/10">
        <h3 className="text-sm font-medium mb-2">Electrode Regions</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Frontal (Fp, F)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Central (C)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Temporal (T)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Parietal (P)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Occipital (O)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Reference (A)</span>
          </div>
        </div>
      </div>
    </div>
  );
}