import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Circle, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const ARBreathingExercise = ({ isAR, handGestures, onComplete }) => {
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
  const [cycleCount, setCycleCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const breathingOrb = useRef();
  const guidanceText = useRef();
  const progressRing = useRef();
  
  // Breathing timing configuration (in seconds)
  const breathingPattern = {
    inhale: 4,
    hold: 4,
    exhale: 6,
    pause: 2
  };
  
  const totalCycles = 5; // Number of breathing cycles
  
  useEffect(() => {
    if (isActive) {
      startBreathingCycle();
    }
    
    return () => {
      // Cleanup
    };
  }, [isActive]);

  const startBreathingCycle = () => {
    let currentPhase = 'inhale';
    let phaseStartTime = Date.now();
    
    const updatePhase = () => {
      const elapsed = (Date.now() - phaseStartTime) / 1000;
      const phaseDuration = breathingPattern[currentPhase];
      
      if (elapsed >= phaseDuration) {
        // Move to next phase
        switch (currentPhase) {
          case 'inhale':
            currentPhase = 'hold';
            break;
          case 'hold':
            currentPhase = 'exhale';
            break;
          case 'exhale':
            currentPhase = 'pause';
            break;
          case 'pause':
            currentPhase = 'inhale';
            setCycleCount(prev => {
              const newCount = prev + 1;
              if (newCount >= totalCycles) {
                completeExercise();
                return newCount;
              }
              return newCount;
            });
            break;
        }
        
        setBreathPhase(currentPhase);
        phaseStartTime = Date.now();
      }
      
      // Update progress within current phase
      const phaseProgress = elapsed / phaseDuration;
      setProgress(phaseProgress);
      
      if (cycleCount < totalCycles) {
        requestAnimationFrame(updatePhase);
      }
    };
    
    requestAnimationFrame(updatePhase);
  };

  const completeExercise = () => {
    setIsActive(false);
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  // 3D Breathing Orb Component
  const BreathingOrb = () => {
    const orbRef = useRef();
    const particlesRef = useRef();
    
    useFrame((state) => {
      if (!orbRef.current) return;
      
      // Animate orb size based on breath phase
      let targetScale = 1;
      if (breathPhase === 'inhale') {
        targetScale = 1 + progress * 0.5; // Grow to 1.5x
      } else if (breathPhase === 'exhale') {
        targetScale = 1.5 - progress * 0.5; // Shrink back to 1x
      } else if (breathPhase === 'hold') {
        targetScale = 1.5; // Stay large
      }
      
      orbRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
      
      // Pulsing glow effect
      if (orbRef.current.material) {
        orbRef.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      }
      
      // Rotate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.005;
        particlesRef.current.rotation.z += 0.003;
      }
    });
    
    return (
      <group ref={breathingOrb}>
        {/* Main breathing orb */}
        <mesh ref={orbRef}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial
            color="#00bfff"
            emissive="#00bfff"
            emissiveIntensity={0.5}
            metalness={0.3}
            roughness={0.2}
            transparent
            opacity={0.7}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
        
        {/* Particle field around orb */}
        <group ref={particlesRef}>
          {[...Array(50)].map((_, i) => {
            const angle = (i / 50) * Math.PI * 2;
            const radius = 1.5 + Math.random() * 0.5;
            const y = (Math.random() - 0.5) * 2;
            
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  y,
                  Math.sin(angle) * radius
                ]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.6}
                />
              </mesh>
            );
          })}
        </group>
        
        {/* Progress ring */}
        <Torus
          ref={progressRing}
          args={[2, 0.1, 8, 64, Math.PI * 2 * (cycleCount / totalCycles)]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#4ade80" transparent opacity={0.8} />
        </Torus>
      </group>
    );
  };

  // Guidance Text Component
  const GuidanceDisplay = () => {
    const getPhaseText = () => {
      switch (breathPhase) {
        case 'inhale':
          return 'Breathe In...';
        case 'hold':
          return 'Hold...';
        case 'exhale':
          return 'Breathe Out...';
        case 'pause':
          return 'Rest...';
        default:
          return '';
      }
    };
    
    const getPhaseColor = () => {
      switch (breathPhase) {
        case 'inhale':
          return '#00bfff';
        case 'hold':
          return '#ffd700';
        case 'exhale':
          return '#ff6b6b';
        case 'pause':
          return '#4ade80';
        default:
          return '#ffffff';
      }
    };
    
    return (
      <group position={[0, 2.5, 0]}>
        <Text
          ref={guidanceText}
          fontSize={0.3}
          color={getPhaseColor()}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {getPhaseText()}
        </Text>
        
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          opacity={0.7}
        >
          {`Cycle ${cycleCount + 1} of ${totalCycles}`}
        </Text>
      </group>
    );
  };

  // Hand gesture interaction
  useEffect(() => {
    if (handGestures?.left?.gestures || handGestures?.right?.gestures) {
      const allGestures = [
        ...(handGestures.left?.gestures || []),
        ...(handGestures.right?.gestures || [])
      ];
      
      // Start exercise with open palm gesture
      if (allGestures.some(g => g.type === 'open-palm') && !isActive && cycleCount === 0) {
        setIsActive(true);
      }
      
      // Stop exercise with fist gesture
      if (allGestures.some(g => g.type === 'fist') && isActive) {
        completeExercise();
      }
    }
  }, [handGestures, isActive, cycleCount]);

  // UI for non-AR mode
  if (!isAR) {
    return (
      <group position={[0, 0, -3]}>
        {!isActive && cycleCount === 0 && (
          <group>
            <RoundedBox
              args={[3, 1, 0.1]}
              radius={0.05}
              smoothness={4}
              position={[0, 0, 0]}
              onClick={() => setIsActive(true)}
            >
              <meshPhysicalMaterial color="#4f46e5" />
            </RoundedBox>
            <Text
              position={[0, 0, 0.1]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              Start Breathing Exercise
            </Text>
          </group>
        )}
        
        {(isActive || cycleCount > 0) && (
          <>
            <BreathingOrb />
            <GuidanceDisplay />
            
            {cycleCount >= totalCycles && (
              <group position={[0, -2, 0]}>
                <Text
                  fontSize={0.25}
                  color="#4ade80"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.01}
                  outlineColor="#000000"
                >
                  Exercise Complete!
                </Text>
                <Text
                  position={[0, -0.4, 0]}
                  fontSize={0.15}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  opacity={0.7}
                >
                  Great job on your breathing practice
                </Text>
              </group>
            )}
          </>
        )}
      </group>
    );
  }

  // AR mode rendering
  return (
    <>
      {!isActive && cycleCount === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/80 backdrop-blur-lg rounded-lg p-8 text-center max-w-md"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Breathing Exercise</h2>
            <p className="text-gray-300 mb-6">
              {isAR 
                ? "Hold up your open palm to begin the breathing exercise"
                : "Click the button to start"}
            </p>
            {!isAR && (
              <button
                onClick={() => setIsActive(true)}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-white font-semibold"
              >
                Start Exercise
              </button>
            )}
          </motion.div>
        </div>
      )}
      
      {/* AR 3D Content */}
      {(isActive || cycleCount > 0) && (
        <group>
          <BreathingOrb />
          <GuidanceDisplay />
          
          {/* AR-specific visual effects */}
          {isAR && (
            <>
              {/* Floor indicator */}
              <Circle
                args={[3, 64]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.5, 0]}
              >
                <meshBasicMaterial
                  color="#4f46e5"
                  transparent
                  opacity={0.2}
                  side={THREE.DoubleSide}
                />
              </Circle>
              
              {/* Ambient particles for AR */}
              <group>
                {[...Array(20)].map((_, i) => (
                  <mesh
                    key={`ar-particle-${i}`}
                    position={[
                      (Math.random() - 0.5) * 5,
                      Math.random() * 3,
                      (Math.random() - 0.5) * 5
                    ]}
                  >
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshBasicMaterial
                      color={breathPhase === 'inhale' ? '#00bfff' : '#ff6b6b'}
                      transparent
                      opacity={0.5}
                    />
                  </mesh>
                ))}
              </group>
            </>
          )}
        </group>
      )}
    </>
  );
};

export default ARBreathingExercise;