import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sky, Stars, Cloud, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const ARSafeSpace = ({ isAR, handGestures, onComplete }) => {
  const [environment, setEnvironment] = useState('forest');
  const [ambientSound, setAmbientSound] = useState(true);
  const [customizations, setCustomizations] = useState({
    skyColor: '#87CEEB',
    groundColor: '#228B22',
    lightIntensity: 0.7,
    particles: true
  });
  
  const audioRef = useRef();
  const sceneRef = useRef();

  const environments = [
    {
      id: 'forest',
      name: 'Peaceful Forest',
      icon: '🌲',
      skyColor: '#87CEEB',
      groundColor: '#228B22',
      fogColor: '#e0f2e9',
      ambientAudio: '/sounds/forest-ambient.mp3'
    },
    {
      id: 'beach',
      name: 'Calm Beach',
      icon: '🏖️',
      skyColor: '#FFB347',
      groundColor: '#F4A460',
      fogColor: '#fff8e7',
      ambientAudio: '/sounds/ocean-waves.mp3'
    },
    {
      id: 'mountain',
      name: 'Mountain Sanctuary',
      icon: '⛰️',
      skyColor: '#B0C4DE',
      groundColor: '#708090',
      fogColor: '#e6e9f0',
      ambientAudio: '/sounds/mountain-wind.mp3'
    },
    {
      id: 'space',
      name: 'Cosmic Peace',
      icon: '🌌',
      skyColor: '#000033',
      groundColor: '#1a1a2e',
      fogColor: '#0f0f23',
      ambientAudio: '/sounds/space-ambient.mp3'
    }
  ];

  useEffect(() => {
    const currentEnv = environments.find(env => env.id === environment);
    if (currentEnv) {
      setCustomizations({
        skyColor: currentEnv.skyColor,
        groundColor: currentEnv.groundColor,
        lightIntensity: environment === 'space' ? 0.3 : 0.7,
        particles: true
      });
    }
  }, [environment]);

  // Forest Environment Component
  const ForestEnvironment = () => {
    const treePositions = useRef([]);
    
    // Generate random tree positions on mount
    useEffect(() => {
      treePositions.current = [...Array(20)].map(() => ({
        x: (Math.random() - 0.5) * 30,
        z: (Math.random() - 0.5) * 30,
        scale: 0.8 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2
      }));
    }, []);

    return (
      <group>
        {/* Trees */}
        {treePositions.current.map((pos, i) => (
          <group
            key={i}
            position={[pos.x, 0, pos.z]}
            scale={pos.scale}
            rotation={[0, pos.rotation, 0]}
          >
            {/* Tree trunk */}
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            
            {/* Tree foliage */}
            <mesh position={[0, 2.5, 0]}>
              <coneGeometry args={[1.5, 2, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            <mesh position={[0, 3.5, 0]}>
              <coneGeometry args={[1.2, 1.5, 8]} />
              <meshStandardMaterial color="#32CD32" />
            </mesh>
          </group>
        ))}
        
        {/* Floating particles (leaves/pollen) */}
        <Float
          speed={2}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          {[...Array(30)].map((_, i) => (
            <mesh
              key={`particle-${i}`}
              position={[
                (Math.random() - 0.5) * 20,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 20
              ]}
            >
              <planeGeometry args={[0.1, 0.1]} />
              <meshBasicMaterial
                color="#90EE90"
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </Float>
      </group>
    );
  };

  // Beach Environment Component
  const BeachEnvironment = () => {
    const waveRef = useRef();
    
    useFrame((state) => {
      if (waveRef.current) {
        waveRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      }
    });

    return (
      <group>
        {/* Ocean waves */}
        <mesh
          ref={waveRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.5, -10]}
        >
          <planeGeometry args={[50, 20, 32, 32]} />
          <meshStandardMaterial
            color="#006994"
            transparent
            opacity={0.8}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
        
        {/* Beach sand */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#F4A460" roughness={0.8} />
        </mesh>
        
        {/* Seashells */}
        {[...Array(10)].map((_, i) => (
          <mesh
            key={`shell-${i}`}
            position={[
              (Math.random() - 0.5) * 10,
              -0.4,
              (Math.random() - 0.5) * 10
            ]}
            scale={0.1}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#FFF8DC" />
          </mesh>
        ))}
      </group>
    );
  };

  // Mountain Environment Component
  const MountainEnvironment = () => {
    return (
      <group>
        {/* Mountain peaks */}
        {[...Array(5)].map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const distance = 15 + Math.random() * 10;
          
          return (
            <mesh
              key={`mountain-${i}`}
              position={[
                Math.cos(angle) * distance,
                -2,
                Math.sin(angle) * distance
              ]}
              scale={[3, 8, 3]}
            >
              <coneGeometry args={[1, 1, 4]} />
              <meshStandardMaterial color="#708090" />
            </mesh>
          );
        })}
        
        {/* Clouds */}
        <Cloud
          position={[0, 10, 0]}
          speed={0.2}
          opacity={0.5}
          scale={2}
        />
        <Cloud
          position={[10, 12, -5]}
          speed={0.1}
          opacity={0.4}
          scale={1.5}
        />
      </group>
    );
  };

  // Space Environment Component
  const SpaceEnvironment = () => {
    return (
      <group>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />
        
        {/* Floating cosmic orbs */}
        {[...Array(10)].map((_, i) => (
          <Float
            key={`orb-${i}`}
            speed={1 + Math.random()}
            rotationIntensity={0.5}
            floatIntensity={2}
          >
            <mesh
              position={[
                (Math.random() - 0.5) * 20,
                Math.random() * 10,
                (Math.random() - 0.5) * 20
              ]}
            >
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial
                color={new THREE.Color().setHSL(Math.random(), 0.7, 0.5)}
                emissive={new THREE.Color().setHSL(Math.random(), 0.7, 0.5)}
                emissiveIntensity={0.5}
              />
            </mesh>
          </Float>
        ))}
      </group>
    );
  };

  const renderEnvironment = () => {
    switch (environment) {
      case 'forest':
        return <ForestEnvironment />;
      case 'beach':
        return <BeachEnvironment />;
      case 'mountain':
        return <MountainEnvironment />;
      case 'space':
        return <SpaceEnvironment />;
      default:
        return null;
    }
  };

  // Handle hand gestures for environment switching
  useEffect(() => {
    if (handGestures?.left?.gestures || handGestures?.right?.gestures) {
      const allGestures = [
        ...(handGestures.left?.gestures || []),
        ...(handGestures.right?.gestures || [])
      ];
      
      // Switch environment with pinch gesture
      if (allGestures.some(g => g.type === 'pinch')) {
        const currentIndex = environments.findIndex(env => env.id === environment);
        const nextIndex = (currentIndex + 1) % environments.length;
        setEnvironment(environments[nextIndex].id);
      }
    }
  }, [handGestures, environment]);

  // UI overlay for environment selection
  const EnvironmentSelector = () => (
    <div className="fixed top-4 left-4 right-4 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/70 backdrop-blur-lg rounded-lg p-4"
      >
        <h3 className="text-white text-lg font-semibold mb-3">Choose Your Safe Space</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {environments.map(env => (
            <button
              key={env.id}
              onClick={() => setEnvironment(env.id)}
              className={`p-3 rounded-lg transition-all ${
                environment === env.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-2xl mb-1">{env.icon}</div>
              <div className="text-xs">{env.name}</div>
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={ambientSound}
              onChange={(e) => setAmbientSound(e.target.checked)}
              className="rounded"
            />
            Ambient Sound
          </label>
          
          <button
            onClick={() => onComplete?.()}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white text-sm font-medium"
          >
            Exit Safe Space
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* Environment selector UI */}
      <EnvironmentSelector />
      
      {/* 3D Environment */}
      <group ref={sceneRef}>
        {/* Lighting */}
        <ambientLight intensity={customizations.lightIntensity * 0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={customizations.lightIntensity}
          castShadow
        />
        
        {/* Sky */}
        {environment !== 'space' && (
          <Sky
            distance={450000}
            sunPosition={[100, 20, 100]}
            inclination={0.6}
            azimuth={0.25}
          />
        )}
        
        {/* Ground plane */}
        {environment !== 'space' && (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.5, 0]}
            receiveShadow
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial
              color={customizations.groundColor}
              roughness={0.8}
            />
          </mesh>
        )}
        
        {/* Render selected environment */}
        {renderEnvironment()}
        
        {/* AR-specific elements */}
        {isAR && (
          <group>
            {/* AR boundary indicator */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.01, 0]}
            >
              <ringGeometry args={[2.9, 3, 32]} />
              <meshBasicMaterial
                color="#4f46e5"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Floating UI hint */}
            <Float
              speed={2}
              rotationIntensity={0}
              floatIntensity={0.5}
            >
              <group position={[0, 2, -2]}>
                <mesh>
                  <planeGeometry args={[2, 0.5]} />
                  <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.7}
                  />
                </mesh>
                <text
                  position={[0, 0, 0.01]}
                  fontSize={0.15}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {isAR ? 'Pinch to change environment' : 'Select environment above'}
                </text>
              </group>
            </Float>
          </group>
        )}
      </group>
      
      {/* Audio element for ambient sounds */}
      {ambientSound && (
        <audio
          ref={audioRef}
          src={environments.find(env => env.id === environment)?.ambientAudio}
          loop
          autoPlay
          volume={0.3}
        />
      )}
    </>
  );
};

export default ARSafeSpace;