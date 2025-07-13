// Trauma pattern matching utility for privacy-preserving support matching
export class TraumaPatternMatcher {
  constructor() {
    // Weights for different matching factors
    this.weights = {
      traumaTypeSimilarity: 0.3,
      healingStageCompatibility: 0.25,
      impactPatternSimilarity: 0.25,
      copingStyleCompatibility: 0.2
    };
    
    // Minimum thresholds for matching
    this.thresholds = {
      minimum: 0.6,
      recommended: 0.75,
      excellent: 0.85
    };
  }

  // Calculate overall compatibility score between two users
  calculateCompatibility(userPattern1, userPattern2) {
    // Ensure privacy by working only with anonymized pattern data
    const scores = {
      traumaType: this.calculateTraumaTypeSimilarity(
        userPattern1.traumaTypes,
        userPattern2.traumaTypes
      ),
      healingStage: this.calculateHealingStageCompatibility(
        userPattern1.healingStage,
        userPattern2.healingStage
      ),
      impactPattern: this.calculateImpactPatternSimilarity(
        userPattern1.brainImpactPattern,
        userPattern2.brainImpactPattern
      ),
      copingStyle: this.calculateCopingStyleCompatibility(
        userPattern1.copingStyles,
        userPattern2.copingStyles
      )
    };
    
    // Calculate weighted total score
    const totalScore = 
      scores.traumaType * this.weights.traumaTypeSimilarity +
      scores.healingStage * this.weights.healingStageCompatibility +
      scores.impactPattern * this.weights.impactPatternSimilarity +
      scores.copingStyle * this.weights.copingStyleCompatibility;
    
    return {
      totalScore,
      scores,
      matchQuality: this.getMatchQuality(totalScore),
      sharedFactors: this.identifySharedFactors(userPattern1, userPattern2)
    };
  }

  // Calculate similarity between trauma types (privacy-preserving)
  calculateTraumaTypeSimilarity(types1, types2) {
    if (!types1 || !types2) return 0;
    
    // Use categorical matching without revealing specific traumas
    const categories1 = new Set(types1.map(t => t.category));
    const categories2 = new Set(types2.map(t => t.category));
    
    const intersection = new Set([...categories1].filter(x => categories2.has(x)));
    const union = new Set([...categories1, ...categories2]);
    
    // Jaccard similarity coefficient
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Calculate healing stage compatibility
  calculateHealingStageCompatibility(stage1, stage2) {
    const stageMap = {
      'acute': 1,
      'early-recovery': 2,
      'active-healing': 3,
      'integration': 4,
      'post-traumatic-growth': 5
    };
    
    const value1 = stageMap[stage1] || 3;
    const value2 = stageMap[stage2] || 3;
    
    // Best compatibility when stages are close but not identical
    const difference = Math.abs(value1 - value2);
    
    if (difference === 0) return 0.8; // Same stage - good but not ideal
    if (difference === 1) return 1.0; // Adjacent stages - ideal
    if (difference === 2) return 0.6; // Two stages apart - acceptable
    return 0.3; // Too far apart
  }

  // Calculate brain impact pattern similarity
  calculateImpactPatternSimilarity(pattern1, pattern2) {
    if (!pattern1 || !pattern2) return 0;
    
    // Compare affected brain regions without revealing specific details
    const regions1 = new Set(Object.keys(pattern1.affectedRegions || {}));
    const regions2 = new Set(Object.keys(pattern2.affectedRegions || {}));
    
    const sharedRegions = new Set([...regions1].filter(x => regions2.has(x)));
    const totalRegions = new Set([...regions1, ...regions2]);
    
    // Calculate similarity based on shared affected regions
    const regionSimilarity = totalRegions.size > 0 ? 
      sharedRegions.size / totalRegions.size : 0;
    
    // Compare impact severity patterns
    const severitySimilarity = this.compareSeverityPatterns(pattern1, pattern2);
    
    return (regionSimilarity * 0.6 + severitySimilarity * 0.4);
  }

  // Compare severity patterns
  compareSeverityPatterns(pattern1, pattern2) {
    const severity1 = pattern1.overallSeverity || 'moderate';
    const severity2 = pattern2.overallSeverity || 'moderate';
    
    const severityMap = {
      'mild': 1,
      'moderate': 2,
      'significant': 3,
      'severe': 4
    };
    
    const diff = Math.abs(
      (severityMap[severity1] || 2) - 
      (severityMap[severity2] || 2)
    );
    
    return 1 - (diff / 3); // Normalize to 0-1 scale
  }

  // Calculate coping style compatibility
  calculateCopingStyleCompatibility(styles1, styles2) {
    if (!styles1 || !styles2) return 0.5; // Neutral if no data
    
    const styleCategories = {
      'problem-focused': ['planning', 'active-coping', 'problem-solving'],
      'emotion-focused': ['acceptance', 'positive-reframing', 'emotional-support'],
      'meaning-making': ['spirituality', 'growth-seeking', 'benefit-finding'],
      'avoidance': ['distraction', 'denial', 'disengagement'],
      'social': ['support-seeking', 'venting', 'connection']
    };
    
    // Map styles to categories
    const categories1 = this.mapStylesToCategories(styles1, styleCategories);
    const categories2 = this.mapStylesToCategories(styles2, styleCategories);
    
    // Calculate compatibility based on complementary styles
    let compatibility = 0;
    const totalCategories = new Set([...categories1, ...categories2]).size;
    
    // Some overlap is good, but diversity is also valuable
    const overlap = new Set([...categories1].filter(x => categories2.has(x))).size;
    const overlapRatio = totalCategories > 0 ? overlap / totalCategories : 0;
    
    // Optimal overlap is around 40-60%
    if (overlapRatio >= 0.4 && overlapRatio <= 0.6) {
      compatibility = 1.0;
    } else if (overlapRatio < 0.4) {
      compatibility = 0.7 + (overlapRatio * 0.75);
    } else {
      compatibility = 1.0 - ((overlapRatio - 0.6) * 1.0);
    }
    
    return compatibility;
  }

  // Map individual styles to categories
  mapStylesToCategories(styles, categoryMap) {
    const categories = new Set();
    
    styles.forEach(style => {
      Object.entries(categoryMap).forEach(([category, categoryStyles]) => {
        if (categoryStyles.includes(style)) {
          categories.add(category);
        }
      });
    });
    
    return categories;
  }

  // Get match quality label
  getMatchQuality(score) {
    if (score >= this.thresholds.excellent) return 'excellent';
    if (score >= this.thresholds.recommended) return 'recommended';
    if (score >= this.thresholds.minimum) return 'compatible';
    return 'low';
  }

  // Identify shared factors for display (anonymized)
  identifySharedFactors(pattern1, pattern2) {
    const shared = {
      traumaCategories: [],
      affectedRegions: [],
      copingApproaches: [],
      strengthAreas: []
    };
    
    // Shared trauma categories (general, not specific)
    if (pattern1.traumaTypes && pattern2.traumaTypes) {
      const categories1 = new Set(pattern1.traumaTypes.map(t => t.category));
      const categories2 = new Set(pattern2.traumaTypes.map(t => t.category));
      shared.traumaCategories = [...categories1].filter(x => categories2.has(x));
    }
    
    // Shared affected brain regions (general areas only)
    if (pattern1.brainImpactPattern && pattern2.brainImpactPattern) {
      const regions1 = Object.keys(pattern1.brainImpactPattern.affectedRegions || {});
      const regions2 = Object.keys(pattern2.brainImpactPattern.affectedRegions || {});
      shared.affectedRegions = regions1
        .filter(r => regions2.includes(r))
        .map(r => this.generalizeRegionName(r));
    }
    
    // Shared coping approaches
    if (pattern1.copingStyles && pattern2.copingStyles) {
      const styles1 = new Set(pattern1.copingStyles);
      const styles2 = new Set(pattern2.copingStyles);
      shared.copingApproaches = [...styles1].filter(x => styles2.has(x));
    }
    
    // Shared strength areas
    if (pattern1.strengths && pattern2.strengths) {
      const strengths1 = new Set(pattern1.strengths);
      const strengths2 = new Set(pattern2.strengths);
      shared.strengthAreas = [...strengths1].filter(x => strengths2.has(x));
    }
    
    return shared;
  }

  // Generalize region names for privacy
  generalizeRegionName(region) {
    const generalizations = {
      'amygdala': 'emotional processing area',
      'hippocampus': 'memory center',
      'prefrontal_cortex': 'executive function area',
      'anterior_cingulate': 'attention regulation area',
      'insula': 'body awareness area',
      'temporal_lobe': 'sensory processing area',
      'parietal_lobe': 'spatial processing area'
    };
    
    return generalizations[region] || 'brain region';
  }

  // Find best matches for a user from a pool of candidates
  findBestMatches(userPattern, candidatePatterns, options = {}) {
    const {
      maxMatches = 5,
      minimumScore = this.thresholds.minimum,
      diversityBonus = true
    } = options;
    
    const matches = candidatePatterns
      .map(candidate => ({
        candidateId: candidate.id,
        compatibility: this.calculateCompatibility(userPattern, candidate),
        candidate
      }))
      .filter(match => match.compatibility.totalScore >= minimumScore)
      .sort((a, b) => b.compatibility.totalScore - a.compatibility.totalScore);
    
    // Apply diversity bonus if enabled
    if (diversityBonus && matches.length > maxMatches) {
      return this.selectDiverseMatches(matches, maxMatches);
    }
    
    return matches.slice(0, maxMatches);
  }

  // Select diverse matches to avoid echo chambers
  selectDiverseMatches(matches, maxMatches) {
    const selected = [];
    const usedCategories = new Set();
    
    for (const match of matches) {
      if (selected.length >= maxMatches) break;
      
      // Check if this match adds diversity
      const matchCategories = match.candidate.traumaTypes
        .map(t => t.category);
      
      const newCategories = matchCategories
        .filter(c => !usedCategories.has(c));
      
      // Prefer matches that add new perspectives
      if (selected.length === 0 || newCategories.length > 0 || 
          match.compatibility.totalScore >= this.thresholds.excellent) {
        selected.push(match);
        matchCategories.forEach(c => usedCategories.add(c));
      }
    }
    
    // Fill remaining slots with highest scores
    if (selected.length < maxMatches) {
      const remaining = matches
        .filter(m => !selected.includes(m))
        .slice(0, maxMatches - selected.length);
      selected.push(...remaining);
    }
    
    return selected;
  }

  // Validate pattern data for matching
  validatePatternData(pattern) {
    const required = ['traumaTypes', 'healingStage', 'brainImpactPattern'];
    const missing = required.filter(field => !pattern[field]);
    
    if (missing.length > 0) {
      return {
        valid: false,
        missing,
        message: `Missing required pattern data: ${missing.join(', ')}`
      };
    }
    
    return { valid: true };
  }

  // Anonymize pattern data before matching
  anonymizePattern(pattern) {
    return {
      traumaTypes: pattern.traumaTypes.map(t => ({
        category: t.category,
        // Remove any identifying details
      })),
      healingStage: pattern.healingStage,
      brainImpactPattern: {
        affectedRegions: pattern.brainImpactPattern.affectedRegions,
        overallSeverity: pattern.brainImpactPattern.overallSeverity
      },
      copingStyles: pattern.copingStyles,
      strengths: pattern.strengths,
      // No personal identifiers
    };
  }
}

export default new TraumaPatternMatcher();