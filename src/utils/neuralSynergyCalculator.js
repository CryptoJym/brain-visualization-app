// Neural synergy calculations based on converging evidence and mathematical patterns

export const calculateAdvancedSynergies = (brainImpacts) => {
  const synergies = [];
  
  // Helper to safely get impact value
  const getImpact = (region) => brainImpacts[region]?.totalImpact || 0;
  
  // 1. Attachment-Stress Axis Disruption
  // When early neglect affects both attachment and stress systems
  const attachmentImpact = getImpact('Attachment Circuits') || getImpact('Attachment Systems');
  const stressImpact = getImpact('HPA Axis') || getImpact('Stress Response System');
  if (attachmentImpact && stressImpact) {
    synergies.push({
      pattern: 'Attachment-Stress Cascade',
      formula: 'Attachment disruption × 1.3 when co-occurring with HPA dysregulation',
      amplification: Math.abs(attachmentImpact) * 0.3,
      basis: 'Early attachment shapes stress response calibration',
      references: ['Gunnar & Quevedo, 2007', 'Lupien et al., 2009']
    });
  }
  
  // 2. Executive-Limbic Imbalance Ratio
  // Calculates the ratio between control systems and emotional systems
  const executiveReduction = Math.abs(
    getImpact('Prefrontal Cortex') + 
    getImpact('Medial Prefrontal Cortex') + 
    getImpact('Orbitofrontal Cortex')
  );
  const limbicIncrease = Math.abs(
    getImpact('Amygdala') + 
    getImpact('Limbic System')
  );
  
  if (executiveReduction > 0 && limbicIncrease > 0) {
    const imbalanceRatio = limbicIncrease / executiveReduction;
    synergies.push({
      pattern: 'Executive-Limbic Imbalance',
      formula: 'Limbic hyperactivity / Executive hypoactivity',
      ratio: imbalanceRatio,
      threshold: imbalanceRatio > 1.5 ? 'Severe' : imbalanceRatio > 1.0 ? 'Moderate' : 'Mild',
      basis: 'Top-down control deficit proportional to bottom-up hyperactivation'
    });
  }
  
  // 3. Memory-Context Network Disruption
  const memoryImpact = getImpact('Hippocampus');
  const contextImpact = getImpact('Temporal Lobe') + getImpact('Default Mode Network');
  if (memoryImpact < 0 && contextImpact) {
    synergies.push({
      pattern: 'Contextual Memory Fragmentation',
      formula: 'Hippocampal reduction × Temporal/DMN disruption',
      severity: Math.abs(memoryImpact * contextImpact) / 100,
      basis: 'Memory encoding requires intact temporal-hippocampal circuits'
    });
  }
  
  // 4. Sensory Gating Failure
  const sensoryChanges = getImpact('Sensory Cortex') + getImpact('Visual Cortex');
  const thalamus = getImpact('Thalamus') || 0;
  const inhibitoryLoss = getImpact('Prefrontal Cortex');
  
  if (sensoryChanges && inhibitoryLoss < 0) {
    synergies.push({
      pattern: 'Sensory Gating Deficit',
      formula: 'Sensory hypervigilance × Prefrontal disinhibition',
      magnitude: Math.abs(sensoryChanges) * (1 + Math.abs(inhibitoryLoss) / 100),
      basis: 'Loss of cortical filtering of sensory input'
    });
  }
  
  // 5. White Matter Connectivity Index
  const whiteChanges = getImpact('Corpus Callosum') + getImpact('White Matter Integrity');
  const networkNodes = Object.keys(brainImpacts).filter(region => 
    region.includes('Cortex') || region.includes('Network')
  ).length;
  
  if (whiteChanges < 0 && networkNodes > 3) {
    synergies.push({
      pattern: 'Network Disconnection Syndrome',
      formula: 'White matter reduction × Number of affected cortical nodes',
      disconnection: Math.abs(whiteChanges) * Math.sqrt(networkNodes),
      basis: 'Structural connectivity loss amplifies functional disruption'
    });
  }
  
  // 6. Developmental Timing Amplification
  // Early trauma creates vulnerability to later trauma
  const developmentalAmplification = Object.values(brainImpacts)
    .filter(impact => impact.sources && impact.sources.some(s => 
      s.ages && (s.ages.includes('0-2') || s.ages.includes('3-5'))
    ))
    .length;
    
  if (developmentalAmplification > 3) {
    synergies.push({
      pattern: 'Developmental Cascade',
      formula: 'Early trauma regions × 1.5 vulnerability factor',
      affectedSystems: developmentalAmplification,
      amplification: developmentalAmplification * 0.5,
      basis: 'Early alterations create sensitization to later stress'
    });
  }
  
  // 7. Reward-Stress Competition
  const rewardImpact = getImpact('Reward Circuits') || getImpact('Striatum');
  const stressActive = getImpact('Amygdala') + getImpact('HPA Axis');
  
  if (rewardImpact && stressActive > 0) {
    synergies.push({
      pattern: 'Reward-Stress Competition',
      formula: 'Stress hyperactivation suppresses reward sensitivity',
      suppression: stressActive * 0.4,
      basis: 'Chronic stress downregulates dopaminergic reward pathways'
    });
  }
  
  return synergies;
};

// Calculate network-wide effects based on graph theory principles
export const calculateNetworkEffects = (brainImpacts) => {
  const effects = [];
  
  // Count hubs (regions connected to many others)
  const hubs = ['Prefrontal Cortex', 'Thalamus', 'Hippocampus', 'Amygdala'];
  const affectedHubs = hubs.filter(hub => brainImpacts[hub]);
  
  if (affectedHubs.length >= 2) {
    effects.push({
      type: 'Hub Disruption',
      severity: affectedHubs.length / hubs.length,
      impact: 'Network-wide communication breakdown',
      principle: 'Hub regions have disproportionate influence on global connectivity'
    });
  }
  
  // Calculate small-world property disruption
  const localClusters = [
    ['Visual Cortex', 'Visual Association Areas'],
    ['Sensory Cortex', 'Insula'],
    ['Hippocampus', 'Temporal Lobe'],
    ['Prefrontal Cortex', 'Anterior Cingulate']
  ];
  
  const disruptedClusters = localClusters.filter(cluster =>
    cluster.some(region => brainImpacts[region]?.totalImpact)
  ).length;
  
  if (disruptedClusters > 2) {
    effects.push({
      type: 'Small-World Disruption',
      clusters: disruptedClusters,
      impact: 'Loss of efficient local-global balance',
      principle: 'Brain networks optimize local specialization with global integration'
    });
  }
  
  return effects;
};