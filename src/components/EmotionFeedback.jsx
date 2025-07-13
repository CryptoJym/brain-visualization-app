import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmotionFeedback({ metrics, insights }) {
  const [showInsight, setShowInsight] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(null);

  useEffect(() => {
    // Show insights when they appear
    if (insights && insights.length > 0) {
      const latestInsight = insights[insights.length - 1];
      if (latestInsight !== currentInsight) {
        setCurrentInsight(latestInsight);
        setShowInsight(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => setShowInsight(false), 5000);
      }
    }
  }, [insights]);

  if (!metrics) return null;

  const getEmotionColor = (emotion) => {
    const colors = {
      neutral: '#94a3b8',
      happy: '#10b981',
      sad: '#3b82f6',
      angry: '#ef4444',
      fearful: '#f59e0b',
      disgusted: '#8b5cf6',
      surprised: '#ec4899',
      contempt: '#6366f1'
    };
    return colors[emotion] || '#94a3b8';
  };

  const getStressLevelLabel = (level) => {
    if (level < 0.3) return 'Relaxed';
    if (level < 0.6) return 'Moderate';
    if (level < 0.8) return 'Elevated';
    return 'High';
  };

  const getStressLevelColor = (level) => {
    if (level < 0.3) return '#10b981';
    if (level < 0.6) return '#f59e0b';
    if (level < 0.8) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="fixed bottom-24 right-6 z-40 space-y-4">
      {/* Emotion and Stress Indicators */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10 min-w-[250px]"
      >
        <h4 className="text-white/60 text-xs font-medium mb-3 uppercase tracking-wider">
          Emotional State
        </h4>
        
        {/* Current Emotion */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/80 text-sm">Detected Emotion</span>
            <span 
              className="text-sm font-medium capitalize"
              style={{ color: getEmotionColor(metrics.currentEmotion?.primary || 'neutral') }}
            >
              {metrics.currentEmotion?.primary || 'Analyzing...'}
            </span>
          </div>
          {metrics.confidence > 0 && (
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getEmotionColor(metrics.currentEmotion?.primary || 'neutral') }}
                initial={{ width: 0 }}
                animate={{ width: `${metrics.confidence * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>

        {/* Stress Level */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/80 text-sm">Stress Level</span>
            <span 
              className="text-sm font-medium"
              style={{ color: getStressLevelColor(metrics.stressLevel || 0) }}
            >
              {getStressLevelLabel(metrics.stressLevel || 0)}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <motion.div
              className="h-full rounded-full transition-all duration-500"
              style={{ backgroundColor: getStressLevelColor(metrics.stressLevel || 0) }}
              initial={{ width: 0 }}
              animate={{ width: `${(metrics.stressLevel || 0) * 100}%` }}
            />
          </div>
        </div>

        {/* Emotion Stability */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/80 text-sm">Emotional Stability</span>
            <span className="text-sm font-medium text-white/60">
              {Math.round((metrics.emotionStability || 1) * 100)}%
            </span>
          </div>
          <div className="flex space-x-0.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-sm transition-all duration-300 ${
                  i < Math.round((metrics.emotionStability || 1) * 10)
                    ? 'bg-green-500/80'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Heart Rate if available */}
        {metrics.heartRate && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Heart Rate</span>
              <span className="text-sm font-medium text-red-400">
                {metrics.heartRate} BPM
              </span>
            </div>
          </div>
        )}

        {/* Micro-expressions */}
        {metrics.microExpressionCount > 0 && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-white/60 text-xs">
                Detecting subtle expressions
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Insights */}
      <AnimatePresence>
        {showInsight && currentInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-xl rounded-2xl p-4 border border-white/20 max-w-[300px]"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                {currentInsight.type === 'suppression' && '🤐'}
                {currentInsight.type === 'stress_increase' && '😰'}
                {currentInsight.type === 'incongruence' && '🤔'}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm leading-relaxed">
                  {currentInsight.message}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-1 flex-1 bg-white/20 rounded-full">
                    <div 
                      className="h-full bg-white/60 rounded-full"
                      style={{ width: `${currentInsight.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-white/60 text-xs">
                    {Math.round(currentInsight.confidence * 100)}% confident
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-black/60 backdrop-blur rounded-lg p-3 text-center"
      >
        <p className="text-white/40 text-xs">
          🔒 Biometric data is processed locally and never stored
        </p>
      </motion.div>
    </div>
  );
}