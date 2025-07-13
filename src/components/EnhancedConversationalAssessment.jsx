import React, { useState, useEffect, useRef } from 'react';
import ConversationalAIService from '../services/ConversationalAIService';
import BiometricService from '../services/BiometricService';
import LiveBrainVisualization from './LiveBrainVisualization';
import EmotionFeedback from './EmotionFeedback';
import { analyzeProfessionalTraumaImpact } from '../utils/professionalTraumaBrainMapping';
import { storeUserAssessment } from '../lib/mem0-auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnhancedConversationalAssessment({ user, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brainData, setBrainData] = useState({});
  const [showBrainViz, setShowBrainViz] = useState(true);
  const [conversationSummary, setConversationSummary] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Biometric states
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricMetrics, setBiometricMetrics] = useState(null);
  const [biometricInsights, setBiometricInsights] = useState([]);
  const [showPermissionDialog, setShowPermissionDialog] = useState(true);
  
  const chatEndRef = useRef(null);
  const aiService = useRef(null);
  const biometricService = useRef(null);
  const videoRef = useRef(null);
  const mediaStream = useRef(null);
  const biometricInterval = useRef(null);

  // Initialize services
  useEffect(() => {
    aiService.current = new ConversationalAIService();
    biometricService.current = new BiometricService();
    
    // Check if user has previously granted permissions
    const hasGrantedPermissions = localStorage.getItem('biometricPermissionsGranted');
    if (hasGrantedPermissions === 'true') {
      enableBiometrics();
    }
    
    startConversation();
    
    return () => {
      // Cleanup
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
      }
      if (biometricInterval.current) {
        clearInterval(biometricInterval.current);
      }
    };
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enable biometric monitoring
  const enableBiometrics = async () => {
    try {
      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true 
      });
      
      mediaStream.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Initialize biometric service
      await biometricService.current.initialize();
      
      // Start biometric monitoring
      biometricInterval.current = setInterval(async () => {
        if (videoRef.current) {
          const metrics = await biometricService.current.captureFrame(videoRef.current);
          if (metrics) {
            setBiometricMetrics(biometricService.current.getRealtimeMetrics());
            
            // Get insights
            const insights = biometricService.current.generateInsights();
            if (insights.length > 0) {
              setBiometricInsights(insights);
            }
          }
        }
      }, 100); // 10 FPS
      
      setBiometricsEnabled(true);
      setShowPermissionDialog(false);
      localStorage.setItem('biometricPermissionsGranted', 'true');
      
      // Add system message
      setMessages(prev => [...prev, {
        role: 'system',
        content: '🎯 Biometric monitoring enabled. I can now better understand your emotional state to provide more supportive responses.',
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Failed to enable biometrics:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Camera access was declined. The assessment will continue without biometric monitoring.',
        timestamp: new Date()
      }]);
    }
  };

  // Start the conversation
  const startConversation = async () => {
    setIsLoading(true);
    const response = await aiService.current.startConversation();
    
    setMessages([{
      role: 'assistant',
      content: response.message || "Hi there! I'm here to help you create a personalized brain map based on your life experiences. This is a safe, supportive space where you can share at your own pace. There's no rush, and you're in control of what you share. To begin, I'm curious - when you think back to your childhood, what comes to mind first?",
      timestamp: new Date()
    }]);
    
    setIsLoading(false);
  };

  // Handle sending a message
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    setIsTyping(true);

    // Check biometric state if enabled
    let biometricContext = null;
    if (biometricsEnabled && biometricMetrics) {
      // Check for high stress or emotional suppression
      if (biometricMetrics.stressLevel > 0.7) {
        biometricContext = 'User showing high stress levels';
      }
      if (biometricMetrics.microExpressionCount > 3) {
        biometricContext = 'Detecting potential emotional suppression';
      }
    }

    // Get AI response with biometric context
    const response = await aiService.current.sendMessage(userMessage, false, biometricContext);
    const parsedResponse = aiService.current.parseResponse(response);

    // Simulate typing delay for more natural feel
    setTimeout(() => {
      setIsTyping(false);
      
      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: parsedResponse.message,
        timestamp: new Date(),
        biometricContext: biometricContext
      }]);

      // Update brain visualization if we extracted data
      if (parsedResponse.currentData) {
        updateBrainVisualization(parsedResponse.currentData);
      }

      // Update summary
      setConversationSummary(aiService.current.getSummary());
      
      // Check if we should add supportive messages based on biometrics
      if (biometricMetrics?.stressLevel > 0.8 && Math.random() > 0.7) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "I notice this might be difficult to talk about. Remember, we can take a break anytime you need. Your wellbeing comes first. 💙",
            timestamp: new Date(),
            isSupport: true
          }]);
        }, 2000);
      }
      
      setIsLoading(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  // Update brain visualization based on extracted data
  const updateBrainVisualization = (extractedData) => {
    // Convert to questionnaire format
    const questionnaireData = aiService.current.getQuestionnaireFormat();
    
    // Analyze impacts
    const analysis = analyzeProfessionalTraumaImpact(questionnaireData);
    
    // Update brain data for visualization
    setBrainData(analysis.brainImpacts || {});
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Complete assessment
  const completeAssessment = async () => {
    const questionnaireData = aiService.current.getQuestionnaireFormat();
    
    // Add biometric summary if available
    if (biometricsEnabled) {
      questionnaireData.biometricSummary = {
        averageStressLevel: biometricMetrics?.stressLevel || 0,
        emotionalStability: biometricMetrics?.emotionStability || 1,
        primaryEmotions: messages
          .filter(m => m.role === 'user')
          .map(m => biometricMetrics?.currentEmotion)
          .filter(Boolean)
      };
    }
    
    // Store assessment with biometric data
    if (user) {
      const analysis = analyzeProfessionalTraumaImpact(questionnaireData);
      await storeUserAssessment(questionnaireData, analysis);
    }
    
    onComplete(questionnaireData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black flex">
      {/* Hidden video element for biometrics */}
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline
        className="hidden"
      />

      {/* Permission Dialog */}
      <AnimatePresence>
        {showPermissionDialog && !biometricsEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-white/10"
            >
              <h3 className="text-2xl font-light text-white mb-4">
                Enhanced Assessment Experience
              </h3>
              <p className="text-gray-300 mb-6">
                Would you like to enable biometric monitoring? This helps me:
              </p>
              <ul className="space-y-2 mb-6 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Detect when topics become stressful</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Provide more empathetic responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Identify suppressed emotions</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 mb-6">
                🔒 All biometric data is processed locally and never stored or transmitted.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={enableBiometrics}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                >
                  Enable Biometrics
                </button>
                <button
                  onClick={() => setShowPermissionDialog(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                >
                  Continue Without
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side - Chat */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-purple-600/20 border-purple-600/30' 
                  : message.role === 'system'
                  ? 'bg-blue-600/20 border-blue-600/30'
                  : message.isSupport
                  ? 'bg-green-600/20 border-green-600/30'
                  : 'bg-white/5 border-white/10'
              } backdrop-blur-xl rounded-2xl p-4 border`}>
                {message.role === 'assistant' && !message.isSupport && (
                  <div className="text-xs text-purple-400 mb-2 font-medium">AI Counselor</div>
                )}
                {message.role === 'system' && (
                  <div className="text-xs text-blue-400 mb-2 font-medium">System</div>
                )}
                {message.biometricContext && (
                  <div className="text-xs text-yellow-400 mb-2 italic">
                    {message.biometricContext}
                  </div>
                )}
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <div className="text-xs text-white/40 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts... (Press Enter to send)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          
          {conversationSummary?.readyForVisualization && (
            <div className="mt-4 p-4 bg-green-600/20 border border-green-600/30 rounded-xl">
              <p className="text-green-400 text-sm mb-2">
                ✨ We've gathered enough information to create your personalized brain map!
              </p>
              <button
                onClick={completeAssessment}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                View Your Brain Map
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Brain visualization */}
      {showBrainViz && (
        <div className="w-1/3 min-w-[400px] border-l border-white/10">
          <div className="sticky top-0 h-screen">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Your Brain Map</h3>
              <p className="text-white/60 text-sm mt-1">
                Updates in real-time as we talk
              </p>
              {biometricsEnabled && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs">Biometrics Active</span>
                </div>
              )}
            </div>
            <div className="h-[calc(100vh-80px)]">
              <LiveBrainVisualization brainData={brainData} />
            </div>
          </div>
        </div>
      )}

      {/* Biometric Feedback */}
      {biometricsEnabled && (
        <EmotionFeedback 
          metrics={biometricMetrics} 
          insights={biometricInsights}
        />
      )}

      {/* Toggle brain visualization */}
      <button
        onClick={() => setShowBrainViz(!showBrainViz)}
        className="fixed bottom-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all z-30"
        title={showBrainViz ? 'Hide brain visualization' : 'Show brain visualization'}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {showBrainViz ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          )}
        </svg>
      </button>
    </div>
  );
}