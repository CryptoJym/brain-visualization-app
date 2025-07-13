import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sparkles, Trail } from '@react-three/drei';
import { calculateHealingMetrics } from '../utils/HealingMetrics';
import { createProgressAnimation } from '../utils/ProgressAnimations';
import { processTimelineData } from '../utils/TimelineDataProcessor';
import { motion, AnimatePresence } from 'framer-motion';

// Healing Tree Component - represents neuroplasticity growth
function HealingTree({ progress, position }) {
  const meshRef = useRef();
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    // Generate branches based on progress
    const branchCount = Math.floor(progress * 20);
    const newBranches = [];
    
    for (let i = 0; i < branchCount; i++) {
      const angle = (i / branchCount) * Math.PI * 2;
      const height = (i / branchCount) * 2;
      const radius = 0.5 + (i / branchCount) * 0.5;
      
      newBranches.push({
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ],
        scale: 0.1 + (progress * 0.9),
        color: new THREE.Color().setHSL(0.3 - (i / branchCount) * 0.1, 0.8, 0.6)
      });
    }
    
    setBranches(newBranches);
  }, [progress]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.1, 0.3, 2, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {branches.map((branch, i) => (
        <Float key={i} speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
          <mesh position={branch.position} scale={branch.scale}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color={branch.color}
              emissive={branch.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
      
      <Sparkles
        count={Math.floor(progress * 50)}
        scale={3}
        size={2}
        speed={0.5}
        opacity={0.8}
        color="#FFD700"
      />
    </group>
  );
}

// Healing Light Effect
function HealingLight({ intensity, color }) {
  const lightRef = useRef();
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = intensity * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
    }
  });

  return (
    <>
      <pointLight
        ref={lightRef}
        position={[0, 5, 0]}
        intensity={intensity}
        color={color}
        castShadow
      />
      <mesh position={[0, 5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </>
  );
}

// Brain Comparison Component
function BrainComparison({ beforeData, afterData, progress }) {
  const beforeRef = useRef();
  const afterRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (beforeRef.current) {
      beforeRef.current.rotation.y = time * 0.1;
      beforeRef.current.material.opacity = 0.3 + (1 - progress) * 0.4;
    }
    
    if (afterRef.current) {
      afterRef.current.rotation.y = time * 0.1;
      afterRef.current.material.opacity = 0.3 + progress * 0.7;
    }
  });

  return (
    <group>
      {/* Before Brain */}
      <mesh ref={beforeRef} position={[-3, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#FF6B6B"
          transparent
          wireframe
          emissive="#FF0000"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* After Brain */}
      <mesh ref={afterRef} position={[3, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#4ECDC4"
          transparent
          wireframe
          emissive="#00FF88"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Connection Lines */}
      {progress > 0.2 && (
        <Trail
          width={2}
          length={10}
          color="#FFD700"
          attenuation={(t) => t * t}
        >
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </Trail>
      )}
      
      <Text
        position={[-3, -2.5, 0]}
        fontSize={0.3}
        color="#FF6B6B"
        anchorX="center"
        anchorY="middle"
      >
        Before
      </Text>
      
      <Text
        position={[3, -2.5, 0]}
        fontSize={0.3}
        color="#4ECDC4"
        anchorX="center"
        anchorY="middle"
      >
        After
      </Text>
    </group>
  );
}

// Timeline Visualization
function HealingTimeline({ milestones, currentProgress }) {
  return (
    <group position={[0, -3, 0]}>
      {milestones.map((milestone, index) => {
        const x = (index - milestones.length / 2) * 2;
        const isAchieved = currentProgress >= milestone.progress;
        
        return (
          <group key={milestone.id} position={[x, 0, 0]}>
            <Float speed={isAchieved ? 2 : 0} floatIntensity={isAchieved ? 0.5 : 0}>
              <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                  color={isAchieved ? "#FFD700" : "#666666"}
                  emissive={isAchieved ? "#FFD700" : "#000000"}
                  emissiveIntensity={isAchieved ? 0.5 : 0}
                />
              </mesh>
            </Float>
            
            <Text
              position={[0, -0.5, 0]}
              fontSize={0.15}
              color={isAchieved ? "#FFD700" : "#666666"}
              anchorX="center"
              anchorY="top"
            >
              {milestone.name}
            </Text>
            
            {isAchieved && (
              <Sparkles
                count={20}
                scale={1}
                size={1}
                speed={0.5}
                opacity={0.8}
                color="#FFD700"
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

// Main Healing Journey Visualization Component
export default function HealingJourneyVisualization({ 
  assessmentData, 
  historicalData = [],
  userProfile = {} 
}) {
  const [selectedView, setSelectedView] = useState('journey');
  const [healingProgress, setHealingProgress] = useState(0);
  const [milestones, setMilestones] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [timelineData, setTimelineData] = useState(null);

  useEffect(() => {
    // Calculate healing metrics
    if (assessmentData) {
      const calculatedMetrics = calculateHealingMetrics(assessmentData, historicalData);
      setMetrics(calculatedMetrics);
      setHealingProgress(calculatedMetrics.overallProgress);
      
      // Process timeline data
      const timeline = processTimelineData(historicalData, calculatedMetrics);
      setTimelineData(timeline);
      
      // Set milestones
      setMilestones(calculatedMetrics.milestones);
      
      // Check for new milestone achievement
      const newMilestone = calculatedMetrics.milestones.find(
        m => m.justAchieved && !m.celebrated
      );
      
      if (newMilestone) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }
    }
  }, [assessmentData, historicalData]);

  const views = {
    journey: 'Healing Journey',
    timeline: 'Progress Timeline',
    comparison: 'Before & After',
    metrics: 'Healing Metrics'
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-6 bg-gradient-to-b from-black/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-light text-white mb-2">
            Your Healing Journey
          </h1>
          <p className="text-gray-300 text-lg">
            Witness your brain's remarkable capacity for healing and growth
          </p>
          
          {/* View Selector */}
          <div className="flex gap-4 mt-6">
            {Object.entries(views).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedView(key)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedView === key
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Visualization Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 5, 10], fov: 60 }}
          shadows
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          
          {/* Healing Light Effect */}
          <HealingLight 
            intensity={healingProgress * 2}
            color={new THREE.Color().setHSL(0.3 - healingProgress * 0.1, 0.8, 0.6)}
          />
          
          {/* Different Views */}
          {selectedView === 'journey' && (
            <>
              <HealingTree progress={healingProgress} position={[0, -2, 0]} />
              <HealingTimeline milestones={milestones} currentProgress={healingProgress} />
            </>
          )}
          
          {selectedView === 'comparison' && (
            <BrainComparison 
              beforeData={historicalData[0]}
              afterData={assessmentData}
              progress={healingProgress}
            />
          )}
          
          {selectedView === 'timeline' && timelineData && (
            <TimelineVisualization data={timelineData} />
          )}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
          />
        </Canvas>
      </div>

      {/* Side Panel - Metrics and Information */}
      <div className="absolute top-32 right-0 bottom-0 w-full max-w-md p-6 overflow-y-auto">
        <AnimatePresence>
          {metrics && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="space-y-4"
            >
              {/* Progress Card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                <h2 className="text-xl font-medium text-white mb-4">
                  Overall Healing Progress
                </h2>
                
                <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${healingProgress * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                
                <p className="text-3xl font-bold text-white mb-2">
                  {Math.round(healingProgress * 100)}%
                </p>
                
                <p className="text-gray-300 text-sm">
                  {metrics.encouragingMessage}
                </p>
              </div>

              {/* Recent Achievements */}
              {metrics.recentAchievements.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-medium text-white mb-3">
                    Recent Achievements
                  </h3>
                  <ul className="space-y-2">
                    {metrics.recentAchievements.map((achievement, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <span className="text-yellow-400">✨</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Brain Region Progress */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-medium text-white mb-3">
                  Brain Region Healing
                </h3>
                <div className="space-y-3">
                  {Object.entries(metrics.regionProgress).map(([region, progress]) => (
                    <div key={region}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 capitalize">
                          {region.replace(/_/g, ' ')}
                        </span>
                        <span className="text-white">
                          {Math.round(progress * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 1, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neuroplasticity Tips */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-medium text-white mb-3">
                  Boost Your Healing
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>🧘 Practice mindfulness meditation daily</li>
                  <li>🏃 Regular aerobic exercise promotes neurogenesis</li>
                  <li>😴 Prioritize 7-9 hours of quality sleep</li>
                  <li>🥗 Eat brain-healthy foods rich in omega-3s</li>
                  <li>🤝 Build supportive social connections</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-center">
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="text-6xl font-bold text-yellow-400 mb-4"
              >
                Milestone Achieved! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl text-white"
              >
                Your brain is healing beautifully
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Timeline Visualization Component
function TimelineVisualization({ data }) {
  return (
    <group>
      {data.points.map((point, index) => {
        const x = (index - data.points.length / 2) * 3;
        const y = point.healingLevel * 5 - 2.5;
        
        return (
          <group key={point.date} position={[x, y, 0]}>
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color={point.color}
                emissive={point.color}
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {index > 0 && (
              <Line
                points={[
                  [0, 0, 0],
                  [
                    (data.points[index - 1].healingLevel * 5 - 2.5) - y,
                    -3,
                    0
                  ]
                ]}
                color={point.color}
                lineWidth={2}
              />
            )}
            
            <Text
              position={[0, -0.6, 0]}
              fontSize={0.15}
              color="#FFFFFF"
              anchorX="center"
            >
              {new Date(point.date).toLocaleDateString()}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

// Simple Line component for connections
function Line({ points, color, lineWidth }) {
  const lineRef = useRef();
  
  useEffect(() => {
    if (lineRef.current) {
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(...p))
      );
      lineRef.current.geometry = geometry;
    }
  }, [points]);
  
  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color={color} linewidth={lineWidth} />
    </line>
  );
}