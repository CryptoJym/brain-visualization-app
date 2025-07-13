// Brain Training Protocols - Scientific exercises and recovery protocols for neuroplasticity

export const getBrainTrainingProtocols = () => {
  return {
    prefrontal: {
      name: 'Prefrontal Cortex',
      functions: ['Executive function', 'Decision making', 'Planning', 'Working memory'],
      exercises: [
        {
          name: 'Dual N-Back',
          description: 'Improves working memory and fluid intelligence',
          duration: '20 minutes',
          frequency: 'Daily',
          difficulty: [1, 2, 3, 4, 5],
          scientificBasis: 'Jaeggi et al. (2008) - Increases in fluid intelligence after n-back training'
        },
        {
          name: 'Task Switching',
          description: 'Enhances cognitive flexibility and attention control',
          duration: '15 minutes',
          frequency: '3-4 times per week',
          difficulty: [1, 2, 3, 4, 5],
          scientificBasis: 'Karbach & Verhaeghen (2014) - Executive control training effects'
        },
        {
          name: 'Meditation Focus',
          description: 'Strengthens attention networks and emotional regulation',
          duration: '10-30 minutes',
          frequency: 'Daily',
          difficulty: [1, 2, 3],
          scientificBasis: 'Tang et al. (2007) - Short-term meditation induces white matter changes'
        }
      ],
      recoveryProtocol: {
        minRestHours: 4,
        optimalRestHours: 24,
        tips: [
          'Sleep is crucial for prefrontal recovery',
          'Avoid multitasking during recovery',
          'Light physical exercise enhances recovery'
        ]
      }
    },
    
    hippocampus: {
      name: 'Hippocampus',
      functions: ['Memory formation', 'Spatial navigation', 'Pattern separation'],
      exercises: [
        {
          name: 'Method of Loci',
          description: 'Ancient memory technique using spatial visualization',
          duration: '30 minutes',
          frequency: 'Daily practice',
          difficulty: [1, 2, 3, 4, 5],
          scientificBasis: 'Maguire et al. (2003) - London taxi drivers study on hippocampal plasticity'
        },
        {
          name: 'Aerobic Exercise',
          description: 'Promotes neurogenesis in the hippocampus',
          duration: '30-45 minutes',
          frequency: '3-5 times per week',
          difficulty: [1, 2, 3],
          scientificBasis: 'Erickson et al. (2011) - Exercise increases hippocampal volume'
        },
        {
          name: 'Novel Environment Exploration',
          description: 'Stimulates place cells and grid cells',
          duration: '60 minutes',
          frequency: 'Weekly',
          difficulty: [1, 2],
          scientificBasis: "O'Keefe & Nadel (1978) - Hippocampus as a cognitive map"
        }
      ],
      recoveryProtocol: {
        minRestHours: 6,
        optimalRestHours: 48,
        tips: [
          'REM sleep consolidates hippocampal memories',
          'Avoid alcohol during memory consolidation',
          'Omega-3 fatty acids support hippocampal health'
        ]
      }
    },
    
    amygdala: {
      name: 'Amygdala',
      functions: ['Emotional processing', 'Fear response', 'Threat detection'],
      exercises: [
        {
          name: 'Exposure Therapy Simulation',
          description: 'Gradual exposure to controlled stressors',
          duration: '20-30 minutes',
          frequency: '2-3 times per week',
          difficulty: [1, 2, 3, 4],
          scientificBasis: 'Phelps et al. (2004) - Extinction learning and amygdala plasticity'
        },
        {
          name: 'Heart Rate Variability Training',
          description: 'Biofeedback for emotional regulation',
          duration: '15 minutes',
          frequency: 'Daily',
          difficulty: [1, 2, 3],
          scientificBasis: 'Thayer et al. (2012) - HRV and prefrontal-amygdala connectivity'
        },
        {
          name: 'Compassion Meditation',
          description: 'Reduces amygdala reactivity to negative stimuli',
          duration: '20 minutes',
          frequency: 'Daily',
          difficulty: [1, 2, 3],
          scientificBasis: 'Klimecki et al. (2013) - Compassion training effects on amygdala'
        }
      ],
      recoveryProtocol: {
        minRestHours: 8,
        optimalRestHours: 24,
        tips: [
          'Social support aids emotional recovery',
          'Nature exposure reduces amygdala activation',
          'Avoid stimulants during recovery'
        ]
      }
    },
    
    insula: {
      name: 'Insula',
      functions: ['Interoception', 'Body awareness', 'Empathy', 'Pain processing'],
      exercises: [
        {
          name: 'Body Scan Meditation',
          description: 'Systematic attention to body sensations',
          duration: '20-45 minutes',
          frequency: 'Daily',
          difficulty: [1, 2, 3],
          scientificBasis: 'Farb et al. (2013) - Interoceptive awareness and insula function'
        },
        {
          name: 'Breath Awareness Practice',
          description: 'Focused attention on breathing sensations',
          duration: '10-20 minutes',
          frequency: 'Multiple times daily',
          difficulty: [1, 2],
          scientificBasis: 'Critchley et al. (2004) - Insula and autonomic awareness'
        },
        {
          name: 'Temperature Contrast Training',
          description: 'Cold/heat exposure for interoceptive accuracy',
          duration: '10-15 minutes',
          frequency: '3 times per week',
          difficulty: [2, 3, 4],
          scientificBasis: 'Craig (2009) - Insula and thermosensory processing'
        }
      ],
      recoveryProtocol: {
        minRestHours: 2,
        optimalRestHours: 12,
        tips: [
          'Hydration supports interoceptive accuracy',
          'Yoga enhances body awareness recovery',
          'Mindful eating strengthens insula function'
        ]
      }
    },
    
    cingulate: {
      name: 'Anterior Cingulate Cortex',
      functions: ['Attention control', 'Conflict monitoring', 'Error detection', 'Pain modulation'],
      exercises: [
        {
          name: 'Stroop Task Variations',
          description: 'Cognitive conflict resolution training',
          duration: '15-20 minutes',
          frequency: 'Daily',
          difficulty: [1, 2, 3, 4, 5],
          scientificBasis: 'Bush et al. (2000) - ACC and cognitive control'
        },
        {
          name: 'Focused Attention Meditation',
          description: 'Sustained attention on single object',
          duration: '20-40 minutes',
          frequency: 'Daily',
          difficulty: [1, 2, 3, 4],
          scientificBasis: 'Lutz et al. (2004) - Meditation and ACC activation'
        },
        {
          name: 'Error Monitoring Games',
          description: 'Deliberate error detection and correction',
          duration: '15 minutes',
          frequency: '4-5 times per week',
          difficulty: [1, 2, 3, 4],
          scientificBasis: 'Holroyd & Coles (2002) - ACC and performance monitoring'
        }
      ],
      recoveryProtocol: {
        minRestHours: 3,
        optimalRestHours: 18,
        tips: [
          'Avoid cognitive overload during recovery',
          'Short naps enhance ACC recovery',
          'Green tea supports attention networks'
        ]
      }
    }
  }
}

// Difficulty progression algorithms
export const getDifficultyProgression = (region, currentLevel) => {
  const progressions = {
    prefrontal: {
      1: { nBack: 1, taskCount: 2, timeLimit: 'relaxed' },
      2: { nBack: 2, taskCount: 3, timeLimit: 'moderate' },
      3: { nBack: 2, taskCount: 4, timeLimit: 'strict' },
      4: { nBack: 3, taskCount: 5, timeLimit: 'strict' },
      5: { nBack: 3, taskCount: 6, timeLimit: 'very strict' }
    },
    hippocampus: {
      1: { itemCount: 5, delay: '30s', interference: 'none' },
      2: { itemCount: 8, delay: '1min', interference: 'low' },
      3: { itemCount: 12, delay: '2min', interference: 'medium' },
      4: { itemCount: 15, delay: '5min', interference: 'high' },
      5: { itemCount: 20, delay: '10min', interference: 'very high' }
    },
    amygdala: {
      1: { stressorIntensity: 'minimal', copingTools: 'all', guidance: 'full' },
      2: { stressorIntensity: 'low', copingTools: 'most', guidance: 'moderate' },
      3: { stressorIntensity: 'moderate', copingTools: 'some', guidance: 'minimal' },
      4: { stressorIntensity: 'high', copingTools: 'few', guidance: 'none' },
      5: { stressorIntensity: 'very high', copingTools: 'minimal', guidance: 'none' }
    },
    insula: {
      1: { sensitivity: 'obvious', distractors: 'none', precision: 'low' },
      2: { sensitivity: 'clear', distractors: 'few', precision: 'moderate' },
      3: { sensitivity: 'subtle', distractors: 'some', precision: 'high' },
      4: { sensitivity: 'very subtle', distractors: 'many', precision: 'very high' },
      5: { sensitivity: 'threshold', distractors: 'maximum', precision: 'extreme' }
    },
    cingulate: {
      1: { conflictLevel: 'low', distractors: 'none', speed: 'self-paced' },
      2: { conflictLevel: 'moderate', distractors: 'few', speed: 'relaxed' },
      3: { conflictLevel: 'high', distractors: 'moderate', speed: 'moderate' },
      4: { conflictLevel: 'very high', distractors: 'many', speed: 'fast' },
      5: { conflictLevel: 'extreme', distractors: 'constant', speed: 'very fast' }
    }
  }
  
  return progressions[region]?.[currentLevel] || progressions[region]?.[1]
}

// Effectiveness measurement criteria
export const getEffectivenessCriteria = (region) => {
  return {
    prefrontal: {
      metrics: ['accuracy', 'reaction_time', 'task_switching_cost', 'working_memory_span'],
      targets: {
        beginner: { accuracy: 0.6, reactionTime: 2000, switchingCost: 500, span: 3 },
        intermediate: { accuracy: 0.75, reactionTime: 1500, switchingCost: 300, span: 5 },
        advanced: { accuracy: 0.9, reactionTime: 1000, switchingCost: 150, span: 7 }
      }
    },
    hippocampus: {
      metrics: ['recall_accuracy', 'retention_duration', 'pattern_separation', 'spatial_accuracy'],
      targets: {
        beginner: { recall: 0.5, retention: '5min', separation: 0.6, spatial: 0.7 },
        intermediate: { recall: 0.7, retention: '30min', separation: 0.75, spatial: 0.85 },
        advanced: { recall: 0.9, retention: '24hr', separation: 0.9, spatial: 0.95 }
      }
    },
    amygdala: {
      metrics: ['regulation_speed', 'recovery_time', 'baseline_return', 'coping_effectiveness'],
      targets: {
        beginner: { regulationSpeed: 60, recoveryTime: 300, baselineReturn: 0.7, copingScore: 0.6 },
        intermediate: { regulationSpeed: 30, recoveryTime: 180, baselineReturn: 0.85, copingScore: 0.8 },
        advanced: { regulationSpeed: 15, recoveryTime: 60, baselineReturn: 0.95, copingScore: 0.95 }
      }
    },
    insula: {
      metrics: ['interoceptive_accuracy', 'sensitivity_threshold', 'body_map_precision', 'prediction_error'],
      targets: {
        beginner: { accuracy: 0.5, threshold: 0.8, precision: 0.6, error: 0.4 },
        intermediate: { accuracy: 0.7, threshold: 0.6, precision: 0.8, error: 0.25 },
        advanced: { accuracy: 0.9, threshold: 0.4, precision: 0.95, error: 0.1 }
      }
    },
    cingulate: {
      metrics: ['sustained_attention', 'conflict_resolution', 'error_detection', 'adaptation_rate'],
      targets: {
        beginner: { attention: 0.6, conflict: 0.65, errorDetection: 0.7, adaptation: 0.5 },
        intermediate: { attention: 0.8, conflict: 0.8, errorDetection: 0.85, adaptation: 0.7 },
        advanced: { attention: 0.95, conflict: 0.95, errorDetection: 0.95, adaptation: 0.9 }
      }
    }
  }
}

// Recovery time calculations based on intensity and performance
export const calculateRecoveryTime = (region, sessionData) => {
  const baseRecovery = {
    prefrontal: 4,    // hours
    hippocampus: 6,   // hours
    amygdala: 8,      // hours
    insula: 2,        // hours
    cingulate: 3      // hours
  }
  
  const { duration, intensity, performance } = sessionData
  
  // Factors that increase recovery time
  const durationFactor = duration > 30 ? 1.5 : 1.0
  const intensityFactor = 1 + (intensity / 10)
  const performanceFactor = performance < 0.5 ? 1.3 : 1.0
  
  // Calculate total recovery time
  const recoveryHours = baseRecovery[region] * durationFactor * intensityFactor * performanceFactor
  
  return {
    minimum: Math.floor(recoveryHours * 0.75),
    optimal: Math.floor(recoveryHours),
    maximum: Math.floor(recoveryHours * 1.5)
  }
}

// Neuroplasticity principles for game design
export const neuroplasticityPrinciples = {
  specificity: 'Training effects are specific to the trained task and brain region',
  repetition: 'Consistent practice is required for lasting neural changes',
  intensity: 'Challenging but achievable difficulty promotes growth',
  timing: 'Spaced practice is more effective than massed practice',
  salience: 'Emotionally engaging tasks enhance plasticity',
  age: 'Younger brains are more plastic, but adult plasticity is significant',
  multimodal: 'Combining sensory modalities enhances learning',
  feedback: 'Immediate, clear feedback accelerates learning',
  sleep: 'Sleep consolidates neural changes from training',
  novelty: 'Novel challenges promote new neural connections'
}