import React, { useRef, useEffect, useState } from 'react';

export default function WorkingThreeBrain({ brainImpacts = {} }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState('Loading library...');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = '/libs/threebrain-main.js';
    script.async = true;

    script.onload = () => {
      setLoadStatus('Library loaded, initializing...');
      
      if (!window.threeBrain) {
        setError('threeBrain not found on window');
        setIsLoading(false);
        return;
      }

      const { ViewerApp, ExternLibs } = window.threeBrain;
      const THREE = ExternLibs?.THREE;

      if (!ViewerApp || !THREE) {
        setError('ViewerApp or THREE not available');
        setIsLoading(false);
        return;
      }

      try {
        // Create viewer with correct parameter name
        const viewer = new ViewerApp({
          $wrapper: containerRef.current,  // Note: $wrapper not container
          width: window.innerWidth,
          height: window.innerHeight,
          debug: true,
          webgl2Enabled: true
        });

        viewerRef.current = viewer;
        setLoadStatus('Viewer created, setting up scene...');

        // The ViewerApp creates its own canvas property
        if (!viewer.canvas) {
          setError('Canvas not initialized');
          setIsLoading(false);
          return;
        }

        // Access scene from canvas
        const scene = viewer.canvas.scene;
        const camera = viewer.canvas.camera;
        
        if (!scene || !camera) {
          setError('Scene or camera not available');
          setIsLoading(false);
          return;
        }

        // Set background
        scene.background = new THREE.Color(0x000814);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        scene.add(directionalLight);

        // Create brain visualization
        const brainGroup = new THREE.Group();
        scene.add(brainGroup);

        // Main brain shape - icosahedron deformed to look brain-like
        const brainGeometry = new THREE.IcosahedronGeometry(60, 3);
        const positions = brainGeometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          // Deform to brain shape
          positions.setX(i, x * 1.2 * (1 + 0.1 * Math.sin(y * 0.1)));
          positions.setY(i, y * 1.4);
          positions.setZ(i, z * 0.9 * (1 + 0.1 * Math.cos(x * 0.1)));
        }
        positions.needsUpdate = true;
        brainGeometry.computeVertexNormals();

        const brainMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffaaaa,
          transparent: true,
          opacity: 0.15,
          roughness: 0.8,
          metalness: 0.1,
          side: THREE.DoubleSide,
          wireframe: true
        });

        const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
        brainGroup.add(brainMesh);

        // Add brain regions
        const regions = [
          { name: 'Frontal Cortex', pos: [0, 45, 35], color: 0x4169e1, size: 12 },
          { name: 'Parietal Lobe', pos: [0, 40, -25], color: 0x32cd32, size: 10 },
          { name: 'Temporal L', pos: [-45, 0, 0], color: 0xffa500, size: 11 },
          { name: 'Temporal R', pos: [45, 0, 0], color: 0xffa500, size: 11 },
          { name: 'Occipital', pos: [0, 10, -45], color: 0xff69b4, size: 9 },
          { name: 'Hippocampus L', pos: [-20, -10, 5], color: 0x9370db, size: 6 },
          { name: 'Hippocampus R', pos: [20, -10, 5], color: 0x9370db, size: 6 },
          { name: 'Amygdala L', pos: [-25, -10, 15], color: 0xff0000, size: 5 },
          { name: 'Amygdala R', pos: [25, -10, 15], color: 0xff0000, size: 5 },
        ];

        regions.forEach(region => {
          const geometry = new THREE.SphereGeometry(region.size, 24, 24);
          const material = new THREE.MeshPhongMaterial({
            color: region.color,
            emissive: region.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(...region.pos);
          mesh.userData = { name: region.name };
          brainGroup.add(mesh);
        });

        // Position camera
        camera.position.set(0, 0, 200);
        camera.lookAt(0, 0, 0);

        setLoadStatus('Setup complete, starting render...');

        // Start animation
        let animationId;
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          brainGroup.rotation.y += 0.003;
          
          // Use viewer's render method
          if (viewer.canvas && viewer.canvas.needsUpdate) {
            viewer.canvas.needsUpdate = true;
            viewer.canvas.render();
          }
        };
        animate();

        setIsLoading(false);
        setLoadStatus('Rendering active');

        // Cleanup
        return () => {
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          viewer.dispose();
        };

      } catch (error) {
        console.error('Failed to initialize:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    script.onerror = () => {
      setError('Failed to load three-brain library');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-gray-900 to-black">
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-light text-white mb-4">
              @rave-ieeg/three-brain
            </div>
            <div className="text-lg text-gray-400 mb-2">
              {loadStatus}
            </div>
            <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-2xl font-light text-red-400 mb-4">
              Error
            </div>
            <div className="text-gray-400">
              {error}
            </div>
          </div>
        </div>
      )}
      
      <div ref={containerRef} className="w-full h-full" />
      
      {!isLoading && !error && (
        <div className="absolute top-6 left-6 pointer-events-none">
          <h1 className="text-3xl font-light text-white mb-2">
            Brain Visualization
          </h1>
          <p className="text-sm text-gray-400">
            Using @rave-ieeg/three-brain electrode localization library
          </p>
        </div>
      )}
    </div>
  );
}