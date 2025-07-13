import React, { useState, useEffect } from 'react';
import HealingJourneyVisualization from '../components/HealingJourneyVisualization';
import { motion } from 'framer-motion';

// Example historical data showing progress over time
const generateExampleHistoricalData = () => {
  const data = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6); // 6 months ago
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 14); // Every 2 weeks
    
    // Simulate gradual improvement
    const progress = i / 11;
    const baseImpact = 0.8;
    
    data.push({
      date: date.toISOString(),
      brainImpacts: {
        amygdala: { 
          severity: Math.max(0.2, baseImpact - progress * 0.5 + Math.random() * 0.1),
          traumaTypes: ['emotional_abuse', 'physical_abuse']
        },
        hippocampus: { 
          severity: Math.max(0.15, baseImpact * 0.9 - progress * 0.6 + Math.random() * 0.1),
          traumaTypes: ['chronic_stress', 'neglect']
        },
        prefrontal_cortex: { 
          severity: Math.max(0.1, baseImpact * 0.8 - progress * 0.5 + Math.random() * 0.1),
          traumaTypes: ['emotional_neglect']
        },
        insula: { 
          severity: Math.max(0.1, baseImpact * 0.7 - progress * 0.4 + Math.random() * 0.1),
          traumaTypes: ['medical_trauma']
        },
        anterior_cingulate: { 
          severity: Math.max(0.1, baseImpact * 0.6 - progress * 0.4 + Math.random() * 0.1),
          traumaTypes: ['physical_abuse']
        }
      },
      responses: {
        anxietyLevel: Math.max(1, 5 - progress * 3),
        depressionLevel: Math.max(1, 4 - progress * 2.5),
        sleepQuality: Math.min(5, 2 + progress * 3),
        stressLevel: Math.max(1, 5 - progress * 3),
        emotionalRegulation: Math.min(5, 2 + progress * 3)
      }
    });
  }
  
  return data;
};

export default function HealingJourneyPage() {
  const [historicalData, setHistoricalData] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [userProfile, setUserProfile] = useState({
    healingActivities: ['therapy', 'meditation', 'exercise', 'social_support'],
    age: 32,
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const historical = generateExampleHistoricalData();
      setHistoricalData(historical);
      setCurrentAssessment(historical[historical.length - 1]);
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your healing journey...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-0 left-0 right-0 z-40 p-6 text-center"
      >
        <h1 className="text-5xl font-light text-white mb-2">
          Welcome to Your Healing Journey
        </h1>
        <p className="text-xl text-gray-300">
          Witness the remarkable transformation of your brain
        </p>
      </motion.div>

      {/* Main Visualization */}
      <HealingJourneyVisualization
        assessmentData={currentAssessment}
        historicalData={historicalData}
        userProfile={userProfile}
      />

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 left-8 z-40 space-y-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/20 backdrop-blur-xl border border-white/30 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-all"
          onClick={() => {
            // Add new healing activity
            const newActivity = prompt('What healing activity would you like to add?');
            if (newActivity) {
              setUserProfile(prev => ({
                ...prev,
                healingActivities: [...prev.healingActivities, newActivity.toLowerCase().replace(/\s+/g, '_')]
              }));
            }
          }}
        >
          <span>➕</span>
          Add Healing Activity
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/20 backdrop-blur-xl border border-white/30 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-all"
          onClick={() => {
            // Generate healing report
            alert('Generating your healing report...');
          }}
        >
          <span>📊</span>
          Generate Report
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/20 backdrop-blur-xl border border-white/30 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-all"
          onClick={() => {
            // Share progress
            alert('Sharing features coming soon!');
          }}
        >
          <span>🔗</span>
          Share Progress
        </motion.button>
      </div>

      {/* Inspirational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 right-8 max-w-md z-40"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <p className="text-white text-lg italic">
            "The brain that changes itself: neuroplasticity proves that transformation is always possible."
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            - Dr. Norman Doidge
          </p>
        </div>
      </motion.div>
    </div>
  );
}