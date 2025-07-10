// Research-based developmental periods with specific vulnerability windows (2023-2025 research)
const developmentalPeriods = {
  '0-3': {
    name: 'Infancy/Early Toddlerhood',
    criticalSystems: ['hpa_axis_programming', 'attachment', 'global_brain_architecture'],
    vulnerableRegions: ['hippocampus', 'amygdala', 'brain_stem', 'corpus_callosum'],
    neuralConnectionRate: 1000000, // connections per second
    specificVulnerabilities: {
      '0-8weeks': 'Most vulnerable to complex trauma',
      hippocampus: 'Bilateral effects, HPA axis programming',
      stress_response: 'Permanent alterations to cortisol patterns'
    }
  },
  '3-5': {
    name: 'Preschool',
    criticalSystems: ['emotional_regulation', 'hippocampal_memory', 'prefrontal_working_memory'],
    vulnerableRegions: ['hippocampus_bilateral', 'PFC', 'amygdala', 'vmPFC'],
    specificVulnerabilities: {
      age_3_5: 'Sexual abuse particularly damaging to hippocampus',
      age_4: 'Prefrontal working memory emergence',
      visual_memory: 'Substantial increase in capacity'
    }
  },
  '6-11': {
    name: 'School Age',
    criticalSystems: ['attention_systems', 'executive_function', 'academic_skills'],
    vulnerableRegions: ['right_hippocampus', 'amygdala', 'dlPFC', 'visual_association'],
    specificAges: {
      7: 'Right hippocampus most affected',
      '6-9': 'Attention systems maximum development',
      '10-11': 'Amygdala hypersensitivity peaks',
      11: 'Impulsivity spike'
    }
  },
  '11-13': {
    name: 'Early Adolescence',
    criticalSystems: ['prefrontal_amygdala_connectivity', 'identity_formation', 'social_processing'],
    vulnerableRegions: ['hippocampus', 'PFC', 'amygdala', 'insula'],
    note: 'Second critical window for hippocampal vulnerability'
  },
  '14-18': {
    name: 'Adolescence',
    criticalSystems: ['abstract_thinking', 'risk_assessment', 'identity_consolidation'],
    vulnerableRegions: ['PFC', 'right_hippocampus', 'dopaminergic_pathways', 'social_brain_network'],
    specificAges: {
      14: 'Right hippocampus affected'
    }
  }
};

// Research-based gender/sex differences in trauma response
const genderDifferences = {
  male: {
    vulnerableRegions: ['amygdala', 'hippocampus', 'planum_temporale'],
    hpaReactivity: 1.0,
    specificEffects: {
      cortisol: 'More vulnerable to altered diurnal patterns',
      protection: 'Androgens decrease HPA activity',
      hippocampus: 'Less volume reduction than females'
    }
  },
  female: {
    vulnerableRegions: ['hippocampus', 'corpus_callosum', 'visual_cortex', 'insula'],
    hpaReactivity: 1.3, // 1.2-1.5x greater reactivity
    specificEffects: {
      cortisol: 'More rapid HPA activation, greater output',
      vulnerability: 'Estrogens increase HPA activity',
      visual_cortex: 'Thinning with sexual abuse',
      placenta: 'Increased permeability to maternal glucocorticoids'
    }
  }
};

// Research-based ACE type to brain region mapping with specific effects
const aceTypeToBrainMapping = {
  physical_abuse: {
    primaryRegions: ['amygdala', 'ACC', 'somatosensory_cortex', 'corpus_callosum'],
    secondaryRegions: ['dlPFC', 'hippocampus', 'insula'],
    structuralChanges: {
      amygdala: 'Volumetric enlargement, hyperactivity to emotional stimuli',
      corpus_callosum: 'Reduced fractional anisotropy in body region',
      connectivity: 'Disrupted cingulum bundle and uncinate fasciculus'
    },
    effects: 'Hypervigilance, altered pain processing, emotional dysregulation',
    criticalPeriod: '10-11 years for amygdala hypertrophy',
    doseResponse: 'Modest exposure produces maximal effect'
  },
  sexual_abuse: {
    primaryRegions: ['hippocampus', 'amygdala', 'insula', 'visual_cortex', 'corpus_callosum'],
    secondaryRegions: ['PFC', 'temporal_cortex', 'cerebellar_vermis'],
    structuralChanges: {
      hippocampus: 'Bilateral volume reduction, especially ages 3-5 and 11-13',
      visual_cortex: 'Thinning in females',
      corpus_callosum: 'Reduced size, especially in females',
      connectivity: 'Reduced FA in IFOF and ILF (visual association tracts)'
    },
    effects: 'Memory fragmentation, dissociation, altered body awareness',
    criticalPeriod: '3-5 years most damaging for hippocampus',
    genderDifferences: 'Females show greater corpus callosum reduction'
  },
  emotional_neglect: {
    primaryRegions: ['PFC', 'OFC', 'ACC', 'corpus_callosum', 'default_mode_network'],
    secondaryRegions: ['amygdala', 'hippocampus', 'insula'],
    structuralChanges: {
      PFC: 'Reduced gray matter volume',
      connectivity: 'Disrupted prefrontal-amygdala pathways',
      networks: 'Default mode network alterations'
    },
    effects: 'Attachment difficulties, emotional recognition deficits',
    epigenetic: {
      NR3C1: 'Increased methylation (glucocorticoid receptor)',
      FKBP5: 'Decreased methylation (stress response dysregulation)'
    }
  },
  physical_neglect: {
    primaryRegions: ['sensory_cortex', 'cerebellum', 'parietal_cortex', 'hippocampus'],
    secondaryRegions: ['PFC', 'visual_association_areas'],
    structuralChanges: {
      cerebellum: 'Reduced volume, especially vermis',
      white_matter: 'Decreased integrity in sensory pathways',
      somatosensory: 'Altered cortical thickness'
    },
    effects: 'Sensory processing issues, motor coordination problems'
  },
  household_dysfunction: {
    primaryRegions: ['PFC', 'hippocampus', 'HPA_axis', 'salience_network'],
    secondaryRegions: ['amygdala', 'ACC', 'default_mode_network'],
    structuralChanges: {
      PFC: 'Reduced connectivity, especially vmPFC',
      HPA_axis: 'Chronic activation, altered cortisol patterns',
      networks: 'Salience network impairment, DMN alterations'
    },
    effects: 'Chronic stress response, executive function deficits',
    biomarkers: 'Elevated inflammatory markers, altered BDNF'
  }
};

// Protective factors that can reduce impact (research-based)
const protectiveFactors = {
  secure_attachment: {
    reduction: 0.20,  // 20% reduction in impact
    mechanisms: 'Lower oxytocin methylation, better facial recognition',
    epigenetic: 'Reduced stress-related methylation patterns'
  },
  high_quality_care: {
    reduction: 0.15,  // 15% reduction
    mechanisms: 'Increased hippocampal histone acetylation',
    epigenetic: 'Decreased NR3C1 methylation, increased TNF methylation'
  },
  cultural_connection: {
    reduction: 0.10, // 10% reduction
    mechanisms: 'Enhanced resilience via identity formation'
  },
  positive_experiences: {
    reduction: 0.15, // 15% reduction per positive experience
    mechanisms: 'Dose-dependent mental health benefits'
  },
  therapy_intervention: {
    reduction: 0.25,  // 25% reduction with effective therapy
    mechanisms: 'Measurable epigenetic changes, neuroplasticity activation'
  }
};

// Epigenetic markers associated with ACEs (2023-2025 research)
const epigeneticMarkers = {
  NR3C1: {
    name: 'Glucocorticoid receptor',
    effect: 'Increased methylation with trauma',
    impact: 'Altered stress response, HPA axis dysregulation'
  },
  FKBP5: {
    name: 'FK506 binding protein 5',
    effect: 'Decreased methylation with trauma',
    impact: 'Stress response dysregulation, increased PTSD risk'
  },
  BDNF: {
    name: 'Brain-derived neurotrophic factor',
    effect: 'Increased methylation with trauma',
    impact: 'Reduced neuroplasticity, depression risk'
  },
  SLC6A4: {
    name: 'Serotonin transporter',
    effect: 'Increased methylation with trauma',
    impact: 'Mood regulation issues, increased depression risk'
  },
  TNF: {
    name: 'Tumor necrosis factor',
    effect: 'Affected by positive parenting',
    impact: 'Inflammation regulation'
  }
};

// Research-based dose-response calculation
function calculateImpactStrength(aceCount, ageRanges, traumaTypes, gender = 'female', protectiveExperiences = []) {
  // Non-linear dose-response relationship based on research
  let impact;
  
  if (aceCount <= 1) {
    impact = aceCount * 0.1; // Baseline risk
  } else if (aceCount <= 3) {
    impact = 0.1 + (aceCount - 1) * 0.15; // 1.34-2.0x increased risk
  } else {
    // 4+ ACEs: 2.65x depression risk, exponential increase
    impact = 0.4 + (aceCount - 3) * 0.25;
  }
  
  // Critical period multipliers based on neuroscience research
  const criticalPeriodMultipliers = {
    '0-3': 1.4,   // Highest vulnerability - neural connections forming at 1M/sec
    '3-5': 1.3,   // High vulnerability - hippocampus especially vulnerable
    '6-11': 1.2,  // Moderate vulnerability - amygdala peaks at 10-11
    '11-13': 1.25, // Second critical window for hippocampus
    '14-18': 1.1   // Lower but still significant
  };
  
  // Apply age-based multipliers
  let maxMultiplier = 1.0;
  ageRanges.forEach(range => {
    if (criticalPeriodMultipliers[range]) {
      maxMultiplier = Math.max(maxMultiplier, criticalPeriodMultipliers[range]);
    }
  });
  impact *= maxMultiplier;
  
  // Gender-based HPA reactivity modifier from research
  const genderModifier = genderDifferences[gender]?.hpaReactivity || 1.0;
  impact *= genderModifier;
  
  // Combined ACE types have multiplicative effects
  if (traumaTypes.length > 2) {
    impact *= 1.1 + (traumaTypes.length - 2) * 0.05;
  }
  
  // Specific trauma-age combinations from research
  if (traumaTypes.includes('sexual_abuse') && 
      (ageRanges.includes('3-5') || ageRanges.includes('0-3'))) {
    impact *= 1.2; // Particularly damaging combination
  }
  
  if (traumaTypes.includes('physical_abuse') && 
      (ageRanges.includes('6-11'))) {
    impact *= 1.15; // Peak amygdala vulnerability at 10-11
  }
  
  // Apply protective factor reductions
  let protectionMultiplier = 1.0;
  protectiveExperiences.forEach(factor => {
    if (protectiveFactors[factor]) {
      protectionMultiplier *= (1 - protectiveFactors[factor].reduction);
    }
  });
  impact *= protectionMultiplier;
  
  return Math.min(impact, 1.0);
}

// Comprehensive mapping of trauma types to brain region impacts based on neuroscience research
export const traumaBrainMapping = {
  // Physical Abuse - Updated with 2023-2025 research
  physical_abuse: {
    dlPFC: 0.9,
    vmPFC: 0.8,
    OFC: 0.9,
    ACC: 1.0,
    amygdala: 1.0,  // Volumetric enlargement, hyperactivity
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
    corpus_callosum: 0.95  // Reduced fractional anisotropy
  },
  
  // Sexual Abuse - Critical at ages 3-5
  sexual_abuse: {
    dlPFC: 0.8,
    vmPFC: 0.9,
    OFC: 0.9,
    ACC: 0.9,
    amygdala: 1.0,
    hippocampus: 1.0,  // Severe bilateral reduction at 3-5, 11-13
    thalamus: 0.9,
    hypothalamus: 0.9,
    IPL: 0.8,
    fusiform_gyrus: 0.9,
    PAG: 0.9,
    insula: 0.9,
    corpus_callosum: 0.95,  // Especially in females
    fornix: 0.9,
    cerebellar_vermis: 0.9,
    visual_cortex: 0.85  // Thinning in females
  },
  
  // Emotional Abuse - Network disruptions
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
    inferior_colliculus: 0.9,
    default_mode_network: 0.85,
    salience_network: 0.85
  },
  
  // Physical Neglect - Sensory system impacts
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
    cerebellar_vermis: 0.85,
    globus_pallidus: 0.8,
    substantia_nigra: 0.7,
    somatosensory_cortex: 0.9
  },
  
  // Emotional Neglect - Attachment system disruption
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
    cerebellar_vermis: 0.8,
    corpus_callosum: 0.9,
    default_mode_network: 0.9
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
    STG: 0.8,
    default_mode_network: 0.8
  },
  
  // Domestic Violence
  domestic_violence: {
    amygdala: 1.0,
    hippocampus: 0.8,
    superior_colliculus: 0.9,
    inferior_colliculus: 1.0,
    PAG: 0.8,
    locus_coeruleus: 1.0,
    corpus_callosum: 0.85
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
  
  // Additional trauma types with research-based impacts
  peer_bullying: {
    vmPFC: 0.9,
    ACC: 0.8,
    amygdala: 0.9,
    STG: 0.9,
    fusiform_gyrus: 0.8,
    precuneus: 0.8,
    salience_network: 0.8
  },
  
  community_violence: {
    amygdala: 0.9,
    hippocampus: 0.8,
    superior_colliculus: 0.9,
    locus_coeruleus: 0.9,
    PAG: 0.8
  },
  
  economic_hardship: {
    dlPFC: 0.7,
    hippocampus: 0.6,
    hypothalamus: 0.7
  },
  
  discrimination: {
    vmPFC: 0.8,
    ACC: 0.7,
    amygdala: 0.8,
    insula: 0.7,
    salience_network: 0.75
  },
  
  medical_trauma: {
    PAG: 1.0,
    insula: 0.9,
    ACC: 0.8,
    amygdala: 0.8,
    somatosensory_cortex: 0.85
  },
  
  caregiver_changes: {
    vmPFC: 0.8,
    ACC: 0.7,
    amygdala: 0.8,
    hippocampus: 0.8,
    fusiform_gyrus: 0.9
  },
  
  caregiver_death: {
    vmPFC: 0.9,
    ACC: 0.8,
    amygdala: 0.9,
    hippocampus: 0.8
  },
  
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
    precuneus: 0.8,
    default_mode_network: 0.85
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
    vulnerablePeriods: ['4-7', '11-13'],
    type: 'region'
  },
  vmPFC: {
    name: 'Ventromedial Prefrontal Cortex',
    position: { center: [0, 1.8, 2.5] },
    color: 0x7b68ee,
    size: 0.7,
    function: 'Emotion regulation, decision-making, self-referential processing',
    vulnerablePeriods: ['0-3', '14-18'],
    type: 'region'
  },
  OFC: {
    name: 'Orbitofrontal Cortex',
    position: { center: [0, 0.5, 2.8] },
    color: 0x9370db,
    size: 0.6,
    function: 'Reward processing, decision-making, impulse control',
    vulnerablePeriods: ['3-5', '13-15'],
    type: 'region'
  },
  ACC: {
    name: 'Anterior Cingulate Cortex',
    position: { center: [0, 0.8, 1.5] },
    color: 0xda70d6,
    size: 0.5,
    function: 'Conflict monitoring, pain processing, emotion regulation',
    vulnerablePeriods: ['0-3', '10-11'],
    type: 'region'
  },
  
  // Limbic System - Research-based critical periods
  amygdala: {
    name: 'Amygdala',
    position: { left: [-2.0, -1.0, 0.5], right: [2.0, -1.0, 0.5] },
    color: 0xff6b6b,
    size: 0.3,
    function: 'Threat detection, fear processing, emotional memory',
    vulnerablePeriods: ['10-11'],  // Peak vulnerability
    criticalNotes: 'Hyperactivity peaks at ages 10-11, volumetric enlargement with physical abuse',
    type: 'region'
  },
  hippocampus: {
    name: 'Hippocampus',
    position: { left: [-1.8, -1.2, 0], right: [1.8, -1.2, 0] },
    color: 0x4ecdc4,
    size: 0.4,
    function: 'Memory formation, stress regulation, spatial navigation',
    vulnerablePeriods: ['3-5', '11-13'],  // Two critical windows
    criticalNotes: 'Bilateral vulnerability at 3-5 and 11-13; right hemisphere at ages 7 and 14',
    type: 'region'
  },
  hippocampus_bilateral: {
    name: 'Hippocampus (Bilateral)',
    position: { center: [0, -1.2, 0] },
    color: 0x4ecdc4,
    size: 0.4,
    function: 'Bilateral hippocampal processing',
    vulnerablePeriods: ['3-5', '11-13'],
    type: 'region'
  },
  right_hippocampus: {
    name: 'Right Hippocampus',
    position: { right: [1.8, -1.2, 0] },
    color: 0x4ecdc4,
    size: 0.35,
    function: 'Spatial memory, stress response',
    vulnerablePeriods: ['7', '14'],
    type: 'region'
  },
  thalamus: {
    name: 'Thalamus',
    position: { center: [0, -0.3, 0] },
    color: 0x45b7d1,
    size: 0.35,
    function: 'Sensory relay, consciousness, alertness',
    vulnerablePeriods: ['0-3'],
    type: 'region'
  },
  hypothalamus: {
    name: 'Hypothalamus',
    position: { center: [0, -1.0, 0.3] },
    color: 0xffa500,
    size: 0.25,
    function: 'Stress response (HPA axis), homeostasis, hormonal regulation',
    vulnerablePeriods: ['0-3'],  // Critical for HPA axis programming
    criticalNotes: 'Programs lifelong stress response patterns',
    type: 'region'
  },
  
  // Temporal Lobe Structures
  STG: {
    name: 'Superior Temporal Gyrus',
    position: { left: [-3.0, -0.5, 0], right: [3.0, -0.5, 0] },
    color: 0x20b2aa,
    size: 0.5,
    function: 'Auditory processing, language comprehension, social cognition',
    vulnerablePeriods: ['3-5', '7-9'],
    type: 'region'
  },
  MTG: {
    name: 'Middle Temporal Gyrus',
    position: { left: [-3.2, -1.0, -0.5], right: [3.2, -1.0, -0.5] },
    color: 0x48d1cc,
    size: 0.4,
    function: 'Semantic memory, language processing, face recognition',
    vulnerablePeriods: ['4-6'],
    type: 'region'
  },
  ITG: {
    name: 'Inferior Temporal Gyrus',
    position: { left: [-3.0, -1.5, -1.0], right: [3.0, -1.5, -1.0] },
    color: 0x00ced1,
    size: 0.4,
    function: 'Visual object recognition, semantic processing',
    vulnerablePeriods: ['6-11'],
    type: 'region'
  },
  fusiform_gyrus: {
    name: 'Fusiform Gyrus',
    position: { left: [-2.5, -2.0, -0.5], right: [2.5, -2.0, -0.5] },
    color: 0x00bfff,
    size: 0.35,
    function: 'Face recognition, visual word processing',
    vulnerablePeriods: ['0-3', '6-11'],
    type: 'region'
  },
  
  // Parietal Lobe Structures
  IPL: {
    name: 'Inferior Parietal Lobule',
    position: { left: [-2.5, 1.0, -1.5], right: [2.5, 1.0, -1.5] },
    color: 0xdda0dd,
    size: 0.5,
    function: 'Attention, sensory integration, body awareness',
    vulnerablePeriods: ['6-9'],
    type: 'region'
  },
  SPL: {
    name: 'Superior Parietal Lobule',
    position: { left: [-2.0, 1.5, -2.0], right: [2.0, 1.5, -2.0] },
    color: 0xee82ee,
    size: 0.5,
    function: 'Spatial awareness, sensorimotor integration',
    vulnerablePeriods: ['6-11'],
    type: 'region'
  },
  precuneus: {
    name: 'Precuneus',
    position: { center: [0, 1.8, -2.5] },
    color: 0xda70d6,
    size: 0.6,
    function: 'Self-awareness, consciousness, episodic memory',
    vulnerablePeriods: ['11-18'],
    type: 'region'
  },
  angular_gyrus: {
    name: 'Angular Gyrus',
    position: { left: [-2.8, 0.5, -2.0], right: [2.8, 0.5, -2.0] },
    color: 0xba55d3,
    size: 0.4,
    function: 'Language, number processing, attention',
    vulnerablePeriods: ['6-11'],
    type: 'region'
  },
  
  // Subcortical Structures
  nucleus_accumbens: {
    name: 'Nucleus Accumbens',
    position: { left: [-0.8, -0.8, 0.8], right: [0.8, -0.8, 0.8] },
    color: 0xffd700,
    size: 0.2,
    function: 'Reward processing, motivation, addiction vulnerability',
    vulnerablePeriods: ['13-18'],
    type: 'region'
  },
  VTA: {
    name: 'Ventral Tegmental Area',
    position: { center: [0, -2.0, -0.5] },
    color: 0xffb347,
    size: 0.2,
    function: 'Dopamine production, reward, motivation',
    vulnerablePeriods: ['13-18'],
    type: 'region'
  },
  substantia_nigra: {
    name: 'Substantia Nigra',
    position: { center: [0, -2.2, -0.8] },
    color: 0x2f4f4f,
    size: 0.2,
    function: 'Motor control, reward processing',
    vulnerablePeriods: ['0-3', '13-18'],
    type: 'region'
  },
  putamen: {
    name: 'Putamen',
    position: { left: [-1.5, -0.5, 0.5], right: [1.5, -0.5, 0.5] },
    color: 0x708090,
    size: 0.35,
    function: 'Motor control, habit formation, reinforcement learning',
    vulnerablePeriods: ['6-11'],
    type: 'region'
  },
  caudate: {
    name: 'Caudate Nucleus',
    position: { left: [-1.2, 0.2, 0.8], right: [1.2, 0.2, 0.8] },
    color: 0x778899,
    size: 0.35,
    function: 'Goal-directed behavior, executive function, learning',
    vulnerablePeriods: ['6-11', '13-18'],
    type: 'region'
  },
  globus_pallidus: {
    name: 'Globus Pallidus',
    position: { left: [-1.8, -0.3, 0.3], right: [1.8, -0.3, 0.3] },
    color: 0x696969,
    size: 0.25,
    function: 'Motor control, reward processing',
    vulnerablePeriods: ['0-3'],
    type: 'region'
  },
  
  // Brainstem Structures - Critical for trauma response
  PAG: {
    name: 'Periaqueductal Gray',
    position: { center: [0, -2.5, -1.0] },
    color: 0xdc143c,
    size: 0.25,
    function: 'Pain modulation, defensive responses, emotional regulation',
    vulnerablePeriods: ['0-3', '10-11'],
    criticalNotes: 'Central to freeze/flight/fight responses',
    type: 'region'
  },
  locus_coeruleus: {
    name: 'Locus Coeruleus',
    position: { center: [0, -3.0, -1.5] },
    color: 0x4169e1,
    size: 0.2,
    function: 'Norepinephrine production, arousal, vigilance',
    vulnerablePeriods: ['0-3', '10-11'],
    criticalNotes: 'Hyperactivation leads to hypervigilance',
    type: 'region'
  },
  raphe_nuclei: {
    name: 'Raphe Nuclei',
    position: { center: [0, -3.2, -1.2] },
    color: 0x6495ed,
    size: 0.2,
    function: 'Serotonin production, mood regulation, sleep',
    vulnerablePeriods: ['0-3', '13-18'],
    type: 'region'
  },
  superior_colliculus: {
    name: 'Superior Colliculus',
    position: { center: [0, -2.0, -2.0] },
    color: 0x1e90ff,
    size: 0.25,
    function: 'Visual attention, eye movements, orienting responses',
    vulnerablePeriods: ['0-3', '6-11'],
    type: 'region'
  },
  inferior_colliculus: {
    name: 'Inferior Colliculus',
    position: { center: [0, -2.3, -2.2] },
    color: 0x00bfff,
    size: 0.2,
    function: 'Auditory processing, startle response',
    vulnerablePeriods: ['0-3'],
    type: 'region'
  },
  
  // Cerebellum - Increasingly recognized in trauma
  cerebellar_vermis: {
    name: 'Cerebellar Vermis',
    position: { center: [0, -2.5, -2.5] },
    color: 0xcd853f,
    size: 0.4,
    function: 'Emotional regulation, motor control, cognitive processing',
    vulnerablePeriods: ['0-3', '3-5'],
    criticalNotes: 'Volume reduction with neglect',
    type: 'region'
  },
  cerebellar_hemispheres: {
    name: 'Cerebellar Hemispheres',
    position: { left: [-1.5, -2.8, -2.8], right: [1.5, -2.8, -2.8] },
    color: 0xdaa520,
    size: 0.6,
    function: 'Motor learning, cognitive functions, emotional processing',
    vulnerablePeriods: ['0-3', '6-11'],
    type: 'region'
  },
  
  // Other Critical Structures
  habenula: {
    name: 'Habenula',
    position: { center: [0, -0.5, -0.8] },
    color: 0x8b0000,
    size: 0.15,
    function: 'Negative reward processing, aversion, stress response',
    vulnerablePeriods: ['13-18'],
    type: 'region'
  },
  insula: {
    name: 'Insula',
    position: { left: [-2.2, 0, 0], right: [2.2, 0, 0] },
    color: 0xff69b4,
    size: 0.3,
    function: 'Interoception, emotion processing, empathy, pain',
    vulnerablePeriods: ['0-3', '10-11'],
    criticalNotes: 'Sex-specific trauma responses',
    type: 'region'
  },
  corpus_callosum: {
    name: 'Corpus Callosum',
    position: { center: [0, 0, 0] },
    color: 0xf0e68c,
    size: 0.2,
    function: 'Interhemispheric communication',
    vulnerablePeriods: ['0-3', '3-5'],
    criticalNotes: 'Reduced fractional anisotropy with abuse, especially in females',
    type: 'pathway'
  },
  fornix: {
    name: 'Fornix',
    position: { from: [0, -1.2, 0], to: [0, 0.8, 1.5] },
    color: 0xfafad2,
    function: 'Memory circuit, hippocampal connectivity',
    vulnerablePeriods: ['3-5', '11-13'],
    type: 'pathway'
  },
  mammillary_bodies: {
    name: 'Mammillary Bodies',
    position: { center: [0, -1.5, 0.5] },
    color: 0xffe4b5,
    size: 0.15,
    function: 'Memory processing, spatial navigation',
    vulnerablePeriods: ['3-5'],
    type: 'region'
  },
  pineal_gland: {
    name: 'Pineal Gland',
    position: { center: [0, -0.8, -1.2] },
    color: 0xffdead,
    size: 0.1,
    function: 'Melatonin production, circadian rhythms',
    vulnerablePeriods: ['0-3', '13-18'],
    type: 'region'
  },
  basal_forebrain: {
    name: 'Basal Forebrain',
    position: { center: [0, -0.5, 1.0] },
    color: 0xf4a460,
    size: 0.3,
    function: 'Attention, arousal, learning, memory',
    vulnerablePeriods: ['0-3', '6-11'],
    type: 'region'
  },
  
  // Sensory and other cortical regions
  somatosensory_cortex: {
    name: 'Somatosensory Cortex',
    position: { left: [-1.5, 2.0, -0.5], right: [1.5, 2.0, -0.5] },
    color: 0xff7f50,
    size: 0.5,
    function: 'Touch, pain, temperature, body position sensing',
    vulnerablePeriods: ['0-3', '3-5'],
    type: 'region'
  },
  visual_cortex: {
    name: 'Visual Cortex',
    position: { center: [0, 0.5, -3.0] },
    color: 0x87ceeb,
    size: 0.6,
    function: 'Visual processing',
    vulnerablePeriods: ['0-3', '3-5'],
    criticalNotes: 'Thinning in females with sexual abuse',
    type: 'region'
  },
  visual_association: {
    name: 'Visual Association Areas',
    position: { left: [-2.0, 0, -2.5], right: [2.0, 0, -2.5] },
    color: 0x4682b4,
    size: 0.5,
    function: 'Complex visual processing, object recognition',
    vulnerablePeriods: ['3-5', '6-11'],
    type: 'region'
  },
  
  // Language areas
  broca_area: {
    name: "Broca's Area",
    position: { left: [-2.8, 1.5, 1.0] },
    color: 0x32cd32,
    size: 0.4,
    function: 'Speech production, language processing',
    vulnerablePeriods: ['3-5'],
    type: 'region'
  },
  wernicke_area: {
    name: "Wernicke's Area",
    position: { left: [-3.0, -0.5, 0.5] },
    color: 0x228b22,
    size: 0.4,
    function: 'Language comprehension',
    vulnerablePeriods: ['3-5'],
    type: 'region'
  },
  
  // Network nodes
  default_mode_network: {
    name: 'Default Mode Network',
    position: { center: [0, 1.0, -1.0] },
    color: 0x9966cc,
    size: 0.3,
    function: 'Self-referential thinking, mind-wandering',
    vulnerablePeriods: ['11-18'],
    criticalNotes: 'Alterations with emotional neglect',
    type: 'network'
  },
  salience_network: {
    name: 'Salience Network',
    position: { center: [0, 0.5, 0.5] },
    color: 0xcc6699,
    size: 0.3,
    function: 'Switching between internal/external focus',
    vulnerablePeriods: ['6-11', '13-18'],
    criticalNotes: 'Impairment with household dysfunction',
    type: 'network'
  },
  
  // Additional regions
  HPA_axis: {
    name: 'HPA Axis',
    position: { from: [0, -1.0, 0.3], to: [0, -3.0, 0] },
    color: 0xff4500,
    function: 'Stress response system',
    vulnerablePeriods: ['0-3'],
    criticalNotes: 'Programming occurs in first 8 weeks of life',
    type: 'system'
  },
  planum_temporale: {
    name: 'Planum Temporale',
    position: { left: [-3.0, -0.8, 0], right: [3.0, -0.8, 0] },
    color: 0x20b2aa,
    size: 0.3,
    function: 'Auditory processing, language',
    vulnerablePeriods: ['3-5'],
    criticalNotes: 'Sex-specific trauma responses',
    type: 'region'
  },
  brain_stem: {
    name: 'Brain Stem',
    position: { center: [0, -3.0, -1.0] },
    color: 0x8b4513,
    size: 0.6,
    function: 'Basic life functions, arousal',
    vulnerablePeriods: ['0-3'],
    type: 'region'
  },
  dopaminergic_pathways: {
    name: 'Dopaminergic Pathways',
    position: { from: [0, -2.0, -0.5], to: [0, -0.8, 0.8] },
    color: 0xffa500,
    function: 'Reward and motivation circuits',
    vulnerablePeriods: ['13-18'],
    type: 'pathway'
  },
  social_brain_network: {
    name: 'Social Brain Network',
    position: { center: [0, 1.0, 1.0] },
    color: 0x87ceeb,
    size: 0.4,
    function: 'Social cognition and interaction',
    vulnerablePeriods: ['11-18'],
    type: 'network'
  }
};

// Calculate ACE count and analyze brain region impacts with research-based approach
export function analyzeACEs(answers, currentAge, biologicalSex, protectiveExperiences = []) {
  let totalACEs = 0;
  let acesByAge = {
    '0-3': [],
    '3-5': [],    // Changed from '4-6' to match research periods
    '6-11': [],   // Expanded from '7-12' to match research
    '11-13': [],  // New critical period
    '14-18': [],  // Changed from '13-18'
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
      
      // Track impacted brain regions with research-based calculations
      if (traumaBrainMapping[questionId]) {
        Object.entries(traumaBrainMapping[questionId]).forEach(([regionKey, impact]) => {
          if (impact > 0) {
            if (!impactedRegions[regionKey]) {
              impactedRegions[regionKey] = {
                traumaTypes: [],
                ageRanges: new Set(),
                impactStrength: 0,
                epigenetic: [],
                structuralChanges: []
              };
            }
            impactedRegions[regionKey].traumaTypes.push(questionId);
            
            // Add all age ranges for this trauma
            ageRanges.forEach(age => impactedRegions[regionKey].ageRanges.add(age));
            
            // Calculate impact strength using research-based function
            const strength = calculateImpactStrength(
              totalACEs,
              ageRanges,
              impactedRegions[regionKey].traumaTypes,
              biologicalSex,
              protectiveExperiences
            );
            
            impactedRegions[regionKey].impactStrength = Math.max(
              impactedRegions[regionKey].impactStrength,
              strength
            );
            
            // Add epigenetic markers if applicable
            if (aceTypeToBrainMapping[questionId]?.epigenetic) {
              Object.entries(aceTypeToBrainMapping[questionId].epigenetic).forEach(([marker, effect]) => {
                impactedRegions[regionKey].epigenetic.push({ marker, effect });
              });
            }
            
            // Add structural changes
            if (aceTypeToBrainMapping[questionId]?.structuralChanges?.[regionKey]) {
              impactedRegions[regionKey].structuralChanges.push(
                aceTypeToBrainMapping[questionId].structuralChanges[regionKey]
              );
            }
          }
        });
      }
    }
  });
  
  // Determine critical developmental periods affected
  const criticalPeriods = {
    infancy: acesByAge['0-3'].length > 0,
    preschool: acesByAge['3-5'].length > 0,
    schoolAge: acesByAge['6-11'].length > 0,
    earlyAdolescence: acesByAge['11-13'].length > 0,
    adolescence: acesByAge['14-18'].length > 0,
    chronic: acesByAge['throughout'].length > 0 || acesByAge['multiple'].length > 0
  };
  
  // Calculate dose-response effects
  let doseResponseCategory;
  if (totalACEs === 0) {
    doseResponseCategory = 'baseline';
  } else if (totalACEs <= 1) {
    doseResponseCategory = 'low';
  } else if (totalACEs <= 3) {
    doseResponseCategory = 'moderate';  // 1.34-2.0x risk
  } else {
    doseResponseCategory = 'high';  // 2.65x+ risk
  }
  
  return {
    totalACEs,
    acesByAge,
    impactedRegions,
    criticalPeriods,
    doseResponseCategory,
    hasProtectiveFactor: answers.protective?.experienced === 'yes',
    protectiveExperiences,
    biologicalSex,
    epigeneticRisk: totalACEs >= 2  // Significant epigenetic changes
  };
}

// Analyze trauma impact on brain regions with research-based approach
export function analyzeTraumaImpact(assessmentResults) {
  console.log('analyzeTraumaImpact - input:', assessmentResults);
  
  try {
    if (!assessmentResults) {
      console.error('No assessment results provided');
      return {
        brainImpacts: {},
        summary: {
          totalACEs: 0,
          totalRegionsAffected: 0,
          criticalPeriods: {},
          acesByAge: {},
          doseResponseCategory: 'baseline',
          primaryImpacts: [],
          networkImpacts: [],
          epigeneticRisk: false,
          genderSpecificRisks: []
        },
        recommendations: [],
        aceAnalysis: {},
        researchFindings: {}
      };
    }
  
  const { answers = {}, currentAge, biologicalSex, protectiveExperiences = [] } = assessmentResults;
  const aceAnalysis = analyzeACEs(answers, currentAge, biologicalSex, protectiveExperiences);
  const brainImpacts = {};
  
  // Process each impacted region with research-based analysis
  Object.entries(aceAnalysis.impactedRegions).forEach(([regionKey, data]) => {
    const regionInfo = brainRegions[regionKey];
    if (!regionInfo) return;
    
    // Check if this region was affected during its vulnerable periods
    const affectedDuringVulnerablePeriod = regionInfo.vulnerablePeriods?.some(period => {
      return Array.from(data.ageRanges).some(ageRange => {
        // Match specific ages or ranges
        if (period === ageRange) return true;
        if (period === '7' && ageRange === '6-11') return true;
        if (period === '10-11' && ageRange === '6-11') return true;
        if (period === '14' && ageRange === '14-18') return true;
        return false;
      });
    });
    
    brainImpacts[regionKey] = {
      traumaTypes: data.traumaTypes,
      ageRanges: Array.from(data.ageRanges),
      impactStrength: data.impactStrength,
      impacts: [],
      hasProtectiveFactor: aceAnalysis.hasProtectiveFactor,
      affectedDuringVulnerablePeriod,
      epigenetic: data.epigenetic,
      structuralChanges: data.structuralChanges,
      criticalNotes: regionInfo.criticalNotes
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
          behavior: getBehavioralImpact(regionKey, traumaType, biologicalSex)
        });
      }
    });
  });
  
  // Generate research-based summary
  const summary = {
    totalACEs: aceAnalysis.totalACEs,
    totalRegionsAffected: Object.keys(brainImpacts).length,
    criticalPeriods: aceAnalysis.criticalPeriods,
    acesByAge: aceAnalysis.acesByAge,
    doseResponseCategory: aceAnalysis.doseResponseCategory,
    primaryImpacts: [],
    networkImpacts: [],
    epigeneticRisk: aceAnalysis.epigeneticRisk,
    genderSpecificRisks: getGenderSpecificRisks(biologicalSex, brainImpacts)
  };
  
  // Get most affected regions with research prioritization
  const regionPriority = {
    amygdala: 10,
    hippocampus: 10,
    hippocampus_bilateral: 10,
    right_hippocampus: 9,
    PFC: 9,
    dlPFC: 9,
    vmPFC: 9,
    ACC: 8,
    corpus_callosum: 8,
    PAG: 8,
    locus_coeruleus: 8,
    insula: 7,
    default_mode_network: 7,
    salience_network: 7
  };
  
  Object.entries(brainImpacts)
    .sort((a, b) => {
      // Sort by priority first, then by impact strength
      const priorityA = regionPriority[a[0]] || 5;
      const priorityB = regionPriority[b[0]] || 5;
      if (priorityA !== priorityB) return priorityB - priorityA;
      return b[1].impactStrength - a[1].impactStrength;
    })
    .slice(0, 7)
    .forEach(([region, data]) => {
      summary.primaryImpacts.push({
        region: brainRegions[region]?.name || region,
        traumaCount: data.traumaTypes.length,
        ageRanges: data.ageRanges,
        mainEffect: data.impacts[0]?.behavior || 'Multiple effects',
        criticalPeriodAffected: data.affectedDuringVulnerablePeriod,
        structuralChanges: data.structuralChanges
      });
    });
  
  // Identify network impacts
  ['default_mode_network', 'salience_network', 'social_brain_network'].forEach(network => {
    if (brainImpacts[network]) {
      summary.networkImpacts.push({
        network: brainRegions[network].name,
        impact: brainImpacts[network].impactStrength,
        effects: brainImpacts[network].impacts[0]?.behavior
      });
    }
  });
  
  // Generate research-based recommendations
  const recommendations = generateResearchBasedRecommendations(brainImpacts, aceAnalysis, biologicalSex);
  
  return {
    brainImpacts,
    summary,
    recommendations,
    aceAnalysis,
    researchFindings: {
      doseResponse: getDoseResponseDescription(aceAnalysis.doseResponseCategory),
      epigeneticRisk: aceAnalysis.epigeneticRisk ? 'High - Consider epigenetic screening' : 'Low',
      criticalPeriods: getCriticalPeriodDescription(aceAnalysis.criticalPeriods),
      protectiveFactors: getProtectiveFactorDescription(aceAnalysis.protectiveExperiences)
    }
  };
  } catch (error) {
    console.error('Error in analyzeTraumaImpact:', error);
    return {
      brainImpacts: {},
      summary: {
        totalACEs: 0,
        totalRegionsAffected: 0,
        criticalPeriods: {},
        acesByAge: {},
        doseResponseCategory: 'baseline',
        primaryImpacts: [],
        networkImpacts: [],
        epigeneticRisk: false,
        genderSpecificRisks: []
      },
      recommendations: [],
      aceAnalysis: {},
      researchFindings: {}
    };
  }
}

// Helper function to get research-based impact descriptions
function getImpactDescription(region, traumaType, ageRange) {
  const ageSpecificImpacts = {
    '0-3': 'Critical period disruption - neural connections forming at 1M/second',
    '3-5': 'Preschool impact - hippocampal vulnerability peak, working memory emergence',
    '6-11': 'School age impact - attention systems development, amygdala sensitivity',
    '11-13': 'Early adolescence - second hippocampal vulnerability window',
    '14-18': 'Adolescent impact - prefrontal maturation, identity formation',
    'throughout': 'Chronic impact - cumulative epigenetic and structural changes',
    'multiple': 'Repeated impact - dose-dependent structural alterations'
  };
  
  // Research-based descriptions for specific region-trauma combinations
  const descriptions = {
    amygdala: {
      physical_abuse: 'Volumetric enlargement, hyperactivity to emotional stimuli (peaks age 10-11)',
      emotional_abuse: 'Enhanced fear conditioning, disrupted emotion regulation circuits',
      sexual_abuse: 'Extreme hypervigilance, altered threat detection threshold',
      near_death_experience: 'Persistent hyperactivation, panic response sensitization'
    },
    hippocampus: {
      physical_abuse: 'Volume reduction, HPA axis dysregulation, memory consolidation deficits',
      emotional_abuse: 'Stress-induced atrophy, fragmented autobiographical memory',
      sexual_abuse: 'Severe bilateral volume reduction (especially ages 3-5), dissociative patterns',
      chronic_pain: 'Glucocorticoid-mediated atrophy, altered pain memory encoding'
    },
    corpus_callosum: {
      physical_abuse: 'Reduced fractional anisotropy in body region, interhemispheric disruption',
      sexual_abuse: 'Size reduction (more severe in females), connectivity impairment',
      emotional_neglect: 'White matter integrity loss, delayed myelination'
    },
    dlPFC: {
      physical_abuse: 'Gray matter reduction, executive control impairment',
      emotional_abuse: 'Working memory deficits (emerges age 4), emotional dysregulation',
      emotional_neglect: 'Delayed maturation, cognitive flexibility impairment',
      educational_disruption: 'Learning circuit disruption, attention network dysfunction'
    },
    insula: {
      physical_abuse: 'Interoceptive dysfunction, altered pain processing',
      sexual_abuse: 'Body awareness disruption, dissociative tendencies',
      chronic_pain: 'Central sensitization, emotional-somatic integration failure'
    },
    PAG: {
      physical_abuse: 'Defensive response dysregulation, chronic freeze states',
      near_death_experience: 'Survival circuit hyperactivation, panic vulnerability',
      medical_trauma: 'Pain modulation disruption, emotional numbing'
    }
  };
  
  const baseDescription = descriptions[region]?.[traumaType] || 
    `Neural adaptation - ${aceTypeToBrainMapping[traumaType]?.effects || 'structural and functional changes'}`;
  const ageContext = ageSpecificImpacts[ageRange] || 'Developmental impact';
  
  return `${baseDescription} | ${ageContext}`;
}

// Helper function to get behavioral impacts with gender considerations
function getBehavioralImpact(region, traumaType, gender = 'female') {
  const baseImpacts = {
    amygdala: 'Hypervigilance, emotional reactivity, fear generalization, anxiety',
    hippocampus: 'Memory fragmentation, stress sensitivity, contextual processing deficits',
    dlPFC: 'Executive dysfunction, impulsivity, emotional control deficits, attention problems',
    vmPFC: 'Self-concept disruption, emotional dysregulation, social decision-making impairment',
    ACC: 'Conflict detection errors, heightened pain sensitivity, emotional instability',
    insula: 'Interoceptive deficits, emotional numbing, chronic pain vulnerability',
    PAG: 'Freeze responses, dissociation, defensive behavior dysregulation',
    corpus_callosum: 'Interhemispheric processing delays, emotional integration problems',
    default_mode_network: 'Self-referential processing disruption, rumination, depression risk',
    salience_network: 'Attention switching impairment, hypervigilance to threat'
  };
  
  let impact = baseImpacts[region] || 'Altered neural functioning';
  
  // Add gender-specific modifiers based on research
  if (gender === 'female' && genderDifferences.female.vulnerableRegions.includes(region)) {
    impact += ' (enhanced vulnerability in females)';
  } else if (gender === 'male' && region === 'amygdala') {
    impact += ' (altered diurnal cortisol patterns in males)';
  }
  
  return impact;
}

// Generate research-based recommendations
function generateResearchBasedRecommendations(brainImpacts, aceAnalysis, gender) {
  const recommendations = [];
  
  // Dose-response based recommendations
  if (aceAnalysis.doseResponseCategory === 'high') {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Comprehensive trauma-focused therapy with neurobiologically-informed approach',
      priority: 'critical',
      evidence: '4+ ACEs associated with 2.65x depression risk, requires intensive intervention'
    });
    
    recommendations.push({
      type: 'medical',
      suggestion: 'Consider epigenetic screening and biomarker assessment',
      priority: 'high',
      evidence: 'High ACE scores associated with measurable epigenetic changes'
    });
  } else if (aceAnalysis.doseResponseCategory === 'moderate') {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Trauma-informed therapy targeting specific developmental impacts',
      priority: 'high',
      evidence: '2-3 ACEs show 1.34-2.0x increased mental health risks'
    });
  }
  
  // Critical period-specific recommendations
  if (aceAnalysis.criticalPeriods.infancy) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Attachment-based interventions (e.g., CPP, PCIT) for early trauma',
      priority: 'critical',
      evidence: '0-3 years critical for HPA axis programming and attachment'
    });
  }
  
  if (aceAnalysis.criticalPeriods.preschool && 
      aceAnalysis.acesByAge['3-5'].includes('sexual_abuse')) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Specialized trauma therapy for early sexual abuse (TF-CBT)',
      priority: 'critical',
      evidence: 'Ages 3-5 particularly vulnerable to hippocampal damage from sexual abuse'
    });
  }
  
  // Region-specific evidence-based interventions
  if (brainImpacts.amygdala?.impactStrength > 0.8) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'EMDR or neurofeedback for amygdala hyperactivity',
      priority: 'high',
      evidence: 'Proven efficacy in reducing amygdala hyperreactivity'
    });
    
    recommendations.push({
      type: 'lifestyle',
      suggestion: 'Daily mindfulness practice (20+ minutes) with body scan',
      priority: 'high',
      evidence: 'Reduces amygdala volume and reactivity over 8 weeks'
    });
  }
  
  if (brainImpacts.hippocampus?.impactStrength > 0.7) {
    recommendations.push({
      type: 'lifestyle',
      suggestion: 'Aerobic exercise program (150 min/week) for hippocampal neurogenesis',
      priority: 'high',
      evidence: 'Increases hippocampal volume and BDNF expression'
    });
    
    recommendations.push({
      type: 'therapy',
      suggestion: 'Cognitive remediation therapy for memory deficits',
      priority: 'medium',
      evidence: 'Improves hippocampal-dependent memory function'
    });
  }
  
  if (brainImpacts.dlPFC?.impactStrength > 0.7 || brainImpacts.vmPFC?.impactStrength > 0.7) {
    recommendations.push({
      type: 'skills',
      suggestion: 'DBT skills training for executive function and emotion regulation',
      priority: 'high',
      evidence: 'Targets prefrontal-mediated skills deficits'
    });
  }
  
  if (brainImpacts.corpus_callosum?.impactStrength > 0.7) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Bilateral stimulation therapies (EMDR, drumming)',
      priority: 'medium',
      evidence: 'Promotes interhemispheric integration'
    });
  }
  
  // Network-based interventions
  if (aceAnalysis.impactedRegions.default_mode_network || 
      aceAnalysis.impactedRegions.salience_network) {
    recommendations.push({
      type: 'therapy',
      suggestion: 'Mindfulness-Based Stress Reduction (MBSR) for network regulation',
      priority: 'high',
      evidence: 'Normalizes DMN and salience network activity'
    });
  }
  
  // Gender-specific recommendations
  if (gender === 'female') {
    recommendations.push({
      type: 'medical',
      suggestion: 'Monitor HPA axis function and stress hormone levels',
      priority: 'medium',
      evidence: 'Females show 1.2-1.5x greater HPA reactivity to trauma'
    });
  }
  
  // Protective factor enhancement
  if (!aceAnalysis.hasProtectiveFactor) {
    recommendations.push({
      type: 'support',
      suggestion: 'Build secure relationships and social support network',
      priority: 'high',
      evidence: 'Secure attachment provides 20% reduction in trauma impact'
    });
  }
  
  // Epigenetic interventions
  if (aceAnalysis.epigeneticRisk) {
    recommendations.push({
      type: 'lifestyle',
      suggestion: 'Anti-inflammatory diet and stress reduction protocol',
      priority: 'medium',
      evidence: 'Can modify epigenetic markers (NR3C1, FKBP5) over time'
    });
  }
  
  // Sort by priority and remove duplicates
  const uniqueRecommendations = recommendations.filter((rec, index, self) =>
    index === self.findIndex((r) => r.suggestion === rec.suggestion)
  );
  
  return uniqueRecommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Helper functions for research-based descriptions
function getGenderSpecificRisks(gender, brainImpacts) {
  const risks = [];
  const genderData = genderDifferences[gender];
  
  if (!genderData) return risks;
  
  // Check for gender-specific vulnerable regions
  genderData.vulnerableRegions.forEach(region => {
    if (brainImpacts[region]) {
      risks.push({
        region: brainRegions[region]?.name || region,
        risk: genderData.specificEffects[region] || 'Enhanced vulnerability'
      });
    }
  });
  
  // Add HPA axis reactivity risk
  if (Object.keys(brainImpacts).length > 3) {
    risks.push({
      system: 'HPA Axis',
      risk: genderData.specificEffects.cortisol || 'Altered stress response'
    });
  }
  
  return risks;
}

function getDoseResponseDescription(category) {
  const descriptions = {
    baseline: 'No elevated risk',
    low: '1 ACE: Baseline to slightly elevated risk',
    moderate: '2-3 ACEs: 1.34-2.0x increased risk for depression and anxiety',
    high: '4+ ACEs: 2.65x depression risk, 55.2% substance abuse rate, significant health impacts'
  };
  return descriptions[category] || 'Unknown risk level';
}

function getCriticalPeriodDescription(periods) {
  const affected = [];
  if (periods.infancy) affected.push('Infancy (0-3): HPA axis programming, attachment formation');
  if (periods.preschool) affected.push('Preschool (3-5): Hippocampal vulnerability, emotional regulation');
  if (periods.schoolAge) affected.push('School Age (6-11): Amygdala sensitivity peak, executive function');
  if (periods.earlyAdolescence) affected.push('Early Adolescence (11-13): Second hippocampal window');
  if (periods.adolescence) affected.push('Adolescence (14-18): Prefrontal maturation, identity');
  if (periods.chronic) affected.push('Chronic exposure: Cumulative epigenetic changes');
  
  return affected.length > 0 ? affected.join('; ') : 'No critical periods identified';
}

function getProtectiveFactorDescription(factors) {
  if (!factors || factors.length === 0) {
    return 'No protective factors identified - consider building resilience resources';
  }
  
  const descriptions = factors.map(factor => {
    const data = protectiveFactors[factor];
    if (data) {
      return `${factor}: ${data.mechanisms} (${data.reduction * 100}% impact reduction)`;
    }
    return factor;
  });
  
  return descriptions.join('; ');
}