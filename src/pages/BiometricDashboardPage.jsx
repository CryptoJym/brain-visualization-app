import React, { useState } from 'react';
import BiometricDashboard from '../components/BiometricDashboard';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const BiometricDashboardPage = () => {
  const [userId] = useState('demo-user-001');
  const [brainHealthData, setBrainHealthData] = useState(null);

  const handleBrainHealthUpdate = (data) => {
    setBrainHealthData(data);
    console.log('Brain health update:', data);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Biometric Health Monitor</h1>
                <p className="text-sm text-gray-400">Real-time physiological insights</p>
              </div>
            </div>
            
            {brainHealthData && (
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Healing Progress</p>
                  <p className="text-lg font-semibold text-white">
                    {Math.round(brainHealthData.healingScore * 100)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Active Regions</p>
                  <p className="text-lg font-semibold text-white">
                    {brainHealthData.affectedRegions?.length || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Dashboard */}
      <main className="relative">
        <BiometricDashboard 
          userId={userId}
          onBrainHealthUpdate={handleBrainHealthUpdate}
        />
      </main>

      {/* Instructions Overlay (shown initially) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 5, duration: 1 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center pointer-events-none z-50"
      >
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to Your Biometric Dashboard
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Connect your wearable device to start monitoring your heart rate variability, 
            stress levels, sleep quality, and emotional patterns in real-time.
          </p>
          <p className="text-gray-400">
            This message will disappear in a few seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BiometricDashboardPage;