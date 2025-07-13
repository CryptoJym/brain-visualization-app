import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  Heart, 
  AlertTriangle,
  TrendingUp,
  Eye,
  MessageSquare,
  Zap,
  Shield
} from 'lucide-react';

const SessionInsights = ({ metrics, brainData, onInsightCapture }) => {
  const [insights, setInsights] = useState([]);
  const [focusArea, setFocusArea] = useState(null);

  useEffect(() => {
    generateInsights();
  }, [metrics, brainData]);

  const generateInsights = () => {
    const newInsights = [];

    // Emotional state insights
    if (metrics.emotionalState === 'distressed') {
      newInsights.push({
        id: 'emotional-distress',
        type: 'warning',
        title: 'Elevated Distress Detected',
        description: 'Client showing signs of emotional distress. Consider grounding or validation techniques.',
        icon: AlertTriangle,
        priority: 'high',
        actionable: true
      });
    }

    // Engagement insights
    if (metrics.engagementLevel < 30) {
      newInsights.push({
        id: 'low-engagement',
        type: 'attention',
        title: 'Low Engagement',
        description: 'Client engagement is below optimal levels. Try more open-ended questions or change approach.',
        icon: Activity,
        priority: 'medium',
        actionable: true
      });
    } else if (metrics.engagementLevel > 80) {
      newInsights.push({
        id: 'high-engagement',
        type: 'positive',
        title: 'High Engagement',
        description: 'Client is highly engaged. This is a good opportunity for deeper exploration.',
        icon: TrendingUp,
        priority: 'low',
        actionable: false
      });
    }

    // Breakthrough moments
    if (metrics.breakthroughMoments.length > 0) {
      newInsights.push({
        id: 'breakthrough',
        type: 'breakthrough',
        title: 'Breakthrough Moment',
        description: `Client had an insight: "${metrics.breakthroughMoments[metrics.breakthroughMoments.length - 1]}"`,
        icon: Zap,
        priority: 'high',
        actionable: true
      });
    }

    // Brain activity insights
    if (brainData && brainData.regions) {
      // Amygdala hyperactivity
      if (brainData.regions.amygdala?.activity > 0.8) {
        newInsights.push({
          id: 'amygdala-activity',
          type: 'neurological',
          title: 'Heightened Amygdala Activity',
          description: 'Fear center is highly active. Client may be experiencing trauma activation.',
          icon: Brain,
          priority: 'high',
          actionable: true
        });
      }

      // Prefrontal cortex activity
      if (brainData.regions.prefrontalCortex?.activity < 0.3) {
        newInsights.push({
          id: 'pfc-activity',
          type: 'neurological',
          title: 'Low Prefrontal Activity',
          description: 'Executive function may be impaired. Consider simplifying language and providing structure.',
          icon: Brain,
          priority: 'medium',
          actionable: true
        });
      }
    }

    // Therapeutic alliance
    if (metrics.therapeuticAlliance < 40) {
      newInsights.push({
        id: 'alliance-concern',
        type: 'warning',
        title: 'Alliance Needs Attention',
        description: 'Therapeutic alliance is below optimal. Focus on building rapport and trust.',
        icon: Heart,
        priority: 'high',
        actionable: true
      });
    }

    setInsights(newInsights);
  };

  const getInsightColor = (type) => {
    const colors = {
      warning: 'border-red-500/30 bg-red-500/10',
      attention: 'border-yellow-500/30 bg-yellow-500/10',
      positive: 'border-green-500/30 bg-green-500/10',
      breakthrough: 'border-purple-500/30 bg-purple-500/10',
      neurological: 'border-blue-500/30 bg-blue-500/10'
    };
    return colors[type] || 'border-gray-500/30 bg-gray-500/10';
  };

  const getIconColor = (type) => {
    const colors = {
      warning: 'text-red-400',
      attention: 'text-yellow-400',
      positive: 'text-green-400',
      breakthrough: 'text-purple-400',
      neurological: 'text-blue-400'
    };
    return colors[type] || 'text-gray-400';
  };

  return (
    <div className="space-y-4">
      {/* Real-time Insights */}
      <div className="grid gap-3">
        <AnimatePresence>
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-xl border ${getInsightColor(insight.type)} cursor-pointer transition-all hover:scale-[1.02]`}
                onClick={() => setFocusArea(insight)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white/10 ${getIconColor(insight.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                    <p className="text-gray-300 text-sm">{insight.description}</p>
                    {insight.actionable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInsightCapture(insight);
                        }}
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Take Action →
                      </button>
                    )}
                  </div>
                  {insight.priority === 'high' && (
                    <div className="px-2 py-1 bg-red-500/20 rounded text-red-300 text-xs font-medium">
                      HIGH
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Brain Region Activity */}
      {brainData && brainData.regions && (
        <div className="mt-6 p-4 bg-white/5 rounded-xl">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Brain Activity Patterns
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(brainData.regions).map(([region, data]) => (
              <div key={region} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 capitalize">
                    {region.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-white">
                    {Math.round(data.activity * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className={`h-full rounded-full ${
                      data.activity > 0.7 ? 'bg-red-400' : 
                      data.activity > 0.4 ? 'bg-yellow-400' : 
                      'bg-green-400'
                    }`}
                    animate={{ width: `${data.activity * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Patterns */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" />
          Observable Patterns
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">
              Client tends to be more open when discussing {metrics.emotionalState === 'positive' ? 'achievements' : 'challenges'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">
              Defense mechanisms: {metrics.engagementLevel < 40 ? 'Heightened' : 'Relaxed'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">
              Energy level: {metrics.engagementLevel > 70 ? 'High' : metrics.engagementLevel > 40 ? 'Moderate' : 'Low'}
            </span>
          </div>
        </div>
      </div>

      {/* Focus Area Detail */}
      <AnimatePresence>
        {focusArea && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setFocusArea(null)}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">{focusArea.title}</h3>
              <p className="text-gray-300 mb-4">{focusArea.description}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onInsightCapture(focusArea);
                    setFocusArea(null);
                  }}
                  className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Take Action
                </button>
                <button
                  onClick={() => setFocusArea(null)}
                  className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionInsights;