import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  AlertCircle,
  Lightbulb,
  FileText,
  Users,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';
import SessionInsights from './therapist/SessionInsights';
import InterventionSuggestions from './therapist/InterventionSuggestions';
import ProgressTracking from './therapist/ProgressTracking';
import SessionNotes from './therapist/SessionNotes';
import { analyzeSessionInRealTime } from '../services/TherapeuticIntelligence';

const TherapistCoPilot = ({ 
  clientId, 
  sessionId, 
  brainData,
  onInterventionSelect,
  onInsightCapture
}) => {
  const [activeTab, setActiveTab] = useState('insights');
  const [sessionMetrics, setSessionMetrics] = useState({
    emotionalState: 'neutral',
    engagementLevel: 0,
    therapeuticAlliance: 0,
    breakthroughMoments: [],
    riskIndicators: []
  });
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTranscript, setSessionTranscript] = useState('');
  const analysisIntervalRef = useRef(null);

  useEffect(() => {
    if (isRecording && sessionId) {
      // Start real-time analysis
      analysisIntervalRef.current = setInterval(async () => {
        const analysis = await analyzeSessionInRealTime({
          clientId,
          sessionId,
          brainData,
          transcript: sessionTranscript
        });
        setSessionMetrics(analysis);
      }, 5000); // Analyze every 5 seconds

      return () => {
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
        }
      };
    }
  }, [isRecording, sessionId, clientId, brainData, sessionTranscript]);

  const tabs = [
    { id: 'insights', label: 'Live Insights', icon: Brain },
    { id: 'interventions', label: 'Interventions', icon: Lightbulb },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'notes', label: 'Session Notes', icon: FileText }
  ];

  const getEmotionalStateColor = (state) => {
    const colors = {
      positive: 'text-green-500',
      neutral: 'text-blue-500',
      anxious: 'text-yellow-500',
      distressed: 'text-red-500'
    };
    return colors[state] || 'text-gray-500';
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Therapist Co-Pilot</h2>
            <p className="text-gray-400 text-sm">AI-Enhanced Session Support</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRecording(!isRecording)}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            isRecording 
              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
              : 'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}
        >
          {isRecording ? 'Stop Recording' : 'Start Session'}
        </motion.button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-gray-400">Emotional State</span>
          </div>
          <p className={`text-lg font-semibold ${getEmotionalStateColor(sessionMetrics.emotionalState)}`}>
            {sessionMetrics.emotionalState.charAt(0).toUpperCase() + sessionMetrics.emotionalState.slice(1)}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <motion.div 
                className="bg-blue-400 h-full rounded-full"
                animate={{ width: `${sessionMetrics.engagementLevel}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm text-white">{sessionMetrics.engagementLevel}%</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Alliance Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <motion.div 
                className="bg-green-400 h-full rounded-full"
                animate={{ width: `${sessionMetrics.therapeuticAlliance}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm text-white">{sessionMetrics.therapeuticAlliance}%</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Risk Indicators</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {sessionMetrics.riskIndicators.length}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {activeTab === 'insights' && (
            <SessionInsights 
              metrics={sessionMetrics}
              brainData={brainData}
              onInsightCapture={onInsightCapture}
            />
          )}
          
          {activeTab === 'interventions' && (
            <InterventionSuggestions
              emotionalState={sessionMetrics.emotionalState}
              clientHistory={clientId}
              onInterventionSelect={onInterventionSelect}
            />
          )}
          
          {activeTab === 'progress' && (
            <ProgressTracking
              clientId={clientId}
              currentSession={sessionId}
              metrics={sessionMetrics}
            />
          )}
          
          {activeTab === 'notes' && (
            <SessionNotes
              sessionId={sessionId}
              clientId={clientId}
              metrics={sessionMetrics}
              transcript={sessionTranscript}
              onTranscriptUpdate={setSessionTranscript}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Breakthrough Moments Alert */}
      <AnimatePresence>
        {sessionMetrics.breakthroughMoments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/30 rounded-lg">
                <Lightbulb className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Breakthrough Moment Detected</h4>
                <p className="text-gray-300 text-sm">
                  {sessionMetrics.breakthroughMoments[sessionMetrics.breakthroughMoments.length - 1]}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TherapistCoPilot;