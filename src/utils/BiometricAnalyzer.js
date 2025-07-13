import * as tf from '@tensorflow/tfjs';

class BiometricAnalyzer {
  constructor() {
    this.historicalData = [];
    this.baselines = {
      heartRate: { min: 60, max: 100, resting: 70 },
      hrv: { min: 20, max: 100, optimal: 50 },
      stressLevel: { low: 0.3, moderate: 0.6, high: 0.8 },
      sleepQuality: { poor: 0.5, fair: 0.7, good: 0.85 }
    };
    this.patterns = new Map();
    this.correlations = new Map();
    this.model = null;
    this.initializeModel();
  }

  async initializeModel() {
    try {
      // Initialize a simple neural network for pattern recognition
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 20, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 10, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'softmax' })
        ]
      });

      this.model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });
    } catch (error) {
      console.error('Failed to initialize ML model:', error);
    }
  }

  analyze(currentData, historicalData = []) {
    // Store data for analysis
    this.historicalData = [...this.historicalData, ...historicalData].slice(-1000);
    
    const insights = [];
    const recommendations = [];

    // Analyze HRV patterns
    const hrvAnalysis = this.analyzeHRV(currentData, historicalData);
    insights.push(...hrvAnalysis.insights);
    recommendations.push(...hrvAnalysis.recommendations);

    // Analyze stress patterns
    const stressAnalysis = this.analyzeStress(currentData, historicalData);
    insights.push(...stressAnalysis.insights);
    recommendations.push(...stressAnalysis.recommendations);

    // Analyze sleep impact
    const sleepAnalysis = this.analyzeSleepImpact(currentData);
    insights.push(...sleepAnalysis.insights);
    recommendations.push(...sleepAnalysis.recommendations);

    // Detect anomalies
    const anomalies = this.detectAnomalies(currentData);
    insights.push(...anomalies);

    // Generate predictive insights
    const predictions = this.generatePredictions(historicalData);
    insights.push(...predictions.insights);

    return {
      insights: this.prioritizeInsights(insights),
      recommendations: this.prioritizeRecommendations(recommendations),
      patterns: this.identifyPatterns(historicalData),
      anomalies
    };
  }

  analyzeHRV(currentData, historicalData) {
    const insights = [];
    const recommendations = [];
    
    if (!currentData.hrv) return { insights, recommendations };

    const hrv = currentData.hrv;
    const recentHRV = historicalData.slice(-60).map(d => d.hrv).filter(v => v > 0);
    
    if (recentHRV.length === 0) return { insights, recommendations };

    const avgHRV = recentHRV.reduce((a, b) => a + b, 0) / recentHRV.length;
    const trend = this.calculateTrend(recentHRV);

    // Check HRV levels
    if (hrv < this.baselines.hrv.min) {
      insights.push({
        id: 'low-hrv',
        type: 'warning',
        title: 'Low HRV Detected',
        message: 'Your heart rate variability is below optimal levels, indicating potential stress or fatigue.',
        confidence: 0.8,
        timestamp: Date.now()
      });
      
      recommendations.push({
        id: 'hrv-breathing',
        priority: 'high',
        title: 'Try Coherence Breathing',
        message: 'Practice 5-5 breathing: inhale for 5 seconds, exhale for 5 seconds. This can quickly improve HRV.',
        action: 'Start Breathing Exercise'
      });
    }

    // Check HRV trend
    if (trend < -0.2) {
      insights.push({
        id: 'declining-hrv',
        type: 'warning',
        title: 'Declining HRV Trend',
        message: 'Your HRV has been decreasing over the past hour. This may indicate accumulating stress.',
        confidence: 0.7,
        timestamp: Date.now()
      });
    } else if (trend > 0.2) {
      insights.push({
        id: 'improving-hrv',
        type: 'positive',
        title: 'HRV Improving',
        message: 'Great! Your nervous system is showing improved balance and resilience.',
        confidence: 0.8,
        timestamp: Date.now()
      });
    }

    // Check coherence
    const coherence = this.calculateCoherence(recentHRV);
    if (coherence > 0.7) {
      insights.push({
        id: 'high-coherence',
        type: 'positive',
        title: 'Excellent Heart Coherence',
        message: 'Your heart rhythm is highly coherent, supporting optimal brain function and emotional balance.',
        confidence: 0.9,
        timestamp: Date.now()
      });
    }

    return { insights, recommendations };
  }

  analyzeStress(currentData, historicalData) {
    const insights = [];
    const recommendations = [];
    
    const stressLevel = currentData.stressLevel || 0;
    const recentStress = historicalData.slice(-30).map(d => d.stressLevel).filter(v => v !== undefined);
    
    if (recentStress.length === 0) return { insights, recommendations };

    const avgStress = recentStress.reduce((a, b) => a + b, 0) / recentStress.length;
    const stressVariability = this.calculateVariability(recentStress);

    // Check acute stress
    if (stressLevel > this.baselines.stressLevel.high) {
      insights.push({
        id: 'high-stress',
        type: 'warning',
        title: 'High Stress Level',
        message: 'Your stress levels are elevated. This may impact your cognitive performance and healing.',
        confidence: 0.9,
        timestamp: Date.now()
      });

      recommendations.push({
        id: 'stress-break',
        priority: 'high',
        title: 'Take a Stress Break',
        message: 'Step away for 5 minutes. Try the box breathing technique or a quick walk.',
        action: 'Set Break Reminder'
      });
    }

    // Check chronic stress patterns
    if (avgStress > this.baselines.stressLevel.moderate && stressVariability < 0.1) {
      insights.push({
        id: 'chronic-stress',
        type: 'warning',
        title: 'Chronic Stress Pattern',
        message: 'You\'ve been experiencing sustained moderate to high stress. This can impair neuroplasticity.',
        confidence: 0.8,
        timestamp: Date.now()
      });

      recommendations.push({
        id: 'stress-management',
        priority: 'medium',
        title: 'Develop Stress Management Routine',
        message: 'Consider regular meditation, exercise, or therapy to address chronic stress patterns.',
        action: 'View Stress Management Guide'
      });
    }

    // Detect stress spikes
    const stressSpikes = this.detectSpikes(recentStress);
    if (stressSpikes.length > 3) {
      insights.push({
        id: 'frequent-spikes',
        type: 'recommendation',
        title: 'Frequent Stress Spikes',
        message: `You've experienced ${stressSpikes.length} stress spikes in the last 30 minutes.`,
        confidence: 0.7,
        timestamp: Date.now()
      });
    }

    return { insights, recommendations };
  }

  analyzeSleepImpact(currentData) {
    const insights = [];
    const recommendations = [];
    
    const sleepQuality = currentData.sleepQuality || 0;
    const meditationMinutes = currentData.meditationMinutes || 0;

    // Analyze sleep quality impact
    if (sleepQuality < this.baselines.sleepQuality.poor) {
      insights.push({
        id: 'poor-sleep',
        type: 'warning',
        title: 'Poor Sleep Quality Affecting Recovery',
        message: 'Low sleep quality is limiting your brain\'s ability to heal and form new connections.',
        confidence: 0.85,
        timestamp: Date.now()
      });

      recommendations.push({
        id: 'sleep-hygiene',
        priority: 'high',
        title: 'Improve Sleep Hygiene',
        message: 'Set a consistent bedtime, avoid screens 1 hour before sleep, and keep your room cool.',
        action: 'View Sleep Guide'
      });
    } else if (sleepQuality > this.baselines.sleepQuality.good) {
      insights.push({
        id: 'excellent-sleep',
        type: 'positive',
        title: 'Excellent Sleep Supporting Healing',
        message: 'Your high-quality sleep is optimizing brain repair and memory consolidation.',
        confidence: 0.9,
        timestamp: Date.now()
      });
    }

    // Meditation impact
    if (meditationMinutes > 10) {
      insights.push({
        id: 'meditation-benefit',
        type: 'positive',
        title: 'Meditation Enhancing Neuroplasticity',
        message: `Your ${meditationMinutes} minutes of meditation today is boosting brain flexibility and healing.`,
        confidence: 0.8,
        timestamp: Date.now()
      });
    }

    return { insights, recommendations };
  }

  calculateBrainHealthCorrelations(data) {
    const hrv = data.hrv || 50;
    const stress = data.stressLevel || 0.5;
    const sleep = data.sleepQuality || 0.7;
    const meditation = data.meditationMinutes || 0;

    // Calculate healing score based on biometric factors
    const hrvScore = Math.min(hrv / 100, 1);
    const stressScore = 1 - stress;
    const sleepScore = sleep;
    const meditationScore = Math.min(meditation / 20, 1);

    const healingScore = (
      hrvScore * 0.3 +
      stressScore * 0.3 +
      sleepScore * 0.3 +
      meditationScore * 0.1
    );

    // Determine affected brain regions based on patterns
    const affectedRegions = [];
    
    if (stress > 0.7) {
      affectedRegions.push('Amygdala', 'Hippocampus');
    }
    if (hrv < 30) {
      affectedRegions.push('Prefrontal Cortex');
    }
    if (sleep < 0.6) {
      affectedRegions.push('Default Mode Network');
    }

    // Calculate neuroplasticity index
    const neuroplasticityIndex = this.calculateNeuroplasticity({
      hrv, stress, sleep, meditation
    });

    // Calculate trends
    const trends = this.calculateHealthTrends();

    return {
      healingScore,
      affectedRegions,
      neuroplasticityIndex,
      circadianAlignment: this.calculateCircadianAlignment(data),
      autonomicBalance: this.calculateAutonomicBalance(hrv, data.heartRate),
      ...trends
    };
  }

  calculateNeuroplasticity({ hrv, stress, sleep, meditation }) {
    // Complex calculation based on research
    const baseScore = 0.5;
    
    // HRV contribution (higher is better)
    const hrvContribution = (hrv / 100) * 0.3;
    
    // Stress contribution (lower is better)
    const stressContribution = (1 - stress) * 0.3;
    
    // Sleep contribution
    const sleepContribution = sleep * 0.3;
    
    // Meditation boost
    const meditationBoost = Math.min(meditation / 30, 0.1);
    
    return Math.min(1, baseScore + hrvContribution + stressContribution + sleepContribution + meditationBoost);
  }

  calculateCircadianAlignment(data) {
    const hour = new Date(data.timestamp).getHours();
    const expectedHR = this.getExpectedHeartRate(hour);
    const actualHR = data.heartRate || 70;
    
    const deviation = Math.abs(actualHR - expectedHR) / expectedHR;
    return Math.max(0, 1 - deviation);
  }

  calculateAutonomicBalance(hrv, heartRate) {
    if (!hrv || !heartRate) return 0.5;
    
    // Higher HRV with lower HR indicates good parasympathetic tone
    const hrvScore = Math.min(hrv / 80, 1);
    const hrScore = Math.max(0, 1 - (heartRate - 60) / 40);
    
    return (hrvScore + hrScore) / 2;
  }

  detectAnomalies(data) {
    const anomalies = [];
    
    // Check for unusual heart rate
    if (data.heartRate && (data.heartRate < 40 || data.heartRate > 150)) {
      anomalies.push({
        id: 'abnormal-hr',
        type: 'warning',
        title: 'Abnormal Heart Rate',
        message: `Heart rate of ${data.heartRate} bpm is outside normal range.`,
        confidence: 0.95,
        timestamp: Date.now(),
        action: 'Check Device Connection'
      });
    }

    // Check for HRV anomalies
    if (data.hrv && data.hrv < 10) {
      anomalies.push({
        id: 'very-low-hrv',
        type: 'warning',
        title: 'Very Low HRV',
        message: 'Extremely low HRV detected. Please ensure proper sensor contact.',
        confidence: 0.9,
        timestamp: Date.now()
      });
    }

    return anomalies;
  }

  generatePredictions(historicalData) {
    const insights = [];
    
    if (historicalData.length < 30) return { insights };

    // Predict stress buildup
    const stressTrend = this.predictStressTrend(historicalData);
    if (stressTrend.increasing && stressTrend.confidence > 0.7) {
      insights.push({
        id: 'stress-prediction',
        type: 'recommendation',
        title: 'Stress Building Up',
        message: 'Based on your patterns, stress levels are likely to increase in the next 30 minutes.',
        confidence: stressTrend.confidence,
        timestamp: Date.now(),
        action: 'Schedule Preventive Break'
      });
    }

    // Predict energy dips
    const energyPrediction = this.predictEnergyLevels(historicalData);
    if (energyPrediction.lowEnergyPredicted) {
      insights.push({
        id: 'energy-dip',
        type: 'recommendation',
        title: 'Energy Dip Expected',
        message: `You typically experience low energy around this time. Consider a short walk or healthy snack.`,
        confidence: energyPrediction.confidence,
        timestamp: Date.now()
      });
    }

    return { insights };
  }

  // Helper methods
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / firstAvg;
  }

  calculateVariability(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  calculateCoherence(hrvValues) {
    if (hrvValues.length < 5) return 0;
    
    // Calculate the smoothness of HRV changes
    let coherenceScore = 0;
    for (let i = 1; i < hrvValues.length; i++) {
      const change = Math.abs(hrvValues[i] - hrvValues[i - 1]);
      const avgValue = (hrvValues[i] + hrvValues[i - 1]) / 2;
      const relativeChange = change / avgValue;
      
      // Lower relative change = higher coherence
      coherenceScore += 1 - Math.min(relativeChange, 1);
    }
    
    return coherenceScore / (hrvValues.length - 1);
  }

  detectSpikes(values, threshold = 1.5) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = this.calculateVariability(values);
    
    return values
      .map((val, index) => ({ value: val, index }))
      .filter(item => Math.abs(item.value - mean) > threshold * stdDev);
  }

  getExpectedHeartRate(hour) {
    // Circadian rhythm expectations
    if (hour >= 22 || hour < 6) return 55; // Sleep
    if (hour >= 6 && hour < 9) return 65; // Morning
    if (hour >= 9 && hour < 12) return 70; // Mid-morning
    if (hour >= 12 && hour < 14) return 75; // Lunch
    if (hour >= 14 && hour < 17) return 70; // Afternoon
    if (hour >= 17 && hour < 20) return 65; // Evening
    return 60; // Night
  }

  predictStressTrend(historicalData) {
    const stressValues = historicalData.map(d => d.stressLevel).filter(v => v !== undefined);
    if (stressValues.length < 10) return { increasing: false, confidence: 0 };
    
    const trend = this.calculateTrend(stressValues);
    const consistency = 1 - this.calculateVariability(stressValues);
    
    return {
      increasing: trend > 0.1,
      confidence: Math.min(Math.abs(trend) * consistency * 2, 1)
    };
  }

  predictEnergyLevels(historicalData) {
    const hour = new Date().getHours();
    const typicalDips = [14, 15, 16]; // Post-lunch dip
    
    const isTypicalDipTime = typicalDips.includes(hour);
    const currentHRV = historicalData[historicalData.length - 1]?.hrv || 50;
    const lowHRV = currentHRV < 40;
    
    return {
      lowEnergyPredicted: isTypicalDipTime && lowHRV,
      confidence: isTypicalDipTime ? 0.8 : 0.3
    };
  }

  prioritizeInsights(insights) {
    // Sort by timestamp (most recent first) and confidence
    return insights
      .sort((a, b) => {
        if (a.type === 'warning' && b.type !== 'warning') return -1;
        if (a.type !== 'warning' && b.type === 'warning') return 1;
        return b.confidence - a.confidence;
      })
      .slice(0, 5); // Show top 5 insights
  }

  prioritizeRecommendations(recommendations) {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    return recommendations
      .sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return 0;
      })
      .slice(0, 3); // Show top 3 recommendations
  }

  identifyPatterns(historicalData) {
    // This would implement more sophisticated pattern recognition
    // For now, return basic patterns
    return {
      dailyRhythm: 'normal',
      stressPattern: 'episodic',
      recoveryRate: 'moderate'
    };
  }

  calculateHealthTrends() {
    // Calculate trends from historical data
    if (this.historicalData.length < 10) {
      return {
        hrvTrend: 0,
        stressTrend: 0,
        sleepTrend: 0,
        recoveryTrend: 0
      };
    }

    const recent = this.historicalData.slice(-20);
    const older = this.historicalData.slice(-40, -20);

    const recentAvg = {
      hrv: recent.reduce((sum, d) => sum + (d.hrv || 0), 0) / recent.length,
      stress: recent.reduce((sum, d) => sum + (d.stressLevel || 0), 0) / recent.length,
      sleep: recent.reduce((sum, d) => sum + (d.sleepQuality || 0), 0) / recent.length,
      recovery: recent.reduce((sum, d) => sum + (d.recoveryScore || 0), 0) / recent.length
    };

    const olderAvg = {
      hrv: older.reduce((sum, d) => sum + (d.hrv || 0), 0) / older.length || recentAvg.hrv,
      stress: older.reduce((sum, d) => sum + (d.stressLevel || 0), 0) / older.length || recentAvg.stress,
      sleep: older.reduce((sum, d) => sum + (d.sleepQuality || 0), 0) / older.length || recentAvg.sleep,
      recovery: older.reduce((sum, d) => sum + (d.recoveryScore || 0), 0) / older.length || recentAvg.recovery
    };

    return {
      hrvTrend: ((recentAvg.hrv - olderAvg.hrv) / olderAvg.hrv) * 100,
      stressTrend: ((recentAvg.stress - olderAvg.stress) / olderAvg.stress) * 100,
      sleepTrend: ((recentAvg.sleep - olderAvg.sleep) / olderAvg.sleep) * 100,
      recoveryTrend: ((recentAvg.recovery - olderAvg.recovery) / olderAvg.recovery) * 100
    };
  }
}

export default BiometricAnalyzer;