// AI-Generated Personalized Healing Pathways
// Creates custom therapeutic interventions based on brain impact analysis

class HealingPathwayGenerator {
  constructor() {
    this.pathways = [];
    this.exercises = {
      // Region-specific healing exercises
      hippocampus: [
        {
          name: 'Memory Palace Reconstruction',
          type: 'neuroplasticity',
          description: 'Build positive memory associations to counteract traumatic imprints',
          duration: '15 min',
          frequency: 'daily',
          techniques: ['visualization', 'spatial_memory', 'positive_association']
        },
        {
          name: 'Bilateral Storytelling',
          type: 'integration',
          description: 'Alternate between left/right sensory input while recounting positive memories',
          duration: '20 min',
          frequency: '3x/week',
          techniques: ['bilateral_stimulation', 'narrative_therapy']
        }
      ],
      amygdala: [
        {
          name: 'Safety Signal Training',
          type: 'regulation',
          description: 'Train your amygdala to recognize safety cues',
          duration: '10 min',
          frequency: 'daily',
          techniques: ['breathing', 'grounding', 'safety_anchoring']
        },
        {
          name: 'Graduated Exposure VR',
          type: 'desensitization',
          description: 'Gentle, controlled exposure to triggers in safe VR environment',
          duration: '20-30 min',
          frequency: '2x/week',
          techniques: ['vr_therapy', 'systematic_desensitization']
        }
      ],
      prefrontal_cortex: [
        {
          name: 'Executive Function Games',
          type: 'cognitive',
          description: 'Strengthen executive control through targeted brain training',
          duration: '15 min',
          frequency: 'daily',
          techniques: ['cognitive_training', 'working_memory', 'inhibition']
        },
        {
          name: 'Mindful Decision Trees',
          type: 'metacognition',
          description: 'Practice conscious decision-making pathways',
          duration: '10 min',
          frequency: 'daily',
          techniques: ['mindfulness', 'decision_mapping']
        }
      ],
      insula: [
        {
          name: 'Body Scan Meditation',
          type: 'interoception',
          description: 'Rebuild healthy body awareness and internal sensing',
          duration: '20 min',
          frequency: 'daily',
          techniques: ['body_awareness', 'meditation', 'somatic']
        },
        {
          name: 'Emotional Thermometer',
          type: 'awareness',
          description: 'Track and understand emotional-physical connections',
          duration: '5 min',
          frequency: '3x/day',
          techniques: ['emotion_tracking', 'somatic_awareness']
        }
      ]
    };
  }

  async generatePersonalizedPathway(brainImpacts, traumaAnalysis, userPreferences = {}) {
    console.log('Generating personalized healing pathway...');
    
    // Sort regions by impact severity
    const impactedRegions = Object.entries(brainImpacts)
      .filter(([region, impact]) => impact > 0.3)
      .sort(([,a], [,b]) => b - a)
      .map(([region]) => region);

    // Generate pathway phases
    const pathway = {
      id: `pathway_${Date.now()}`,
      createdAt: new Date().toISOString(),
      phases: [
        this.generateStabilizationPhase(impactedRegions, traumaAnalysis),
        this.generateProcessingPhase(impactedRegions, traumaAnalysis),
        this.generateIntegrationPhase(impactedRegions, traumaAnalysis),
        this.generateGrowthPhase(impactedRegions, traumaAnalysis)
      ],
      totalDuration: '12-16 weeks',
      adaptiveLearning: true
    };

    // Add AI-generated custom exercises
    const customExercises = await this.generateCustomExercises(brainImpacts, traumaAnalysis);
    pathway.customExercises = customExercises;

    // Add progress milestones
    pathway.milestones = this.generateMilestones(pathway);

    this.pathways.push(pathway);
    return pathway;
  }

  generateStabilizationPhase(impactedRegions, analysis) {
    return {
      name: 'Stabilization & Safety',
      duration: '2-3 weeks',
      goals: [
        'Establish sense of safety',
        'Build coping resources',
        'Regulate nervous system'
      ],
      exercises: [
        {
          ...this.getExerciseForRegion('amygdala', 'Safety Signal Training'),
          priority: 'high',
          adaptations: this.getAdaptations(analysis)
        },
        {
          name: 'Window of Tolerance Expansion',
          type: 'regulation',
          description: 'Gradually expand your emotional comfort zone',
          duration: '10-15 min',
          frequency: 'daily',
          techniques: ['titration', 'pendulation', 'resourcing']
        },
        {
          name: '5-4-3-2-1 Grounding',
          type: 'grounding',
          description: 'Sensory grounding technique for overwhelming moments',
          duration: '5 min',
          frequency: 'as needed',
          techniques: ['sensory_grounding', 'present_moment']
        }
      ],
      brainTargets: ['amygdala', 'brain_stem', 'prefrontal_cortex']
    };
  }

  generateProcessingPhase(impactedRegions, analysis) {
    const exercises = [];
    
    // Add region-specific processing exercises
    impactedRegions.slice(0, 3).forEach(region => {
      const regionExercises = this.exercises[region] || [];
      regionExercises.forEach(exercise => {
        if (exercise.type === 'integration' || exercise.type === 'desensitization') {
          exercises.push({
            ...exercise,
            customized: true,
            traumaAdapted: this.adaptExerciseToTrauma(exercise, analysis)
          });
        }
      });
    });

    return {
      name: 'Trauma Processing',
      duration: '4-6 weeks',
      goals: [
        'Process traumatic memories safely',
        'Reduce emotional charge',
        'Integrate experiences'
      ],
      exercises: [
        ...exercises,
        {
          name: 'Narrative Exposure Therapy',
          type: 'processing',
          description: 'Structured storytelling to process trauma narrative',
          duration: '45 min',
          frequency: 'weekly with support',
          techniques: ['narrative_therapy', 'exposure', 'integration'],
          requiresSupport: true
        }
      ],
      brainTargets: impactedRegions
    };
  }

  generateIntegrationPhase(impactedRegions, analysis) {
    return {
      name: 'Integration & Reconnection',
      duration: '4-5 weeks',
      goals: [
        'Integrate new neural patterns',
        'Rebuild healthy connections',
        'Strengthen resilience'
      ],
      exercises: [
        {
          name: 'Neural Network Rebuilding',
          type: 'neuroplasticity',
          description: 'Activities to forge new, healthy neural connections',
          duration: '20 min',
          frequency: 'daily',
          techniques: ['cross_lateral', 'novel_learning', 'creativity']
        },
        {
          name: 'Values Clarification',
          type: 'meaning_making',
          description: 'Reconnect with personal values and life meaning',
          duration: '30 min',
          frequency: 'weekly',
          techniques: ['act', 'values_work', 'commitment']
        },
        ...this.getIntegrationExercises(impactedRegions)
      ],
      brainTargets: ['prefrontal_cortex', 'hippocampus', 'corpus_callosum']
    };
  }

  generateGrowthPhase(impactedRegions, analysis) {
    return {
      name: 'Post-Traumatic Growth',
      duration: '2-3 weeks + ongoing',
      goals: [
        'Cultivate post-traumatic growth',
        'Build future resilience',
        'Create meaning from experience'
      ],
      exercises: [
        {
          name: 'Resilience Portfolio',
          type: 'growth',
          description: 'Document and celebrate your healing journey',
          duration: '30 min',
          frequency: 'weekly',
          techniques: ['reflection', 'gratitude', 'achievement']
        },
        {
          name: 'Helping Others Heal',
          type: 'altruism',
          description: 'Share your story to help others (when ready)',
          duration: 'varies',
          frequency: 'optional',
          techniques: ['peer_support', 'mentoring', 'advocacy']
        },
        {
          name: 'Future Self Visualization',
          type: 'projection',
          description: 'Connect with your healed future self',
          duration: '15 min',
          frequency: '2x/week',
          techniques: ['visualization', 'future_pacing', 'hope']
        }
      ],
      brainTargets: ['whole_brain', 'default_mode_network']
    };
  }

  async generateCustomExercises(brainImpacts, analysis) {
    // This would call GPT-4/Claude to generate completely custom exercises
    // For now, returning template-based customizations
    
    const customExercises = [];
    
    // High hippocampus impact = memory-focused exercises
    if (brainImpacts.hippocampus > 0.7) {
      customExercises.push({
        name: 'Temporal Bridge Building',
        description: 'Connect positive past, present, and future memories',
        type: 'custom_memory',
        instructions: [
          '1. Recall a positive memory from before the trauma',
          '2. Find a recent positive moment',
          '3. Imagine a positive future scene',
          '4. Build mental bridges between all three',
          '5. Practice traveling these bridges daily'
        ],
        neuroscience: 'Strengthens temporal lobe connections and hippocampal neurogenesis'
      });
    }

    // High amygdala impact = fear regulation exercises
    if (brainImpacts.amygdala > 0.7) {
      customExercises.push({
        name: 'Fear Signal Recalibration',
        description: 'Retrain your alarm system with precision',
        type: 'custom_regulation',
        instructions: [
          '1. Create a "fear thermometer" from 0-10',
          '2. Practice rating fear levels throughout the day',
          '3. When fear > 5, use box breathing (4-4-4-4)',
          '4. Journal: "Real danger?" vs "Trauma echo?"',
          '5. Celebrate accurate threat detection'
        ],
        neuroscience: 'Recalibrates amygdala threat detection threshold'
      });
    }

    return customExercises;
  }

  generateMilestones(pathway) {
    const milestones = [];
    let weekCounter = 0;

    pathway.phases.forEach((phase, phaseIndex) => {
      const phaseDuration = parseInt(phase.duration.split('-')[1]) || 3;
      
      // Add phase completion milestone
      weekCounter += phaseDuration;
      milestones.push({
        week: weekCounter,
        title: `Complete ${phase.name} Phase`,
        description: `Finish all core exercises in ${phase.name}`,
        reward: this.generateReward(phaseIndex),
        brainChanges: this.predictBrainChanges(phase.brainTargets, phaseDuration)
      });

      // Add mid-phase milestone for longer phases
      if (phaseDuration > 3) {
        milestones.push({
          week: weekCounter - Math.floor(phaseDuration / 2),
          title: `${phase.name} Halfway Point`,
          description: 'Celebrate your progress and adjust exercises as needed',
          reward: { type: 'reflection', value: 'progress_visualization' }
        });
      }
    });

    return milestones;
  }

  generateReward(phaseIndex) {
    const rewards = [
      { type: 'visualization', value: 'brain_healing_animation' },
      { type: 'achievement', value: 'trauma_warrior_badge' },
      { type: 'unlock', value: 'advanced_exercises' },
      { type: 'certificate', value: 'growth_certification' }
    ];
    return rewards[phaseIndex] || rewards[0];
  }

  predictBrainChanges(targetRegions, weeks) {
    // Predict neuroplastic changes based on research
    const changes = {};
    
    targetRegions.forEach(region => {
      changes[region] = {
        structuralChange: this.calculateStructuralChange(region, weeks),
        functionalChange: this.calculateFunctionalChange(region, weeks),
        connectivity: this.calculateConnectivityChange(region, weeks)
      };
    });

    return changes;
  }

  calculateStructuralChange(region, weeks) {
    // Based on neuroplasticity research timelines
    const changeRates = {
      hippocampus: 0.02, // 2% volume increase per week with exercise
      prefrontal_cortex: 0.015,
      amygdala: -0.01, // Reduction in hyperactivity
      corpus_callosum: 0.01
    };
    
    const rate = changeRates[region] || 0.01;
    return Math.min(rate * weeks, 0.25); // Cap at 25% change
  }

  calculateFunctionalChange(region, weeks) {
    // Functional improvements typically faster than structural
    return Math.min(weeks * 0.05, 0.5); // Up to 50% functional improvement
  }

  calculateConnectivityChange(region, weeks) {
    // Neural pathway strengthening
    return Math.min(weeks * 0.08, 0.6); // Up to 60% connectivity improvement
  }

  getExerciseForRegion(region, exerciseName) {
    const regionExercises = this.exercises[region] || [];
    return regionExercises.find(e => e.name === exerciseName) || regionExercises[0];
  }

  getAdaptations(analysis) {
    const adaptations = [];
    
    // Add adaptations based on trauma type
    if (analysis.primaryTraumas?.includes('sexual_abuse')) {
      adaptations.push({
        type: 'body_safety',
        modification: 'Start with external focus, gradually move to body awareness'
      });
    }
    
    if (analysis.developmentalStage === 'early_childhood') {
      adaptations.push({
        type: 'play_based',
        modification: 'Incorporate play and creative elements'
      });
    }

    return adaptations;
  }

  adaptExerciseToTrauma(exercise, analysis) {
    // Customize exercise based on specific trauma
    const adapted = { ...exercise };
    
    if (analysis.primaryTraumas?.includes('abandonment')) {
      adapted.modifications = adapted.modifications || [];
      adapted.modifications.push('Practice with trusted support person present');
    }
    
    return adapted;
  }

  getIntegrationExercises(impactedRegions) {
    const exercises = [];
    
    // Add specific integration exercises based on impacted regions
    if (impactedRegions.includes('corpus_callosum')) {
      exercises.push({
        name: 'Cross-Brain Integration',
        type: 'bilateral',
        description: 'Activities that integrate left and right brain',
        duration: '15 min',
        frequency: 'daily',
        techniques: ['cross_crawl', 'bilateral_drawing', 'music_movement']
      });
    }

    return exercises;
  }

  // Progress tracking
  trackProgress(pathwayId, exerciseId, completion) {
    // Store progress data
    const progress = {
      pathwayId,
      exerciseId,
      completion,
      timestamp: new Date().toISOString(),
      metrics: {
        mood: completion.mood || null,
        difficulty: completion.difficulty || null,
        insights: completion.insights || null
      }
    };

    // Calculate adaptive adjustments
    if (completion.difficulty > 8) {
      progress.recommendation = 'reduce_intensity';
    } else if (completion.difficulty < 3) {
      progress.recommendation = 'increase_challenge';
    }

    return progress;
  }

  // Generate progress report
  generateProgressReport(pathwayId, progressData) {
    const pathway = this.pathways.find(p => p.id === pathwayId);
    if (!pathway) return null;

    const report = {
      pathwayId,
      generatedAt: new Date().toISOString(),
      overallProgress: this.calculateOverallProgress(progressData),
      phaseProgress: this.calculatePhaseProgress(pathway, progressData),
      predictedCompletion: this.predictCompletion(progressData),
      adaptiveRecommendations: this.generateAdaptiveRecommendations(progressData),
      celebrations: this.identifyCelebrations(progressData)
    };

    return report;
  }

  calculateOverallProgress(progressData) {
    // Calculate percentage of exercises completed
    const totalExercises = progressData.length;
    const completedExercises = progressData.filter(p => p.completion.completed).length;
    return (completedExercises / totalExercises) * 100;
  }

  calculatePhaseProgress(pathway, progressData) {
    // Calculate progress for each phase
    return pathway.phases.map(phase => ({
      phaseName: phase.name,
      progress: this.calculatePhaseCompletion(phase, progressData)
    }));
  }

  predictCompletion(progressData) {
    // Use progress rate to predict completion date
    const progressRate = this.calculateProgressRate(progressData);
    const remainingWork = 100 - this.calculateOverallProgress(progressData);
    const daysToCompletion = remainingWork / progressRate;
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToCompletion);
    
    return completionDate.toISOString();
  }

  calculateProgressRate(progressData) {
    // Calculate average daily progress rate
    if (progressData.length < 2) return 1;
    
    const firstEntry = new Date(progressData[0].timestamp);
    const lastEntry = new Date(progressData[progressData.length - 1].timestamp);
    const daysDiff = (lastEntry - firstEntry) / (1000 * 60 * 60 * 24);
    
    return this.calculateOverallProgress(progressData) / daysDiff;
  }

  generateAdaptiveRecommendations(progressData) {
    const recommendations = [];
    
    // Check for patterns in difficulty ratings
    const avgDifficulty = progressData.reduce((sum, p) => sum + (p.metrics.difficulty || 5), 0) / progressData.length;
    
    if (avgDifficulty > 7) {
      recommendations.push({
        type: 'reduce_intensity',
        message: 'Consider reducing exercise intensity or duration',
        suggestion: 'Try 50% duration for the next week'
      });
    }
    
    // Check for mood improvements
    const moodTrend = this.calculateMoodTrend(progressData);
    if (moodTrend > 0.2) {
      recommendations.push({
        type: 'celebrate_progress',
        message: 'Your mood is consistently improving!',
        suggestion: 'Add a rewarding activity this week'
      });
    }

    return recommendations;
  }

  calculateMoodTrend(progressData) {
    // Simple linear regression on mood scores
    const moodData = progressData
      .filter(p => p.metrics.mood)
      .map((p, i) => ({ x: i, y: p.metrics.mood }));
    
    if (moodData.length < 3) return 0;
    
    // Calculate trend (simplified)
    const firstHalf = moodData.slice(0, Math.floor(moodData.length / 2));
    const secondHalf = moodData.slice(Math.floor(moodData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.y, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.y, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / firstAvg;
  }

  identifyCelebrations(progressData) {
    const celebrations = [];
    
    // Streak detection
    const currentStreak = this.calculateStreak(progressData);
    if (currentStreak >= 7) {
      celebrations.push({
        type: 'streak',
        message: `${currentStreak} day streak! You're building strong habits.`,
        reward: 'streak_badge'
      });
    }

    // Phase completion
    const phaseCompletions = progressData.filter(p => p.phaseCompleted);
    phaseCompletions.forEach(completion => {
      celebrations.push({
        type: 'phase_complete',
        message: `You completed the ${completion.phaseName} phase!`,
        reward: 'phase_certificate'
      });
    });

    return celebrations;
  }

  calculateStreak(progressData) {
    // Calculate consecutive days of practice
    let streak = 0;
    const today = new Date();
    
    for (let i = progressData.length - 1; i >= 0; i--) {
      const entryDate = new Date(progressData[i].timestamp);
      const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  calculatePhaseCompletion(phase, progressData) {
    const phaseExercises = phase.exercises.map(e => e.name);
    const completedExercises = progressData
      .filter(p => phaseExercises.includes(p.exerciseId) && p.completion.completed)
      .length;
    
    return (completedExercises / phaseExercises.length) * 100;
  }
}

export default HealingPathwayGenerator;