import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, Moon, Activity, Zap, AlertCircle, TrendingUp, Shield } from 'lucide-react';
import HRVTimeline from './HRVTimeline';
import StressHeatmap from './StressHeatmap';
import SleepImpactVisualization from './SleepImpactVisualization';
import EmotionWheel from './EmotionWheel';
import WearableIntegration from '../services/WearableIntegration';
import BiometricAnalyzer from '../utils/BiometricAnalyzer';

const BiometricDashboard = ({ userId, onBrainHealthUpdate }) => {
  const [biometrics, setBiometrics] = useState({
    heartRate: 0,
    hrv: 0,
    stressLevel: 0,
    sleepQuality: 0,
    emotionalState: 'neutral',
    meditationMinutes: 0,
    recoveryScore: 0
  });

  const [insights, setInsights] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [realtimeData, setRealtimeData] = useState([]);
  const [correlations, setCorrelations] = useState({});
  
  const wearableService = useRef(null);
  const analyzer = useRef(null);
  const updateInterval = useRef(null);

  useEffect(() => {
    // Initialize services
    wearableService.current = new WearableIntegration();
    analyzer.current = new BiometricAnalyzer();

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      wearableService.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isConnected && selectedDevice) {
      // Start real-time updates
      updateInterval.current = setInterval(updateBiometrics, 1000);
    } else {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    }
  }, [isConnected, selectedDevice]);

  const connectDevice = async (deviceType) => {
    try {
      const connected = await wearableService.current.connect(deviceType);
      if (connected) {
        setIsConnected(true);
        setSelectedDevice(deviceType);
        
        // Start listening for data
        wearableService.current.on('data', handleBiometricData);
        wearableService.current.on('disconnect', () => {
          setIsConnected(false);
          setSelectedDevice(null);
        });
      }
    } catch (error) {
      console.error('Failed to connect device:', error);
    }
  };

  const handleBiometricData = (data) => {
    // Update real-time data
    setRealtimeData(prev => [...prev.slice(-300), data]);
    
    // Update current biometrics
    setBiometrics(prev => ({
      ...prev,
      ...data
    }));

    // Analyze patterns and generate insights
    const analysis = analyzer.current.analyze(data, realtimeData);
    if (analysis.insights.length > 0) {
      setInsights(analysis.insights);
    }

    // Calculate correlations with brain health
    const brainCorrelations = analyzer.current.calculateBrainHealthCorrelations(data);
    setCorrelations(brainCorrelations);

    // Notify parent component of brain health updates
    if (onBrainHealthUpdate && brainCorrelations.healingScore) {
      onBrainHealthUpdate({
        healingScore: brainCorrelations.healingScore,
        affectedRegions: brainCorrelations.affectedRegions,
        recommendations: analysis.recommendations
      });
    }
  };

  const updateBiometrics = async () => {
    if (!wearableService.current?.isConnected()) return;

    const data = await wearableService.current.getCurrentData();
    if (data) {
      handleBiometricData(data);
    }
  };

  const MetricCard = ({ icon: Icon, label, value, unit, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600'
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-700"
      >
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${colorClasses[color]} opacity-20 blur-2xl`} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center space-x-1 text-sm ${
                  trend > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(trend)}%</span>
              </motion.div>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">{label}</p>
            <div className="flex items-baseline space-x-1">
              <motion.span
                key={value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white"
              >
                {value}
              </motion.span>
              <span className="text-gray-500 text-sm">{unit}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const InsightCard = ({ insight }) => {
    const typeIcons = {
      warning: AlertCircle,
      positive: Shield,
      recommendation: Brain
    };
    
    const Icon = typeIcons[insight.type] || AlertCircle;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex items-start space-x-3 p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700"
      >
        <div className={`p-2 rounded-lg ${
          insight.type === 'warning' ? 'bg-red-500/20' :
          insight.type === 'positive' ? 'bg-green-500/20' :
          'bg-blue-500/20'
        }`}>
          <Icon className={`w-5 h-5 ${
            insight.type === 'warning' ? 'text-red-400' :
            insight.type === 'positive' ? 'text-green-400' :
            'text-blue-400'
          }`} />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">{insight.title}</h4>
          <p className="text-gray-400 text-sm">{insight.message}</p>
          {insight.action && (
            <button className="mt-2 text-blue-400 text-sm hover:text-blue-300 transition-colors">
              {insight.action}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const DeviceSelector = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { id: 'apple-watch', name: 'Apple Watch', icon: '⌚' },
        { id: 'fitbit', name: 'Fitbit', icon: '🏃' },
        { id: 'garmin', name: 'Garmin', icon: '🧭' },
        { id: 'bluetooth-hrm', name: 'Heart Rate Monitor', icon: '💓' }
      ].map(device => (
        <motion.button
          key={device.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => connectDevice(device.id)}
          disabled={isConnected && selectedDevice !== device.id}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedDevice === device.id
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
          } ${isConnected && selectedDevice !== device.id ? 'opacity-50' : ''}`}
        >
          <div className="text-3xl mb-2">{device.icon}</div>
          <p className="text-sm text-gray-300">{device.name}</p>
          {selectedDevice === device.id && (
            <div className="mt-2 flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Connected</span>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Biometric Health Dashboard
          </motion.h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time monitoring of your physiological and emotional well-being
          </p>
        </div>

        {/* Device Connection */}
        {!isConnected && <DeviceSelector />}

        {/* Connection Status */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400">Connected to {selectedDevice}</span>
            </div>
            <button
              onClick={() => {
                wearableService.current?.disconnect();
                setIsConnected(false);
                setSelectedDevice(null);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Disconnect
            </button>
          </motion.div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={Heart}
            label="Heart Rate Variability"
            value={biometrics.hrv}
            unit="ms"
            trend={correlations.hrvTrend}
            color="pink"
          />
          <MetricCard
            icon={Zap}
            label="Stress Level"
            value={Math.round(biometrics.stressLevel * 100)}
            unit="%"
            trend={correlations.stressTrend}
            color="orange"
          />
          <MetricCard
            icon={Moon}
            label="Sleep Quality"
            value={Math.round(biometrics.sleepQuality * 100)}
            unit="%"
            trend={correlations.sleepTrend}
            color="purple"
          />
          <MetricCard
            icon={Activity}
            label="Recovery Score"
            value={Math.round(biometrics.recoveryScore * 100)}
            unit="%"
            trend={correlations.recoveryTrend}
            color="green"
          />
        </div>

        {/* Meditation & Mindfulness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-800/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Mindfulness Practice</h3>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              <span className="text-2xl font-bold text-white">{biometrics.meditationMinutes}</span>
              <span className="text-gray-400">minutes today</span>
            </div>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((biometrics.meditationMinutes / 20) * 100, 100)}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
          <p className="mt-2 text-sm text-gray-400">Goal: 20 minutes daily</p>
        </motion.div>

        {/* Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <HRVTimeline data={realtimeData} />
            <EmotionWheel currentEmotion={biometrics.emotionalState} history={realtimeData} />
          </div>
          <div className="space-y-6">
            <StressHeatmap data={realtimeData} />
            <SleepImpactVisualization sleepData={biometrics} brainHealth={correlations} />
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">Personalized Insights</h3>
          <AnimatePresence mode="popLayout">
            {insights.map((insight, index) => (
              <InsightCard key={insight.id || index} insight={insight} />
            ))}
          </AnimatePresence>
        </div>

        {/* Brain Health Correlation */}
        {correlations.healingScore !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-green-900/20 border border-blue-800/30"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Brain Health Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Healing Progress</p>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${correlations.healingScore * 100}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                    />
                  </div>
                  <span className="text-white font-semibold">{Math.round(correlations.healingScore * 100)}%</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Neuroplasticity Index</p>
                <div className="text-3xl font-bold text-white">
                  {correlations.neuroplasticityIndex?.toFixed(2) || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Active Brain Regions</p>
                <div className="flex flex-wrap gap-2">
                  {correlations.affectedRegions?.map(region => (
                    <span
                      key={region}
                      className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BiometricDashboard;