import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Moon, Brain, Zap, TrendingUp, Sun } from 'lucide-react';

const SleepImpactVisualization = ({ sleepData = {}, brainHealth = {} }) => {
  const canvasRef = useRef(null);
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [sleepStages, setSleepStages] = useState({
    deep: 0,
    rem: 0,
    light: 0,
    awake: 0
  });
  const [brainImpact, setBrainImpact] = useState({
    prefrontalCortex: 0,
    hippocampus: 0,
    amygdala: 0,
    defaultModeNetwork: 0
  });

  useEffect(() => {
    // Calculate sleep stages from data
    if (sleepData.stages) {
      setSleepStages(sleepData.stages);
    } else {
      // Mock calculation based on sleep quality
      const quality = sleepData.sleepQuality || 0.7;
      setSleepStages({
        deep: quality * 0.25 * 8, // hours
        rem: quality * 0.20 * 8,
        light: quality * 0.50 * 8,
        awake: (1 - quality) * 0.05 * 8
      });
    }

    // Calculate brain impact
    calculateBrainImpact();
  }, [sleepData, brainHealth]);

  useEffect(() => {
    drawVisualization();
  }, [sleepStages, brainImpact, selectedMetric]);

  const calculateBrainImpact = () => {
    const quality = sleepData.sleepQuality || 0.7;
    const deepSleepRatio = sleepStages.deep / 8;
    const remRatio = sleepStages.rem / 8;

    setBrainImpact({
      // Prefrontal cortex benefits from deep sleep
      prefrontalCortex: Math.min(1, deepSleepRatio * 4),
      // Hippocampus (memory) benefits from REM sleep
      hippocampus: Math.min(1, remRatio * 5),
      // Amygdala (emotion regulation) affected by overall sleep quality
      amygdala: quality,
      // Default mode network affected by sleep continuity
      defaultModeNetwork: quality * (1 - (sleepStages.awake / 8))
    });
  };

  const drawVisualization = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up dimensions
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    if (selectedMetric === 'overall') {
      drawSleepWheel(ctx, centerX, centerY, radius);
    } else {
      drawBrainImpactRadar(ctx, centerX, centerY, radius);
    }
  };

  const drawSleepWheel = (ctx, centerX, centerY, radius) => {
    const stages = [
      { name: 'Deep', value: sleepStages.deep, color: '#4c1d95' },
      { name: 'REM', value: sleepStages.rem, color: '#7c3aed' },
      { name: 'Light', value: sleepStages.light, color: '#a78bfa' },
      { name: 'Awake', value: sleepStages.awake, color: '#ef4444' }
    ];

    const total = stages.reduce((sum, stage) => sum + stage.value, 0);
    let currentAngle = -Math.PI / 2;

    stages.forEach((stage, index) => {
      const angle = (stage.value / total) * 2 * Math.PI;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
      ctx.closePath();
      
      // Gradient fill
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, stage.color + '40');
      gradient.addColorStop(1, stage.color);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      const labelAngle = currentAngle + angle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stage.name, labelX, labelY);
      
      ctx.font = '12px sans-serif';
      ctx.fillText(`${stage.value.toFixed(1)}h`, labelX, labelY + 16);

      currentAngle += angle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.stroke();

    // Sleep score in center
    const sleepScore = Math.round((sleepData.sleepQuality || 0.7) * 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${sleepScore}%`, centerX, centerY - 10);
    
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Sleep Score', centerX, centerY + 10);
  };

  const drawBrainImpactRadar = (ctx, centerX, centerY, radius) => {
    const metrics = [
      { name: 'Prefrontal\nCortex', value: brainImpact.prefrontalCortex, angle: 0 },
      { name: 'Hippocampus', value: brainImpact.hippocampus, angle: Math.PI / 2 },
      { name: 'Amygdala', value: brainImpact.amygdala, angle: Math.PI },
      { name: 'Default Mode\nNetwork', value: brainImpact.defaultModeNetwork, angle: 3 * Math.PI / 2 }
    ];

    // Draw grid
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      
      metrics.forEach((metric, index) => {
        const angle = metric.angle - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * i / 5);
        const y = centerY + Math.sin(angle) * (radius * i / 5);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axes
    metrics.forEach(metric => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const angle = metric.angle - Math.PI / 2;
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.strokeStyle = '#374151';
      ctx.stroke();
    });

    // Draw data shape
    ctx.beginPath();
    metrics.forEach((metric, index) => {
      const angle = metric.angle - Math.PI / 2;
      const value = metric.value * radius;
      const x = centerX + Math.cos(angle) * value;
      const y = centerY + Math.sin(angle) * value;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    
    // Fill with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, '#8b5cf620');
    gradient.addColorStop(1, '#3b82f640');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    metrics.forEach(metric => {
      const angle = metric.angle - Math.PI / 2;
      const value = metric.value * radius;
      const x = centerX + Math.cos(angle) * value;
      const y = centerY + Math.sin(angle) * value;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#8b5cf6';
      ctx.fill();
      ctx.strokeStyle = '#1f2937';
      ctx.stroke();
    });

    // Draw labels
    metrics.forEach(metric => {
      const angle = metric.angle - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const lines = metric.name.split('\n');
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + (i - 0.5) * 14);
      });
      
      // Draw percentage
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${Math.round(metric.value * 100)}%`, x, y + lines.length * 14);
    });
  };

  const getSleepRecommendation = () => {
    const quality = sleepData.sleepQuality || 0.7;
    
    if (quality >= 0.85) {
      return {
        type: 'positive',
        message: 'Excellent sleep quality! Your brain is getting optimal recovery time for healing and neuroplasticity.'
      };
    } else if (quality >= 0.7) {
      return {
        type: 'neutral',
        message: 'Good sleep quality. Consider increasing deep sleep duration for enhanced brain repair.'
      };
    } else {
      return {
        type: 'warning',
        message: 'Poor sleep quality may impair brain healing. Try establishing a consistent sleep schedule.'
      };
    }
  };

  const recommendation = getSleepRecommendation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Moon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Sleep Impact on Brain Health</h3>
            <p className="text-sm text-gray-400">How your sleep affects neural recovery</p>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedMetric('overall')}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              selectedMetric === 'overall'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sleep Stages
          </button>
          <button
            onClick={() => setSelectedMetric('brain')}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              selectedMetric === 'brain'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Brain Impact
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-purple-900 rounded-full" />
            <p className="text-xs text-gray-400">Deep Sleep</p>
          </div>
          <p className="text-lg font-bold text-white">{sleepStages.deep.toFixed(1)}h</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-purple-600 rounded-full" />
            <p className="text-xs text-gray-400">REM Sleep</p>
          </div>
          <p className="text-lg font-bold text-white">{sleepStages.rem.toFixed(1)}h</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Brain className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Brain Recovery</p>
          </div>
          <p className="text-lg font-bold text-white">
            {Math.round((brainHealth.healingScore || 0.75) * 100)}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-gray-400">Energy Level</p>
          </div>
          <p className="text-lg font-bold text-white">
            {Math.round((sleepData.sleepQuality || 0.7) * 100)}%
          </p>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="relative bg-gray-800/30 rounded-lg p-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-auto"
        />
      </div>

      {/* Sleep Insights */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMetric}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 space-y-3"
        >
          {selectedMetric === 'overall' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Circadian Alignment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(brainHealth.circadianAlignment || 0.8) * 100}%` }}
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    />
                  </div>
                  <span className="text-sm text-white font-medium">
                    {Math.round((brainHealth.circadianAlignment || 0.8) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Your sleep patterns directly influence these brain regions:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Memory Consolidation</p>
                  <p className="text-sm text-white">
                    {brainImpact.hippocampus > 0.7 ? 'Optimal' : 'Needs improvement'}
                  </p>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Emotional Regulation</p>
                  <p className="text-sm text-white">
                    {brainImpact.amygdala > 0.7 ? 'Balanced' : 'Affected'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Recommendation */}
      <div className={`mt-4 p-4 rounded-lg ${
        recommendation.type === 'positive' ? 'bg-green-500/10 border border-green-500/30' :
        recommendation.type === 'warning' ? 'bg-orange-500/10 border border-orange-500/30' :
        'bg-blue-500/10 border border-blue-500/30'
      }`}>
        <div className="flex items-start space-x-2">
          <TrendingUp className={`w-4 h-4 mt-0.5 ${
            recommendation.type === 'positive' ? 'text-green-400' :
            recommendation.type === 'warning' ? 'text-orange-400' :
            'text-blue-400'
          }`} />
          <p className="text-sm text-gray-300">{recommendation.message}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SleepImpactVisualization;