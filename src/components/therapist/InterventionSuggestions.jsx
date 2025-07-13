import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Brain, 
  Heart, 
  Wind,
  Users,
  Shield,
  Layers,
  Target,
  BookOpen,
  ChevronDown,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import { generateInterventionSuggestions } from '../../services/TherapeuticIntelligence';

const InterventionSuggestions = ({ emotionalState, clientHistory, onInterventionSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [emotionalState, clientHistory]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const interventions = await generateInterventionSuggestions(emotionalState, clientHistory);
      
      // Add additional evidence-based interventions
      const enrichedInterventions = [
        ...interventions,
        ...getProtocolBasedInterventions(emotionalState)
      ];
      
      setSuggestions(enrichedInterventions);
    } catch (error) {
      console.error('Error loading interventions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProtocolBasedInterventions = (state) => {
    const protocols = {
      anxious: [
        {
          type: 'CBT Technique',
          category: 'cognitive',
          description: 'Thought challenging worksheet',
          rationale: 'Helps identify and restructure anxious thoughts',
          protocol: 'CBT',
          steps: [
            'Identify the anxious thought',
            'Rate belief in thought (0-100%)',
            'List evidence for and against',
            'Create balanced thought',
            'Re-rate belief'
          ],
          effectiveness: 85,
          timeEstimate: '10-15 minutes',
          contraindications: ['Severe dissociation', 'Active psychosis']
        },
        {
          type: 'Somatic Technique',
          category: 'somatic',
          description: 'Progressive muscle relaxation',
          rationale: 'Releases physical tension associated with anxiety',
          protocol: 'Somatic Experiencing',
          steps: [
            'Start with toes, tense for 5 seconds',
            'Release and notice the relaxation',
            'Move up through each muscle group',
            'End with full body scan'
          ],
          effectiveness: 78,
          timeEstimate: '15-20 minutes'
        }
      ],
      distressed: [
        {
          type: 'DBT Skill',
          category: 'emotional-regulation',
          description: 'PLEASE skills for vulnerability reduction',
          rationale: 'Addresses factors that increase emotional vulnerability',
          protocol: 'DBT',
          components: [
            'PL - Treat physical illness',
            'E - Balance eating',
            'A - Avoid mood-altering substances',
            'S - Balance sleep',
            'E - Get exercise'
          ],
          effectiveness: 82,
          timeEstimate: 'Ongoing practice'
        },
        {
          type: 'EMDR Preparation',
          category: 'trauma',
          description: 'Safe place visualization',
          rationale: 'Creates internal resource for emotional regulation',
          protocol: 'EMDR',
          steps: [
            'Identify a real or imagined safe place',
            'Engage all senses in visualization',
            'Install with bilateral stimulation',
            'Practice accessing when distressed'
          ],
          effectiveness: 88,
          timeEstimate: '20-30 minutes',
          requiresTraining: true
        }
      ],
      positive: [
        {
          type: 'Positive Psychology',
          category: 'strengths',
          description: 'Strengths exploration exercise',
          rationale: 'Builds on positive momentum to identify resources',
          protocol: 'Positive Psychology',
          activities: [
            'Identify top 5 character strengths',
            'Share examples of using each strength',
            'Plan how to use strengths this week',
            'Create strengths reminder card'
          ],
          effectiveness: 75,
          timeEstimate: '15-20 minutes'
        }
      ]
    };

    return protocols[state] || protocols.positive;
  };

  const categories = [
    { id: 'all', label: 'All Interventions', icon: Layers },
    { id: 'cognitive', label: 'Cognitive', icon: Brain },
    { id: 'somatic', label: 'Somatic', icon: Heart },
    { id: 'emotional-regulation', label: 'Emotion Regulation', icon: Wind },
    { id: 'trauma', label: 'Trauma-Focused', icon: Shield },
    { id: 'strengths', label: 'Strengths-Based', icon: Star }
  ];

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const getProtocolColor = (protocol) => {
    const colors = {
      'CBT': 'text-blue-400',
      'DBT': 'text-purple-400',
      'EMDR': 'text-green-400',
      'Somatic Experiencing': 'text-orange-400',
      'Positive Psychology': 'text-yellow-400'
    };
    return colors[protocol] || 'text-gray-400';
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Current State Indicator */}
      <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
        <Heart className="w-5 h-5 text-pink-400" />
        <span className="text-sm text-gray-300">
          Suggesting interventions for <span className="text-white font-medium">{emotionalState}</span> state
        </span>
      </div>

      {/* Intervention Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-400">Loading interventions...</div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredSuggestions.map((suggestion, index) => (
              <motion.div
                key={`${suggestion.type}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedSuggestion(
                    expandedSuggestion === index ? null : index
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-semibold">{suggestion.type}</h4>
                        {suggestion.protocol && (
                          <span className={`text-xs font-medium ${getProtocolColor(suggestion.protocol)}`}>
                            {suggestion.protocol}
                          </span>
                        )}
                        {suggestion.requiresTraining && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                            Training Required
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        {suggestion.effectiveness && (
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-green-400" />
                            <span className="text-gray-400">
                              {suggestion.effectiveness}% effective
                            </span>
                          </div>
                        )}
                        {suggestion.timeEstimate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-400" />
                            <span className="text-gray-400">{suggestion.timeEstimate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedSuggestion === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSuggestion === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 space-y-4">
                        {/* Rationale */}
                        <div>
                          <h5 className="text-sm font-medium text-white mb-1">Rationale</h5>
                          <p className="text-sm text-gray-300">{suggestion.rationale}</p>
                        </div>

                        {/* Steps or Components */}
                        {suggestion.steps && (
                          <div>
                            <h5 className="text-sm font-medium text-white mb-2">Steps</h5>
                            <ol className="space-y-1">
                              {suggestion.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                  <span className="text-purple-400 font-medium">{i + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {suggestion.components && (
                          <div>
                            <h5 className="text-sm font-medium text-white mb-2">Components</h5>
                            <ul className="space-y-1">
                              {suggestion.components.map((component, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                                  <span>{component}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {suggestion.activities && (
                          <div>
                            <h5 className="text-sm font-medium text-white mb-2">Activities</h5>
                            <ul className="space-y-1">
                              {suggestion.activities.map((activity, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {suggestion.examples && (
                          <div>
                            <h5 className="text-sm font-medium text-white mb-2">Examples</h5>
                            <ul className="space-y-1">
                              {suggestion.examples.map((example, i) => (
                                <li key={i} className="text-sm text-gray-300 italic">
                                  "{example}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {suggestion.questions && (
                          <div>
                            <h5 className="text-sm font-medium text-white mb-2">Questions to Ask</h5>
                            <ul className="space-y-1">
                              {suggestion.questions.map((question, i) => (
                                <li key={i} className="text-sm text-gray-300">
                                  • {question}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Contraindications */}
                        {suggestion.contraindications && (
                          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                            <h5 className="text-sm font-medium text-red-300 mb-1">Contraindications</h5>
                            <ul className="space-y-1">
                              {suggestion.contraindications.map((item, i) => (
                                <li key={i} className="text-sm text-red-200">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="flex gap-3 pt-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onInterventionSelect(suggestion)}
                            className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors font-medium"
                          >
                            Use This Intervention
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            <BookOpen className="w-4 h-4 inline mr-2" />
                            View Resources
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Evidence-Based Badge */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Lightbulb className="w-5 h-5 text-blue-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium">Evidence-Based Interventions</h4>
            <p className="text-gray-300 text-sm">
              All suggestions are based on empirically supported treatments and best practices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionSuggestions;