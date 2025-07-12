// Professional trauma to brain region mapping using anatomical atlas names
// Based on 2023-2025 neuroscience research

// Map simplified names to professional anatomical names
const regionNameMapping = {
  // Frontal regions
  'PFC': 'Superior Frontal',
  'dlPFC': 'Rostral Middle Frontal',
  'vmPFC': 'Medial Orbitofrontal',
  'OFC': 'Lateral Orbitofrontal',
  'motor_cortex': 'Precentral',
  'frontal_pole': 'Superior Frontal',
  
  // Temporal regions
  'STG': 'Superior Temporal',
  'superior_temporal': 'Superior Temporal',
  'temporal_cortex': 'Middle Temporal',
  'auditory_cortex': 'Transverse Temporal',
  'fusiform_gyrus': 'Fusiform',
  'temporal_pole': 'Temporal Pole',
  
  // Parietal regions
  'parietal_cortex': 'Superior Parietal',
  'angular_gyrus': 'Inferior Parietal',
  'somatosensory_cortex': 'Postcentral',
  'precuneus': 'Precuneus',
  
  // Occipital regions
  'visual_cortex': 'Pericalcarine',
  'visual_association_areas': 'Lateral Occipital',
  'visual_association': 'Lateral Occipital',
  
  // Cingulate regions
  'ACC': 'Caudal Anterior Cingulate',
  'anterior_cingulate': 'Rostral Anterior Cingulate',
  'posterior_cingulate': 'Posterior Cingulate',
  
  // Subcortical structures
  'amygdala': 'Amygdala',
  'hippocampus': 'Hippocampus',
  'hippocampus_bilateral': 'Hippocampus',
  'left_hippocampus': 'Hippocampus',
  'right_hippocampus': 'Hippocampus',
  'thalamus': 'Thalamus',
  'hypothalamus': 'Thalamus', // Grouped with thalamus for visualization
  'caudate': 'Caudate',
  'putamen': 'Putamen',
  'basal_ganglia': 'Caudate',
  'nucleus_accumbens': 'Nucleus Accumbens',
  
  // Brainstem
  'brain_stem': 'Midbrain',
  'midbrain': 'Midbrain',
  'pons': 'Pons',
  'medulla': 'Medulla',
  'PAG': 'Midbrain', // Periaqueductal gray is in midbrain
  'locus_coeruleus': 'Pons', // Located in pons
  'superior_colliculus': 'Midbrain',
  'inferior_colliculus': 'Midbrain',
  
  // Cerebellum
  'cerebellum': 'Cerebellar Cortex',
  'cerebellar_vermis': 'Cerebellar Vermis',
  
  // Other regions
  'insula': 'Caudal Anterior Cingulate', // Group with cingulate for now
  'corpus_callosum': 'Superior Frontal', // Distributed connection
  'entorhinal': 'Entorhinal',
  'parahippocampal': 'Parahippocampal',
  
  // Network names (map to key regions)
  'default_mode_network': 'Posterior Cingulate',
  'salience_network': 'Caudal Anterior Cingulate',
  'HPA_axis': 'Hypothalamus'
};

// Professional ACE type to brain region mapping
export const professionalAceMapping = {
  physical_abuse: {
    'Amygdala': 1.0,
    'Caudal Anterior Cingulate': 0.9,
    'Postcentral': 0.8, // Somatosensory
    'Rostral Middle Frontal': 0.7,
    'Hippocampus': 0.7,
    'Rostral Anterior Cingulate': 0.8,
    'Lateral Orbitofrontal': 0.6
  },
  
  sexual_abuse: {
    'Hippocampus': 1.0,
    'Amygdala': 0.9,
    'Pericalcarine': 0.8, // Visual cortex
    'Lateral Occipital': 0.8,
    'Caudal Anterior Cingulate': 0.8,
    'Superior Frontal': 0.7,
    'Fusiform': 0.7,
    'Temporal Pole': 0.6,
    'Cerebellar Vermis': 0.7
  },
  
  emotional_abuse: {
    'Superior Frontal': 0.9,
    'Medial Orbitofrontal': 0.9,
    'Rostral Anterior Cingulate': 0.8,
    'Caudal Anterior Cingulate': 0.8,
    'Posterior Cingulate': 0.7,
    'Amygdala': 0.8,
    'Hippocampus': 0.6,
    'Superior Temporal': 0.7
  },
  
  emotional_neglect: {
    'Superior Frontal': 1.0,
    'Medial Orbitofrontal': 0.9,
    'Lateral Orbitofrontal': 0.8,
    'Rostral Anterior Cingulate': 0.9,
    'Posterior Cingulate': 0.8,
    'Amygdala': 0.7,
    'Hippocampus': 0.7,
    'Entorhinal': 0.6
  },
  
  physical_neglect: {
    'Postcentral': 0.9, // Sensory cortex
    'Cerebellar Cortex': 0.8,
    'Cerebellar Vermis': 0.8,
    'Superior Parietal': 0.7,
    'Hippocampus': 0.7,
    'Superior Frontal': 0.6,
    'Lateral Occipital': 0.6
  },
  
  // Household dysfunction types
  substance_abuse: {
    'Superior Frontal': 0.8,
    'Hippocampus': 0.8,
    'Amygdala': 0.7,
    'Caudate': 0.8,
    'Nucleus Accumbens': 0.9,
    'Midbrain': 0.7,
    'Posterior Cingulate': 0.6
  },
  
  mental_illness: {
    'Medial Orbitofrontal': 0.8,
    'Caudal Anterior Cingulate': 0.7,
    'Amygdala': 0.8,
    'Hippocampus': 0.7,
    'Posterior Cingulate': 0.8
  },
  
  domestic_violence: {
    'Amygdala': 1.0,
    'Hippocampus': 0.8,
    'Midbrain': 0.9, // Superior/inferior colliculus
    'Pons': 1.0, // Locus coeruleus
    'Superior Frontal': 0.85
  },
  
  parental_separation: {
    'Medial Orbitofrontal': 0.7,
    'Rostral Anterior Cingulate': 0.6,
    'Amygdala': 0.7,
    'Hippocampus': 0.6
  },
  
  incarceration: {
    'Medial Orbitofrontal': 0.6,
    'Amygdala': 0.6,
    'Hippocampus': 0.5
  }
};

// Developmental period vulnerabilities with professional region names
export const developmentalVulnerabilities = {
  '0-3': {
    vulnerableRegions: ['Hippocampus', 'Amygdala', 'Midbrain', 'Pons', 'Medulla'],
    criticalSystems: ['stress_response', 'attachment', 'global_architecture']
  },
  '3-5': {
    vulnerableRegions: ['Hippocampus', 'Superior Frontal', 'Amygdala', 'Medial Orbitofrontal'],
    criticalSystems: ['emotional_regulation', 'memory', 'executive_function']
  },
  '6-11': {
    vulnerableRegions: ['Hippocampus', 'Amygdala', 'Rostral Middle Frontal', 'Lateral Occipital'],
    criticalSystems: ['attention', 'executive_function', 'academic_skills']
  },
  '11-13': {
    vulnerableRegions: ['Hippocampus', 'Superior Frontal', 'Amygdala', 'Caudal Anterior Cingulate'],
    criticalSystems: ['social_processing', 'identity', 'emotion_regulation']
  },
  '14-18': {
    vulnerableRegions: ['Superior Frontal', 'Hippocampus', 'Caudate', 'Nucleus Accumbens'],
    criticalSystems: ['abstract_thinking', 'risk_assessment', 'identity']
  }
};

// Gender-specific vulnerabilities with professional names
export const genderVulnerabilities = {
  male: {
    vulnerableRegions: ['Amygdala', 'Hippocampus', 'Superior Temporal'],
    hpaReactivity: 1.0
  },
  female: {
    vulnerableRegions: ['Hippocampus', 'Superior Frontal', 'Pericalcarine', 'Caudal Anterior Cingulate'],
    hpaReactivity: 1.3
  }
};

// Function to convert old region names to professional names
export function convertToProfessionalNames(oldMapping) {
  const professionalMapping = {};
  
  for (const [oldName, value] of Object.entries(oldMapping)) {
    const professionalName = regionNameMapping[oldName] || oldName;
    
    // If this professional name already exists, take the maximum impact
    if (professionalMapping[professionalName]) {
      professionalMapping[professionalName] = Math.max(professionalMapping[professionalName], value);
    } else {
      professionalMapping[professionalName] = value;
    }
  }
  
  return professionalMapping;
}

// Main analysis function using professional names
export function analyzeProfessionalTraumaImpact(assessmentResults) {
  const { answers = {}, biologicalSex = 'female' } = assessmentResults;
  const brainImpacts = {};
  
  // Extract ACE types and age ranges from answers
  const aceTypes = [];
  const allAgeRanges = new Set();
  
  Object.entries(answers).forEach(([aceType, answerData]) => {
    if (answerData.experienced === 'yes' && professionalAceMapping[aceType]) {
      aceTypes.push(aceType);
      
      // Collect age ranges for this trauma
      if (answerData.ageRanges) {
        answerData.ageRanges.forEach(range => allAgeRanges.add(range));
      }
    }
  });
  
  // Process each ACE type
  aceTypes.forEach(aceType => {
    const mapping = professionalAceMapping[aceType];
    const answerData = answers[aceType];
    
    if (mapping) {
      Object.entries(mapping).forEach(([region, baseImpact]) => {
        if (!brainImpacts[region]) {
          brainImpacts[region] = {
            impact: 0,
            traumaTypes: [],
            developmentalPeriods: new Set()
          };
        }
        
        // Adjust impact based on duration
        let adjustedImpact = baseImpact;
        if (answerData.duration) {
          const durationMultipliers = {
            'single': 0.7,
            'days': 0.8,
            'weeks': 0.9,
            'months': 1.0,
            '<1year': 1.1,
            '1-2years': 1.2,
            '3-5years': 1.3,
            '5+years': 1.4,
            'throughout': 1.5,
            'ongoing': 1.5
          };
          adjustedImpact *= durationMultipliers[answerData.duration] || 1.0;
        }
        
        brainImpacts[region].impact = Math.max(brainImpacts[region].impact, adjustedImpact);
        brainImpacts[region].traumaTypes.push(aceType);
        
        // Add age ranges for this trauma
        if (answerData.ageRanges) {
          answerData.ageRanges.forEach(range => {
            brainImpacts[region].developmentalPeriods.add(range);
          });
        }
      });
    }
  });
  
  // Add developmental period vulnerabilities
  Array.from(allAgeRanges).forEach(ageRange => {
    const vulnerability = developmentalVulnerabilities[ageRange];
    if (vulnerability) {
      vulnerability.vulnerableRegions.forEach(region => {
        if (!brainImpacts[region]) {
          brainImpacts[region] = {
            impact: 0,
            traumaTypes: [],
            developmentalPeriods: new Set()
          };
        }
        brainImpacts[region].impact = Math.min(1, brainImpacts[region].impact + 0.1);
        brainImpacts[region].developmentalPeriods.add(ageRange);
      });
    }
  });
  
  // Add gender-specific vulnerabilities
  const genderVuln = genderVulnerabilities[biologicalSex];
  if (genderVuln) {
    genderVuln.vulnerableRegions.forEach(region => {
      if (brainImpacts[region]) {
        brainImpacts[region].impact *= genderVuln.hpaReactivity;
      }
    });
  }
  
  // Apply protective factors if present
  if (answers.protective?.experienced === 'yes') {
    // Protective factors reduce impact by 10-20%
    Object.values(brainImpacts).forEach(data => {
      data.impact *= 0.85;
    });
  }
  
  // Convert sets to arrays and filter significant impacts
  const significantImpacts = {};
  Object.entries(brainImpacts).forEach(([region, data]) => {
    if (data.impact > 0.3) {
      significantImpacts[region] = {
        ...data,
        impact: Math.min(1, data.impact), // Cap at 1.0
        developmentalPeriods: Array.from(data.developmentalPeriods)
      };
    }
  });
  
  return {
    brainImpacts: significantImpacts,
    summary: {
      totalACEs: aceTypes.length,
      totalRegionsAffected: Object.keys(significantImpacts).length,
      primaryImpacts: Object.entries(significantImpacts)
        .sort((a, b) => b[1].impact - a[1].impact)
        .slice(0, 5)
        .map(([region, data]) => ({
          region,
          impact: data.impact,
          traumaTypes: data.traumaTypes,
          developmentalPeriods: data.developmentalPeriods
        })),
      genderSpecificRisks: genderVuln ? {
        hpaReactivity: genderVuln.hpaReactivity,
        vulnerableRegions: genderVuln.vulnerableRegions
      } : null,
      hasProtectiveFactors: answers.protective?.experienced === 'yes'
    }
  };
}