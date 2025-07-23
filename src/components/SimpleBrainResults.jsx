import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SimpleBrainResults = ({ assessmentResults }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameId = useRef(null);

  useEffect(() => {
    if (!mountRef.current || !assessmentResults) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create brain representation
    const brainGroup = new THREE.Group();

    // Main brain sphere
    const brainGeometry = new THREE.SphereGeometry(2, 32, 32);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.3
    });
    const brain = new THREE.Mesh(brainGeometry, brainMaterial);
    brainGroup.add(brain);

    // Add impacted regions
    const regionPositions = {
      'Prefrontal Cortex': [0, 1.5, 1.5],
      'Amygdala': [-0.8, 0, 0],
      'Hippocampus': [0.8, 0, 0],
      'Anterior Cingulate': [0, 0.8, 1.2]
    };

    Object.entries(assessmentResults.brainImpacts).forEach(([region, data]) => {
      const position = regionPositions[region] || [
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      ];

      const impact = data.totalImpact;
      const isReduced = impact < 0;
      
      // Create region sphere
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: isReduced ? 0x3b82f6 : 0xef4444,
        emissive: isReduced ? 0x1e40af : 0x991b1b,
        emissiveIntensity: 0.5
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(...position);
      brainGroup.add(sphere);
    });

    scene.add(brainGroup);

    // Animation
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      brainGroup.rotation.y += 0.005;
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
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [assessmentResults]);

  if (!assessmentResults) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">No assessment data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 3D Visualization */}
      <div ref={mountRef} className="w-full h-screen" />
      
      {/* Overlay Information */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <div className="p-8">
          <h1 className="text-4xl font-light text-white mb-2">
            Brain Impact Assessment
          </h1>
          <p className="text-gray-400">
            ACE Score: {assessmentResults.aceScore}/10
          </p>
        </div>

        {/* Impact Summary */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
          <h2 className="text-2xl font-light text-white mb-4">
            Affected Brain Regions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {Object.entries(assessmentResults.brainImpacts)
              .sort((a, b) => Math.abs(b[1].totalImpact) - Math.abs(a[1].totalImpact))
              .slice(0, 6)
              .map(([region, data]) => {
                const impact = data.totalImpact;
                const isReduced = impact < 0;
                
                return (
                  <div key={region} className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <h3 className="text-white font-medium">{region}</h3>
                    <div className={`text-2xl font-light mt-1 ${isReduced ? 'text-blue-400' : 'text-red-400'}`}>
                      {isReduced ? '' : '+'}{impact.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {isReduced ? 'Volume reduction' : 'Hyperactivity'}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Reduced activity/volume</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Increased activity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBrainResults;