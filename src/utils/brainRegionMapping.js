// Brain region mapping utility
// Maps professional anatomical names from assessment to visual coordinates for BrainCanvas

// Map professional anatomical names to BrainCanvas display regions
const anatomicalToVisualMapping = {
  // Frontal regions
  'Superior Frontal': 'Prefrontal Cortex',
  'Rostral Middle Frontal': 'Prefrontal Cortex',
  'Medial Orbitofrontal': 'Prefrontal Cortex',
  'Lateral Orbitofrontal': 'Prefrontal Cortex',
  'Precentral': 'Motor Cortex',
  
  // Temporal regions
  'Superior Temporal': 'Temporal Lobe',
  'Middle Temporal': 'Temporal Lobe',
  'Transverse Temporal': 'Temporal Lobe',
  'Fusiform': 'Temporal Lobe',
  'Temporal Pole': 'Temporal Lobe',
  
  // Parietal regions
  'Superior Parietal': 'Parietal Cortex',
  'Inferior Parietal': 'Parietal Cortex',
  'Postcentral': 'Sensory Cortex',
  'Precuneus': 'Parietal Cortex',
  
  // Occipital regions
  'Pericalcarine': 'Occipital Lobe',
  'Lateral Occipital': 'Occipital Lobe',
  
  // Cingulate regions
  'Caudal Anterior Cingulate': 'Anterior Cingulate Cortex',
  'Rostral Anterior Cingulate': 'Anterior Cingulate Cortex',
  'Posterior Cingulate': 'Parietal Cortex', // Group with parietal for visualization
  
  // Subcortical structures
  'Amygdala': 'Amygdala',
  'Hippocampus': 'Hippocampus',
  'Thalamus': 'Thalamus',
  'Caudate': 'Thalamus', // Group with thalamus for visualization
  'Putamen': 'Thalamus', // Group with thalamus for visualization
  'Nucleus Accumbens': 'Thalamus', // Group with thalamus for visualization
  
  // Brainstem
  'Midbrain': 'Brain Stem',
  'Pons': 'Brain Stem',
  'Medulla': 'Brain Stem',
  
  // Cerebellum
  'Cerebellar Cortex': 'Cerebellum',
  'Cerebellar Vermis': 'Cerebellum',
  
  // Other regions
  'Entorhinal': 'Temporal Lobe',
  'Parahippocampal': 'Temporal Lobe',
  
  // Insula (special case - can be bilateral)
  'Insula': 'Insula',
  
  // Additional subcortical structures
  'Hypothalamus': 'Hypothalamus'
};

// Map severity levels based on impact scores
const getSeverityLevel = (impact) => {
  if (impact >= 0.8) return 'severe';
  if (impact >= 0.6) return 'high';
  if (impact >= 0.4) return 'moderate';
  if (impact >= 0.2) return 'mild';
  return 'normal';
};

// Determine if a region should be bilateral
const bilateralRegions = [
  'Prefrontal Cortex',
  'Motor Cortex',
  'Sensory Cortex',
  'Parietal Cortex',
  'Temporal Lobe',
  'Occipital Lobe',
  'Hippocampus',
  'Amygdala',
  'Insula'
];

/**
 * Convert assessment results to visual data format for BrainCanvas
 * @param {Object} assessmentResults - Results from analyzeProfessionalTraumaImpact
 * @returns {Object} Data formatted for BrainCanvas component
 */
export function convertAssessmentToVisualData(assessmentResults) {
  const { brainImpacts = {} } = assessmentResults;
  const visualData = {};
  
  // Track which visual regions have been mapped
  const mappedRegions = new Map();
  
  // Process each brain impact from the assessment
  Object.entries(brainImpacts).forEach(([anatomicalRegion, impactData]) => {
    // Get the visual region name
    const visualRegion = anatomicalToVisualMapping[anatomicalRegion];
    
    if (visualRegion) {
      // Check if this visual region should be bilateral
      const isBilateral = bilateralRegions.includes(visualRegion);
      
      // Calculate severity based on impact
      const severity = getSeverityLevel(impactData.impact);
      
      // Create region data
      const regionData = {
        severity,
        impact: impactData.impact,
        traumaTypes: impactData.traumaTypes || [],
        developmentalPeriods: impactData.developmentalPeriods || [],
        anatomicalNames: [anatomicalRegion] // Track original anatomical names
      };
      
      if (isBilateral) {
        // For bilateral regions, create both left and right entries
        const leftRegion = visualRegion;
        const rightRegion = `${visualRegion} Right`;
        
        // Update or create left hemisphere data
        if (mappedRegions.has(leftRegion)) {
          const existing = mappedRegions.get(leftRegion);
          existing.impact = Math.max(existing.impact, impactData.impact);
          existing.severity = getSeverityLevel(existing.impact);
          existing.traumaTypes = [...new Set([...existing.traumaTypes, ...regionData.traumaTypes])];
          existing.developmentalPeriods = [...new Set([...existing.developmentalPeriods, ...regionData.developmentalPeriods])];
          existing.anatomicalNames.push(anatomicalRegion);
        } else {
          mappedRegions.set(leftRegion, { ...regionData });
          visualData[leftRegion] = mappedRegions.get(leftRegion);
        }
        
        // Update or create right hemisphere data
        if (mappedRegions.has(rightRegion)) {
          const existing = mappedRegions.get(rightRegion);
          existing.impact = Math.max(existing.impact, impactData.impact);
          existing.severity = getSeverityLevel(existing.impact);
          existing.traumaTypes = [...new Set([...existing.traumaTypes, ...regionData.traumaTypes])];
          existing.developmentalPeriods = [...new Set([...existing.developmentalPeriods, ...regionData.developmentalPeriods])];
          existing.anatomicalNames.push(anatomicalRegion);
        } else {
          mappedRegions.set(rightRegion, { ...regionData });
          visualData[rightRegion] = mappedRegions.get(rightRegion);
        }
      } else {
        // For non-bilateral regions, just update the single region
        if (mappedRegions.has(visualRegion)) {
          const existing = mappedRegions.get(visualRegion);
          existing.impact = Math.max(existing.impact, impactData.impact);
          existing.severity = getSeverityLevel(existing.impact);
          existing.traumaTypes = [...new Set([...existing.traumaTypes, ...regionData.traumaTypes])];
          existing.developmentalPeriods = [...new Set([...existing.developmentalPeriods, ...regionData.developmentalPeriods])];
          existing.anatomicalNames.push(anatomicalRegion);
        } else {
          mappedRegions.set(visualRegion, { ...regionData });
          visualData[visualRegion] = mappedRegions.get(visualRegion);
        }
      }
    }
  });
  
  return visualData;
}

/**
 * Get display name for a visual region
 * @param {string} visualRegion - The visual region name
 * @returns {string} Human-friendly display name
 */
export function getRegionDisplayName(visualRegion) {
  // Remove "Right" suffix for display
  const baseName = visualRegion.replace(' Right', '');
  const isRight = visualRegion.includes(' Right');
  
  const displayNames = {
    'Prefrontal Cortex': 'Prefrontal Cortex',
    'Motor Cortex': 'Motor Cortex',
    'Sensory Cortex': 'Sensory Cortex',
    'Parietal Cortex': 'Parietal Cortex',
    'Temporal Lobe': 'Temporal Lobe',
    'Occipital Lobe': 'Occipital Lobe',
    'Hippocampus': 'Hippocampus',
    'Amygdala': 'Amygdala',
    'Thalamus': 'Thalamus & Basal Ganglia',
    'Hypothalamus': 'Hypothalamus',
    'Brain Stem': 'Brain Stem',
    'Cerebellum': 'Cerebellum',
    'Corpus Callosum': 'Corpus Callosum',
    'Anterior Cingulate Cortex': 'Anterior Cingulate Cortex',
    'Insula': 'Insula'
  };
  
  const name = displayNames[baseName] || baseName;
  return isRight ? `${name} (Right)` : name;
}

/**
 * Get description for a brain region based on its function and trauma impact
 * @param {string} visualRegion - The visual region name
 * @returns {string} Description of the region's function
 */
export function getRegionDescription(visualRegion) {
  const descriptions = {
    'Prefrontal Cortex': 'Executive function, decision-making, emotional regulation, and social behavior',
    'Motor Cortex': 'Voluntary movement control and motor planning',
    'Sensory Cortex': 'Processing touch, temperature, pain, and body position',
    'Parietal Cortex': 'Spatial awareness, attention, and sensory integration',
    'Temporal Lobe': 'Memory formation, language, and auditory processing',
    'Occipital Lobe': 'Visual processing and perception',
    'Hippocampus': 'Memory formation, learning, and stress response regulation',
    'Amygdala': 'Fear processing, emotional memory, and threat detection',
    'Thalamus': 'Sensory relay station and consciousness regulation',
    'Hypothalamus': 'Hormonal control and stress response (HPA axis)',
    'Brain Stem': 'Basic life functions, arousal, and survival reflexes',
    'Cerebellum': 'Motor coordination, balance, and cognitive processing',
    'Corpus Callosum': 'Communication between brain hemispheres',
    'Anterior Cingulate Cortex': 'Emotion regulation, pain processing, and conflict monitoring',
    'Insula': 'Interoception, empathy, and emotional awareness'
  };
  
  const baseName = visualRegion.replace(' Right', '');
  return descriptions[baseName] || 'Brain region involved in various cognitive and emotional functions';
}

/**
 * Get all professional anatomical names mapped to a visual region
 * @param {Object} visualData - The visual data object
 * @param {string} visualRegion - The visual region name
 * @returns {Array} List of anatomical names
 */
export function getAnatomicalNames(visualData, visualRegion) {
  const regionData = visualData[visualRegion];
  return regionData?.anatomicalNames || [];
}

// Export the mapping for reference
export const professionalToVisualMap = anatomicalToVisualMapping;
export const severityLevels = ['normal', 'mild', 'moderate', 'high', 'severe'];