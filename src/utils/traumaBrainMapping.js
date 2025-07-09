// Comprehensive mapping of trauma types to brain region impacts
export const traumaBrainMapping = {
  // Physical Abuse
  physical_abuse: {
    earlyChildhood: { // 0-5 years
      amygdala: {
        impact: 'severe',
        changes: 'Hyperactive threat detection, enlarged volume',
        behavior: 'Constant state of hypervigilance'
      },
      hippocampus: {
        impact: 'severe',
        changes: 'Reduced volume, impaired memory consolidation',
        behavior: 'Difficulty forming coherent memories'
      },
      prefrontalCortex: {
        impact: 'moderate',
        changes: 'Delayed development, reduced gray matter',
        behavior: 'Poor emotional regulation'
      }
    },
    middleChildhood: { // 6-11 years
      amygdala: {
        impact: 'severe',
        changes: 'Hyperreactive to physical threats',
        behavior: 'Explosive anger responses'
      },
      motorCortex: {
        impact: 'moderate',
        changes: 'Enhanced defensive motor patterns',
        behavior: 'Flinching, defensive posturing'
      }
    },
    adolescence: { // 12-18 years
      prefrontalCortex: {
        impact: 'severe',
        changes: 'Disrupted executive function development',
        behavior: 'Impulsive aggression'
      }
    }
  },

  // Sexual Abuse
  sexual_abuse: {
    earlyChildhood: {
      amygdala: {
        impact: 'severe',
        changes: 'Extreme hypervigilance to interpersonal cues',
        behavior: 'Severe trust issues'
      },
      hippocampus: {
        impact: 'severe',
        changes: 'Fragmented memory encoding',
        behavior: 'Dissociative episodes'
      },
      insula: {
        impact: 'severe',
        changes: 'Disrupted body awareness',
        behavior: 'Disconnection from physical sensations'
      }
    },
    middleChildhood: {
      temporalLobe: {
        impact: 'moderate',
        changes: 'Altered social perception',
        behavior: 'Difficulty reading social cues'
      },
      cingulateGyrus: {
        impact: 'severe',
        changes: 'Impaired emotional processing',
        behavior: 'Emotional numbing'
      }
    },
    adolescence: {
      orbitofrontalCortex: {
        impact: 'severe',
        changes: 'Disrupted reward processing',
        behavior: 'Risky sexual behaviors'
      }
    }
  },

  // Emotional Abuse
  emotional_abuse: {
    earlyChildhood: {
      prefrontalCortex: {
        impact: 'severe',
        changes: 'Reduced gray matter density',
        behavior: 'Poor self-concept'
      },
      auditoryCortex: {
        impact: 'moderate',
        changes: 'Hypersensitivity to vocal tones',
        behavior: 'Overreaction to criticism'
      }
    },
    middleChildhood: {
      anteriorCingulate: {
        impact: 'severe',
        changes: 'Reduced volume',
        behavior: 'Chronic self-criticism'
      },
      languageAreas: {
        impact: 'moderate',
        changes: 'Enhanced processing of negative words',
        behavior: 'Negative self-talk patterns'
      }
    },
    adolescence: {
      defaultModeNetwork: {
        impact: 'severe',
        changes: 'Hyperactive self-referential processing',
        behavior: 'Rumination and anxiety'
      }
    }
  },

  // Physical Neglect
  physical_neglect: {
    earlyChildhood: {
      somatosensoryCortex: {
        impact: 'moderate',
        changes: 'Reduced sensitivity to physical needs',
        behavior: 'Poor body awareness'
      },
      cerebellum: {
        impact: 'moderate',
        changes: 'Impaired motor coordination',
        behavior: 'Clumsiness, poor balance'
      }
    },
    middleChildhood: {
      parietalLobe: {
        impact: 'moderate',
        changes: 'Reduced spatial processing',
        behavior: 'Poor environmental awareness'
      }
    }
  },

  // Emotional Neglect
  emotional_neglect: {
    earlyChildhood: {
      corpusCallosum: {
        impact: 'severe',
        changes: 'Reduced thickness',
        behavior: 'Poor emotional integration'
      },
      rightHemisphere: {
        impact: 'severe',
        changes: 'Underdeveloped emotional processing',
        behavior: 'Alexithymia (difficulty identifying emotions)'
      },
      fusiformGyrus: {
        impact: 'moderate',
        changes: 'Reduced face processing ability',
        behavior: 'Difficulty reading facial expressions'
      }
    },
    middleChildhood: {
      mirrorNeuronSystem: {
        impact: 'severe',
        changes: 'Reduced activation',
        behavior: 'Impaired empathy development'
      }
    }
  },

  // Household Substance Abuse
  substance_abuse: {
    earlyChildhood: {
      stressResponseSystem: {
        impact: 'moderate',
        changes: 'Chronic HPA axis activation',
        behavior: 'Anxiety and hypervigilance'
      }
    },
    middleChildhood: {
      rewardSystem: {
        impact: 'moderate',
        changes: 'Altered dopamine sensitivity',
        behavior: 'Increased addiction vulnerability'
      }
    }
  },

  // Domestic Violence Witness
  domestic_violence: {
    earlyChildhood: {
      visualCortex: {
        impact: 'severe',
        changes: 'Enhanced threat detection in visual field',
        behavior: 'Hypervigilance to body language'
      },
      amygdala: {
        impact: 'severe',
        changes: 'Hyperreactive to conflict',
        behavior: 'Freeze response to arguments'
      }
    },
    middleChildhood: {
      auditoryCortex: {
        impact: 'moderate',
        changes: 'Hypersensitivity to raised voices',
        behavior: 'Startles easily to loud sounds'
      }
    }
  },

  // Peer Bullying
  peer_bullying: {
    middleChildhood: {
      socialBrain: {
        impact: 'severe',
        changes: 'Hyperactive social threat detection',
        behavior: 'Social anxiety and withdrawal'
      },
      selfReferentialNetwork: {
        impact: 'moderate',
        changes: 'Negative self-perception',
        behavior: 'Low self-esteem'
      }
    },
    adolescence: {
      ventromedialPrefrontal: {
        impact: 'severe',
        changes: 'Impaired social decision making',
        behavior: 'Poor peer relationships'
      }
    }
  },

  // Community Violence
  community_violence: {
    all: {
      vigilanceNetwork: {
        impact: 'severe',
        changes: 'Chronic hyperactivation',
        behavior: 'Constant environmental scanning'
      },
      stressCircuits: {
        impact: 'moderate',
        changes: 'Elevated baseline arousal',
        behavior: 'Difficulty relaxing'
      }
    }
  }
};

// Function to analyze questionnaire results and determine brain impacts
export function analyzeTraumaImpact(questionnaireResults) {
  const { answers, currentAge, biologicalSex } = questionnaireResults;
  const brainImpacts = {};
  
  // Process each answered question
  Object.entries(answers).forEach(([questionId, answer]) => {
    if (answer.experienced === 'yes' && answer.ages) {
      const mapping = traumaBrainMapping[questionId];
      if (!mapping) return;
      
      // Parse age ranges
      const ageRanges = parseAgeRanges(answer.ages);
      
      // Determine developmental periods affected
      ageRanges.forEach(range => {
        const period = getDevelopmentalPeriod(range);
        const impacts = mapping[period] || mapping.all;
        
        if (impacts) {
          Object.entries(impacts).forEach(([region, impact]) => {
            if (!brainImpacts[region]) {
              brainImpacts[region] = {
                impacts: [],
                severity: 0,
                criticalPeriods: []
              };
            }
            
            brainImpacts[region].impacts.push({
              trauma: questionId,
              period: period,
              ...impact
            });
            
            // Calculate cumulative severity
            const severityScore = impact.impact === 'severe' ? 3 : impact.impact === 'moderate' ? 2 : 1;
            brainImpacts[region].severity += severityScore;
            
            // Track critical periods
            if (range.start < 8) {
              brainImpacts[region].criticalPeriods.push('early');
            }
          });
        }
      });
    }
  });
  
  // Apply protective factors
  if (answers.protective?.experienced === 'yes') {
    Object.keys(brainImpacts).forEach(region => {
      brainImpacts[region].hasProtectiveFactor = true;
      brainImpacts[region].severity *= 0.7; // Reduce severity by 30%
    });
  }
  
  // Add sex-specific impacts
  if (biologicalSex) {
    applySexSpecificFactors(brainImpacts, biologicalSex);
  }
  
  return {
    brainImpacts,
    summary: generateImpactSummary(brainImpacts),
    recommendations: generateRecommendations(brainImpacts)
  };
}

// Helper functions
function parseAgeRanges(ageString) {
  const ranges = [];
  const parts = ageString.split(',').map(s => s.trim());
  
  parts.forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n));
      ranges.push({ start, end });
    } else {
      const age = parseInt(part);
      if (!isNaN(age)) {
        ranges.push({ start: age, end: age });
      }
    }
  });
  
  return ranges;
}

function getDevelopmentalPeriod(ageRange) {
  const age = ageRange.start;
  if (age <= 5) return 'earlyChildhood';
  if (age <= 11) return 'middleChildhood';
  if (age <= 18) return 'adolescence';
  return 'adult';
}

function applySexSpecificFactors(brainImpacts, sex) {
  if (sex === 'male') {
    // Males show more corpus callosum thinning
    if (brainImpacts.corpusCallosum) {
      brainImpacts.corpusCallosum.severity *= 1.2;
    }
    // Males show more externalizing behaviors
    if (brainImpacts.prefrontalCortex) {
      brainImpacts.prefrontalCortex.additionalNote = 'Increased risk of externalizing behaviors';
    }
  } else if (sex === 'female') {
    // Females show more internalizing
    if (brainImpacts.defaultModeNetwork) {
      brainImpacts.defaultModeNetwork.severity *= 1.2;
    }
    // Females show more hippocampal impacts
    if (brainImpacts.hippocampus) {
      brainImpacts.hippocampus.severity *= 1.1;
    }
  }
}

function generateImpactSummary(brainImpacts) {
  const summary = {
    totalRegionsAffected: Object.keys(brainImpacts).length,
    severityLevel: 'low',
    primaryImpacts: [],
    developmentalDisruptions: []
  };
  
  // Calculate overall severity
  const totalSeverity = Object.values(brainImpacts).reduce((sum, impact) => sum + impact.severity, 0);
  if (totalSeverity > 20) summary.severityLevel = 'severe';
  else if (totalSeverity > 10) summary.severityLevel = 'moderate';
  
  // Identify primary impacts
  Object.entries(brainImpacts)
    .sort((a, b) => b[1].severity - a[1].severity)
    .slice(0, 3)
    .forEach(([region, data]) => {
      summary.primaryImpacts.push({
        region,
        severity: data.severity,
        mainEffect: data.impacts[0]?.behavior || 'Multiple effects'
      });
    });
  
  return summary;
}

function generateRecommendations(brainImpacts) {
  const recommendations = [];
  
  // Check for specific patterns
  if (brainImpacts.amygdala?.severity > 5) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Trauma-focused therapy (EMDR, CPT) for hypervigilance',
      priority: 'high'
    });
  }
  
  if (brainImpacts.hippocampus?.severity > 3) {
    recommendations.push({
      type: 'lifestyle',
      suggestion: 'Memory-supportive practices (journaling, mindfulness)',
      priority: 'medium'
    });
  }
  
  if (brainImpacts.prefrontalCortex?.severity > 4) {
    recommendations.push({
      type: 'skills',
      suggestion: 'Executive function training and emotional regulation skills',
      priority: 'high'
    });
  }
  
  return recommendations;
}

// Additional brain regions for comprehensive mapping
export const additionalBrainRegions = {
  insula: {
    position: { center: [-1.5, 0, 0.5] },
    color: 0xff9999,
    type: 'region',
    size: 0.3,
    name: 'Insula',
    function: 'Interoception and body awareness'
  },
  cingulateGyrus: {
    position: { center: [0, 0.5, 0.5] },
    color: 0xffcc99,
    type: 'region',
    size: 0.4,
    name: 'Cingulate Gyrus',
    function: 'Emotion processing and attention'
  },
  temporalLobe: {
    position: { left: [-2.5, -0.5, 0], right: [2.5, -0.5, 0] },
    color: 0x99ccff,
    type: 'region',
    size: 0.6,
    name: 'Temporal Lobe',
    function: 'Language and social processing'
  },
  parietalLobe: {
    position: { left: [-1.5, 1, -1], right: [1.5, 1, -1] },
    color: 0xcc99ff,
    type: 'region',
    size: 0.5,
    name: 'Parietal Lobe',
    function: 'Spatial processing and attention'
  },
  cerebellum: {
    position: { center: [0, -2, -1.5] },
    color: 0xffcccc,
    type: 'region',
    size: 0.7,
    name: 'Cerebellum',
    function: 'Motor coordination and learning'
  },
  thalamus: {
    position: { center: [0, -0.5, 0] },
    color: 0xccffcc,
    type: 'region',
    size: 0.3,
    name: 'Thalamus',
    function: 'Sensory relay and consciousness'
  },
  basalGanglia: {
    position: { left: [-1, -0.5, 0.5], right: [1, -0.5, 0.5] },
    color: 0xccccff,
    type: 'region',
    size: 0.4,
    name: 'Basal Ganglia',
    function: 'Movement and reward processing'
  }
};