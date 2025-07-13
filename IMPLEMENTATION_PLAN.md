# Conversational AI Trauma Assessment - Implementation Plan

## Quick Start Implementation

### Step 1: Create the Conversational AI Service

```javascript
// src/services/conversationalAI.js
import Anthropic from '@anthropic-ai/sdk';

class ConversationalAIService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
    });
    
    this.systemPrompt = `You are a compassionate AI assistant helping someone explore their childhood experiences to create a personalized brain development map. 

Your approach:
- Create a warm, safe space for sharing
- Ask open-ended questions that feel natural
- Listen for indicators of the following trauma types without directly asking:
  * Physical abuse, sexual abuse, emotional abuse
  * Physical neglect, emotional neglect  
  * Household dysfunction (substance abuse, mental illness, domestic violence, separation, incarceration)
  * Community violence, bullying, discrimination
  * Medical trauma, life-threatening events
  * Loss and attachment disruptions

Extract (but don't explicitly ask about):
- Age ranges: 0-3 (infancy), 3-5 (preschool), 6-11 (school age), 11-13 (early adolescence), 14-18 (adolescence)
- Duration: single incident, days, weeks, months, years, throughout childhood
- Protective factors: safe adults, supportive relationships

Current topics covered: {TOPICS_COVERED}
Trust level: {TRUST_LEVEL}/10

Respond naturally and empathetically. If they share something difficult, validate their experience before continuing.`;
  }

  async startConversation() {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 300,
      temperature: 0.7,
      system: this.systemPrompt.replace('{TOPICS_COVERED}', 'none').replace('{TRUST_LEVEL}', '0'),
      messages: [{
        role: 'user',
        content: 'Start the conversation'
      }]
    });
    
    return {
      text: response.content[0].text,
      metadata: {
        topicSuggestion: 'childhood_general'
      }
    };
  }

  async processResponse(userMessage, conversationHistory, currentState) {
    // Build context
    const contextualPrompt = this.systemPrompt
      .replace('{TOPICS_COVERED}', currentState.topicsCovered.join(', '))
      .replace('{TRUST_LEVEL}', currentState.trustLevel);
    
    // Get conversational response
    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 300,
      temperature: 0.7,
      system: contextualPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]
    });
    
    // Extract data in parallel
    const extraction = await this.extractTraumaData(userMessage, conversationHistory);
    
    return {
      aiResponse: response.content[0].text,
      extractedData: extraction,
      trustLevelUpdate: this.calculateTrustUpdate(userMessage)
    };
  }

  async extractTraumaData(message, context) {
    const extractionPrompt = `Analyze this conversation for trauma indicators. Extract:
1. Trauma types mentioned (use these codes: physical_abuse, sexual_abuse, emotional_abuse, physical_neglect, emotional_neglect, substance_abuse, mental_illness, domestic_violence, separation, incarceration, bullying, community_violence, discrimination, medical_trauma, life_threat, loss)
2. Age ranges mentioned (0-3, 3-5, 6-11, 11-13, 14-18)
3. Duration (single, days, weeks, months, years, throughout)
4. Protective factors

Conversation: ${message}
Context: ${JSON.stringify(context.slice(-3))}

Return as JSON only.`;

    const extraction = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 500,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: extractionPrompt
      }]
    });
    
    try {
      return JSON.parse(extraction.content[0].text);
    } catch {
      return { traumaTypes: [], ageRanges: [], duration: null, protectiveFactors: [] };
    }
  }

  calculateTrustUpdate(message) {
    // Simple heuristic: longer messages and emotional words increase trust
    const wordCount = message.split(' ').length;
    const emotionalWords = ['felt', 'scared', 'happy', 'sad', 'angry', 'loved', 'safe'];
    const emotionalCount = emotionalWords.filter(word => 
      message.toLowerCase().includes(word)
    ).length;
    
    return Math.min(0.5, (wordCount / 100) + (emotionalCount * 0.1));
  }
}

export default ConversationalAIService;
```

### Step 2: Create the Chat Interface Component

```jsx
// src/components/ConversationalAssessment.jsx
import React, { useState, useEffect, useRef } from 'react';
import ConversationalAIService from '../services/conversationalAI';
import LiveBrainVisualization from './LiveBrainVisualization';
import { analyzeProfessionalTraumaImpact } from '../utils/professionalTraumaBrainMapping';

const ConversationalAssessment = ({ onComplete }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [extractedData, setExtractedData] = useState({});
  const [conversationState, setConversationState] = useState({
    topicsCovered: [],
    trustLevel: 0,
    sessionStartTime: Date.now()
  });
  const [brainHighlights, setBrainHighlights] = useState({});
  
  const aiService = useRef(new ConversationalAIService());
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    // Start conversation
    initializeConversation();
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const initializeConversation = async () => {
    const { text } = await aiService.current.startConversation();
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: text,
      timestamp: new Date()
    }]);
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Process with AI
      const response = await aiService.current.processResponse(
        inputValue,
        messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })),
        conversationState
      );
      
      // Update extracted data
      if (response.extractedData.traumaTypes?.length > 0) {
        setExtractedData(prev => {
          const updated = { ...prev };
          response.extractedData.traumaTypes.forEach(trauma => {
            if (!updated[trauma]) {
              updated[trauma] = {
                experienced: 'yes',
                ageRanges: response.extractedData.ageRanges || [],
                duration: response.extractedData.duration || 'unknown'
              };
            }
          });
          return updated;
        });
        
        // Update brain visualization
        updateBrainHighlights(response.extractedData);
      }
      
      // Update conversation state
      setConversationState(prev => ({
        ...prev,
        trustLevel: Math.min(10, prev.trustLevel + response.trustLevelUpdate),
        topicsCovered: [...new Set([...prev.topicsCovered, ...response.extractedData.traumaTypes])]
      }));
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsTyping(false);
    }
  };
  
  const updateBrainHighlights = (data) => {
    // Convert extracted data to brain region highlights
    const newHighlights = {};
    
    data.traumaTypes.forEach(traumaType => {
      const regions = analyzeProfessionalTraumaImpact({ 
        answers: { [traumaType]: { experienced: 'yes' } } 
      }).affectedRegions;
      
      regions.forEach(region => {
        newHighlights[region.name] = {
          intensity: region.severity,
          color: getTraumaColor(traumaType),
          label: region.impact
        };
      });
    });
    
    setBrainHighlights(prev => ({ ...prev, ...newHighlights }));
  };
  
  const getTraumaColor = (traumaType) => {
    const colorMap = {
      physical_abuse: '#FF6B6B',
      emotional_abuse: '#4ECDC4',
      sexual_abuse: '#45B7D1',
      neglect: '#96CEB4',
      household_dysfunction: '#FECA57',
      community: '#DDA0DD',
      medical: '#98D8C8',
      loss: '#F7DC6F'
    };
    
    return colorMap[traumaType] || '#BB86FC';
  };
  
  const handleComplete = () => {
    // Convert conversation data to assessment format
    const assessmentResults = {
      currentAge: conversationState.age || '',
      biologicalSex: conversationState.sex || '',
      answers: extractedData,
      conversationDuration: Date.now() - conversationState.sessionStartTime,
      trustLevel: conversationState.trustLevel,
      completedAt: new Date().toISOString()
    };
    
    onComplete(assessmentResults);
  };
  
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Chat Interface - Left Side */}
      <div className="w-1/2 flex flex-col border-r border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-light text-white mb-2">
            Let's explore your story together
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Trust Level</span>
            <div className="flex-1 bg-gray-800 rounded-full h-2 max-w-[200px]">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${conversationState.trustLevel * 10}%` }}
              />
            </div>
            <span className="text-gray-400">{conversationState.topicsCovered.length} topics explored</span>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-50 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 p-4 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share what feels comfortable..."
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !inputValue.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          
          <div className="flex justify-between mt-4">
            <button className="text-gray-400 hover:text-white text-sm">
              Take a break
            </button>
            <button 
              onClick={handleComplete}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Complete assessment →
            </button>
          </div>
        </div>
      </div>
      
      {/* Brain Visualization - Right Side */}
      <div className="w-1/2 relative bg-black">
        <LiveBrainVisualization 
          highlights={brainHighlights}
          conversationMode={true}
        />
        
        {/* Insights Panel */}
        <div className="absolute bottom-6 left-6 right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
          <h3 className="text-white font-medium mb-2">Neural Impact Detected</h3>
          <div className="space-y-2">
            {Object.entries(brainHighlights).slice(0, 3).map(([region, data]) => (
              <div key={region} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: data.color }}
                />
                <span className="text-gray-300 text-sm">{region}</span>
                <span className="text-gray-500 text-xs ml-auto">{data.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationalAssessment;
```

### Step 3: Create Live Brain Visualization Component

```jsx
// src/components/LiveBrainVisualization.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const LiveBrainVisualization = ({ highlights = {}, conversationMode = false }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const brainModelRef = useRef(null);
  const highlightMeshes = useRef({});
  const animationFrameId = useRef(null);
  
  useEffect(() => {
    initializeScene();
    return () => cleanup();
  }, []);
  
  useEffect(() => {
    updateHighlights();
  }, [highlights]);
  
  const initializeScene = () => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = conversationMode;
    controls.autoRotateSpeed = 0.5;
    
    // Load brain model
    loadBrainModel();
    
    // Animation loop
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      
      controls.update();
      
      // Pulse animations for highlights
      updatePulseAnimations();
      
      renderer.render(scene, camera);
    };
    animate();
  };
  
  const loadBrainModel = () => {
    // For now, create a simple brain representation
    // In production, load actual brain model
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    const brain = new THREE.Mesh(geometry, material);
    sceneRef.current.add(brain);
    brainModelRef.current = brain;
    
    // Add some region placeholders
    createBrainRegions();
  };
  
  const createBrainRegions = () => {
    const regions = [
      { name: 'Amygdala', position: [-0.8, -0.5, 0.5], size: 0.3 },
      { name: 'Hippocampus', position: [-0.5, -0.7, 0.3], size: 0.4 },
      { name: 'Prefrontal Cortex', position: [0, 1.2, 0.8], size: 0.6 },
      { name: 'Anterior Cingulate', position: [0, 0.3, 0.6], size: 0.4 },
      { name: 'Insula', position: [0.7, 0, 0.4], size: 0.35 }
    ];
    
    regions.forEach(region => {
      const geometry = new THREE.SphereGeometry(region.size, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.2,
        emissive: 0x000000,
        emissiveIntensity: 0
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...region.position);
      mesh.userData = { 
        name: region.name, 
        baseOpacity: 0.2,
        pulsePhase: Math.random() * Math.PI * 2
      };
      
      sceneRef.current.add(mesh);
      highlightMeshes.current[region.name] = mesh;
    });
  };
  
  const updateHighlights = () => {
    Object.entries(highlightMeshes.current).forEach(([regionName, mesh]) => {
      const highlight = highlights[regionName];
      
      if (highlight) {
        // Update color
        mesh.material.color = new THREE.Color(highlight.color);
        mesh.material.emissive = new THREE.Color(highlight.color);
        mesh.material.emissiveIntensity = highlight.intensity * 0.5;
        
        // Set target opacity based on intensity
        mesh.userData.targetOpacity = 0.2 + (highlight.intensity * 0.6);
        mesh.userData.isHighlighted = true;
      } else {
        // Reset to default
        mesh.material.color = new THREE.Color(0x333333);
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = 0;
        mesh.userData.targetOpacity = 0.2;
        mesh.userData.isHighlighted = false;
      }
    });
  };
  
  const updatePulseAnimations = () => {
    const time = Date.now() * 0.001;
    
    Object.values(highlightMeshes.current).forEach(mesh => {
      if (mesh.userData.isHighlighted) {
        // Gentle pulsing for highlighted regions
        const pulse = Math.sin(time * 2 + mesh.userData.pulsePhase) * 0.1 + 0.9;
        mesh.material.opacity = mesh.userData.targetOpacity * pulse;
        
        // Slight scale animation
        const scale = 1 + (Math.sin(time * 1.5 + mesh.userData.pulsePhase) * 0.05);
        mesh.scale.setScalar(scale);
      } else {
        // Smooth transition back to base state
        mesh.material.opacity = THREE.MathUtils.lerp(
          mesh.material.opacity,
          mesh.userData.baseOpacity,
          0.05
        );
        mesh.scale.setScalar(1);
      }
    });
  };
  
  const cleanup = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    if (rendererRef.current && mountRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }
  };
  
  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {conversationMode && (
        <div className="absolute top-6 left-6 text-white">
          <h3 className="text-lg font-light mb-2">Your Neural Landscape</h3>
          <p className="text-sm text-gray-400">
            Watch as your story illuminates your brain's development
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveBrainVisualization;
```

### Step 4: Integration with Main App

```jsx
// Update src/App.jsx to include conversational mode

// Add to imports
import ConversationalAssessment from './components/ConversationalAssessment'

// Add new view option
if (currentView === 'intro') {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center space-y-8">
          {/* Existing intro content */}
          
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('conversational')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-300"
            >
              Start Conversational Assessment
            </button>
            
            <button
              onClick={() => setCurrentView('questionnaire')}
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
            >
              Use Traditional Questionnaire
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

if (currentView === 'conversational') {
  return <ConversationalAssessment 
    onComplete={handleQuestionnaireComplete}
  />
}
```

### Step 5: Environment Setup

```bash
# .env.local
REACT_APP_ANTHROPIC_API_KEY=your-api-key-here
```

### Step 6: Enhanced Data Extraction Utilities

```javascript
// src/utils/conversationalDataExtraction.js

export const ageRangeMapping = {
  'baby': '0-3',
  'toddler': '0-3',
  'infant': '0-3',
  'preschool': '3-5',
  'kindergarten': '3-5',
  'elementary': '6-11',
  'middle school': '11-13',
  'high school': '14-18',
  'teenager': '14-18',
  'teen': '14-18'
};

export const durationMapping = {
  'once': 'single',
  'one time': 'single',
  'few days': 'days',
  'several days': 'days',
  'few weeks': 'weeks',
  'several weeks': 'weeks',
  'few months': 'months',
  'several months': 'months',
  'year': '1-2years',
  'years': '3-5years',
  'always': 'throughout',
  'whole childhood': 'throughout',
  'still happening': 'ongoing'
};

export const traumaKeywords = {
  physical_abuse: [
    'hit', 'beat', 'hurt', 'punch', 'slap', 'kick', 'bruise', 
    'physical discipline', 'corporal punishment', 'belt', 'spank'
  ],
  emotional_abuse: [
    'yell', 'scream', 'insult', 'humiliate', 'worthless', 'stupid',
    'threaten', 'fear', 'walking on eggshells', 'verbal abuse'
  ],
  sexual_abuse: [
    'inappropriate', 'touched', 'molest', 'sexual', 'uncomfortable touch',
    'private parts', 'forced'
  ],
  neglect: [
    'alone', 'hungry', 'dirty', 'no one cared', 'abandoned',
    'left alone', 'fend for myself', 'no supervision'
  ],
  substance_abuse: [
    'drunk', 'drinking', 'alcohol', 'drugs', 'high', 'substance',
    'addiction', 'rehab', 'AA', 'overdose'
  ],
  mental_illness: [
    'depression', 'depressed', 'bipolar', 'schizophrenia', 'suicide',
    'mental health', 'psychiatric', 'breakdown', 'hospitalized'
  ],
  domestic_violence: [
    'fighting', 'violence', 'police', 'scared', 'hide', 'arguing',
    'throwing things', 'breaking things', 'holes in walls'
  ],
  bullying: [
    'bullied', 'picked on', 'teased', 'excluded', 'mean kids',
    'cyberbullying', 'harassed', 'intimidated'
  ],
  medical_trauma: [
    'surgery', 'hospital', 'sick', 'illness', 'medical', 'doctor',
    'painful procedure', 'chronic pain', 'disability'
  ],
  loss: [
    'died', 'death', 'funeral', 'lost', 'passed away', 'grief',
    'mourning', 'gone forever'
  ]
};

export function extractTraumaIndicators(text) {
  const lowercaseText = text.toLowerCase();
  const found = [];
  
  Object.entries(traumaKeywords).forEach(([traumaType, keywords]) => {
    if (keywords.some(keyword => lowercaseText.includes(keyword))) {
      found.push(traumaType);
    }
  });
  
  return found;
}

export function extractAgeReferences(text) {
  const ageReferences = [];
  const lowercaseText = text.toLowerCase();
  
  // Direct age mentions
  const agePattern = /(\d+)\s*years?\s*old|age\s*(\d+)|when\s*i\s*was\s*(\d+)/g;
  let match;
  while ((match = agePattern.exec(lowercaseText)) !== null) {
    const age = parseInt(match[1] || match[2] || match[3]);
    if (age >= 0 && age <= 18) {
      ageReferences.push(mapAgeToRange(age));
    }
  }
  
  // School/developmental stages
  Object.entries(ageRangeMapping).forEach(([keyword, range]) => {
    if (lowercaseText.includes(keyword)) {
      ageReferences.push(range);
    }
  });
  
  return [...new Set(ageReferences)];
}

export function mapAgeToRange(age) {
  if (age <= 3) return '0-3';
  if (age <= 5) return '3-5';
  if (age <= 11) return '6-11';
  if (age <= 13) return '11-13';
  if (age <= 18) return '14-18';
  return null;
}
```

## Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. **Add Environment Variables**
   - Get Anthropic API key from https://console.anthropic.com
   - Add to `.env.local`

3. **Test Conversation Flow**
   - Start with simple responses
   - Verify data extraction
   - Check brain visualization updates

4. **Optimize Performance**
   - Implement response caching
   - Add loading states
   - Handle API errors gracefully

5. **User Testing**
   - Test with various conversation styles
   - Verify trauma detection accuracy
   - Ensure comfortable pacing

## Next Steps

1. **Voice Integration** - Add speech-to-text for verbal responses
2. **Session Persistence** - Save conversation progress
3. **Multi-language Support** - Translate prompts and responses
4. **Clinical Export** - Generate professional reports
5. **Mobile Optimization** - Responsive design for all devices