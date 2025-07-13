import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

class BiometricService {
  constructor() {
    this.model = null;
    this.emotionHistory = [];
    this.stressIndicators = {
      heartRateVariability: [],
      voiceStress: [],
      facialMicroExpressions: [],
      eyeMovement: []
    };
    this.calibrationData = null;
  }

  async initialize() {
    // Load TensorFlow.js models
    await tf.ready();
    this.model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
    
    // Initialize emotion detection model
    await this.loadEmotionModel();
    
    // Start baseline calibration
    await this.calibrateBaseline();
  }

  async loadEmotionModel() {
    // Load pre-trained emotion detection model
    // This would use a custom model trained on facial expressions
    try {
      this.emotionModel = await tf.loadLayersModel('/models/emotion-detection/model.json');
      console.log('Emotion model loaded successfully');
    } catch (error) {
      console.error('Failed to load emotion model:', error);
    }
  }

  async calibrateBaseline() {
    // Capture baseline metrics for 30 seconds
    console.log('Starting baseline calibration...');
    const calibrationDuration = 30000; // 30 seconds
    const startTime = Date.now();
    
    this.calibrationData = {
      baseline: {
        heartRate: null,
        facialLandmarks: null,
        voiceFrequency: null
      },
      timestamp: startTime
    };

    // Collect baseline data
    while (Date.now() - startTime < calibrationDuration) {
      await this.captureFrame();
      await new Promise(resolve => setTimeout(resolve, 100)); // 10 FPS
    }
    
    console.log('Baseline calibration complete');
  }

  async captureFrame(videoElement) {
    if (!videoElement || !this.model) return null;

    try {
      // Detect facial landmarks
      const predictions = await this.model.estimateFaces({
        input: videoElement,
        returnTensors: false,
        flipHorizontal: false,
        predictIrises: true
      });

      if (predictions.length > 0) {
        const face = predictions[0];
        
        // Extract emotion from facial landmarks
        const emotion = await this.detectEmotion(face);
        
        // Detect micro-expressions
        const microExpression = this.detectMicroExpression(face);
        
        // Calculate stress indicators
        const stressLevel = this.calculateStressLevel(face, emotion);
        
        // Store in history
        this.emotionHistory.push({
          timestamp: Date.now(),
          emotion,
          microExpression,
          stressLevel,
          confidence: face.faceInViewConfidence
        });
        
        // Keep only last 5 minutes of data
        this.pruneHistory();
        
        return {
          emotion,
          microExpression,
          stressLevel,
          confidence: face.faceInViewConfidence
        };
      }
    } catch (error) {
      console.error('Error capturing biometric frame:', error);
    }
    
    return null;
  }

  async detectEmotion(faceLandmarks) {
    // Extract key facial features for emotion detection
    const features = this.extractEmotionFeatures(faceLandmarks);
    
    if (this.emotionModel && features) {
      // Run inference
      const prediction = this.emotionModel.predict(features);
      const emotions = await prediction.data();
      
      // Map to emotion labels
      const emotionLabels = [
        'neutral', 'happy', 'sad', 'angry', 
        'fearful', 'disgusted', 'surprised', 'contempt'
      ];
      
      const maxIndex = emotions.indexOf(Math.max(...emotions));
      
      return {
        primary: emotionLabels[maxIndex],
        confidence: emotions[maxIndex],
        all: emotionLabels.map((label, i) => ({
          emotion: label,
          probability: emotions[i]
        }))
      };
    }
    
    return { primary: 'neutral', confidence: 0.5 };
  }

  detectMicroExpression(faceLandmarks) {
    // Detect subtle, involuntary facial movements
    // that might indicate suppressed emotions
    if (!this.previousLandmarks) {
      this.previousLandmarks = faceLandmarks;
      return null;
    }

    // Calculate movement deltas
    const movements = this.calculateLandmarkDeltas(
      this.previousLandmarks,
      faceLandmarks
    );

    // Detect rapid changes (< 500ms) that revert quickly
    const microExpressions = [];
    
    // Check for specific micro-expression patterns
    if (movements.eyebrowRaise > 0.02 && movements.duration < 500) {
      microExpressions.push({
        type: 'surprise',
        intensity: movements.eyebrowRaise,
        duration: movements.duration
      });
    }

    if (movements.lipCornerPull > 0.015 && movements.duration < 300) {
      microExpressions.push({
        type: 'contempt',
        intensity: movements.lipCornerPull,
        duration: movements.duration
      });
    }

    this.previousLandmarks = faceLandmarks;
    return microExpressions.length > 0 ? microExpressions : null;
  }

  calculateStressLevel(faceLandmarks, emotion) {
    let stressScore = 0;
    
    // Blink rate (stress often increases blink rate)
    const blinkRate = this.calculateBlinkRate(faceLandmarks);
    if (blinkRate > this.calibrationData?.baseline?.blinkRate * 1.5) {
      stressScore += 0.2;
    }
    
    // Facial tension (jaw clenching, furrowed brow)
    const tension = this.calculateFacialTension(faceLandmarks);
    stressScore += tension * 0.3;
    
    // Emotion-based stress
    const stressEmotions = ['angry', 'fearful', 'sad'];
    if (stressEmotions.includes(emotion.primary)) {
      stressScore += emotion.confidence * 0.3;
    }
    
    // Micro-expression frequency
    const recentMicroExpressions = this.emotionHistory
      .slice(-30)
      .filter(h => h.microExpression)
      .length;
    if (recentMicroExpressions > 5) {
      stressScore += 0.2;
    }
    
    return Math.min(stressScore, 1.0); // Normalize to 0-1
  }

  async analyzeVoiceStress(audioBuffer) {
    // Analyze voice for stress indicators
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Extract features
    const features = {
      fundamentalFrequency: this.extractF0(audioBuffer),
      jitter: this.calculateJitter(audioBuffer),
      shimmer: this.calculateShimmer(audioBuffer),
      speechRate: this.calculateSpeechRate(audioBuffer)
    };
    
    // Compare to baseline
    let voiceStressScore = 0;
    
    if (features.fundamentalFrequency > this.calibrationData?.baseline?.voiceF0 * 1.2) {
      voiceStressScore += 0.3;
    }
    
    if (features.jitter > 0.02) { // Normal jitter is < 1%
      voiceStressScore += 0.2;
    }
    
    if (features.shimmer > 0.05) { // Normal shimmer is < 3%
      voiceStressScore += 0.2;
    }
    
    // Pauses and hesitations indicate stress
    if (features.speechRate < this.calibrationData?.baseline?.speechRate * 0.8) {
      voiceStressScore += 0.3;
    }
    
    this.stressIndicators.voiceStress.push({
      timestamp: Date.now(),
      score: Math.min(voiceStressScore, 1.0),
      features
    });
    
    return voiceStressScore;
  }

  async connectWearable(deviceType) {
    // Connect to wearable devices via Web Bluetooth API
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['battery_service'] }
        ],
        optionalServices: ['device_information']
      });
      
      const server = await device.gatt.connect();
      
      // Get heart rate service
      const heartRateService = await server.getPrimaryService('heart_rate');
      const heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement');
      
      // Start notifications
      await heartRateCharacteristic.startNotifications();
      heartRateCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const heartRate = value.getUint8(1);
        
        this.stressIndicators.heartRateVariability.push({
          timestamp: Date.now(),
          heartRate,
          hrv: this.calculateHRV(heartRate)
        });
      });
      
      console.log(`Connected to ${deviceType} wearable`);
      return true;
    } catch (error) {
      console.error('Failed to connect wearable:', error);
      return false;
    }
  }

  getRealtimeMetrics() {
    // Get current biometric state
    const recent = this.emotionHistory.slice(-10);
    const currentEmotion = recent[recent.length - 1];
    
    const avgStress = recent.reduce((sum, h) => sum + h.stressLevel, 0) / recent.length;
    const emotionStability = this.calculateEmotionStability(recent);
    
    return {
      currentEmotion: currentEmotion?.emotion || null,
      stressLevel: avgStress,
      emotionStability,
      microExpressionCount: recent.filter(h => h.microExpression).length,
      heartRate: this.stressIndicators.heartRateVariability.slice(-1)[0]?.heartRate || null,
      confidence: currentEmotion?.confidence || 0
    };
  }

  generateInsights() {
    // Generate insights from biometric data
    const insights = [];
    
    // Check for emotion suppression
    const microExpressionRate = this.emotionHistory
      .filter(h => h.microExpression)
      .length / this.emotionHistory.length;
      
    if (microExpressionRate > 0.15) {
      insights.push({
        type: 'suppression',
        message: 'Detecting signs of emotional suppression. It\'s okay to express what you\'re feeling.',
        confidence: microExpressionRate
      });
    }
    
    // Check for increasing stress
    const stressTrend = this.calculateStressTrend();
    if (stressTrend > 0.3) {
      insights.push({
        type: 'stress_increase',
        message: 'I notice this topic might be stressful. Would you like to take a break?',
        confidence: stressTrend
      });
    }
    
    // Check for emotional incongruence
    const verbalEmotionalMismatch = this.detectVerbalEmotionalMismatch();
    if (verbalEmotionalMismatch > 0.5) {
      insights.push({
        type: 'incongruence',
        message: 'Your words and emotions seem different. How are you really feeling?',
        confidence: verbalEmotionalMismatch
      });
    }
    
    return insights;
  }

  // Helper methods
  extractEmotionFeatures(faceLandmarks) {
    // Extract normalized facial features for emotion detection
    // This would include distances between key landmarks,
    // angles, and ratios that indicate different emotions
    
    const features = [];
    
    // Example: eyebrow height (raised = surprise)
    const eyebrowHeight = this.calculateEyebrowHeight(faceLandmarks);
    features.push(eyebrowHeight);
    
    // Example: mouth corners (up = happy, down = sad)
    const mouthCorners = this.calculateMouthCorners(faceLandmarks);
    features.push(mouthCorners);
    
    // Add more feature extractions...
    
    return tf.tensor2d([features]);
  }

  calculateLandmarkDeltas(prev, current) {
    // Calculate movement between frames
    let totalMovement = 0;
    const movements = {
      eyebrowRaise: 0,
      lipCornerPull: 0,
      duration: Date.now() - (this.lastFrameTime || Date.now())
    };
    
    // Calculate specific movements...
    
    this.lastFrameTime = Date.now();
    return movements;
  }

  calculateEmotionStability(history) {
    // Calculate how stable emotions have been
    if (history.length < 2) return 1.0;
    
    let changes = 0;
    for (let i = 1; i < history.length; i++) {
      if (history[i].emotion?.primary !== history[i-1].emotion?.primary) {
        changes++;
      }
    }
    
    return 1 - (changes / history.length);
  }

  calculateStressTrend() {
    // Calculate if stress is increasing over time
    const recent = this.emotionHistory.slice(-30);
    if (recent.length < 10) return 0;
    
    const firstHalf = recent.slice(0, 15);
    const secondHalf = recent.slice(15);
    
    const firstAvg = firstHalf.reduce((sum, h) => sum + h.stressLevel, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, h) => sum + h.stressLevel, 0) / secondHalf.length;
    
    return Math.max(0, secondAvg - firstAvg);
  }

  pruneHistory() {
    // Keep only last 5 minutes of data
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    this.emotionHistory = this.emotionHistory.filter(h => h.timestamp > fiveMinutesAgo);
  }

  // Placeholder methods for full implementation
  calculateBlinkRate(faceLandmarks) { return 15; }
  calculateFacialTension(faceLandmarks) { return 0.3; }
  extractF0(audioBuffer) { return 120; }
  calculateJitter(audioBuffer) { return 0.01; }
  calculateShimmer(audioBuffer) { return 0.03; }
  calculateSpeechRate(audioBuffer) { return 150; }
  calculateHRV(heartRate) { return 50; }
  detectVerbalEmotionalMismatch() { return 0.2; }
  calculateEyebrowHeight(faceLandmarks) { return 0.5; }
  calculateMouthCorners(faceLandmarks) { return 0.0; }
}

export default BiometricService;