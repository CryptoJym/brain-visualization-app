// Transform questionnaire answers to format expected by trauma analysis

export function transformQuestionnaireData(assessmentResults) {
  const { answers, biologicalSex, currentAge } = assessmentResults;
  
  // Extract ACE types from answers
  const aceTypes = [];
  const ageRanges = new Set();
  
  Object.entries(answers).forEach(([questionId, answerData]) => {
    if (answerData.occurred === 'yes') {
      aceTypes.push(questionId);
      
      // Extract age ranges
      if (answerData.ages && Array.isArray(answerData.ages)) {
        answerData.ages.forEach(age => ageRanges.add(age));
      }
    }
  });
  
  return {
    aceTypes,
    ageRanges: Array.from(ageRanges),
    gender: biologicalSex || 'female',
    currentAge
  };
}

// Enhanced analysis that works directly with questionnaire data
export function analyzeQuestionnaireImpacts(assessmentResults) {
  const { answers, biologicalSex } = assessmentResults;
  const impacts = {};
  
  Object.entries(answers).forEach(([traumaType, answerData]) => {
    if (answerData.occurred === 'yes') {
      // Get the impact data for this trauma type
      const regionImpacts = getTraumaImpacts(traumaType);
      
      Object.entries(regionImpacts).forEach(([region, baseImpact]) => {
        if (!impacts[region]) {
          impacts[region] = {
            impactLevel: 0,
            traumaTypes: [],
            ageRanges: []
          };
        }
        
        // Update impact level (take maximum)
        impacts[region].impactLevel = Math.max(impacts[region].impactLevel, baseImpact);
        
        // Add trauma type if not already present
        if (!impacts[region].traumaTypes.includes(traumaType)) {
          impacts[region].traumaTypes.push(traumaType);
        }
        
        // Add age ranges
        if (answerData.ages && Array.isArray(answerData.ages)) {
          answerData.ages.forEach(age => {
            if (!impacts[region].ageRanges.includes(age)) {
              impacts[region].ageRanges.push(age);
            }
          });
        }
      });
    }
  });
  
  return impacts;
}

// Get impacts for a specific trauma type
function getTraumaImpacts(traumaType) {
  // Import the mapping from professionalTraumaBrainMapping
  const mapping = {
    physical_abuse: {
      'Amygdala': 1.0,
      'Caudal Anterior Cingulate': 0.9,
      'Postcentral': 0.8,
      'Rostral Middle Frontal': 0.7,
      'Hippocampus': 0.7,
      'Rostral Anterior Cingulate': 0.8,
      'Lateral Orbitofrontal': 0.6
    },
    sexual_abuse: {
      'Hippocampus': 1.0,
      'Amygdala': 0.9,
      'Pericalcarine': 0.8,
      'Lateral Occipital': 0.8,
      'Caudal Anterior Cingulate': 0.8,
      'Superior Frontal': 0.7,
      'Fusiform': 0.7,
      'Temporal Pole': 0.6,
      'Cerebellar Vermis': 0.7
    },
    emotional_abuse: {
      'Rostral Anterior Cingulate': 1.0,
      'Rostral Middle Frontal': 0.9,
      'Medial Orbitofrontal': 0.8,
      'Superior Frontal': 0.8,
      'Hippocampus': 0.7,
      'Amygdala': 0.7,
      'Posterior Cingulate': 0.6
    },
    physical_neglect: {
      'Postcentral': 1.0,
      'Precentral': 0.8,
      'Superior Parietal': 0.7,
      'Thalamus': 0.8,
      'Cerebellar Cortex': 0.7
    },
    emotional_neglect: {
      'Medial Orbitofrontal': 1.0,
      'Rostral Anterior Cingulate': 0.9,
      'Posterior Cingulate': 0.8,
      'Precuneus': 0.7,
      'Superior Temporal': 0.6,
      'Temporal Pole': 0.7
    },
    substance_abuse: {
      'Nucleus Accumbens': 0.9,
      'Caudate': 0.8,
      'Putamen': 0.7,
      'Lateral Orbitofrontal': 0.8,
      'Hippocampus': 0.6
    },
    mental_illness: {
      'Amygdala': 0.8,
      'Hippocampus': 0.7,
      'Rostral Anterior Cingulate': 0.8,
      'Superior Frontal': 0.6
    },
    domestic_violence: {
      'Amygdala': 0.9,
      'Pericalcarine': 0.7,
      'Lateral Occipital': 0.7,
      'Superior Temporal': 0.8,
      'Caudal Anterior Cingulate': 0.7
    },
    medical_trauma: {
      'Insula': 0.9,
      'Postcentral': 0.8,
      'Caudal Anterior Cingulate': 0.7,
      'Amygdala': 0.6,
      'Thalamus': 0.7
    },
    chronic_stress: {
      'Hippocampus': 0.9,
      'Amygdala': 0.8,
      'Rostral Middle Frontal': 0.7,
      'Pons': 0.6,
      'Midbrain': 0.6
    },
    // Default for unmapped trauma types
    default: {
      'Amygdala': 0.5,
      'Hippocampus': 0.5,
      'Caudal Anterior Cingulate': 0.4
    }
  };
  
  return mapping[traumaType] || mapping.default;
}