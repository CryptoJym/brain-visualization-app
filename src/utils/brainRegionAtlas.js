import { getRegionCoordinates, mniToThreeJS } from './brainCoordinates';

// Load MNI coordinates
const mniCoords = getRegionCoordinates();

const BASE_BRAIN_ATLAS = {
  'Prefrontal Cortex': {
    position: mniCoords.left_caudate?.three_coords
      ? [mniCoords.left_caudate.three_coords.x, mniCoords.left_caudate.three_coords.y, mniCoords.left_caudate.three_coords.z]
      : [0.0, 0.9, 0.35], // Fallback
    hemisphere: 'bilateral',
    system: 'Executive Control',
    type: 'cortical',
    description: 'Regulates planning, impulse control, and executive function.',
    mniRegions: ['left_caudate', 'right_caudate'] // Maps to caudate (executive function)
  },
  'Medial Prefrontal Cortex': {
    position: mniCoords.left_caudate?.three_coords
      ? [mniCoords.left_caudate.three_coords.x * 0.5, mniCoords.left_caudate.three_coords.y, mniCoords.left_caudate.three_coords.z * 1.2]
      : [0.1, 0.75, 0.25],
    hemisphere: 'bilateral',
    system: 'Executive Control',
    type: 'cortical',
    description: 'Integration of emotion and self-referential processing.'
  },
  'Orbitofrontal Cortex': {
    position: mniCoords.left_caudate?.three_coords
      ? [mniCoords.left_caudate.three_coords.x, mniCoords.left_caudate.three_coords.y * 0.6, mniCoords.left_caudate.three_coords.z * 1.5]
      : [0.15, 0.55, 0.6],
    hemisphere: 'bilateral',
    system: 'Executive Control',
    type: 'cortical',
    description: 'Reward valuation and adaptive decision making.'
  },
  'Dorsolateral Prefrontal Cortex': {
    position: mniCoords.left_caudate?.three_coords
      ? [mniCoords.left_caudate.three_coords.x * 1.2, mniCoords.left_caudate.three_coords.y * 1.1, mniCoords.left_caudate.three_coords.z]
      : [-0.15, 0.85, 0.3],
    hemisphere: 'bilateral',
    system: 'Executive Control',
    type: 'cortical',
    description: 'Working memory and top-down attentional control.'
  },
  'Anterior Cingulate': {
    position: mniCoords.left_accumbens?.three_coords
      ? [mniCoords.left_accumbens.three_coords.x * 0.3, mniCoords.left_accumbens.three_coords.y * 0.8, mniCoords.left_accumbens.three_coords.z * 1.5]
      : [0.0, 0.45, 0.2],
    hemisphere: 'bilateral',
    system: 'Salience Network',
    type: 'cortical',
    description: 'Conflict monitoring, error detection, and affect regulation.'
  },
  'Anterior Cingulate Cortex': {
    position: mniCoords.left_accumbens?.three_coords
      ? [mniCoords.left_accumbens.three_coords.x * 0.3, mniCoords.left_accumbens.three_coords.y * 0.8, mniCoords.left_accumbens.three_coords.z * 1.5]
      : [0.0, 0.45, 0.2],
    hemisphere: 'bilateral',
    system: 'Salience Network',
    type: 'cortical',
    description: 'Conflict monitoring, error detection, and affect regulation.'
  },
  Insula: {
    position: mniCoords.left_putamen?.three_coords
      ? [mniCoords.left_putamen.three_coords.x * 0.8, mniCoords.left_putamen.three_coords.y * 2, mniCoords.left_putamen.three_coords.z]
      : [0.0, 0.15, 0.35],
    hemisphere: 'bilateral',
    system: 'Interoceptive Network',
    type: 'cortical',
    description: 'Interoception, empathic resonance, and visceral awareness.'
  },
  Amygdala: {
    position: mniCoords.left_amygdala?.three_coords
      ? [mniCoords.left_amygdala.three_coords.x, mniCoords.left_amygdala.three_coords.y, mniCoords.left_amygdala.three_coords.z]
      : [-0.35, -0.1, 0.25],
    hemisphere: 'bilateral',
    system: 'Limbic System',
    type: 'subcortical',
    description: 'Salience detection, threat appraisal, and fear conditioning.',
    mniRegions: ['left_amygdala', 'right_amygdala']
  },
  Hippocampus: {
    position: mniCoords.left_hippocampus?.three_coords
      ? [mniCoords.left_hippocampus.three_coords.x, mniCoords.left_hippocampus.three_coords.y, mniCoords.left_hippocampus.three_coords.z]
      : [-0.45, -0.05, -0.15],
    hemisphere: 'bilateral',
    system: 'Memory Network',
    type: 'subcortical',
    description: 'Memory consolidation and contextual processing of stress.',
    mniRegions: ['left_hippocampus', 'right_hippocampus']
  },
  Thalamus: {
    position: mniCoords.left_thalamus?.three_coords
      ? [(mniCoords.left_thalamus.three_coords.x + (mniCoords.right_thalamus?.three_coords.x || 0)) / 2,
         mniCoords.left_thalamus.three_coords.y,
         mniCoords.left_thalamus.three_coords.z]
      : [0.0, -0.05, 0.0],
    hemisphere: 'midline',
    system: 'Sensory Relay',
    type: 'subcortical',
    description: 'Sensory relay hub coordinating cortical communication.',
    mniRegions: ['left_thalamus', 'right_thalamus']
  },
  'Brain Stem': {
    position: mniCoords['brain-stem']?.three_coords
      ? [mniCoords['brain-stem'].three_coords.x, mniCoords['brain-stem'].three_coords.y, mniCoords['brain-stem'].three_coords.z]
      : [0.0, -0.9, -0.1],
    hemisphere: 'midline',
    system: 'Autonomic Regulation',
    type: 'subcortical',
    description: 'Autonomic and survival reflex integration.',
    mniRegions: ['brain-stem']
  },
  Cerebellum: {
    position: [0.0, -0.75, -0.4],
    hemisphere: 'bilateral',
    system: 'Sensorimotor Regulation',
    type: 'subcortical',
    description: 'Sensorimotor coordination and timing of emotional responses.'
  },
  'Corpus Callosum': {
    position: [0.0, 0.15, 0.0],
    hemisphere: 'midline',
    system: 'White Matter Connectivity',
    type: 'white-matter',
    description: 'Inter-hemispheric communication superhighway.'
  },
  'White Matter Integrity': {
    position: [0.0, 0.0, 0.0],
    hemisphere: 'midline',
    system: 'White Matter Connectivity',
    type: 'white-matter',
    description: 'Integrity of long-range projection fibers.'
  },
  'Visual Cortex': {
    position: [0.0, 0.15, -0.75],
    hemisphere: 'bilateral',
    system: 'Sensory Processing',
    type: 'cortical',
    description: 'Primary visual processing and integration.'
  },
  'Visual Association Areas': {
    position: [0.2, 0.2, -0.65],
    hemisphere: 'bilateral',
    system: 'Sensory Processing',
    type: 'cortical',
    description: 'Contextual visual interpretation and imagery.'
  },
  'Sensory Cortex': {
    position: [0.15, 0.35, -0.15],
    hemisphere: 'bilateral',
    system: 'Sensory Processing',
    type: 'cortical',
    description: 'Somatosensory integration and body mapping.'
  },
  'Superior Temporal Gyrus': {
    position: [-0.2, 0.1, 0.55],
    hemisphere: 'bilateral',
    system: 'Social Cognition',
    type: 'cortical',
    description: 'Language, social cue processing, and empathy integration.'
  },
  'Temporal Lobe': {
    position: [-0.35, 0.1, 0.4],
    hemisphere: 'bilateral',
    system: 'Social Cognition',
    type: 'cortical',
    description: 'Semantic memory, auditory processing, and affect meaning.'
  },
  'Social Brain Network': {
    position: [0.3, 0.15, 0.5],
    hemisphere: 'bilateral',
    system: 'Social Cognition',
    type: 'network',
    description: 'Co-activation of regions supporting attachment and belonging.'
  },
  'Attachment Systems': {
    position: [0.25, 0.35, 0.45],
    hemisphere: 'bilateral',
    system: 'Social Cognition',
    type: 'network',
    description: 'Attachment circuitry spanning limbic and cortical nodes.'
  },
  'Attachment Circuits': {
    position: [0.15, 0.25, 0.5],
    hemisphere: 'bilateral',
    system: 'Social Cognition',
    type: 'network',
    description: 'Bonding and caregiving neural pathways.'
  },
  'Stress Response System': {
    position: [-0.1, -0.2, 0.1],
    hemisphere: 'midline',
    system: 'Stress Integration',
    type: 'network',
    description: 'Cortisol regulation and autonomic calibration.'
  },
  'HPA Axis': {
    position: [-0.05, -0.25, 0.05],
    hemisphere: 'midline',
    system: 'Stress Integration',
    type: 'systemic',
    description: 'Hypothalamic-pituitary-adrenal coordination of stress hormones.'
  },
  'Stress Axis': {
    position: [0.05, -0.3, 0.0],
    hemisphere: 'midline',
    system: 'Stress Integration',
    type: 'systemic',
    description: 'Broad stress adaptation network across limbic and autonomic centers.'
  },
  'Threat Detection System': {
    position: [-0.3, -0.05, 0.25],
    hemisphere: 'bilateral',
    system: 'Limbic System',
    type: 'network',
    description: 'Rapid threat detection linking amygdala, PAG, and brainstem.'
  },
  'Hypervigilance Network': {
    position: [0.35, 0.2, 0.4],
    hemisphere: 'bilateral',
    system: 'Salience Network',
    type: 'network',
    description: 'Sustained scanning and anticipatory stress circuitry.'
  },
  'Executive Networks': {
    position: [0.05, 0.65, 0.35],
    hemisphere: 'bilateral',
    system: 'Executive Control',
    type: 'network',
    description: 'Frontoparietal control systems enabling regulation and planning.'
  },
  'Prefrontal-Limbic Connectivity': {
    position: [0.0, 0.3, 0.3],
    hemisphere: 'bilateral',
    system: 'Integration Hub',
    type: 'white-matter',
    description: 'Bidirectional regulation between regulatory and emotional hubs.'
  },
  'Limbic System': {
    position: [-0.25, -0.1, 0.15],
    hemisphere: 'bilateral',
    system: 'Limbic System',
    type: 'network',
    description: 'Emotion, memory, and motivation processing ensemble.'
  },
  'Dopamine Reward Circuits': {
    position: [0.2, -0.15, -0.05],
    hemisphere: 'bilateral',
    system: 'Reward Circuitry',
    type: 'network',
    description: 'Mesolimbic pathways regulating reward sensitivity.'
  },
  'Reward Circuits': {
    position: [0.25, -0.05, -0.1],
    hemisphere: 'bilateral',
    system: 'Reward Circuitry',
    type: 'network',
    description: 'Integrated reward valuation network including striatum.'
  },
  Striatum: {
    position: [0.3, -0.05, 0.1],
    hemisphere: 'bilateral',
    system: 'Reward Circuitry',
    type: 'subcortical',
    description: 'Motivation and habit formation hub.'
  },
  'Executive Function': {
    position: [0.05, 0.7, 0.4],
    hemisphere: 'bilateral',
    system: 'Executive Control',
    type: 'network',
    description: 'Composite of regulatory processes for goal-directed behavior.'
  },
  'Social Cognition Areas': {
    position: [-0.25, 0.2, 0.55],
    hemisphere: 'bilateral',
    system: 'Social Cognition',
    type: 'network',
    description: 'Mentalizing and social inference ensemble.'
  },
  'Separation Anxiety Networks': {
    position: [0.2, 0.3, 0.5],
    hemisphere: 'bilateral',
    system: 'Attachment Safety',
    type: 'network',
    description: 'Network encoding safety signals and attachment proximity.'
  },
  'Attachment Security': {
    position: [0.15, 0.35, 0.55],
    hemisphere: 'bilateral',
    system: 'Attachment Safety',
    type: 'network',
    description: 'Sense of secure base and social buffering.'
  },
  'Default Mode Network': {
    position: [0.0, 0.45, -0.05],
    hemisphere: 'bilateral',
    system: 'Intrinsic Networks',
    type: 'network',
    description: 'Self-referential processing and autobiographical memory.'
  },
  'Overall Brain Volume': {
    position: [0.0, 0.0, 0.0],
    hemisphere: 'midline',
    system: 'Structural Integrity',
    type: 'global',
    description: 'Global gray-matter volume, reflecting diffuse structural impact.'
  },
  'Prefrontal Development': {
    position: [0.0, 0.85, 0.25],
    hemisphere: 'bilateral',
    system: 'Executive Control',
    type: 'developmental',
    description: 'Maturation trajectory of prefrontal regulatory circuits.'
  },
  'Prefrontal Function': {
    position: [0.05, 0.75, 0.25],
    hemisphere: 'bilateral',
    system: 'Executive Control',
    type: 'functional',
    description: 'Moment-to-moment regulatory capacity of frontal control systems.'
  }
};

export const brainSystemsPalette = {
  'Executive Control': '#60a5fa',
  'Salience Network': '#f97316',
  'Interoceptive Network': '#22d3ee',
  'Limbic System': '#facc15',
  'Memory Network': '#c084fc',
  'Sensory Processing': '#34d399',
  'Social Cognition': '#f472b6',
  'Attachment Safety': '#7dd3fc',
  'Stress Integration': '#f97316',
  'Reward Circuitry': '#fb7185',
  'Sensorimotor Regulation': '#a78bfa',
  'White Matter Connectivity': '#cbd5f5',
  'Structural Integrity': '#e2e8f0',
  'Autonomic Regulation': '#fbbf24',
  'Intrinsic Networks': '#38bdf8',
  'Integration Hub': '#fda4af',
  default: '#a855f7'
};

const hemisphereAnchors = {
  left: [-0.5, 0, 0],
  right: [0.5, 0, 0],
  bilateral: [0, 0, 0],
  midline: [0, 0, 0]
};

const pseudoRandom = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const seededPositionFromName = (name) => {
  const hash = pseudoRandom(name);
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 0.9 + ((hash % 17) / 50);
  const height = ((hash % 23) / 23 - 0.5) * 1.6;
  return [
    Math.cos(angle) * radius * 0.8,
    height,
    Math.sin(angle) * radius * 0.8
  ];
};

export const getBrainRegionMetadata = (name) => {
  const entry = BASE_BRAIN_ATLAS[name];
  const hemisphere = entry?.hemisphere || 'bilateral';
  const anchor = hemisphereAnchors[hemisphere] || hemisphereAnchors.bilateral;
  const position = entry?.position || seededPositionFromName(name);

  return {
    name,
    position: [
      position[0] + anchor[0],
      position[1] + anchor[1],
      position[2] + anchor[2]
    ],
    hemisphere,
    system: entry?.system || 'unspecified',
    type: entry?.type || 'network',
    description: entry?.description || 'Emergent network node influenced by trauma exposure.',
    paletteColor: brainSystemsPalette[entry?.system] || brainSystemsPalette.default
  };
};

export const enumerateRegionNodes = (brainImpacts = {}) => {
  return Object.entries(brainImpacts).map(([name, data]) => {
    const metadata = getBrainRegionMetadata(name);
    const totalImpact = data.totalImpact || 0;
    const magnitude = Math.min(100, Math.abs(totalImpact));
    const polarity = totalImpact >= 0 ? 'hyperactivation' : 'hypoactivity';
    const severity = magnitude > 45 ? 'severe' : magnitude > 25 ? 'moderate' : magnitude > 10 ? 'notable' : 'subtle';

    return {
      ...metadata,
      impact: totalImpact,
      magnitude,
      severity,
      polarity,
      hotspots: data.hotspots || data.sources || [],
      mitigation: data.mitigation || 0
    };
  }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
};

export default BASE_BRAIN_ATLAS;
