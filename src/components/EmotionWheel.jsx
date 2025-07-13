import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Heart, Brain, Sparkles, AlertCircle } from 'lucide-react';

const EmotionWheel = ({ currentEmotion = 'neutral', history = [] }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [emotionData, setEmotionData] = useState({
    primary: 'neutral',
    intensity: 0.5,
    valence: 0,
    arousal: 0,
    secondary: []
  });
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [hoveredEmotion, setHoveredEmotion] = useState(null);
  const animationRef = useRef(null);

  // Define emotion categories and their positions on the wheel
  const emotionCategories = {
    joy: { color: '#fbbf24', angle: 0, valence: 1, arousal: 0.7 },
    trust: { color: '#34d399', angle: 45, valence: 0.7, arousal: 0.3 },
    fear: { color: '#7c3aed', angle: 90, valence: -0.7, arousal: 0.8 },
    surprise: { color: '#f472b6', angle: 135, valence: 0.3, arousal: 0.9 },
    sadness: { color: '#3b82f6', angle: 180, valence: -1, arousal: -0.5 },
    disgust: { color: '#10b981', angle: 225, valence: -0.8, arousal: 0.2 },
    anger: { color: '#ef4444', angle: 270, valence: -0.9, arousal: 0.9 },
    anticipation: { color: '#f97316', angle: 315, valence: 0.5, arousal: 0.6 }
  };

  // Extended emotion mappings
  const emotionMappings = {
    // Primary emotions
    joy: { primary: 'joy', intensity: 0.8 },
    happy: { primary: 'joy', intensity: 0.7 },
    ecstatic: { primary: 'joy', intensity: 1.0 },
    content: { primary: 'joy', intensity: 0.5 },
    
    trust: { primary: 'trust', intensity: 0.8 },
    acceptance: { primary: 'trust', intensity: 0.6 },
    admiration: { primary: 'trust', intensity: 0.9 },
    
    fear: { primary: 'fear', intensity: 0.8 },
    terror: { primary: 'fear', intensity: 1.0 },
    apprehension: { primary: 'fear', intensity: 0.5 },
    
    surprise: { primary: 'surprise', intensity: 0.8 },
    amazement: { primary: 'surprise', intensity: 1.0 },
    distraction: { primary: 'surprise', intensity: 0.4 },
    
    sadness: { primary: 'sadness', intensity: 0.8 },
    grief: { primary: 'sadness', intensity: 1.0 },
    pensiveness: { primary: 'sadness', intensity: 0.5 },
    
    disgust: { primary: 'disgust', intensity: 0.8 },
    loathing: { primary: 'disgust', intensity: 1.0 },
    boredom: { primary: 'disgust', intensity: 0.4 },
    
    anger: { primary: 'anger', intensity: 0.8 },
    rage: { primary: 'anger', intensity: 1.0 },
    annoyance: { primary: 'anger', intensity: 0.5 },
    
    anticipation: { primary: 'anticipation', intensity: 0.8 },
    vigilance: { primary: 'anticipation', intensity: 1.0 },
    interest: { primary: 'anticipation', intensity: 0.5 },
    
    // Complex emotions (combinations)
    love: { primary: 'joy', secondary: 'trust', intensity: 0.9 },
    submission: { primary: 'trust', secondary: 'fear', intensity: 0.6 },
    awe: { primary: 'fear', secondary: 'surprise', intensity: 0.8 },
    disapproval: { primary: 'surprise', secondary: 'sadness', intensity: 0.6 },
    remorse: { primary: 'sadness', secondary: 'disgust', intensity: 0.7 },
    contempt: { primary: 'disgust', secondary: 'anger', intensity: 0.7 },
    aggressiveness: { primary: 'anger', secondary: 'anticipation', intensity: 0.8 },
    optimism: { primary: 'anticipation', secondary: 'joy', intensity: 0.7 },
    
    // Neutral
    neutral: { primary: 'neutral', intensity: 0.3 },
    calm: { primary: 'neutral', intensity: 0.2 }
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        const size = Math.min(parent.clientWidth, 400);
        setDimensions({ width: size, height: size });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Process current emotion
    const mapped = emotionMappings[currentEmotion.toLowerCase()] || emotionMappings.neutral;
    const category = emotionCategories[mapped.primary] || { valence: 0, arousal: 0 };
    
    setEmotionData({
      primary: mapped.primary,
      intensity: mapped.intensity,
      valence: category.valence * mapped.intensity,
      arousal: category.arousal * mapped.intensity,
      secondary: mapped.secondary ? [mapped.secondary] : []
    });
  }, [currentEmotion]);

  useEffect(() => {
    // Process emotion history
    if (history.length > 0) {
      const processed = history.slice(-20).map(item => {
        const emotion = item.emotionalState || item.emotion || 'neutral';
        const mapped = emotionMappings[emotion.toLowerCase()] || emotionMappings.neutral;
        return {
          ...mapped,
          timestamp: item.timestamp
        };
      });
      setEmotionHistory(processed);
    }
  }, [history]);

  useEffect(() => {
    drawEmotionWheel();
  }, [emotionData, emotionHistory, dimensions, hoveredEmotion]);

  const drawEmotionWheel = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    // Draw background gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.2);
    bgGradient.addColorStop(0, '#1f293710');
    bgGradient.addColorStop(1, '#11182700');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw emotion sectors
    Object.entries(emotionCategories).forEach(([emotion, data]) => {
      const startAngle = (data.angle - 22.5) * Math.PI / 180;
      const endAngle = (data.angle + 22.5) * Math.PI / 180;
      
      // Create gradient for each sector
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, data.color + '20');
      gradient.addColorStop(0.7, data.color + '40');
      gradient.addColorStop(1, data.color + '60');

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Highlight if this is the current emotion
      if (emotion === emotionData.primary) {
        ctx.strokeStyle = data.color;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw emotion label
      const labelAngle = data.angle * Math.PI / 180;
      const labelRadius = radius * 0.85;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;

      ctx.save();
      ctx.translate(labelX, labelY);
      ctx.rotate(labelAngle + Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emotion.charAt(0).toUpperCase() + emotion.slice(1), 0, 0);
      ctx.restore();
    });

    // Draw intensity rings
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * i / 3, 0, 2 * Math.PI);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw current emotion indicator
    if (emotionData.primary !== 'neutral') {
      const category = emotionCategories[emotionData.primary];
      if (category) {
        const angle = category.angle * Math.PI / 180;
        const distance = radius * emotionData.intensity;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        // Glow effect
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        glowGradient.addColorStop(0, category.color + '80');
        glowGradient.addColorStop(1, category.color + '00');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - 20, y - 20, 40, 40);

        // Main indicator
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = category.color;
        ctx.fill();
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pulse animation
        const pulse = (Math.sin(Date.now() * 0.003) + 1) / 2;
        ctx.beginPath();
        ctx.arc(x, y, 12 + pulse * 4, 0, 2 * Math.PI);
        ctx.strokeStyle = category.color + '40';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw emotion history trail
    if (emotionHistory.length > 1) {
      ctx.beginPath();
      emotionHistory.forEach((emotion, index) => {
        const category = emotionCategories[emotion.primary];
        if (category) {
          const angle = category.angle * Math.PI / 180;
          const distance = radius * emotion.intensity * 0.8;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      
      ctx.strokeStyle = '#8b5cf640';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.stroke();

    // Center icon
    ctx.fillStyle = '#8b5cf6';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❤️', centerX, centerY);

    // Request next frame for animation
    animationRef.current = requestAnimationFrame(drawEmotionWheel);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getEmotionInsight = () => {
    const valence = emotionData.valence;
    const arousal = emotionData.arousal;
    
    if (valence > 0.5 && arousal > 0.5) {
      return "High energy positive state - great for creative work and social interaction";
    } else if (valence > 0.5 && arousal < -0.3) {
      return "Calm positive state - ideal for reflection and mindfulness";
    } else if (valence < -0.5 && arousal > 0.5) {
      return "High stress detected - consider taking a break or trying calming exercises";
    } else if (valence < -0.5 && arousal < -0.3) {
      return "Low energy state - gentle movement or rest may be beneficial";
    } else {
      return "Balanced emotional state - maintain awareness of any shifts";
    }
  };

  const getEmotionColor = () => {
    if (emotionData.primary === 'neutral') return 'text-gray-400';
    const category = emotionCategories[emotionData.primary];
    return category ? `text-[${category.color}]` : 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-500/20 rounded-lg">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Emotion Tracking</h3>
            <p className="text-sm text-gray-400">Real-time emotional state monitoring</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Current Emotion Display */}
      <div className="mb-4 p-4 bg-gray-800/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">Current State</p>
          <p className="text-sm text-gray-400">Intensity: {Math.round(emotionData.intensity * 100)}%</p>
        </div>
        <h4 className="text-2xl font-bold text-white capitalize mb-2">
          {emotionData.primary === 'neutral' ? 'Neutral' : emotionData.primary}
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Valence</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${50 + emotionData.valence * 50}%` }}
                  className={`h-full ${
                    emotionData.valence > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <span className="text-white">
                {emotionData.valence > 0 ? '+' : ''}{(emotionData.valence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-400">Arousal</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${50 + emotionData.arousal * 50}%` }}
                  className="h-full bg-purple-500"
                />
              </div>
              <span className="text-white">
                {emotionData.arousal > 0 ? '+' : ''}{(emotionData.arousal * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Wheel Canvas */}
      <div className="relative bg-gray-800/30 rounded-lg p-4 mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-auto cursor-pointer"
          onMouseMove={(e) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Calculate which emotion sector the mouse is over
            // This would require more complex math to implement properly
          }}
          onMouseLeave={() => setHoveredEmotion(null)}
        />
      </div>

      {/* Emotion History Summary */}
      {emotionHistory.length > 0 && (
        <div className="mb-4 p-4 bg-gray-800/30 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Recent Emotion Pattern</p>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {emotionHistory.slice(-10).map((emotion, index) => {
              const category = emotionCategories[emotion.primary];
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: category ? category.color + '20' : '#37415120',
                    borderColor: category ? category.color : '#374151',
                    borderWidth: 2,
                    borderStyle: 'solid'
                  }}
                >
                  <span className="text-xs">
                    {emotion.primary.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <div className="flex items-start space-x-2">
          <Brain className="w-4 h-4 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-400 mb-1">Emotional Intelligence Insight</p>
            <p className="text-sm text-gray-300">{getEmotionInsight()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmotionWheel;