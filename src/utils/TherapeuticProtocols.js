// Evidence-based therapeutic protocols and interventions

export const CBT_PROTOCOLS = {
  thoughtChallenging: {
    name: 'Thought Challenging',
    description: 'Identify and restructure cognitive distortions',
    steps: [
      'Identify the automatic thought',
      'Rate belief in thought (0-100%)',
      'Identify emotions and intensity',
      'List evidence for the thought',
      'List evidence against the thought',
      'Create a balanced thought',
      'Re-rate belief and emotions'
    ],
    worksheets: {
      thoughtRecord: {
        fields: ['situation', 'automaticThought', 'emotions', 'evidenceFor', 'evidenceAgainst', 'balancedThought', 'outcome']
      }
    },
    commonDistortions: [
      'All-or-nothing thinking',
      'Overgeneralization',
      'Mental filter',
      'Disqualifying the positive',
      'Jumping to conclusions',
      'Magnification/Minimization',
      'Emotional reasoning',
      'Should statements',
      'Labeling',
      'Personalization'
    ]
  },
  
  behavioralActivation: {
    name: 'Behavioral Activation',
    description: 'Increase engagement in meaningful activities',
    components: [
      'Activity monitoring',
      'Values identification',
      'Activity scheduling',
      'Pleasure and mastery ratings',
      'Behavioral experiments'
    ],
    tools: {
      activityLog: {
        trackingElements: ['activity', 'mood', 'pleasure', 'mastery', 'avoidance']
      }
    }
  },

  exposureTherapy: {
    name: 'Exposure Therapy',
    description: 'Gradual exposure to feared stimuli',
    phases: [
      'Psychoeducation about anxiety',
      'Create fear hierarchy',
      'Relaxation training',
      'Imaginal exposure',
      'In vivo exposure',
      'Relapse prevention'
    ],
    hierarchyBuilder: {
      suds: 'Subjective Units of Distress Scale (0-100)',
      categories: ['situations', 'thoughts', 'sensations', 'memories']
    }
  }
};

export const EMDR_PROTOCOLS = {
  standardProtocol: {
    name: 'EMDR Standard Protocol',
    phases: [
      {
        phase: 1,
        name: 'History Taking',
        goals: ['Identify targets', 'Assess readiness', 'Treatment planning']
      },
      {
        phase: 2,
        name: 'Preparation',
        goals: ['Explain EMDR', 'Establish safety', 'Teach self-control techniques']
      },
      {
        phase: 3,
        name: 'Assessment',
        goals: ['Activate target', 'Baseline measurements', 'Identify components']
      },
      {
        phase: 4,
        name: 'Desensitization',
        goals: ['Process disturbance', 'Reduce SUD to 0-1']
      },
      {
        phase: 5,
        name: 'Installation',
        goals: ['Strengthen positive belief', 'Increase VOC to 6-7']
      },
      {
        phase: 6,
        name: 'Body Scan',
        goals: ['Clear residual disturbance', 'Check for body sensations']
      },
      {
        phase: 7,
        name: 'Closure',
        goals: ['Return to equilibrium', 'Brief for between sessions']
      },
      {
        phase: 8,
        name: 'Reevaluation',
        goals: ['Check previous work', 'Identify new targets']
      }
    ],
    bilateralStimulation: {
      types: ['Eye movements', 'Tactile', 'Auditory'],
      speed: 'One back-and-forth per second',
      sets: '24+ movements per set'
    }
  },

  resourceInstallation: {
    name: 'Resource Development and Installation',
    description: 'Build and strengthen positive resources',
    steps: [
      'Identify needed resource',
      'Find or create resource memory',
      'Enhance with sensory details',
      'Install with short BLS sets',
      'Link to future scenarios'
    ]
  },

  safePlace: {
    name: 'Safe/Calm Place Exercise',
    description: 'Create internal resource for self-soothing',
    elements: [
      'Real or imagined place',
      'Engage all senses',
      'Ensure complete safety',
      'Install with BLS',
      'Create cue word',
      'Practice accessing'
    ]
  }
};

export const SOMATIC_PROTOCOLS = {
  bodyScanning: {
    name: 'Body Scan',
    description: 'Systematic attention to body sensations',
    sequence: [
      'Start at top of head or feet',
      'Move systematically through body',
      'Notice without changing',
      'Observe sensation quality',
      'Track changes',
      'Complete full scan'
    ],
    qualities: ['Temperature', 'Tension', 'Movement', 'Density', 'Color', 'Shape']
  },

  pendulation: {
    name: 'Pendulation',
    description: 'Moving between comfort and discomfort',
    process: [
      'Identify area of tension/discomfort',
      'Find area of calm/comfort',
      'Gently shift attention between them',
      'Notice what happens',
      'Allow natural movement',
      'Track integration'
    ]
  },

  titration: {
    name: 'Titration',
    description: 'Working with small amounts of activation',
    principles: [
      'Start with edge of sensation',
      'Work with manageable pieces',
      'Pause for integration',
      'Build tolerance gradually',
      'Honor body\'s pace'
    ]
  },

  resourcing: {
    name: 'Somatic Resourcing',
    description: 'Building body-based resources',
    types: [
      'Grounding through feet/sit bones',
      'Orienting to environment',
      'Pleasant body memories',
      'Supportive touch/self-touch',
      'Movement resources',
      'Breath as resource'
    ]
  }
};

export const DBT_SKILLS = {
  distressTolerance: {
    TIPP: {
      name: 'TIPP',
      description: 'Crisis survival skill for extreme emotions',
      components: [
        {
          letter: 'T',
          skill: 'Temperature',
          how: 'Cold water on face, hold ice, cold shower',
          why: 'Activates dive response, resets nervous system'
        },
        {
          letter: 'I',
          skill: 'Intense Exercise',
          how: 'Jumping jacks, running, fast walk',
          why: 'Expends physical energy from emotions'
        },
        {
          letter: 'P',
          skill: 'Paced Breathing',
          how: 'Exhale longer than inhale (4-6-8)',
          why: 'Activates parasympathetic nervous system'
        },
        {
          letter: 'P',
          skill: 'Paired Muscle Relaxation',
          how: 'Tense and release muscle groups',
          why: 'Releases physical tension'
        }
      ]
    },
    
    ACCEPTS: {
      name: 'ACCEPTS',
      description: 'Distraction techniques',
      skills: [
        'Activities - Do something',
        'Contributing - Help others',
        'Comparisons - To worse times',
        'Emotions - Opposite action',
        'Pushing away - Put distance',
        'Thoughts - Count, puzzle',
        'Sensations - Strong sensory input'
      ]
    },

    selfSoothe: {
      name: 'Self-Soothe with 5 Senses',
      senses: {
        vision: ['Look at nature', 'Watch candle', 'Art'],
        hearing: ['Soothing music', 'Nature sounds', 'Sing'],
        smell: ['Candles', 'Flowers', 'Essential oils'],
        taste: ['Tea', 'Chocolate', 'Mint'],
        touch: ['Soft blanket', 'Pet', 'Bath']
      }
    }
  },

  emotionRegulation: {
    PLEASE: {
      name: 'PLEASE',
      description: 'Reduce vulnerability to emotion mind',
      components: [
        'PL - Treat PhysicaL illness',
        'E - Balance Eating',
        'A - Avoid mood-Altering substances',
        'S - Balance Sleep',
        'E - Get Exercise'
      ]
    },

    oppositeAction: {
      name: 'Opposite Action',
      description: 'Change emotions by acting opposite to urges',
      examples: [
        { emotion: 'Fear', urge: 'Avoid', opposite: 'Approach' },
        { emotion: 'Anger', urge: 'Attack', opposite: 'Be kind' },
        { emotion: 'Sadness', urge: 'Withdraw', opposite: 'Get active' },
        { emotion: 'Shame', urge: 'Hide', opposite: 'Share appropriately' }
      ]
    },

    checkTheFacts: {
      name: 'Check the Facts',
      questions: [
        'What emotion am I experiencing?',
        'What is the prompting event?',
        'What are my interpretations?',
        'Am I assuming a threat?',
        'What\'s the catastrophe?',
        'Does my emotion fit the facts?'
      ]
    }
  },

  interpersonalEffectiveness: {
    DEARMAN: {
      name: 'DEARMAN',
      description: 'Getting what you want',
      steps: [
        'Describe - The situation',
        'Express - Your feelings/opinions',
        'Assert - Ask for what you want',
        'Reinforce - The benefits',
        'Mindful - Stay focused',
        'Appear confident - Even if not',
        'Negotiate - Be willing to give'
      ]
    },

    GIVE: {
      name: 'GIVE',
      description: 'Keeping the relationship',
      components: [
        'Gentle - Be nice, no attacks',
        'Interested - Listen, appear interested',
        'Validate - Acknowledge their feelings',
        'Easy manner - Use humor, smile'
      ]
    },

    FAST: {
      name: 'FAST',
      description: 'Keeping self-respect',
      elements: [
        'Fair - To yourself and others',
        'Apologies - Don\'t over-apologize',
        'Stick to values - Don\'t compromise',
        'Truthful - Don\'t lie or exaggerate'
      ]
    }
  },

  mindfulness: {
    WHAT: {
      name: 'WHAT Skills',
      skills: [
        'Observe - Notice without words',
        'Describe - Put words on experience',
        'Participate - Enter into the experience'
      ]
    },

    HOW: {
      name: 'HOW Skills',
      skills: [
        'Non-judgmentally - Without evaluating',
        'One-mindfully - One thing at a time',
        'Effectively - Do what works'
      ]
    },

    wiseMind: {
      name: 'Wise Mind',
      description: 'Integration of emotion and reasonable mind',
      practices: [
        'Stone flake on lake meditation',
        'Walking down spiral stairs',
        'Breathing "wise" in, "mind" out',
        'Asking wise mind a question'
      ]
    }
  }
};

export const TRAUMA_INFORMED_APPROACHES = {
  principles: {
    safety: {
      physical: ['Predictable environment', 'Clear boundaries', 'Choices'],
      emotional: ['Validation', 'No judgment', 'Going slow'],
      relational: ['Consistency', 'Transparency', 'Collaboration']
    },
    
    trustworthiness: {
      elements: ['Clear communication', 'Reliable follow-through', 'Appropriate boundaries', 'Consistency']
    },
    
    collaboration: {
      practices: ['Shared decision-making', 'Power sharing', 'Client as expert', 'Mutual goal-setting']
    },
    
    empowerment: {
      focus: ['Strengths-based', 'Skill building', 'Recognition of resilience', 'Choice and control']
    }
  },

  stabilization: {
    internal: {
      resources: ['Safe place', 'Container', 'Protective figures', 'Nurturing figures'],
      skills: ['Grounding', 'Affect regulation', 'Distress tolerance', 'Mindfulness']
    },
    
    external: {
      supports: ['Safety planning', 'Social support', 'Routine', 'Self-care'],
      environment: ['Stable housing', 'Financial security', 'Healthcare', 'Community']
    }
  },

  phaseOrientedTreatment: {
    phase1: {
      name: 'Safety and Stabilization',
      goals: ['Establish safety', 'Symptom reduction', 'Skills building', 'Resource development'],
      duration: 'Months to years'
    },
    
    phase2: {
      name: 'Trauma Processing',
      goals: ['Process traumatic memories', 'Integration', 'Meaning-making'],
      prerequisites: ['Adequate stabilization', 'Window of tolerance', 'Resources'],
      duration: 'Months to years'
    },
    
    phase3: {
      name: 'Integration and Reconnection',
      goals: ['Life reconstruction', 'Identity development', 'Relationships', 'Future orientation'],
      duration: 'Ongoing'
    }
  },

  windowOfTolerance: {
    concept: 'Optimal zone of arousal for processing',
    hyperarousal: {
      signs: ['Anxiety', 'Panic', 'Racing thoughts', 'Hypervigilance'],
      interventions: ['Grounding', 'Breathing', 'Movement', 'Cold water']
    },
    hypoarousal: {
      signs: ['Numbness', 'Disconnection', 'Emptiness', 'Foggy'],
      interventions: ['Movement', 'Sensory input', 'Social engagement', 'Orienting']
    },
    optimal: {
      signs: ['Present', 'Calm but alert', 'Able to think and feel', 'Connected'],
      maintenance: ['Regular breaks', 'Titration', 'Resources', 'Co-regulation']
    }
  }
};

// Intervention selector based on presenting issues
export const selectInterventions = (presentingIssues, clientHistory) => {
  const recommendations = [];
  
  if (presentingIssues.includes('anxiety')) {
    recommendations.push({
      protocol: 'CBT',
      specific: CBT_PROTOCOLS.thoughtChallenging,
      rationale: 'Evidence-based for anxiety disorders'
    });
    recommendations.push({
      protocol: 'DBT',
      specific: DBT_SKILLS.distressTolerance.TIPP,
      rationale: 'Rapid anxiety reduction'
    });
  }
  
  if (presentingIssues.includes('trauma')) {
    recommendations.push({
      protocol: 'EMDR',
      specific: EMDR_PROTOCOLS.standardProtocol,
      rationale: 'Gold standard for PTSD treatment'
    });
    recommendations.push({
      protocol: 'Somatic',
      specific: SOMATIC_PROTOCOLS.resourcing,
      rationale: 'Body-based trauma healing'
    });
  }
  
  if (presentingIssues.includes('depression')) {
    recommendations.push({
      protocol: 'CBT',
      specific: CBT_PROTOCOLS.behavioralActivation,
      rationale: 'Increases reinforcement and breaks depression cycle'
    });
  }
  
  if (presentingIssues.includes('emotional dysregulation')) {
    recommendations.push({
      protocol: 'DBT',
      specific: DBT_SKILLS.emotionRegulation,
      rationale: 'Specifically designed for emotion dysregulation'
    });
  }
  
  return recommendations;
};

// Session structure templates
export const SESSION_STRUCTURES = {
  initial: {
    timeAllocation: {
      introduction: 5,
      chiefComplaint: 10,
      history: 20,
      assessment: 15,
      treatmentPlanning: 5,
      closing: 5
    }
  },
  
  standard: {
    timeAllocation: {
      checkIn: 5,
      reviewHomework: 10,
      mainIntervention: 30,
      planningNext: 10,
      closing: 5
    }
  },
  
  crisis: {
    timeAllocation: {
      safetyAssessment: 15,
      stabilization: 20,
      copingPlan: 15,
      supportActivation: 5,
      followUp: 5
    }
  }
};

export default {
  CBT_PROTOCOLS,
  EMDR_PROTOCOLS,
  SOMATIC_PROTOCOLS,
  DBT_SKILLS,
  TRAUMA_INFORMED_APPROACHES,
  selectInterventions,
  SESSION_STRUCTURES
};