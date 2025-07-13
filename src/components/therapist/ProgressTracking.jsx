import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Calendar,
  Award,
  BarChart3,
  LineChart,
  PieChart,
  Shield,
  Heart,
  Brain,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { trackProgressMetrics } from '../../services/TherapeuticIntelligence';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressTracking = ({ clientId, currentSession, metrics }) => {
  const [progressData, setProgressData] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [timeRange, setTimeRange] = useState('3months');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [clientId, timeRange]);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      const data = await trackProgressMetrics(clientId);
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      r: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12
          }
        },
        ticks: {
          display: false
        },
        min: 0,
        max: 100
      }
    }
  };

  // Mock session data for visualization
  const sessionHistory = {
    labels: ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5', 'Today'],
    datasets: [
      {
        label: 'Engagement',
        data: [45, 52, 58, 55, 68, metrics.engagementLevel],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4
      },
      {
        label: 'Alliance',
        data: [50, 55, 62, 70, 75, metrics.therapeuticAlliance],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const symptomData = {
    labels: ['Anxiety', 'Depression', 'Sleep Issues', 'Social Withdrawal', 'Trauma Symptoms'],
    datasets: [
      {
        label: 'Initial',
        data: [85, 75, 90, 70, 80],
        borderColor: 'rgba(239, 68, 68, 0.5)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        pointBackgroundColor: 'rgba(239, 68, 68, 0.5)'
      },
      {
        label: 'Current',
        data: [60, 55, 65, 45, 50],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        pointBackgroundColor: 'rgb(34, 197, 94)'
      }
    ]
  };

  const getProgressIndicator = (value) => {
    if (value > 10) return { icon: ArrowUp, color: 'text-green-400' };
    if (value < -10) return { icon: ArrowDown, color: 'text-red-400' };
    return { icon: Minus, color: 'text-gray-400' };
  };

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'symptoms', label: 'Symptoms', icon: Activity },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'milestones', label: 'Milestones', icon: Award }
  ];

  return (
    <div className="space-y-4">
      {/* View Mode Selector */}
      <div className="flex gap-2">
        {viewModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                viewMode === mode.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{mode.label}</span>
            </motion.button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading progress data...</div>
        </div>
      ) : (
        <>
          {/* Overview Mode */}
          {viewMode === 'overview' && (
            <div className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Overall Progress</span>
                    {progressData && getProgressIndicator(progressData.overallImprovement).icon && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={getProgressIndicator(progressData.overallImprovement).color}
                      >
                        {React.createElement(getProgressIndicator(progressData.overallImprovement).icon, {
                          className: 'w-4 h-4'
                        })}
                      </motion.div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {progressData?.overallImprovement || 0}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Since first session
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Sessions</span>
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">6</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Weekly consistency
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Skills Learned</span>
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {progressData?.copingSkillsAcquired?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Active coping strategies
                  </div>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-4">Session Progress</h3>
                <div className="h-64">
                  <Line data={sessionHistory} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Symptoms Mode */}
          {viewMode === 'symptoms' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-4">Symptom Reduction</h3>
                <div className="h-80">
                  <Radar data={symptomData} options={radarOptions} />
                </div>
              </div>

              {/* Symptom Details */}
              <div className="grid grid-cols-2 gap-4">
                {progressData?.symptomReduction && Object.entries(progressData.symptomReduction).map(([symptom, reduction]) => (
                  <div key={symptom} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400 capitalize">{symptom}</span>
                      <span className={`text-sm font-medium ${
                        reduction > 20 ? 'text-green-400' : 
                        reduction > 10 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        -{reduction}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-red-400 to-green-400 h-full rounded-full"
                        animate={{ width: `${reduction}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Mode */}
          {viewMode === 'skills' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-4">Coping Skills Acquired</h3>
                <div className="grid grid-cols-2 gap-3">
                  {progressData?.copingSkillsAcquired?.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    >
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Shield className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm text-gray-300">{skill}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skill Usage Frequency */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-4">Skill Application</h3>
                <div className="space-y-3">
                  {['Grounding techniques', 'Emotional regulation', 'Boundary setting'].map((skill, index) => {
                    const usage = 70 - (index * 15);
                    return (
                      <div key={skill} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{skill}</span>
                          <span className="text-xs text-gray-400">{usage}% of time</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            className="bg-purple-400 h-full rounded-full"
                            animate={{ width: `${usage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Milestones Mode */}
          {viewMode === 'milestones' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-4">Therapeutic Milestones</h3>
                <div className="space-y-3">
                  {[
                    { date: '2 weeks ago', milestone: 'First breakthrough - connected childhood trauma to current anxiety', achieved: true },
                    { date: '1 week ago', milestone: 'Successfully used grounding technique during panic attack', achieved: true },
                    { date: 'Today', milestone: 'Expressed vulnerability without defensive behaviors', achieved: true },
                    { date: 'Goal', milestone: 'Return to work with confidence', achieved: false }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        item.achieved ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        item.achieved ? 'bg-green-500/20' : 'bg-white/10'
                      }`}>
                        <Award className={`w-4 h-4 ${
                          item.achieved ? 'text-green-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{item.milestone}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Next Goals */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
                <h4 className="text-white font-medium mb-3">Upcoming Goals</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <Target className="w-4 h-4 text-purple-400" />
                    Reduce anxiety symptoms by additional 20%
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <Heart className="w-4 h-4 text-pink-400" />
                    Improve relationship communication patterns
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <Brain className="w-4 h-4 text-blue-400" />
                    Process traumatic memories with EMDR
                  </li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProgressTracking;