// Healing Metrics Calculator
// Analyzes brain health improvements over time based on assessment data

// Brain region baseline impact scores (higher = more impacted)
const BASELINE_IMPACTS = {
  amygdala: { baseline: 0.8, healingRate: 0.15 },
  hippocampus: { baseline: 0.75, healingRate: 0.12 },
  prefrontal_cortex: { baseline: 0.7, healingRate: 0.18 },
  insula: { baseline: 0.65, healingRate: 0.14 },
  anterior_cingulate: { baseline: 0.6, healingRate: 0.16 },
  brain_stem: { baseline: 0.55, healingRate: 0.1 },
  corpus_callosum: { baseline: 0.5, healingRate: 0.13 }
};

// Healing milestones
const HEALING_MILESTONES = [
  { id: 'first_step', name: 'First Steps', progress: 0.1, message: 'You\'ve begun your healing journey!' },
  { id: 'foundation', name: 'Building Foundation', progress: 0.25, message: 'Your brain is establishing new patterns' },
  { id: 'momentum', name: 'Gaining Momentum', progress: 0.4, message: 'Neuroplasticity is accelerating' },
  { id: 'transformation', name: 'Transformation', progress: 0.6, message: 'Significant healing is occurring' },
  { id: 'integration', name: 'Integration', progress: 0.75, message: 'New neural pathways are strengthening' },
  { id: 'thriving', name: 'Thriving', progress: 0.9, message: 'Your brain has transformed beautifully' }
];

// Factors that influence healing rate
const HEALING_FACTORS = {
  therapy: { multiplier: 1.3, name: 'Professional therapy' },
  meditation: { multiplier: 1.2, name: 'Regular meditation' },
  exercise: { multiplier: 1.25, name: 'Physical exercise' },
  sleep: { multiplier: 1.15, name: 'Quality sleep' },
  nutrition: { multiplier: 1.1, name: 'Brain-healthy nutrition' },
  social_support: { multiplier: 1.2, name: 'Strong social connections' },
  creative_expression: { multiplier: 1.15, name: 'Creative activities' }
};

// Calculate healing progress for a brain region
function calculateRegionHealing(regionName, currentImpact, timeElapsed, activeFactors = []) {
  const regionData = BASELINE_IMPACTS[regionName];
  if (!regionData) return 0;

  // Calculate base healing based on time (in days)
  const baseHealing = Math.min(1, timeElapsed * regionData.healingRate / 365);
  
  // Apply healing factor multipliers
  let totalMultiplier = 1;
  activeFactors.forEach(factor => {
    if (HEALING_FACTORS[factor]) {
      totalMultiplier *= HEALING_FACTORS[factor].multiplier;
    }
  });
  
  // Calculate final healing progress
  const healingProgress = Math.min(1, baseHealing * totalMultiplier);
  
  // Calculate current health (1 - impact + healing)
  const currentHealth = Math.max(0, Math.min(1, (1 - currentImpact) + healingProgress));
  
  return {
    region: regionName,
    originalImpact: currentImpact,
    healingProgress,
    currentHealth,
    percentImproved: Math.round(healingProgress * 100)
  };
}

// Calculate overall healing metrics
export function calculateHealingMetrics(currentAssessment, historicalData = [], userProfile = {}) {
  const metrics = {
    overallProgress: 0,
    regionProgress: {},
    milestones: [],
    recentAchievements: [],
    healingFactors: [],
    encouragingMessage: '',
    timeElapsed: 0,
    projectedFullHealing: null
  };

  // Calculate time elapsed since first assessment
  if (historicalData.length > 0) {
    const firstDate = new Date(historicalData[0].date);
    const currentDate = new Date();
    metrics.timeElapsed = Math.floor((currentDate - firstDate) / (1000 * 60 * 60 * 24)); // days
  }

  // Identify active healing factors from user profile
  metrics.healingFactors = userProfile.healingActivities || ['therapy', 'meditation'];

  // Calculate healing for each brain region
  let totalHealing = 0;
  let regionCount = 0;

  Object.entries(currentAssessment.brainImpacts || {}).forEach(([region, impact]) => {
    const healing = calculateRegionHealing(
      region,
      impact.severity || 0.5,
      metrics.timeElapsed,
      metrics.healingFactors
    );
    
    metrics.regionProgress[region] = healing.currentHealth;
    totalHealing += healing.healingProgress;
    regionCount++;
  });

  // Calculate overall progress
  metrics.overallProgress = regionCount > 0 ? totalHealing / regionCount : 0;

  // Determine achieved milestones
  metrics.milestones = HEALING_MILESTONES.map(milestone => {
    const achieved = metrics.overallProgress >= milestone.progress;
    const justAchieved = achieved && 
      historicalData.length > 1 && 
      calculatePreviousProgress(historicalData[historicalData.length - 2]) < milestone.progress;
    
    return {
      ...milestone,
      achieved,
      justAchieved,
      celebrated: false
    };
  });

  // Add recent achievements
  const achievedMilestones = metrics.milestones.filter(m => m.justAchieved);
  if (achievedMilestones.length > 0) {
    achievedMilestones.forEach(milestone => {
      metrics.recentAchievements.push(milestone.message);
    });
  }

  // Check for region-specific improvements
  Object.entries(metrics.regionProgress).forEach(([region, health]) => {
    if (health > 0.8) {
      metrics.recentAchievements.push(`Your ${region.replace(/_/g, ' ')} is functioning beautifully!`);
    }
  });

  // Generate encouraging message based on progress
  metrics.encouragingMessage = generateEncouragingMessage(metrics.overallProgress, metrics.timeElapsed);

  // Project full healing timeline
  if (metrics.overallProgress > 0 && metrics.timeElapsed > 0) {
    const currentRate = metrics.overallProgress / metrics.timeElapsed;
    const remainingProgress = 1 - metrics.overallProgress;
    const daysToFullHealing = Math.ceil(remainingProgress / currentRate);
    metrics.projectedFullHealing = new Date();
    metrics.projectedFullHealing.setDate(metrics.projectedFullHealing.getDate() + daysToFullHealing);
  }

  return metrics;
}

// Calculate progress from historical data point
function calculatePreviousProgress(historicalDataPoint) {
  if (!historicalDataPoint || !historicalDataPoint.brainImpacts) return 0;
  
  let totalHealth = 0;
  let regionCount = 0;
  
  Object.entries(historicalDataPoint.brainImpacts).forEach(([region, impact]) => {
    totalHealth += 1 - (impact.severity || 0.5);
    regionCount++;
  });
  
  return regionCount > 0 ? totalHealth / regionCount : 0;
}

// Generate personalized encouraging messages
function generateEncouragingMessage(progress, daysElapsed) {
  if (progress < 0.1) {
    return "Every journey begins with a single step. Your brain's healing has begun.";
  } else if (progress < 0.25) {
    return "You're making wonderful progress. Your brain is already creating new, healthier patterns.";
  } else if (progress < 0.5) {
    return `In just ${daysElapsed} days, you've achieved remarkable healing. Keep going!`;
  } else if (progress < 0.75) {
    return "Your dedication is transforming your brain. You're over halfway to optimal healing!";
  } else if (progress < 0.9) {
    return "You're in the advanced stages of healing. Your brain's resilience is shining through!";
  } else {
    return "You've achieved extraordinary healing! Your brain has transformed beautifully.";
  }
}

// Calculate neuroplasticity potential based on age and factors
export function calculateNeuroplasticityPotential(age, healingFactors = []) {
  // Base neuroplasticity by age (higher for younger, but never zero)
  let basePotential = 1;
  if (age < 25) {
    basePotential = 1.0;
  } else if (age < 40) {
    basePotential = 0.9;
  } else if (age < 55) {
    basePotential = 0.8;
  } else if (age < 70) {
    basePotential = 0.7;
  } else {
    basePotential = 0.6;
  }
  
  // Apply healing factor boosts
  let totalBoost = 1;
  healingFactors.forEach(factor => {
    if (HEALING_FACTORS[factor]) {
      totalBoost *= HEALING_FACTORS[factor].multiplier;
    }
  });
  
  return Math.min(1, basePotential * totalBoost);
}

// Get personalized healing recommendations
export function getHealingRecommendations(metrics, userProfile = {}) {
  const recommendations = [];
  const activeFactors = metrics.healingFactors || [];
  
  // Recommend unused healing factors
  Object.entries(HEALING_FACTORS).forEach(([factor, data]) => {
    if (!activeFactors.includes(factor)) {
      recommendations.push({
        factor,
        name: data.name,
        potentialBoost: Math.round((data.multiplier - 1) * 100),
        priority: data.multiplier
      });
    }
  });
  
  // Sort by priority (highest multiplier first)
  recommendations.sort((a, b) => b.priority - a.priority);
  
  // Add specific recommendations based on progress
  if (metrics.overallProgress < 0.3) {
    recommendations.unshift({
      factor: 'consistency',
      name: 'Daily healing practices',
      potentialBoost: 40,
      priority: 1.4,
      note: 'Consistency is key in early healing stages'
    });
  }
  
  return recommendations.slice(0, 5); // Top 5 recommendations
}

// Calculate healing velocity (rate of improvement)
export function calculateHealingVelocity(historicalData) {
  if (historicalData.length < 2) return 0;
  
  const recentData = historicalData.slice(-30); // Last 30 data points
  if (recentData.length < 2) return 0;
  
  const firstProgress = calculatePreviousProgress(recentData[0]);
  const lastProgress = calculatePreviousProgress(recentData[recentData.length - 1]);
  const daysDiff = Math.max(1, 
    (new Date(recentData[recentData.length - 1].date) - new Date(recentData[0].date)) / 
    (1000 * 60 * 60 * 24)
  );
  
  return (lastProgress - firstProgress) / daysDiff;
}

// Export milestone definitions for external use
export { HEALING_MILESTONES, HEALING_FACTORS };