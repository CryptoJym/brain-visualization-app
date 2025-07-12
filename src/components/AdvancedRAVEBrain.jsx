import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { loadRAVELibrary, checkRAVECapabilities } from '../utils/raveLoader';
import { BrainDataManager } from '../utils/brainDataManager';

export default function AdvancedRAVEBrain({ 
  eegData = null,
  showElectrodes = true,
  surfaceType = 'pial',
  hemisphere = 'both',
  highlightRegions = [],
  onRegionClick = null,
  showSubcortical = true,
  autoRotate = true
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const dataManagerRef = useRef(null);
  const surfaceMeshesRef = useRef({});
  const electrodeMeshesRef = useRef({});
  
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [viewerCapabilities, setViewerCapabilities] = useState(null);
  const [currentSurfaceType, setCurrentSurfaceType] = useState(surfaceType);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeViewer();
    
    return () => {
      // Cleanup
      if (viewerRef.current && viewerRef.current.dispose) {
        viewerRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    // Update surface visibility when surfaceType changes
    if (surfaceMeshesRef.current && !loading) {
      updateSurfaceVisibility(currentSurfaceType);
    }
  }, [currentSurfaceType, loading]);

  useEffect(() => {
    // Update electrode data visualization
    if (eegData && electrodeMeshesRef.current && !loading) {
      updateElectrodeVisualization(eegData);
    }
  }, [eegData, loading]);

  async function initializeViewer() {
    try {
      // Stage 1: Load RAVE library
      setLoadingStage('Loading RAVE three-brain library...');
      await loadRAVELibrary();
      
      const capabilities = checkRAVECapabilities();
      setViewerCapabilities(capabilities);
      console.log('RAVE Capabilities:', capabilities);

      // Stage 2: Initialize viewer
      setLoadingStage('Initializing 3D viewer...');
      const viewer = new window.threeBrain.ViewerApp({
        $wrapper: containerRef.current,
        width: containerRef.current.clientWidth || window.innerWidth,
        height: containerRef.current.clientHeight || window.innerHeight,
        background: 0x050505,
        cameraPosition: [150, 100, 150],
        controllerPosition: [0, 0, 0],
        controls: {
          autoRotate: autoRotate,
          autoRotateSpeed: 0.3,
          enableDamping: true,
          dampingFactor: 0.25,
          rotateSpeed: 0.5,
          zoomSpeed: 1.2,
          panSpeed: 0.8
        }
      });
      
      viewerRef.current = viewer;

      // Stage 3: Load brain data
      setLoadingStage('Loading anatomical brain data...');
      const dataManager = new BrainDataManager();
      dataManagerRef.current = dataManager;
      
      const surfacesLoaded = await dataManager.loadFreeSurferSurfaces();
      await dataManager.loadSubcorticalStructures();

      // Stage 4: Add brain surfaces
      setLoadingStage('Rendering brain surfaces...');
      addBrainSurfaces(viewer, dataManager);

      // Stage 5: Add subcortical structures
      if (showSubcortical) {
        setLoadingStage('Adding subcortical structures...');
        addSubcorticalStructures(viewer, dataManager);
      }

      // Stage 6: Add electrodes
      if (showElectrodes) {
        setLoadingStage('Placing EEG electrodes...');
        addEEGElectrodes(viewer, dataManager);
      }

      // Stage 7: Setup interactions
      setLoadingStage('Setting up interactions...');
      setupInteractions(viewer);

      // Stage 8: Add lighting
      setupAdvancedLighting(viewer);

      // Done!
      setLoading(false);
      setLoadingStage('');
      
      // Start rendering
      viewer.render();
      
      // Setup resize handler
      setupResizeHandler(viewer);

    } catch (error) {
      console.error('Failed to initialize viewer:', error);
      setError(error.message);
      setLoading(false);
    }
  }

  function addBrainSurfaces(viewer, dataManager) {
    const scene = viewer.canvas.scene;
    const surfaceGroup = new THREE.Group();
    surfaceGroup.name = 'BrainSurfaces';

    Object.entries(dataManager.surfaces).forEach(([name, surface]) => {
      if (!surface.isSubcortical) {
        let mesh;
        
        if (surface.vertices && surface.faces) {
          // Create mesh from loaded data
          const geometry = createGeometryFromSurface(surface);
          const material = dataManager.materials[surface.type].clone();
          mesh = new THREE.Mesh(geometry, material);
        } else if (surface.geometry) {
          // Use pre-created geometry
          const material = dataManager.materials[surface.type].clone();
          mesh = new THREE.Mesh(surface.geometry, material);
        }
        
        if (mesh) {
          mesh.userData = {
            type: 'cortical',
            hemisphere: surface.hemisphere,
            surfaceType: surface.type,
            name: name
          };
          
          // Set initial visibility
          mesh.visible = surface.type === currentSurfaceType;
          
          surfaceGroup.add(mesh);
          surfaceMeshesRef.current[name] = mesh;
        }
      }
    });

    scene.add(surfaceGroup);
  }

  function addSubcorticalStructures(viewer, dataManager) {
    const scene = viewer.canvas.scene;
    const subcorticalGroup = new THREE.Group();
    subcorticalGroup.name = 'SubcorticalStructures';

    Object.entries(dataManager.surfaces).forEach(([name, structure]) => {
      if (structure.isSubcortical) {
        const material = dataManager.materials.subcortical[structure.type].clone();
        const mesh = new THREE.Mesh(structure.geometry, material);
        
        // Apply transformations
        mesh.position.set(...structure.position);
        mesh.scale.set(...structure.scale);
        if (structure.rotation) {
          mesh.rotation.set(...structure.rotation);
        }
        
        mesh.userData = {
          type: 'subcortical',
          structureType: structure.type,
          name: name
        };
        
        subcorticalGroup.add(mesh);
        surfaceMeshesRef.current[name] = mesh;
      }
    });

    scene.add(subcorticalGroup);
  }

  function addEEGElectrodes(viewer, dataManager) {
    const scene = viewer.canvas.scene;
    const electrodeGroup = new THREE.Group();
    electrodeGroup.name = 'EEG_Electrodes';
    
    const electrodes = dataManager.load10_20Electrodes();

    Object.entries(electrodes).forEach(([name, electrode]) => {
      // Create electrode sphere
      const geometry = new THREE.SphereGeometry(3, 16, 16);
      const material = new THREE.MeshPhysicalMaterial({
        color: electrode.color || 0xffd700,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0,
        emissive: electrode.color || 0xffd700,
        emissiveIntensity: 0.2
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...electrode.position);
      mesh.userData = {
        type: 'electrode',
        name: name,
        group: electrode.group,
        originalPosition: [...electrode.position]
      };
      
      electrodeGroup.add(mesh);
      electrodeMeshesRef.current[name] = mesh;
      
      // Add label sprite
      const label = createTextSprite(name, electrode.color);
      label.position.set(...electrode.position);
      label.position.y += 5;
      electrodeGroup.add(label);
    });
    
    scene.add(electrodeGroup);
  }

  function createTextSprite(text, color = 0xffffff) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Create gradient background
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.9)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    
    context.fillStyle = gradient;
    context.roundRect(10, 40, canvas.width - 20, 48, 24);
    context.fill();
    
    // Add text
    context.font = 'Bold 32px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      depthTest: false,
      depthWrite: false,
      sizeAttenuation: false
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(20, 10, 1);
    sprite.userData = { type: 'label', for: text };
    
    return sprite;
  }

  function setupInteractions(viewer) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const canvas = viewer.canvas.renderer.domElement;
    
    let hoveredObject = null;
    
    canvas.addEventListener('click', onMouseClick);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('dblclick', onDoubleClick);
    
    function onMouseClick(event) {
      updateMouse(event);
      raycaster.setFromCamera(mouse, viewer.canvas.camera);
      
      const intersects = raycaster.intersectObjects(
        viewer.canvas.scene.children, 
        true
      );
      
      const clickableIntersects = intersects.filter(i => 
        i.object.userData.type && i.object.userData.type !== 'label'
      );
      
      if (clickableIntersects.length > 0) {
        const object = clickableIntersects[0].object;
        handleObjectClick(object);
      }
    }
    
    function onMouseMove(event) {
      updateMouse(event);
      raycaster.setFromCamera(mouse, viewer.canvas.camera);
      
      const intersects = raycaster.intersectObjects(
        viewer.canvas.scene.children, 
        true
      );
      
      const hoverableIntersects = intersects.filter(i => 
        i.object.userData.type && i.object.userData.type !== 'label'
      );
      
      if (hoverableIntersects.length > 0) {
        const object = hoverableIntersects[0].object;
        if (hoveredObject !== object) {
          if (hoveredObject) {
            unhighlightObject(hoveredObject);
          }
          hoveredObject = object;
          highlightObject(hoveredObject);
          canvas.style.cursor = 'pointer';
        }
      } else {
        if (hoveredObject) {
          unhighlightObject(hoveredObject);
          hoveredObject = null;
        }
        canvas.style.cursor = 'default';
      }
    }
    
    function onDoubleClick(event) {
      updateMouse(event);
      raycaster.setFromCamera(mouse, viewer.canvas.camera);
      
      const intersects = raycaster.intersectObjects(
        viewer.canvas.scene.children, 
        true
      );
      
      if (intersects.length > 0) {
        const point = intersects[0].point;
        animateCameraToPosition(viewer.canvas.camera, point, viewer.canvas.controls);
      }
    }
    
    function updateMouse(event) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
  }

  function highlightObject(object) {
    if (object.material) {
      object.userData.originalEmissive = object.material.emissive?.getHex();
      object.userData.originalEmissiveIntensity = object.material.emissiveIntensity;
      
      object.material.emissive = new THREE.Color(0xffff00);
      object.material.emissiveIntensity = 0.3;
    }
  }

  function unhighlightObject(object) {
    if (object.material && object.userData.originalEmissive !== undefined) {
      object.material.emissive = new THREE.Color(object.userData.originalEmissive);
      object.material.emissiveIntensity = object.userData.originalEmissiveIntensity || 0;
    }
  }

  function handleObjectClick(object) {
    const regionData = {
      type: object.userData.type,
      name: object.userData.name,
      hemisphere: object.userData.hemisphere,
      surfaceType: object.userData.surfaceType,
      structureType: object.userData.structureType,
      group: object.userData.group
    };
    
    setSelectedRegion(regionData);
    
    // Highlight effect
    if (object.userData.type === 'electrode') {
      object.material.emissiveIntensity = 0.8;
      setTimeout(() => {
        object.material.emissiveIntensity = 0.2;
      }, 500);
    }
    
    if (onRegionClick) {
      onRegionClick(regionData);
    }
  }

  function animateCameraToPosition(camera, target, controls) {
    const start = camera.position.clone();
    const distance = camera.position.distanceTo(target);
    const end = target.clone().add(
      camera.position.clone().sub(target).normalize().multiplyScalar(distance * 0.5)
    );
    
    const startTime = Date.now();
    const duration = 1000;
    
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      camera.position.lerpVectors(start, end, eased);
      controls.target.lerp(target, eased);
      controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    animate();
  }

  function setupAdvancedLighting(viewer) {
    const scene = viewer.canvas.scene;
    
    // Clear existing lights
    scene.children
      .filter(child => child instanceof THREE.Light)
      .forEach(light => scene.remove(light));
    
    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    
    // Key light (main directional)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
    keyLight.position.set(50, 50, 50);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 500;
    keyLight.shadow.camera.left = -100;
    keyLight.shadow.camera.right = 100;
    keyLight.shadow.camera.top = 100;
    keyLight.shadow.camera.bottom = -100;
    scene.add(keyLight);
    
    // Fill light (softer, opposite side)
    const fillLight = new THREE.DirectionalLight(0xccddff, 0.3);
    fillLight.position.set(-50, 30, -50);
    scene.add(fillLight);
    
    // Rim light (back lighting for depth)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, -50, -100);
    scene.add(rimLight);
    
    // Hemisphere light for natural look
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);
    
    // Enable shadows on renderer
    if (viewer.canvas.renderer) {
      viewer.canvas.renderer.shadowMap.enabled = true;
      viewer.canvas.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }

  function createGeometryFromSurface(surface) {
    const geometry = new THREE.BufferGeometry();
    
    // Flatten vertex array
    const vertices = new Float32Array(surface.vertices.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    // Flatten face array
    const indices = new Uint32Array(surface.faces.flat());
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    
    // Compute normals for proper lighting
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    
    return geometry;
  }

  function updateSurfaceVisibility(type) {
    Object.entries(surfaceMeshesRef.current).forEach(([name, mesh]) => {
      if (mesh.userData.type === 'cortical') {
        mesh.visible = mesh.userData.surfaceType === type;
      }
    });
  }

  function updateElectrodeVisualization(data) {
    // Update electrode colors/sizes based on EEG data
    Object.entries(data).forEach(([electrodeName, value]) => {
      const electrode = electrodeMeshesRef.current[electrodeName];
      if (electrode) {
        // Map value to color (example: activity level)
        const intensity = Math.max(0, Math.min(1, value / 100));
        electrode.material.emissiveIntensity = 0.2 + intensity * 0.6;
        
        // Scale based on signal strength
        const scale = 1 + intensity * 0.5;
        electrode.scale.setScalar(scale);
      }
    });
  }

  function setupResizeHandler(viewer) {
    const handleResize = () => {
      if (containerRef.current && viewer.canvas) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        viewer.canvas.camera.aspect = width / height;
        viewer.canvas.camera.updateProjectionMatrix();
        viewer.canvas.renderer.setSize(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Store cleanup function
    viewer.cleanupResize = () => {
      window.removeEventListener('resize', handleResize);
    };
  }

  // Control panel functions
  const handleSurfaceTypeChange = (type) => {
    setCurrentSurfaceType(type);
  };

  const handleAutoRotateToggle = () => {
    if (viewerRef.current && viewerRef.current.canvas.controls) {
      viewerRef.current.canvas.controls.autoRotate = !viewerRef.current.canvas.controls.autoRotate;
    }
  };

  const handleResetView = () => {
    if (viewerRef.current && viewerRef.current.canvas) {
      viewerRef.current.canvas.camera.position.set(150, 100, 150);
      viewerRef.current.canvas.controls.target.set(0, 0, 0);
      viewerRef.current.canvas.controls.update();
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 animate-pulse">
                <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-light text-white mb-2">
              Initializing Brain Viewer
            </h2>
            <p className="text-gray-400 text-sm mb-6">{loadingStage}</p>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-progress" />
            </div>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md">
            <h3 className="text-red-400 text-lg font-semibold mb-2">Error Loading Brain Viewer</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {/* Control Panel */}
      {!loading && !error && (
        <>
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 space-y-4 border border-white/10">
            <div>
              <h3 className="text-white text-sm font-medium mb-2">Surface Type</h3>
              <div className="flex gap-2">
                {['pial', 'white', 'inflated'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleSurfaceTypeChange(type)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentSurfaceType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showElectrodes}
                  onChange={(e) => {
                    const electrodeGroup = viewerRef.current?.canvas.scene.getObjectByName('EEG_Electrodes');
                    if (electrodeGroup) {
                      electrodeGroup.visible = e.target.checked;
                    }
                  }}
                  className="mr-2"
                />
                Show EEG Electrodes
              </label>
              
              <label className="flex items-center text-white text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showSubcortical}
                  onChange={(e) => {
                    const subcorticalGroup = viewerRef.current?.canvas.scene.getObjectByName('SubcorticalStructures');
                    if (subcorticalGroup) {
                      subcorticalGroup.visible = e.target.checked;
                    }
                  }}
                  className="mr-2"
                />
                Show Subcortical
              </label>
              
              <label className="flex items-center text-white text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoRotate}
                  onChange={handleAutoRotateToggle}
                  className="mr-2"
                />
                Auto Rotate
              </label>
            </div>
            
            <button
              onClick={handleResetView}
              className="w-full px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Reset View
            </button>
          </div>
          
          {/* Info Panel */}
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 max-w-sm border border-white/10">
            <h3 className="text-white text-sm font-medium mb-3">RAVE Brain Viewer</h3>
            <div className="text-gray-400 text-xs space-y-1">
              <p>• Click to select regions</p>
              <p>• Double-click to zoom</p>
              <p>• Scroll to zoom in/out</p>
              <p>• Drag to rotate</p>
              <p>• Right-drag to pan</p>
            </div>
            
            {selectedRegion && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-blue-400 text-sm font-medium mb-2">Selected</h4>
                <div className="text-gray-300 text-xs space-y-1">
                  <p className="capitalize">Type: {selectedRegion.type}</p>
                  {selectedRegion.name && <p>Name: {selectedRegion.name}</p>}
                  {selectedRegion.hemisphere && <p className="capitalize">Hemisphere: {selectedRegion.hemisphere}</p>}
                  {selectedRegion.group && <p className="capitalize">Group: {selectedRegion.group}</p>}
                </div>
              </div>
            )}
            
            {viewerCapabilities && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-gray-500 text-xs">
                  RAVE v{viewerCapabilities.version || 'unknown'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Add animation keyframes to your global CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  .animate-progress {
    animation: progress 2s ease-in-out infinite;
  }
`;
document.head.appendChild(style);