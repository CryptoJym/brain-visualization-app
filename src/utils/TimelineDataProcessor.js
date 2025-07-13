import * as THREE from 'three';

// Process historical data into timeline visualization format
export function processTimelineData(historicalData, currentMetrics) {
  if (!historicalData || historicalData.length === 0) {
    return generateMockTimelineData(currentMetrics);
  }

  const timelineData = {
    points: [],
    milestones: [],
    trends: {},
    summary: {}
  };

  // Process each historical data point
  historicalData.forEach((dataPoint, index) => {
    const healingLevel = calculateHealingLevel(dataPoint);
    const date = new Date(dataPoint.date || Date.now() - (historicalData.length - index) * 7 * 24 * 60 * 60 * 1000);
    
    timelineData.points.push({
      date: date.toISOString(),
      healingLevel,
      color: getColorForHealingLevel(healingLevel),
      data: dataPoint,
      index,
      symptoms: extractSymptoms(dataPoint),
      improvements: index > 0 ? calculateImprovements(dataPoint, historicalData[index - 1]) : []
    });
  });

  // Identify significant milestones
  timelineData.milestones = identifyMilestones(timelineData.points);

  // Calculate trends
  timelineData.trends = calculateTrends(timelineData.points);

  // Generate summary statistics
  timelineData.summary = generateSummary(timelineData.points, timelineData.trends);

  return timelineData;
}

// Calculate overall healing level from assessment data
function calculateHealingLevel(dataPoint) {
  if (!dataPoint.brainImpacts) return 0.5;

  let totalHealth = 0;
  let regionCount = 0;

  Object.entries(dataPoint.brainImpacts).forEach(([region, impact]) => {
    const severity = impact.severity || impact.impactStrength || 0.5;
    totalHealth += (1 - severity);
    regionCount++;
  });

  return regionCount > 0 ? totalHealth / regionCount : 0.5;
}

// Get color based on healing level
function getColorForHealingLevel(level) {
  const hue = level * 120; // 0 (red) to 120 (green)
  const color = new THREE.Color();
  color.setHSL(hue / 360, 0.8, 0.5);
  return `#${color.getHexString()}`;
}

// Extract symptoms from assessment data
function extractSymptoms(dataPoint) {
  const symptoms = [];

  if (dataPoint.responses) {
    // Extract from questionnaire responses
    if (dataPoint.responses.anxietyLevel > 3) {
      symptoms.push({ type: 'anxiety', severity: dataPoint.responses.anxietyLevel / 5 });
    }
    if (dataPoint.responses.depressionLevel > 3) {
      symptoms.push({ type: 'depression', severity: dataPoint.responses.depressionLevel / 5 });
    }
    if (dataPoint.responses.sleepQuality < 3) {
      symptoms.push({ type: 'sleep_issues', severity: (5 - dataPoint.responses.sleepQuality) / 5 });
    }
    if (dataPoint.responses.stressLevel > 3) {
      symptoms.push({ type: 'stress', severity: dataPoint.responses.stressLevel / 5 });
    }
  }

  // Extract from brain impacts
  if (dataPoint.brainImpacts) {
    Object.entries(dataPoint.brainImpacts).forEach(([region, impact]) => {
      if (impact.severity > 0.6) {
        symptoms.push({
          type: `${region}_dysfunction`,
          severity: impact.severity,
          description: getRegionSymptomDescription(region)
        });
      }
    });
  }

  return symptoms;
}

// Calculate improvements between two data points
function calculateImprovements(current, previous) {
  const improvements = [];

  // Compare brain region impacts
  if (current.brainImpacts && previous.brainImpacts) {
    Object.entries(current.brainImpacts).forEach(([region, currentImpact]) => {
      const previousImpact = previous.brainImpacts[region];
      if (previousImpact) {
        const currentSeverity = currentImpact.severity || 0.5;
        const previousSeverity = previousImpact.severity || 0.5;
        const improvement = previousSeverity - currentSeverity;
        
        if (improvement > 0.05) {
          improvements.push({
            type: 'brain_region',
            region,
            improvement,
            percentage: Math.round(improvement * 100),
            description: `${region.replace(/_/g, ' ')} function improved`
          });
        }
      }
    });
  }

  // Compare symptom levels
  if (current.responses && previous.responses) {
    const responseComparisons = [
      { key: 'anxietyLevel', name: 'Anxiety', invert: true },
      { key: 'depressionLevel', name: 'Depression', invert: true },
      { key: 'sleepQuality', name: 'Sleep quality', invert: false },
      { key: 'stressLevel', name: 'Stress', invert: true },
      { key: 'emotionalRegulation', name: 'Emotional regulation', invert: false }
    ];

    responseComparisons.forEach(({ key, name, invert }) => {
      const current_val = current.responses[key];
      const previous_val = previous.responses[key];
      
      if (current_val !== undefined && previous_val !== undefined) {
        const diff = invert ? previous_val - current_val : current_val - previous_val;
        if (diff > 0.5) {
          improvements.push({
            type: 'symptom',
            name,
            improvement: diff / 5,
            description: `${name} improved significantly`
          });
        }
      }
    });
  }

  return improvements;
}

// Identify significant milestones in the timeline
function identifyMilestones(points) {
  const milestones = [];

  points.forEach((point, index) => {
    // First assessment
    if (index === 0) {
      milestones.push({
        date: point.date,
        type: 'start',
        title: 'Healing Journey Began',
        description: 'Your first step towards healing',
        icon: '🌱'
      });
    }

    // Significant improvements
    if (point.improvements.length >= 3) {
      milestones.push({
        date: point.date,
        type: 'breakthrough',
        title: 'Major Breakthrough',
        description: `${point.improvements.length} areas showed improvement`,
        icon: '⭐'
      });
    }

    // Healing level milestones
    const healingMilestones = [0.25, 0.5, 0.75, 0.9];
    healingMilestones.forEach(level => {
      if (point.healingLevel >= level && (index === 0 || points[index - 1].healingLevel < level)) {
        milestones.push({
          date: point.date,
          type: 'healing_level',
          title: `${Math.round(level * 100)}% Healed`,
          description: getHealingLevelDescription(level),
          icon: getHealingLevelIcon(level)
        });
      }
    });

    // Symptom resolution
    if (index > 0) {
      const previousSymptoms = points[index - 1].symptoms;
      const resolvedSymptoms = previousSymptoms.filter(
        prevSymptom => !point.symptoms.find(
          currentSymptom => currentSymptom.type === prevSymptom.type
        )
      );

      if (resolvedSymptoms.length > 0) {
        milestones.push({
          date: point.date,
          type: 'symptom_resolved',
          title: 'Symptom Resolved',
          description: `${resolvedSymptoms[0].type.replace(/_/g, ' ')} no longer present`,
          icon: '✨'
        });
      }
    }
  });

  return milestones;
}

// Calculate trends across the timeline
function calculateTrends(points) {
  const trends = {
    overall: calculateTrendLine(points.map(p => p.healingLevel)),
    regions: {},
    symptoms: {},
    velocity: []
  };

  // Calculate regional trends
  const regionData = {};
  points.forEach(point => {
    if (point.data.brainImpacts) {
      Object.entries(point.data.brainImpacts).forEach(([region, impact]) => {
        if (!regionData[region]) regionData[region] = [];
        regionData[region].push(1 - (impact.severity || 0.5));
      });
    }
  });

  Object.entries(regionData).forEach(([region, values]) => {
    trends.regions[region] = calculateTrendLine(values);
  });

  // Calculate healing velocity (rate of change)
  for (let i = 1; i < points.length; i++) {
    const timeDiff = new Date(points[i].date) - new Date(points[i - 1].date);
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    const healingDiff = points[i].healingLevel - points[i - 1].healingLevel;
    const velocity = healingDiff / daysDiff;
    
    trends.velocity.push({
      date: points[i].date,
      velocity,
      acceleration: i > 1 ? velocity - trends.velocity[i - 2].velocity : 0
    });
  }

  return trends;
}

// Calculate trend line using simple linear regression
function calculateTrendLine(values) {
  if (values.length < 2) return { slope: 0, intercept: values[0] || 0 };

  const n = values.length;
  const sumX = values.reduce((sum, _, i) => sum + i, 0);
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
  const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept, direction: slope > 0 ? 'improving' : slope < 0 ? 'declining' : 'stable' };
}

// Generate summary statistics
function generateSummary(points, trends) {
  if (points.length === 0) return {};

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const timeDiff = new Date(lastPoint.date) - new Date(firstPoint.date);
  const daysDiff = Math.max(1, timeDiff / (1000 * 60 * 60 * 24));

  return {
    totalDays: Math.round(daysDiff),
    startingHealth: Math.round(firstPoint.healingLevel * 100),
    currentHealth: Math.round(lastPoint.healingLevel * 100),
    totalImprovement: Math.round((lastPoint.healingLevel - firstPoint.healingLevel) * 100),
    averageDailyImprovement: ((lastPoint.healingLevel - firstPoint.healingLevel) / daysDiff * 100).toFixed(2),
    trend: trends.overall.direction,
    mostImprovedRegion: findMostImprovedRegion(trends.regions),
    nextMilestone: predictNextMilestone(lastPoint.healingLevel, trends.overall.slope)
  };
}

// Helper functions
function getRegionSymptomDescription(region) {
  const descriptions = {
    amygdala: 'Heightened fear response and emotional reactivity',
    hippocampus: 'Memory difficulties and stress regulation issues',
    prefrontal_cortex: 'Executive function and decision-making challenges',
    insula: 'Difficulty with body awareness and empathy',
    anterior_cingulate: 'Attention and emotional regulation difficulties',
    brain_stem: 'Basic physiological regulation issues',
    corpus_callosum: 'Inter-hemispheric communication challenges'
  };
  
  return descriptions[region] || `${region.replace(/_/g, ' ')} dysfunction`;
}

function getHealingLevelDescription(level) {
  if (level >= 0.9) return 'Your brain has achieved remarkable healing';
  if (level >= 0.75) return 'Advanced healing with significant neuroplasticity';
  if (level >= 0.5) return 'Substantial progress in neural regeneration';
  if (level >= 0.25) return 'Early stages of healing are taking root';
  return 'Beginning your healing journey';
}

function getHealingLevelIcon(level) {
  if (level >= 0.9) return '🌟';
  if (level >= 0.75) return '🌺';
  if (level >= 0.5) return '🌿';
  if (level >= 0.25) return '🌱';
  return '🌰';
}

function findMostImprovedRegion(regionTrends) {
  let bestRegion = null;
  let bestImprovement = 0;

  Object.entries(regionTrends).forEach(([region, trend]) => {
    if (trend.slope > bestImprovement) {
      bestImprovement = trend.slope;
      bestRegion = region;
    }
  });

  return bestRegion ? {
    name: bestRegion.replace(/_/g, ' '),
    improvement: Math.round(bestImprovement * 100)
  } : null;
}

function predictNextMilestone(currentLevel, trendSlope) {
  const milestones = [0.25, 0.5, 0.75, 0.9, 1.0];
  const nextLevel = milestones.find(level => level > currentLevel);
  
  if (!nextLevel || trendSlope <= 0) return null;

  const daysToMilestone = (nextLevel - currentLevel) / trendSlope;
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + Math.round(daysToMilestone));

  return {
    level: Math.round(nextLevel * 100),
    daysAway: Math.round(daysToMilestone),
    date: predictedDate.toLocaleDateString()
  };
}

// Generate mock timeline data for demonstration
function generateMockTimelineData(currentMetrics) {
  const points = [];
  const numPoints = 12; // 12 weeks of data
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numPoints * 7);

  for (let i = 0; i < numPoints; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 7);
    
    // Simulate gradual improvement with some variation
    const progress = Math.min(1, (i / numPoints) * 0.8 + Math.random() * 0.1);
    const healingLevel = 0.3 + progress * 0.6;

    points.push({
      date: date.toISOString(),
      healingLevel,
      color: getColorForHealingLevel(healingLevel),
      data: {
        brainImpacts: {
          amygdala: { severity: 0.8 - progress * 0.5 },
          hippocampus: { severity: 0.7 - progress * 0.4 },
          prefrontal_cortex: { severity: 0.6 - progress * 0.4 }
        }
      },
      symptoms: [],
      improvements: i > 0 ? [{ type: 'general', description: 'Continued progress' }] : []
    });
  }

  return {
    points,
    milestones: identifyMilestones(points),
    trends: calculateTrends(points),
    summary: generateSummary(points, calculateTrends(points))
  };
}

// Export for use in components
export { 
  getColorForHealingLevel,
  calculateHealingLevel,
  generateMockTimelineData
};