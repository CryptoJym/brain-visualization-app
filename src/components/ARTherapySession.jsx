import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import webXRService from '../services/WebXRService';
import { motion, AnimatePresence } from 'framer-motion';

// Import AR therapy modules
import ARBreathingExercise from './ARBreathingExercise';
import ARSafeSpace from './ARSafeSpace';
import ARBrainTapping from './ARBrainTapping';

const ARTherapySession = () => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [handGestures, setHandGestures] = useState({ left: null, right: null });
  const [sessionStatus, setSessionStatus] = useState('ready');
  const [fallbackMode, setFallbackMode] = useState(false);
  
  const canvasRef = useRef();
  const sceneRef = useRef();

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    const supported = await webXRService.checkSupport();
    setIsARSupported(supported);
    if (!supported) {
      setFallbackMode(true);
    }
  };

  const startARSession = async () => {
    if (!isARSupported) {
      setFallbackMode(true);
      return;
    }

    try {
      setSessionStatus('starting');
      const canvas = canvasRef.current;
      
      const { session, gl, refSpace } = await webXRService.startARSession(canvas);
      
      // Set up AR render loop
      webXRService.addFrameCallback((time, frame) => {
        // Update hand tracking
        const hands = webXRService.getHandTrackingData(frame);
        if (hands) {
          setHandGestures(hands);
        }
      });

      webXRService.startRenderLoop();
      
      setIsARActive(true);
      setSessionStatus('active');
    } catch (error) {
      console.error('Failed to start AR session:', error);
      setSessionStatus('error');
      setFallbackMode(true);
    }
  };

  const endARSession = async () => {
    try {
      await webXRService.endSession();
      setIsARActive(false);
      setSessionStatus('ended');
      setSelectedExercise(null);
    } catch (error) {
      console.error('Failed to end AR session:', error);
    }
  };

  const exercises = [
    {
      id: 'breathing',
      name: 'Guided Breathing',
      description: 'Calming breath work with visual guides',
      icon: '🫁',
      component: ARBreathingExercise
    },
    {
      id: 'safe-space',
      name: 'Safe Space',
      description: 'Create your personal calming environment',
      icon: '🏞️',
      component: ARSafeSpace
    },
    {
      id: 'brain-tapping',
      name: 'Bilateral Stimulation',
      description: 'Brain tapping for emotional regulation',
      icon: '🧠',
      component: ARBrainTapping
    }
  ];

  const renderExerciseContent = () => {
    const exercise = exercises.find(ex => ex.id === selectedExercise);
    if (!exercise) return null;

    const ExerciseComponent = exercise.component;
    return (
      <ExerciseComponent
        isAR={isARActive}
        handGestures={handGestures}
        onComplete={() => setSelectedExercise(null)}
      />
    );
  };

  // Fallback 3D visualization for non-AR devices
  const Fallback3DView = () => {
    return (
      <div className="w-full h-screen relative">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: 'linear-gradient(to bottom, #1a1a2e, #0f0f23)' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          
          {/* 3D Brain Model Placeholder */}
          <group>
            <Sphere args={[1.5, 32, 32]}>
              <meshPhysicalMaterial
                color="#ff6b6b"
                metalness={0.3}
                roughness={0.4}
                transparent
                opacity={0.8}
              />
            </Sphere>
            
            {/* Neural pathways */}
            {[...Array(8)].map((_, i) => (
              <Sphere
                key={i}
                position={[
                  Math.sin((i / 8) * Math.PI * 2) * 2,
                  Math.cos((i / 8) * Math.PI * 2) * 0.5,
                  Math.cos((i / 8) * Math.PI * 2) * 2
                ]}
                args={[0.1, 16, 16]}
              >
                <meshBasicMaterial color="#4ecdc4" emissive="#4ecdc4" emissiveIntensity={0.5} />
              </Sphere>
            ))}
          </group>

          {/* Render selected exercise in 3D space */}
          {renderExerciseContent()}
        </Canvas>

        {/* UI Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 text-white">
            <h2 className="text-2xl font-bold mb-2">3D Therapy Session</h2>
            <p className="text-sm opacity-80">
              {isARSupported 
                ? "AR is available on your device. Tap 'Start AR' to begin."
                : "Using 3D mode. AR is not available on this device."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (fallbackMode) {
    return (
      <div className="min-h-screen bg-gray-900">
        {!selectedExercise ? (
          <div className="p-8">
            <h1 className="text-4xl font-bold text-white mb-8">Therapy Exercises</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exercises.map(exercise => (
                <motion.div
                  key={exercise.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setSelectedExercise(exercise.id)}
                >
                  <div className="text-4xl mb-4">{exercise.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{exercise.name}</h3>
                  <p className="text-gray-400">{exercise.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <Fallback3DView />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* AR Canvas */}
      {isARActive && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full"
          style={{ touchAction: 'none' }}
        />
      )}

      {/* UI Overlay */}
      <AnimatePresence>
        {!isARActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 p-8"
          >
            <div className="max-w-6xl mx-auto">
              <h1 className="text-5xl font-bold mb-4">AR Therapy Session</h1>
              <p className="text-xl text-gray-300 mb-8">
                Immersive healing exercises in augmented reality
              </p>

              {isARSupported ? (
                <div className="space-y-8">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Find a quiet, well-lit space</li>
                      <li>• Ensure you have 2-3 meters of clear space</li>
                      <li>• Hold your device at a comfortable viewing angle</li>
                      <li>• Use hand gestures to interact with AR elements</li>
                    </ul>
                  </div>

                  <button
                    onClick={startARSession}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    Start AR Session
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {exercises.map(exercise => (
                      <div
                        key={exercise.id}
                        className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
                      >
                        <div className="text-4xl mb-4">{exercise.icon}</div>
                        <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
                        <p className="text-gray-400">{exercise.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-2">AR Not Available</h2>
                  <p className="text-gray-300">
                    Your device doesn't support AR. You can still use our 3D therapy exercises.
                  </p>
                  <button
                    onClick={() => setFallbackMode(true)}
                    className="mt-4 bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold"
                  >
                    Use 3D Mode
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AR Active Overlay */}
        {isARActive && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-x-0 bottom-0 p-4 z-20"
          >
            <div className="bg-black/80 backdrop-blur-lg rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AR Therapy Active</h3>
                <button
                  onClick={endARSession}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  End Session
                </button>
              </div>

              {!selectedExercise && (
                <div className="grid grid-cols-3 gap-2">
                  {exercises.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => setSelectedExercise(exercise.id)}
                      className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-center transition-colors"
                    >
                      <div className="text-2xl mb-1">{exercise.icon}</div>
                      <div className="text-xs">{exercise.name}</div>
                    </button>
                  ))}
                </div>
              )}

              {selectedExercise && (
                <div className="text-center">
                  <p className="text-sm text-gray-300">
                    {exercises.find(ex => ex.id === selectedExercise)?.name} in progress...
                  </p>
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Switch Exercise
                  </button>
                </div>
              )}

              {/* Hand tracking status */}
              {webXRService.isHandTrackingSupported && (
                <div className="mt-4 flex items-center gap-4 text-xs">
                  <div className={`flex items-center gap-1 ${handGestures.left ? 'text-green-400' : 'text-gray-500'}`}>
                    <span>Left Hand</span>
                    {handGestures.left?.gestures[0]?.type && (
                      <span className="text-xs">({handGestures.left.gestures[0].type})</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 ${handGestures.right ? 'text-green-400' : 'text-gray-500'}`}>
                    <span>Right Hand</span>
                    {handGestures.right?.gestures[0]?.type && (
                      <span className="text-xs">({handGestures.right.gestures[0].type})</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AR Scene Content */}
      {isARActive && selectedExercise && (
        <div className="fixed inset-0 pointer-events-none">
          {renderExerciseContent()}
        </div>
      )}
    </div>
  );
};

export default ARTherapySession;