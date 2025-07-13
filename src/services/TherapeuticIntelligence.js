import * as tf from '@tensorflow/tfjs';
import { supabase } from '../lib/supabase';

// Emotion categories for analysis
const EMOTION_CATEGORIES = {
  POSITIVE: ['joy', 'hope', 'gratitude', 'relief', 'pride'],
  NEUTRAL: ['calm', 'curious', 'thoughtful', 'receptive'],
  ANXIOUS: ['worried', 'nervous', 'uncertain', 'overwhelmed'],
  DISTRESSED: ['sad', 'angry', 'frustrated', 'fearful', 'hopeless']
};

// Therapeutic breakthrough indicators
const BREAKTHROUGH_INDICATORS = [
  'I never realized',
  'Now I understand',
  'That makes sense',
  'I see the connection',
  'I feel different about',
  'I can forgive',
  'I accept that',
  'I\'m ready to'
];

// Risk indicators for immediate attention
const RISK_INDICATORS = [
  'want to die',
  'no point',
  'give up',
  'hurt myself',
  'end it all',
  'can\'t go on',
  'worthless',
  'nobody cares'
];

class TherapeuticIntelligence {
  constructor() {
    this.emotionModel = null;
    this.allianceModel = null;
    this.sessionHistory = new Map();
    this.initializeModels();
  }

  async initializeModels() {
    // In a real implementation, these would be pre-trained models
    // For now, we'll use rule-based analysis with ML-ready structure
    console.log('Initializing therapeutic intelligence models...');
  }

  async analyzeSessionInRealTime({ clientId, sessionId, brainData, transcript }) {
    try {
      const emotionalState = await this.analyzeEmotionalState(transcript, brainData);
      const engagementLevel = await this.calculateEngagementLevel(transcript, brainData);
      const therapeuticAlliance = await this.assessTherapeuticAlliance(clientId, sessionId, transcript);
      const breakthroughMoments = this.detectBreakthroughMoments(transcript);
      const riskIndicators = this.assessRiskIndicators(transcript);

      // Store session data for pattern analysis
      this.updateSessionHistory(sessionId, {
        emotionalState,
        engagementLevel,
        therapeuticAlliance,
        breakthroughMoments,
        riskIndicators,
        timestamp: new Date()
      });

      return {
        emotionalState,
        engagementLevel,
        therapeuticAlliance,
        breakthroughMoments,
        riskIndicators
      };
    } catch (error) {
      console.error('Error in real-time session analysis:', error);
      return this.getDefaultMetrics();
    }
  }

  async analyzeEmotionalState(transcript, brainData) {
    // Analyze transcript for emotional indicators
    const lowerTranscript = transcript.toLowerCase();
    let emotionScores = {
      positive: 0,
      neutral: 0,
      anxious: 0,
      distressed: 0
    };

    // Text-based emotion detection
    for (const [category, keywords] of Object.entries(EMOTION_CATEGORIES)) {
      const categoryKey = category.toLowerCase();
      keywords.forEach(keyword => {
        if (lowerTranscript.includes(keyword)) {
          emotionScores[categoryKey] += 1;
        }
      });
    }

    // Incorporate brain data if available
    if (brainData && brainData.regions) {
      // Analyze amygdala activation for emotional intensity
      const amygdalaActivity = brainData.regions.amygdala?.activity || 0;
      // Analyze prefrontal cortex for emotional regulation
      const pfcActivity = brainData.regions.prefrontalCortex?.activity || 0;

      if (amygdalaActivity > 0.7 && pfcActivity < 0.3) {
        emotionScores.distressed += 2;
      } else if (pfcActivity > 0.6) {
        emotionScores.neutral += 1;
      }
    }

    // Determine dominant emotional state
    const dominantEmotion = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)[0][0];

    return dominantEmotion;
  }

  async calculateEngagementLevel(transcript, brainData) {
    let engagementScore = 50; // Base score

    // Analyze response length and frequency
    const words = transcript.split(' ').length;
    const sentences = transcript.split(/[.!?]+/).length;

    if (words > 50) engagementScore += 10;
    if (words > 100) engagementScore += 10;
    
    // Check for elaborative responses
    const elaborativeIndicators = ['because', 'and', 'also', 'furthermore', 'additionally'];
    elaborativeIndicators.forEach(indicator => {
      if (transcript.toLowerCase().includes(indicator)) {
        engagementScore += 5;
      }
    });

    // Analyze brain engagement patterns
    if (brainData && brainData.globalMetrics) {
      const cognitiveLoad = brainData.globalMetrics.cognitiveLoad || 0;
      engagementScore += (cognitiveLoad * 20);
    }

    // Cap at 100
    return Math.min(Math.round(engagementScore), 100);
  }

  async assessTherapeuticAlliance(clientId, sessionId, transcript) {
    let allianceScore = 60; // Base score

    // Positive alliance indicators
    const positiveIndicators = [
      'trust you',
      'feel safe',
      'comfortable sharing',
      'you understand',
      'helpful',
      'appreciate',
      'thank you'
    ];

    // Negative alliance indicators
    const negativeIndicators = [
      'don\'t understand',
      'not listening',
      'judged',
      'uncomfortable',
      'don\'t trust',
      'waste of time'
    ];

    const lowerTranscript = transcript.toLowerCase();

    positiveIndicators.forEach(indicator => {
      if (lowerTranscript.includes(indicator)) {
        allianceScore += 5;
      }
    });

    negativeIndicators.forEach(indicator => {
      if (lowerTranscript.includes(indicator)) {
        allianceScore -= 10;
      }
    });

    // Factor in session history
    const sessionData = this.sessionHistory.get(sessionId);
    if (sessionData && sessionData.length > 1) {
      // Trending upward engagement increases alliance
      const recentEngagement = sessionData.slice(-3).map(s => s.engagementLevel);
      const trend = this.calculateTrend(recentEngagement);
      allianceScore += (trend * 10);
    }

    return Math.max(0, Math.min(100, Math.round(allianceScore)));
  }

  detectBreakthroughMoments(transcript) {
    const breakthroughs = [];
    const sentences = transcript.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase().trim();
      BREAKTHROUGH_INDICATORS.forEach(indicator => {
        if (lowerSentence.includes(indicator)) {
          breakthroughs.push(sentence.trim());
        }
      });
    });

    return breakthroughs;
  }

  assessRiskIndicators(transcript) {
    const risks = [];
    const lowerTranscript = transcript.toLowerCase();
    
    RISK_INDICATORS.forEach(indicator => {
      if (lowerTranscript.includes(indicator)) {
        risks.push({
          type: 'high',
          indicator: indicator,
          context: this.extractContext(transcript, indicator)
        });
      }
    });

    return risks;
  }

  extractContext(text, keyword, windowSize = 50) {
    const index = text.toLowerCase().indexOf(keyword);
    if (index === -1) return '';
    
    const start = Math.max(0, index - windowSize);
    const end = Math.min(text.length, index + keyword.length + windowSize);
    
    return '...' + text.substring(start, end) + '...';
  }

  updateSessionHistory(sessionId, metrics) {
    if (!this.sessionHistory.has(sessionId)) {
      this.sessionHistory.set(sessionId, []);
    }
    
    const history = this.sessionHistory.get(sessionId);
    history.push(metrics);
    
    // Keep only last 20 data points per session
    if (history.length > 20) {
      history.shift();
    }
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    let sum = 0;
    for (let i = 1; i < values.length; i++) {
      sum += (values[i] - values[i-1]);
    }
    
    return sum / (values.length - 1);
  }

  async generateInterventionSuggestions(emotionalState, clientHistory) {
    const suggestions = [];
    
    // Base suggestions on emotional state
    const interventionMap = {
      anxious: [
        {
          type: 'Grounding Exercise',
          description: '5-4-3-2-1 sensory grounding technique',
          rationale: 'Helps anchor client in present moment and reduce anxiety',
          steps: [
            'Name 5 things you can see',
            'Name 4 things you can touch',
            'Name 3 things you can hear',
            'Name 2 things you can smell',
            'Name 1 thing you can taste'
          ]
        },
        {
          type: 'Breathing Technique',
          description: 'Box breathing (4-4-4-4)',
          rationale: 'Activates parasympathetic nervous system',
          steps: [
            'Inhale for 4 counts',
            'Hold for 4 counts',
            'Exhale for 4 counts',
            'Hold for 4 counts'
          ]
        }
      ],
      distressed: [
        {
          type: 'Validation',
          description: 'Acknowledge and normalize their feelings',
          rationale: 'Creates safety and reduces emotional isolation',
          examples: [
            'It makes complete sense that you would feel this way given what you\'ve experienced',
            'Your feelings are valid and important',
            'Thank you for trusting me with this'
          ]
        },
        {
          type: 'Emotional Regulation',
          description: 'TIPP technique for distress tolerance',
          rationale: 'Rapid physiological intervention for high distress',
          steps: [
            'Temperature - cold water on face',
            'Intense exercise - jumping jacks',
            'Paced breathing - exhale longer than inhale',
            'Paired muscle relaxation'
          ]
        }
      ],
      positive: [
        {
          type: 'Exploration',
          description: 'Deepen understanding of positive experiences',
          rationale: 'Builds resilience and positive neural pathways',
          questions: [
            'What specifically contributed to this positive feeling?',
            'How can we cultivate more of this in your life?',
            'What strengths did you use to achieve this?'
          ]
        }
      ],
      neutral: [
        {
          type: 'Deeper Exploration',
          description: 'Use open-ended questions to go deeper',
          rationale: 'Neutral state allows for productive exploration',
          questions: [
            'What comes up for you when you think about that?',
            'How does that connect to what we discussed last session?',
            'What would be different if this changed?'
          ]
        }
      ]
    };

    // Get relevant suggestions
    const stateSuggestions = interventionMap[emotionalState] || interventionMap.neutral;
    
    // Add evidence-based tag
    stateSuggestions.forEach(suggestion => {
      suggestion.evidenceBased = true;
      suggestion.effectiveness = Math.round(70 + Math.random() * 25); // Simulated effectiveness score
    });

    return stateSuggestions;
  }

  async trackProgressMetrics(clientId) {
    try {
      // Fetch historical session data
      const { data: sessions, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate progress metrics
      const progressData = {
        overallImprovement: 0,
        symptomReduction: {},
        copingSkillsAcquired: [],
        relationshipQuality: 0,
        functionalImprovement: 0
      };

      if (sessions && sessions.length > 1) {
        // Compare first and last sessions
        const firstSession = sessions[0];
        const lastSession = sessions[sessions.length - 1];

        // Calculate improvements (simplified for demo)
        progressData.overallImprovement = Math.round(
          ((lastSession.alliance_score - firstSession.alliance_score) / firstSession.alliance_score) * 100
        );

        // Track symptom changes
        progressData.symptomReduction = {
          anxiety: Math.round(Math.random() * 30 + 20),
          depression: Math.round(Math.random() * 25 + 15),
          trauma: Math.round(Math.random() * 20 + 10)
        };

        // Mock coping skills data
        progressData.copingSkillsAcquired = [
          'Grounding techniques',
          'Emotional regulation',
          'Boundary setting',
          'Self-compassion'
        ];
      }

      return progressData;
    } catch (error) {
      console.error('Error tracking progress:', error);
      return null;
    }
  }

  getDefaultMetrics() {
    return {
      emotionalState: 'neutral',
      engagementLevel: 50,
      therapeuticAlliance: 60,
      breakthroughMoments: [],
      riskIndicators: []
    };
  }
}

// Export singleton instance
const therapeuticIntelligence = new TherapeuticIntelligence();

export const analyzeSessionInRealTime = (...args) => 
  therapeuticIntelligence.analyzeSessionInRealTime(...args);

export const generateInterventionSuggestions = (...args) => 
  therapeuticIntelligence.generateInterventionSuggestions(...args);

export const trackProgressMetrics = (...args) => 
  therapeuticIntelligence.trackProgressMetrics(...args);

export default therapeuticIntelligence;