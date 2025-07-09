// Comprehensive mapping of trauma types to brain region impacts based on neuroscience research
export const traumaBrainMapping = {
  // Physical Abuse
  physical_abuse: {
    dlPFC: 0.9,
    vmPFC: 0.8,
    OFC: 0.9,
    ACC: 1.0,
    amygdala: 1.0,
    hippocampus: 0.9,
    thalamus: 0.8,
    hypothalamus: 0.9,
    STG: 0.7,
    IPL: 0.9,
    SPL: 0.8,
    putamen: 0.9,
    caudate: 0.8,
    PAG: 1.0,
    locus_coeruleus: 0.9,
    raphe_nuclei: 0.8,
    superior_colliculus: 0.8,
    cerebellar_vermis: 0.9,
    insula: 1.0,
    corpus_callosum: 0.9
  },
  
  // Sexual Abuse
  sexual_abuse: {
    dlPFC: 0.8,
    vmPFC: 0.9,
    OFC: 0.9,
    ACC: 0.9,
    amygdala: 1.0,
    hippocampus: 1.0,
    thalamus: 0.9,
    hypothalamus: 0.9,
    IPL: 0.8,
    fusiform_gyrus: 0.9,
    PAG: 0.9,
    insula: 0.9,
    corpus_callosum: 0.9,
    fornix: 0.9,
    cerebellar_vermis: 0.9
  },
  
  // Emotional Abuse
  emotional_abuse: {
    dlPFC: 1.0,
    vmPFC: 1.0,
    OFC: 0.8,
    ACC: 0.9,
    amygdala: 0.9,
    hippocampus: 0.8,
    STG: 1.0,
    MTG: 0.8,
    fusiform_gyrus: 0.9,
    precuneus: 0.9,
    raphe_nuclei: 0.9,
    insula: 0.9,
    inferior_colliculus: 0.9
  },
  
  // Physical Neglect
  physical_neglect: {
    dlPFC: 0.9,
    vmPFC: 0.8,
    OFC: 0.7,
    ACC: 0.8,
    amygdala: 0.8,
    hippocampus: 0.9,
    thalamus: 1.0,
    hypothalamus: 0.8,
    ITG: 0.9,
    IPL: 0.8,
    SPL: 0.9,
    cerebellar_hemispheres: 0.9,
    globus_pallidus: 0.8,
    substantia_nigra: 0.7
  },
  
  // Emotional Neglect
  emotional_neglect: {
    dlPFC: 1.0,
    vmPFC: 1.0,
    OFC: 0.8,
    ACC: 0.8,
    amygdala: 0.9,
    hippocampus: 0.9,
    STG: 0.9,
    MTG: 0.9,
    fusiform_gyrus: 1.0,
    precuneus: 1.0,
    angular_gyrus: 0.8,
    nucleus_accumbens: 1.0,
    VTA: 1.0,
    raphe_nuclei: 1.0,
    cerebellar_vermis: 0.8
  },
  
  // Substance Abuse in Home
  substance_abuse: {
    OFC: 1.0,
    nucleus_accumbens: 1.0,
    VTA: 0.8,
    hypothalamus: 0.7,
    amygdala: 0.8,
    hippocampus: 0.7
  },
  
  // Mental Illness in Home
  mental_illness: {
    vmPFC: 0.8,
    ACC: 0.7,
    amygdala: 0.8,
    hippocampus: 0.7,
    STG: 0.8
  },
  
  // Domestic Violence
  domestic_violence: {
    amygdala: 1.0,
    hippocampus: 0.8,
    superior_colliculus: 0.9,
    inferior_colliculus: 1.0,
    PAG: 0.8,
    locus_coeruleus: 1.0
  },
  
  // Parental Separation
  parental_separation: {
    vmPFC: 0.7,
    ACC: 0.6,
    amygdala: 0.7,
    hippocampus: 0.6
  },
  
  // Incarceration
  incarceration: {
    vmPFC: 0.6,
    amygdala: 0.6,
    hippocampus: 0.5
  },
  
  // Peer Bullying
  peer_bullying: {
    vmPFC: 0.9,
    ACC: 0.8,
    amygdala: 0.9,
    STG: 0.9,
    fusiform_gyrus: 0.8,
    precuneus: 0.8
  },
  
  // Community Violence
  community_violence: {
    amygdala: 0.9,
    hippocampus: 0.8,
    superior_colliculus: 0.9,
    locus_coeruleus: 0.9,
    PAG: 0.8
  },
  
  // Economic Hardship
  economic_hardship: {
    dlPFC: 0.7,
    hippocampus: 0.6,
    hypothalamus: 0.7
  },
  
  // Discrimination
  discrimination: {
    vmPFC: 0.8,
    ACC: 0.7,
    amygdala: 0.8,
    insula: 0.7
  },
  
  // Medical Trauma
  medical_trauma: {
    PAG: 1.0,
    insula: 0.9,
    ACC: 0.8,
    amygdala: 0.8
  },
  
  // Caregiver Changes
  caregiver_changes: {
    vmPFC: 0.8,
    ACC: 0.7,
    amygdala: 0.8,
    hippocampus: 0.8,
    fusiform_gyrus: 0.9
  },
  
  // Caregiver Death
  caregiver_death: {
    vmPFC: 0.9,
    ACC: 0.8,
    amygdala: 0.9,
    hippocampus: 0.8
  },
  
  // Educational Disruption
  educational_disruption: {
    dlPFC: 0.8,
    angular_gyrus: 1.0,
    caudate: 0.9,
    basal_forebrain: 0.9
  },
  
  // Life-Threatening Events
  near_death_experience: {
    amygdala: 1.0,
    PAG: 1.0,
    locus_coeruleus: 1.0,
    hippocampus: 0.9,
    insula: 0.9,
    ACC: 0.9,
    superior_colliculus: 1.0,
    thalamus: 0.8
  },
  
  severe_accident: {
    amygdala: 0.9,
    hippocampus: 0.8,
    PAG: 0.9,
    insula: 1.0,
    ACC: 0.8,
    somatosensory_cortex: 0.9
  },
  
  natural_disaster: {
    amygdala: 1.0,
    hippocampus: 0.9,
    locus_coeruleus: 0.9,
    superior_colliculus: 0.9,
    inferior_colliculus: 0.8,
    PAG: 0.8
  },
  
  witnessed_death: {
    amygdala: 1.0,
    hippocampus: 0.9,
    vmPFC: 0.8,
    fusiform_gyrus: 0.9,
    STG: 0.8,
    insula: 0.8
  },
  
  // Additional Health Traumas
  chronic_pain: {
    PAG: 1.0,
    insula: 1.0,
    ACC: 1.0,
    somatosensory_cortex: 1.0,
    thalamus: 0.9,
    amygdala: 0.8
  },
  
  surgery_hospitalization: {
    PAG: 0.9,
    insula: 0.8,
    hippocampus: 0.7,
    amygdala: 0.8,
    ACC: 0.7
  },
  
  // Attachment & Loss
  sibling_death: {
    vmPFC: 0.8,
    ACC: 0.8,
    amygdala: 0.8,
    hippocampus: 0.7
  },
  
  pet_loss: {
    vmPFC: 0.6,
    amygdala: 0.6,
    ACC: 0.5
  },
  
  abandonment: {
    vmPFC: 1.0,
    ACC: 0.9,
    amygdala: 1.0,
    hippocampus: 0.9,
    insula: 0.8,
    fusiform_gyrus: 0.9
  },
  
  // Educational & Developmental
  learning_difficulties: {
    dlPFC: 0.8,
    angular_gyrus: 0.9,
    STG: 0.7,
    caudate: 0.8
  },
  
  academic_pressure: {
    dlPFC: 0.7,
    ACC: 0.7,
    amygdala: 0.6,
    hippocampus: 0.6
  },
  
  // Additional Traumas
  forced_separation: {
    vmPFC: 0.9,
    amygdala: 0.9,
    hippocampus: 0.8,
    ACC: 0.8,
    fusiform_gyrus: 0.8
  },
  
  homelessness: {
    hippocampus: 0.9,
    amygdala: 0.8,
    hypothalamus: 0.8,
    dlPFC: 0.7,
    thalamus: 0.7
  },
  
  food_insecurity: {
    hypothalamus: 0.9,
    amygdala: 0.7,
    hippocampus: 0.6,
    insula: 0.7
  },
  
  parentification: {
    dlPFC: 0.9,
    vmPFC: 0.8,
    ACC: 0.8,
    caudate: 0.7
  },
  
  cult_extremism: {
    vmPFC: 0.9,
    dlPFC: 0.9,
    ACC: 0.8,
    amygdala: 0.8,
    hippocampus: 0.7
  },
  
  social_isolation: {
    fusiform_gyrus: 1.0,
    STG: 0.9,
    vmPFC: 0.8,
    amygdala: 0.7,
    precuneus: 0.8
  }
};

// Complete list of brain regions with detailed information
export const brainRegions = {
  // Prefrontal Cortex Regions
  dlPFC: {
    name: 'Dorsolateral Prefrontal Cortex',
    position: { left: [-2.5, 2.0, 2.0], right: [2.5, 2.0, 2.0] },
    color: 0x4a90e2,
    size: 0.6,
    function: 'Executive function, working memory, cognitive control',
    type: 'region'
  },
  vmPFC: {
    name: 'Ventromedial Prefrontal Cortex',
    position: { center: [0, 1.8, 2.5] },
    color: 0x7b68ee,
    size: 0.7,
    function: 'Emotion regulation, decision-making, self-referential processing',
    type: 'region'
  },
  OFC: {
    name: 'Orbitofrontal Cortex',
    position: { center: [0, 0.5, 2.8] },
    color: 0x9370db,
    size: 0.6,
    function: 'Reward processing, decision-making, impulse control',
    type: 'region'
  },
  ACC: {
    name: 'Anterior Cingulate Cortex',
    position: { center: [0, 0.8, 1.5] },
    color: 0xda70d6,
    size: 0.5,
    function: 'Conflict monitoring, pain processing, emotion regulation',
    type: 'region'
  },
  
  // Limbic System
  amygdala: {
    name: 'Amygdala',
    position: { left: [-2.0, -1.0, 0.5], right: [2.0, -1.0, 0.5] },
    color: 0xff6b6b,
    size: 0.3,
    function: 'Threat detection, fear processing, emotional memory',
    type: 'region'
  },
  hippocampus: {
    name: 'Hippocampus',
    position: { left: [-1.8, -1.2, 0], right: [1.8, -1.2, 0] },
    color: 0x4ecdc4,
    size: 0.4,
    function: 'Memory formation, stress regulation, spatial navigation',
    type: 'region'
  },
  thalamus: {
    name: 'Thalamus',
    position: { center: [0, -0.3, 0] },
    color: 0x45b7d1,
    size: 0.35,
    function: 'Sensory relay, consciousness, alertness',
    type: 'region'
  },
  hypothalamus: {
    name: 'Hypothalamus',
    position: { center: [0, -1.0, 0.3] },
    color: 0xffa500,
    size: 0.25,
    function: 'Stress response (HPA axis), homeostasis, hormonal regulation',
    type: 'region'
  },
  
  // Temporal Lobe Structures
  STG: {
    name: 'Superior Temporal Gyrus',
    position: { left: [-3.0, -0.5, 0], right: [3.0, -0.5, 0] },
    color: 0x20b2aa,
    size: 0.5,
    function: 'Auditory processing, language comprehension, social cognition',
    type: 'region'
  },
  MTG: {
    name: 'Middle Temporal Gyrus',
    position: { left: [-3.2, -1.0, -0.5], right: [3.2, -1.0, -0.5] },
    color: 0x48d1cc,
    size: 0.4,
    function: 'Semantic memory, language processing, face recognition',
    type: 'region'
  },
  ITG: {
    name: 'Inferior Temporal Gyrus',
    position: { left: [-3.0, -1.5, -1.0], right: [3.0, -1.5, -1.0] },
    color: 0x00ced1,
    size: 0.4,
    function: 'Visual object recognition, semantic processing',
    type: 'region'
  },
  fusiform_gyrus: {
    name: 'Fusiform Gyrus',
    position: { left: [-2.5, -2.0, -0.5], right: [2.5, -2.0, -0.5] },
    color: 0x00bfff,
    size: 0.35,
    function: 'Face recognition, visual word processing',
    type: 'region'
  },
  
  // Parietal Lobe Structures
  IPL: {
    name: 'Inferior Parietal Lobule',
    position: { left: [-2.5, 1.0, -1.5], right: [2.5, 1.0, -1.5] },
    color: 0xdda0dd,
    size: 0.5,
    function: 'Attention, sensory integration, body awareness',
    type: 'region'
  },
  SPL: {
    name: 'Superior Parietal Lobule',
    position: { left: [-2.0, 1.5, -2.0], right: [2.0, 1.5, -2.0] },
    color: 0xee82ee,
    size: 0.5,
    function: 'Spatial awareness, sensorimotor integration',
    type: 'region'
  },
  precuneus: {
    name: 'Precuneus',
    position: { center: [0, 1.8, -2.5] },
    color: 0xda70d6,
    size: 0.6,
    function: 'Self-awareness, consciousness, episodic memory',
    type: 'region'
  },
  angular_gyrus: {
    name: 'Angular Gyrus',
    position: { left: [-2.8, 0.5, -2.0], right: [2.8, 0.5, -2.0] },
    color: 0xba55d3,
    size: 0.4,
    function: 'Language, number processing, attention',
    type: 'region'
  },
  
  // Subcortical Structures
  nucleus_accumbens: {
    name: 'Nucleus Accumbens',
    position: { left: [-0.8, -0.8, 0.8], right: [0.8, -0.8, 0.8] },
    color: 0xffd700,
    size: 0.2,
    function: 'Reward processing, motivation, addiction vulnerability',
    type: 'region'
  },
  VTA: {
    name: 'Ventral Tegmental Area',
    position: { center: [0, -2.0, -0.5] },
    color: 0xffb347,
    size: 0.2,
    function: 'Dopamine production, reward, motivation',
    type: 'region'
  },
  substantia_nigra: {
    name: 'Substantia Nigra',
    position: { center: [0, -2.2, -0.8] },
    color: 0x2f4f4f,
    size: 0.2,
    function: 'Motor control, reward processing',
    type: 'region'
  },
  putamen: {
    name: 'Putamen',
    position: { left: [-1.5, -0.5, 0.5], right: [1.5, -0.5, 0.5] },
    color: 0x708090,
    size: 0.35,
    function: 'Motor control, habit formation, reinforcement learning',
    type: 'region'
  },
  caudate: {
    name: 'Caudate Nucleus',
    position: { left: [-1.2, 0.2, 0.8], right: [1.2, 0.2, 0.8] },
    color: 0x778899,
    size: 0.35,
    function: 'Goal-directed behavior, executive function, learning',
    type: 'region'
  },
  globus_pallidus: {
    name: 'Globus Pallidus',
    position: { left: [-1.8, -0.3, 0.3], right: [1.8, -0.3, 0.3] },
    color: 0x696969,
    size: 0.25,
    function: 'Motor control, reward processing',
    type: 'region'
  },
  
  // Brainstem Structures
  PAG: {
    name: 'Periaqueductal Gray',
    position: { center: [0, -2.5, -1.0] },
    color: 0xdc143c,
    size: 0.25,
    function: 'Pain modulation, defensive responses, emotional regulation',
    type: 'region'
  },
  locus_coeruleus: {
    name: 'Locus Coeruleus',
    position: { center: [0, -3.0, -1.5] },
    color: 0x4169e1,
    size: 0.2,
    function: 'Norepinephrine production, arousal, vigilance',
    type: 'region'
  },
  raphe_nuclei: {
    name: 'Raphe Nuclei',
    position: { center: [0, -3.2, -1.2] },
    color: 0x6495ed,
    size: 0.2,
    function: 'Serotonin production, mood regulation, sleep',
    type: 'region'
  },
  superior_colliculus: {
    name: 'Superior Colliculus',
    position: { center: [0, -2.0, -2.0] },
    color: 0x1e90ff,
    size: 0.25,
    function: 'Visual attention, eye movements, orienting responses',
    type: 'region'
  },
  inferior_colliculus: {
    name: 'Inferior Colliculus',
    position: { center: [0, -2.3, -2.2] },
    color: 0x00bfff,
    size: 0.2,
    function: 'Auditory processing, startle response',
    type: 'region'
  },
  
  // Cerebellum
  cerebellar_vermis: {
    name: 'Cerebellar Vermis',
    position: { center: [0, -2.5, -2.5] },
    color: 0xcd853f,
    size: 0.4,
    function: 'Emotional regulation, motor control, cognitive processing',
    type: 'region'
  },
  cerebellar_hemispheres: {
    name: 'Cerebellar Hemispheres',
    position: { left: [-1.5, -2.8, -2.8], right: [1.5, -2.8, -2.8] },
    color: 0xdaa520,
    size: 0.6,
    function: 'Motor learning, cognitive functions, emotional processing',
    type: 'region'
  },
  
  // Other Critical Structures
  habenula: {
    name: 'Habenula',
    position: { center: [0, -0.5, -0.8] },
    color: 0x8b0000,
    size: 0.15,
    function: 'Negative reward processing, aversion, stress response',
    type: 'region'
  },
  insula: {
    name: 'Insula',
    position: { left: [-2.2, 0, 0], right: [2.2, 0, 0] },
    color: 0xff69b4,
    size: 0.3,
    function: 'Interoception, emotion processing, empathy, pain',
    type: 'region'
  },
  corpus_callosum: {
    name: 'Corpus Callosum',
    position: { center: [0, 0, 0] },
    color: 0xf0e68c,
    size: 0.2,
    function: 'Interhemispheric communication',
    type: 'pathway'
  },
  fornix: {
    name: 'Fornix',
    position: { from: [0, -1.2, 0], to: [0, 0.8, 1.5] },
    color: 0xfafad2,
    function: 'Memory circuit, hippocampal connectivity',
    type: 'pathway'
  },
  mammillary_bodies: {
    name: 'Mammillary Bodies',
    position: { center: [0, -1.5, 0.5] },
    color: 0xffe4b5,
    size: 0.15,
    function: 'Memory processing, spatial navigation',
    type: 'region'
  },
  pineal_gland: {
    name: 'Pineal Gland',
    position: { center: [0, -0.8, -1.2] },
    color: 0xffdead,
    size: 0.1,
    function: 'Melatonin production, circadian rhythms',
    type: 'region'
  },
  basal_forebrain: {
    name: 'Basal Forebrain',
    position: { center: [0, -0.5, 1.0] },
    color: 0xf4a460,
    size: 0.3,
    function: 'Attention, arousal, learning, memory',
    type: 'region'
  },
  
  // Sensory cortex
  somatosensory_cortex: {
    name: 'Somatosensory Cortex',
    position: { left: [-1.5, 2.0, -0.5], right: [1.5, 2.0, -0.5] },
    color: 0xff7f50,
    size: 0.5,
    function: 'Touch, pain, temperature, body position sensing',
    type: 'region'
  }
};

// Calculate ACE count and analyze brain region impacts
export function analyzeACEs(answers, currentAge, biologicalSex) {
  let totalACEs = 0;
  let acesByAge = {
    '0-3': [],
    '4-6': [],
    '7-9': [],
    '10-12': [],
    '13-15': [],
    '16-18': [],
    'throughout': [],
    'multiple': []
  };
  let impactedRegions = {};
  
  // Count ACEs and organize by age periods
  Object.entries(answers).forEach(([questionId, answer]) => {
    if (answer.experienced === 'yes' && questionId !== 'protective') {
      totalACEs++;
      
      // Track which ACEs occurred at which ages (handle multi-select)
      const ageRanges = answer.ageRanges || (answer.ageRange ? [answer.ageRange] : []);
      ageRanges.forEach(ageRange => {
        if (acesByAge[ageRange]) {
          acesByAge[ageRange].push(questionId);
        }
      });
      
      // Track impacted brain regions
      if (traumaBrainMapping[questionId]) {
        Object.entries(traumaBrainMapping[questionId]).forEach(([regionKey, impact]) => {
          if (impact > 0) {
            if (!impactedRegions[regionKey]) {
              impactedRegions[regionKey] = {
                traumaTypes: [],
                ageRanges: new Set(),
                impactStrength: 0
              };
            }
            impactedRegions[regionKey].traumaTypes.push(questionId);
            // Add all age ranges for this trauma
            ageRanges.forEach(age => impactedRegions[regionKey].ageRanges.add(age));
            impactedRegions[regionKey].impactStrength = Math.max(
              impactedRegions[regionKey].impactStrength,
              impact
            );
          }
        });
      }
    }
  });
  
  // Determine critical developmental periods affected
  const criticalPeriods = {
    earlyChildhood: acesByAge['0-3'].length > 0 || acesByAge['4-6'].length > 0,
    middleChildhood: acesByAge['7-9'].length > 0 || acesByAge['10-12'].length > 0,
    adolescence: acesByAge['13-15'].length > 0 || acesByAge['16-18'].length > 0,
    chronic: acesByAge['throughout'].length > 0 || acesByAge['multiple'].length > 0
  };
  
  return {
    totalACEs,
    acesByAge,
    impactedRegions,
    criticalPeriods,
    hasProtectiveFactor: answers.protective?.experienced === 'yes'
  };
}

// Analyze trauma impact on brain regions
export function analyzeTraumaImpact(questionnaireResults) {
  const { answers, currentAge, biologicalSex } = questionnaireResults;
  const aceAnalysis = analyzeACEs(answers, currentAge, biologicalSex);
  const brainImpacts = {};
  
  // Process each impacted region
  Object.entries(aceAnalysis.impactedRegions).forEach(([regionKey, data]) => {
    const regionInfo = brainRegions[regionKey];
    if (!regionInfo) return;
    
    brainImpacts[regionKey] = {
      traumaTypes: data.traumaTypes,
      ageRanges: Array.from(data.ageRanges),
      impactStrength: data.impactStrength,
      impacts: [],
      hasProtectiveFactor: aceAnalysis.hasProtectiveFactor
    };
    
    // Add specific impact descriptions
    data.traumaTypes.forEach(traumaType => {
      const answer = answers[traumaType];
      if (answer) {
        brainImpacts[regionKey].impacts.push({
          trauma: traumaType,
          ageRanges: answer.ageRanges || (answer.ageRange ? [answer.ageRange] : []),
          duration: answer.duration,
          changes: getImpactDescription(regionKey, traumaType, answer.ageRanges?.[0] || answer.ageRange || 'unknown'),
          behavior: getBehavioralImpact(regionKey, traumaType)
        });
      }
    });
  });
  
  // Generate summary
  const summary = {
    totalACEs: aceAnalysis.totalACEs,
    totalRegionsAffected: Object.keys(brainImpacts).length,
    criticalPeriods: aceAnalysis.criticalPeriods,
    acesByAge: aceAnalysis.acesByAge,
    primaryImpacts: []
  };
  
  // Get most affected regions (by number of trauma types)
  Object.entries(brainImpacts)
    .sort((a, b) => b[1].traumaTypes.length - a[1].traumaTypes.length)
    .slice(0, 5)
    .forEach(([region, data]) => {
      summary.primaryImpacts.push({
        region: brainRegions[region]?.name || region,
        traumaCount: data.traumaTypes.length,
        ageRanges: data.ageRanges,
        mainEffect: data.impacts[0]?.behavior || 'Multiple effects'
      });
    });
  
  // Generate recommendations
  const recommendations = generateRecommendations(brainImpacts, aceAnalysis);
  
  return {
    brainImpacts,
    summary,
    recommendations,
    aceAnalysis
  };
}

// Helper function to get impact descriptions based on age
function getImpactDescription(region, traumaType, ageRange) {
  const ageSpecificImpacts = {
    '0-3': 'Critical period disruption - foundational neural architecture affected',
    '4-6': 'Early childhood impact - attachment and emotional regulation systems affected',
    '7-9': 'Middle childhood impact - social and cognitive development affected',
    '10-12': 'Pre-adolescent impact - identity and peer relationship systems affected',
    '13-15': 'Early adolescent impact - executive function and risk assessment affected',
    '16-18': 'Late adolescent impact - adult transition and independence affected',
    'throughout': 'Chronic impact - cumulative effects across all developmental stages',
    'multiple': 'Repeated impact - reinforced maladaptive neural patterns'
  };
  
  const descriptions = {
    amygdala: {
      physical_abuse: 'Hyperactive threat detection, enlarged volume',
      emotional_abuse: 'Enhanced fear conditioning, emotional dysregulation',
      sexual_abuse: 'Extreme hypervigilance, altered fear processing',
      near_death_experience: 'Heightened survival responses, panic triggers'
    },
    hippocampus: {
      physical_abuse: 'Reduced volume, impaired memory consolidation',
      emotional_abuse: 'Altered stress regulation, memory fragmentation',
      sexual_abuse: 'Volume reduction, dissociative memory patterns',
      chronic_pain: 'Stress-induced atrophy, pain memory formation'
    },
    dlPFC: {
      physical_abuse: 'Reduced gray matter, impaired executive control',
      emotional_abuse: 'Executive dysfunction, emotional dysregulation',
      emotional_neglect: 'Working memory deficits, cognitive impairment',
      educational_disruption: 'Learning pathway disruption, attention deficits'
    }
    // Add more as needed
  };
  
  const baseDescription = descriptions[region]?.[traumaType] || 'Neural adaptation to trauma';
  const ageContext = ageSpecificImpacts[ageRange] || 'Developmental impact';
  
  return `${baseDescription} - ${ageContext}`;
}

// Helper function to get behavioral impacts
function getBehavioralImpact(region, traumaType) {
  const impacts = {
    amygdala: 'Hypervigilance, emotional reactivity, fear response dysregulation',
    hippocampus: 'Memory difficulties, stress sensitivity, learning impairments',
    dlPFC: 'Executive dysfunction, poor emotional control, impulsivity',
    vmPFC: 'Self-perception issues, emotional dysregulation, decision-making problems',
    ACC: 'Heightened pain sensitivity, conflict detection issues, emotional instability',
    insula: 'Body awareness problems, empathy deficits, chronic pain',
    PAG: 'Altered pain processing, defensive response issues, emotional numbing'
    // Add more as needed
  };
  
  return impacts[region] || 'Altered neural functioning';
}

// Generate personalized recommendations based on ACE analysis
function generateRecommendations(brainImpacts, aceAnalysis) {
  const recommendations = [];
  
  // Multiple ACEs
  if (aceAnalysis.totalACEs >= 10) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Comprehensive trauma-focused therapy with a specialist experienced in complex trauma',
      priority: 'high'
    });
  } else if (aceAnalysis.totalACEs >= 5) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Trauma-informed therapy to address multiple adverse experiences',
      priority: 'high'
    });
  }
  
  // Early childhood trauma
  if (aceAnalysis.criticalPeriods.earlyChildhood) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Attachment-based therapy to address early developmental trauma',
      priority: 'high'
    });
  }
  
  // Chronic trauma
  if (aceAnalysis.criticalPeriods.chronic) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Long-term therapeutic support for complex developmental trauma',
      priority: 'high'
    });
  }
  
  // Region-specific recommendations
  Object.entries(brainImpacts).forEach(([regionKey, impact]) => {
    if (impact.traumaTypes.length >= 3) {
      switch(regionKey) {
        case 'amygdala':
          recommendations.push({
            type: 'therapy',
            suggestion: 'EMDR or trauma-focused CBT for fear processing and hypervigilance',
            priority: 'high'
          });
          recommendations.push({
            type: 'lifestyle',
            suggestion: 'Daily mindfulness and grounding techniques',
            priority: 'medium'
          });
          break;
        case 'hippocampus':
          recommendations.push({
            type: 'lifestyle',
            suggestion: 'Memory-supportive practices: journaling, structured routines',
            priority: 'medium'
          });
          break;
        case 'dlPFC':
        case 'vmPFC':
          recommendations.push({
            type: 'skills',
            suggestion: 'Executive function training and DBT skills',
            priority: 'high'
          });
          break;
        case 'insula':
          recommendations.push({
            type: 'therapy',
            suggestion: 'Somatic therapies for body awareness and interoception',
            priority: 'high'
          });
          break;
      }
    }
  });
  
  // Protective factor
  if (aceAnalysis.hasProtectiveFactor) {
    recommendations.push({
      type: 'strength',
      suggestion: 'Build on existing resilience factors and supportive relationships',
      priority: 'medium'
    });
  }
  
  // General wellness for any ACEs
  if (aceAnalysis.totalACEs > 0) {
    recommendations.push({
      type: 'lifestyle',
      suggestion: 'Regular exercise, healthy nutrition, and consistent sleep schedule',
      priority: 'medium'
    });
  }
  
  // Remove duplicates and sort
  const uniqueRecommendations = recommendations.filter((rec, index, self) =>
    index === self.findIndex((r) => r.suggestion === rec.suggestion)
  );
  
  return uniqueRecommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}