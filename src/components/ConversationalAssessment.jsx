import React, { useState, useEffect, useRef } from 'react';
import ConversationalAIService from '../services/ConversationalAIService';
import LiveBrainVisualization from './LiveBrainVisualization';
import { analyzeProfessionalTraumaImpact } from '../utils/professionalTraumaBrainMapping';
import { storeUserAssessment } from '../lib/mem0-auth';

export default function ConversationalAssessment({ user, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brainData, setBrainData] = useState({});
  const [showBrainViz, setShowBrainViz] = useState(true);
  const [conversationSummary, setConversationSummary] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);
  const aiService = useRef(null);

  // Initialize AI service
  useEffect(() => {
    aiService.current = new ConversationalAIService();
    startConversation();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Get AI response
    const response = await aiService.current.sendMessage(userMessage);
    const parsedResponse = aiService.current.parseResponse(response);

    // Simulate typing delay for more natural feel
    setTimeout(() => {
      setIsTyping(false);
      
      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: parsedResponse.message,
        timestamp: new Date()
      }]);

      // Update brain visualization if we extracted data
      if (parsedResponse.currentData) {
        updateBrainVisualization(parsedResponse.currentData);
      }

      // Update summary
      setConversationSummary(aiService.current.getSummary());
      
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

  // Complete assessment and save
  const completeAssessment = async () => {
    const finalData = aiService.current.getQuestionnaireFormat();
    const analysis = analyzeProfessionalTraumaImpact(finalData);
    
    // Save to Mem0 if user is authenticated
    if (user) {
      await storeUserAssessment(finalData, analysis);
    }
    
    // Pass data to parent component
    onComplete(finalData);
  };

  // Toggle brain visualization
  const toggleBrainViz = () => {
    setShowBrainViz(!showBrainViz);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Chat Interface - Left Side */}
      <div className={`${showBrainViz ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-800`}>
        {/* Header */}
        <div className="bg-gray-900 p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light mb-1">Your Brain Map Journey</h1>
              <p className="text-gray-400 text-sm">
                Share your story at your own pace - your brain map updates as we talk
              </p>
            </div>
            <button
              onClick={toggleBrainViz}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              {showBrainViz ? 'Hide' : 'Show'} Brain Map
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        {conversationSummary && (
          <div className="bg-gray-900/50 px-6 py-3 border-b border-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Experiences identified: {conversationSummary.traumaTypesIdentified}
              </span>
              {conversationSummary.hasProtectiveFactors && (
                <span className="text-green-400">✓ Protective factors noted</span>
              )}
              {conversationSummary.readyForVisualization && (
                <button
                  onClick={completeAssessment}
                  className="px-4 py-1 bg-purple-600 hover:bg-purple-700 rounded-full text-xs transition-colors"
                >
                  Complete & View Full Map
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className="text-xs mt-1 opacity-50">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
                       style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
                       style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
                       style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-gray-900 p-4 border-t border-gray-800">
          <div className="flex items-end space-x-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts... (Press Enter to send)"
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-500"
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isLoading || !inputValue.trim()
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Send
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Your conversation is private and secure. You can pause or stop at any time.
          </p>
        </div>
      </div>

      {/* Brain Visualization - Right Side */}
      {showBrainViz && (
        <div className="w-1/2 bg-gray-950">
          <LiveBrainVisualization 
            brainData={brainData}
            isLive={true}
            conversationActive={true}
          />
        </div>
      )}
    </div>
  );
}