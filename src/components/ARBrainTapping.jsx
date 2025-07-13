import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Line, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const ARBrainTapping = ({ isAR, handGestures, onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [pattern, setPattern] = useState('alternating'); // alternating, butterfly, custom
  const [speed, setSpeed] = useState(1); // BPM multiplier
  const [tapCount, setTapCount] = useState(0);
  const [currentSide, setCurrentSide] = useState('left');
  const [sessionProgress, setSessionProgress] = useState(0);
  
  const leftTargetRef = useRef();
  const rightTargetRef = useRef();
  const brainModelRef = useRef();
  const pulseRef = useRef();
  
  const targetTaps = 100; // Total taps for a complete session
  const baseRhythm = 60; // Base BPM

  useEffect(() => {
    if (isActive) {
      startTappingSession();
    }
    
    return () => {
      // Cleanup
    };
  }, [isActive, pattern, speed]);

  const startTappingSession = () => {
    let lastTapTime = Date.now();
    let side = 'left';
    
    const tapInterval = (60 / (baseRhythm * speed)) * 1000; // Convert BPM to milliseconds
    
    const performTap = () => {
      if (!isActive) return;
      
      const now = Date.now();
      if (now - lastTapTime >= tapInterval) {
        // Switch sides based on pattern
        if (pattern === 'alternating') {
          side = side === 'left' ? 'right' : 'left';
        } else if (pattern === 'butterfly') {
          side = 'both';
        }
        
        setCurrentSide(side);
        setTapCount(prev => {
          const newCount = prev + 1;
          setSessionProgress((newCount / targetTaps) * 100);
          
          if (newCount >= targetTaps) {
            completeSession();
            return newCount;
          }
          return newCount;
        });
        
        lastTapTime = now;
      }
      
      if (tapCount < targetTaps) {
        requestAnimationFrame(performTap);
      }
    };
    
    requestAnimationFrame(performTap);
  };

  const completeSession = () => {
    setIsActive(false);
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  // Visual tap target component
  const TapTarget = ({ position, isActive, side }) => {
    const targetRef = useRef();
    const pulseScale = useRef(1);
    
    useFrame((state) => {
      if (!targetRef.current) return;
      
      // Pulse effect when active
      if (isActive) {
        pulseScale.current = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
        targetRef.current.scale.setScalar(pulseScale.current);
        
        // Glow effect
        if (targetRef.current.material) {
          targetRef.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
        }
      } else {
        targetRef.current.scale.setScalar(1);
        if (targetRef.current.material) {
          targetRef.current.material.emissiveIntensity = 0.1;
        }
      }
    });
    
    return (
      <group position={position}>
        {/* Target sphere */}
        <mesh ref={targetRef}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshPhysicalMaterial
            color={side === 'left' ? '#ff6b6b' : '#4ecdc4'}
            emissive={side === 'left' ? '#ff6b6b' : '#4ecdc4'}
            emissiveIntensity={0.1}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Ripple effect rings */}
        {isActive && (
          <>
            {[1, 2, 3].map((i) => (
              <mesh
                key={i}
                rotation={[0, 0, 0]}
                scale={1 + i * 0.3}
              >
                <ringGeometry args={[0.3, 0.35, 32]} />
                <meshBasicMaterial
                  color={side === 'left' ? '#ff6b6b' : '#4ecdc4'}
                  transparent
                  opacity={0.3 - i * 0.1}
                />
              </mesh>
            ))}
          </>
        )}
        
        {/* Label */}
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {side.toUpperCase()}
        </Text>
      </group>
    );
  };

  // 3D Brain visualization
  const BrainVisualization = () => {
    const brainRef = useRef();
    const leftHemisphere = useRef();
    const rightHemisphere = useRef();
    
    useFrame((state) => {
      if (!brainRef.current) return;
      
      // Gentle rotation
      brainRef.current.rotation.y += 0.005;
      
      // Highlight active hemisphere
      if (leftHemisphere.current && rightHemisphere.current) {
        if (currentSide === 'left' || currentSide === 'both') {
          leftHemisphere.current.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
        } else {
          leftHemisphere.current.material.emissiveIntensity = 0.1;
        }
        
        if (currentSide === 'right' || currentSide === 'both') {
          rightHemisphere.current.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
        } else {
          rightHemisphere.current.material.emissiveIntensity = 0.1;
        }
      }
    });
    
    return (
      <group ref={brainRef} position={[0, 0, 0]}>
        {/* Left hemisphere */}
        <mesh ref={leftHemisphere} position={[-0.3, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32, 0, Math.PI]} />
          <meshPhysicalMaterial
            color="#ff6b6b"
            emissive="#ff6b6b"
            emissiveIntensity={0.1}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Right hemisphere */}
        <mesh ref={rightHemisphere} position={[0.3, 0, 0]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={[0.8, 32, 32, 0, Math.PI]} />
          <meshPhysicalMaterial
            color="#4ecdc4"
            emissive="#4ecdc4"
            emissiveIntensity={0.1}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Corpus callosum connection */}
        <Box args={[0.2, 0.3, 0.5]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
        </Box>
        
        {/* Neural activity particles */}
        {isActive && (
          <group>
            {[...Array(20)].map((_, i) => (
              <Float
                key={i}
                speed={2 + Math.random() * 2}
                rotationIntensity={0}
                floatIntensity={1}
              >
                <mesh
                  position={[
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                  ]}
                >
                  <sphereGeometry args={[0.02, 8, 8]} />
                  <meshBasicMaterial
                    color={currentSide === 'left' ? '#ff6b6b' : '#4ecdc4'}
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              </Float>
            ))}
          </group>
        )}
      </group>
    );
  };

  // Pattern selector UI
  const PatternSelector = () => (
    <div className="fixed bottom-20 left-4 right-4 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/70 backdrop-blur-lg rounded-lg p-4"
      >
        <h4 className="text-white text-sm font-semibold mb-2">Tapping Pattern</h4>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { id: 'alternating', name: 'Alternating', icon: '↔️' },
            { id: 'butterfly', name: 'Butterfly', icon: '🦋' },
            { id: 'custom', name: 'Custom', icon: '✨' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPattern(p.id)}
              disabled={isActive}
              className={`p-2 rounded-lg transition-all ${
                pattern === p.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-lg">{p.icon}</div>
              <div className="text-xs">{p.name}</div>
            </button>
          ))}
        </div>
        
        {/* Speed control */}
        <div className="mb-3">
          <label className="text-white text-sm">Speed: {speed}x</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            disabled={isActive}
            className="w-full mt-1"
          />
        </div>
        
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{tapCount} / {targetTaps} taps</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${sessionProgress}%` }}
            />
          </div>
        </div>
        
        {/* Control buttons */}
        <div className="flex gap-2">
          {!isActive ? (
            <button
              onClick={() => setIsActive(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-medium"
            >
              Start Session
            </button>
          ) : (
            <button
              onClick={() => {
                setIsActive(false);
                setTapCount(0);
                setSessionProgress(0);
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-medium"
            >
              Stop Session
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );

  // Handle hand gestures
  useEffect(() => {
    if (handGestures?.left || handGestures?.right) {
      // Detect tapping gestures
      if (handGestures.left?.gestures?.some(g => g.type === 'fist')) {
        // Manual tap on left
        if (pattern === 'custom' && isActive) {
          setCurrentSide('left');
          setTapCount(prev => prev + 1);
        }
      }
      
      if (handGestures.right?.gestures?.some(g => g.type === 'fist')) {
        // Manual tap on right
        if (pattern === 'custom' && isActive) {
          setCurrentSide('right');
          setTapCount(prev => prev + 1);
        }
      }
    }
  }, [handGestures, pattern, isActive]);

  return (
    <>
      {/* Main 3D scene */}
      <group>
        {/* Brain visualization in center */}
        <BrainVisualization />
        
        {/* Tap targets */}
        <TapTarget
          position={[-2, 0, 0]}
          isActive={isActive && (currentSide === 'left' || currentSide === 'both')}
          side="left"
        />
        <TapTarget
          position={[2, 0, 0]}
          isActive={isActive && (currentSide === 'right' || currentSide === 'both')}
          side="right"
        />
        
        {/* Session info */}
        <group position={[0, 2, 0]}>
          <Text
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            Bilateral Stimulation
          </Text>
          
          {isActive && (
            <Text
              position={[0, -0.5, 0]}
              fontSize={0.15}
              color="#4ade80"
              anchorX="center"
              anchorY="middle"
            >
              {pattern === 'custom' ? 'Tap with your fists' : `${baseRhythm * speed} BPM`}
            </Text>
          )}
        </group>
        
        {/* AR-specific elements */}
        {isAR && (
          <group>
            {/* Floor guide */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.5, 0]}
            >
              <ringGeometry args={[1.8, 2, 32]} />
              <meshBasicMaterial
                color="#4f46e5"
                transparent
                opacity={0.2}
              />
            </mesh>
            
            {/* Connection lines */}
            <Line
              points={[[-2, 0, 0], [-0.8, 0, 0]]}
              color={currentSide === 'left' || currentSide === 'both' ? '#ff6b6b' : '#333333'}
              lineWidth={2}
              dashed
              dashScale={5}
            />
            <Line
              points={[[2, 0, 0], [0.8, 0, 0]]}
              color={currentSide === 'right' || currentSide === 'both' ? '#4ecdc4' : '#333333'}
              lineWidth={2}
              dashed
              dashScale={5}
            />
          </group>
        )}
        
        {/* Completion message */}
        {sessionProgress >= 100 && (
          <Float
            speed={2}
            rotationIntensity={0}
            floatIntensity={0.5}
          >
            <group position={[0, -1.5, 0]}>
              <RoundedBox args={[3, 0.8, 0.1]} radius={0.05}>
                <meshBasicMaterial color="#4ade80" />
              </RoundedBox>
              <Text
                position={[0, 0, 0.1]}
                fontSize={0.2}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                Session Complete! 🎉
              </Text>
            </group>
          </Float>
        )}
      </group>
      
      {/* UI Controls */}
      <PatternSelector />
    </>
  );
};

export default ARBrainTapping;