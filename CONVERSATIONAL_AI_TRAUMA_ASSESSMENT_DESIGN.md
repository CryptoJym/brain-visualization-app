# Conversational AI Trauma Assessment System Design

## Executive Summary

This design transforms the current structured ACEs questionnaire (34 questions across 10 categories) into an empathetic, conversational AI experience that naturally extracts trauma information while providing real-time brain visualization feedback. The system uses Claude/Opus 4 to conduct supportive conversations that feel therapeutic rather than clinical.

## Current System Analysis

### Questionnaire Structure
- **34 total questions** across 10 categories:
  - Abuse (3 questions)
  - Neglect (2 questions)
  - Household Dysfunction (5 questions)
  - Community & Social (5 questions)
  - Life-Threatening Events (4 questions)
  - Medical & Health (3 questions)
  - Attachment & Loss (5 questions)
  - Educational & Developmental (3 questions)
  - Stability & Environment (4 questions)
  - Protective Factors (1 question)

### Data Requirements per Question
1. **Experienced** (yes/no)
2. **Age ranges** when occurred (0-3, 3-5, 6-11, 11-13, 14-18, throughout, multiple)
3. **Duration** (single incident to throughout childhood)
4. **Protective factors** and their details

## Conversational Flow Design

### 1. Natural Topic Progression

**Opening Approach:**
```
"Hi, I'm here to help create a personalized brain map that shows how your experiences have shaped your neural development. This is a safe space, and you can share as much or as little as you feel comfortable with. Would you like to start by telling me a bit about your childhood - perhaps what comes to mind when you think about growing up?"
```

**Topic Flow Strategy:**
1. **General childhood memories** → Extract household context, stability
2. **Family dynamics** → Identify household dysfunction, relationships
3. **School experiences** → Educational disruptions, peer relationships, bullying
4. **Health journey** → Medical trauma, chronic conditions
5. **Significant events** → Life-threatening experiences, losses
6. **Support systems** → Protective factors, resilience

### 2. Empathetic Extraction Techniques

**Age Range Extraction:**
- "How old were you when that started happening?"
- "Was this something that happened throughout your childhood or during a specific time?"
- "That sounds like it was during your elementary school years - would that be around ages 6-11?"

**Duration Extraction:**
- "Was this a one-time event or something that continued?"
- "How long did this situation last?"
- "When did things start to change or improve?"

**Severity Assessment:**
- Through context and emotional language
- Frequency mentions ("every day", "constantly", "sometimes")
- Impact descriptions ("I couldn't sleep", "I was always scared")

### 3. Conversation Management

**Sensitive Topic Handling:**
```python
sensitivity_responses = {
    "pause_needed": "I can see this is difficult to talk about. Would you like to take a moment, or shall we move to something else?",
    "validation": "Thank you for sharing that with me. Your experiences are valid and important.",
    "support": "That sounds like it was really challenging. You showed a lot of strength getting through that.",
    "redirect": "Let's talk about something more positive for a moment - did you have any special places or people that made you feel safe?"
}
```

**Progressive Disclosure:**
- Start with less sensitive topics
- Build trust through validation
- Allow user to guide depth of sharing
- Offer breaks and topic changes

## Technical Implementation

### 1. Architecture Overview

```
┌─────────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   Chat Interface    │────▶│  Claude/Opus 4   │────▶│  NLP Processor    │
│  (React Component)  │     │    API Handler    │     │ (Extract Data)    │
└─────────────────────┘     └──────────────────┘     └───────────────────┘
          │                           │                         │
          │                           │                         ▼
          │                           │                ┌───────────────────┐
          │                           │                │  Validation &     │
          │                           │                │  Categorization   │
          │                           │                └───────────────────┘
          │                           │                         │
          ▼                           ▼                         ▼
┌─────────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  Live Brain Viz     │◀────│  Brain Impact    │◀────│  Trauma Mapping   │
│    (Three.js)       │     │   Calculator     │     │     Engine        │
└─────────────────────┘     └──────────────────┘     └───────────────────┘
```

### 2. Core Components

#### A. Conversational AI Engine
```javascript
class ConversationalAssessment {
  constructor() {
    this.conversationState = {
      topicsCovered: new Set(),
      extractedData: {},
      trustLevel: 0,
      currentTopic: null,
      conversationHistory: []
    };
    
    this.topicQueue = [
      'childhood_general',
      'family_dynamics',
      'school_experiences',
      'friendships',
      'health_history',
      'significant_events',
      'support_systems'
    ];
  }
  
  async processUserResponse(userText) {
    // Send to Claude API with context
    const response = await this.callClaudeAPI({
      systemPrompt: this.buildSystemPrompt(),
      userMessage: userText,
      conversationHistory: this.conversationState.conversationHistory
    });
    
    // Extract trauma indicators
    const extractedInfo = await this.extractTraumaData(response);
    
    // Update brain visualization in real-time
    this.updateBrainVisualization(extractedInfo);
    
    // Determine next conversation direction
    const nextPrompt = this.determineNextTopic(extractedInfo);
    
    return {
      aiResponse: response.text,
      extractedData: extractedInfo,
      nextSuggestedTopic: nextPrompt
    };
  }
}
```

#### B. Natural Language Processing Pipeline
```javascript
class TraumaDataExtractor {
  async extractFromConversation(text, context) {
    const extraction = {
      traumaTypes: [],
      ageRanges: [],
      duration: null,
      severity: null,
      protectiveFactors: []
    };
    
    // Age extraction patterns
    const agePatterns = [
      { pattern: /when I was (\d+)/i, type: 'specific' },
      { pattern: /(\d+) years old/i, type: 'specific' },
      { pattern: /in (kindergarten|elementary|middle|high) school/i, type: 'range' },
      { pattern: /as a (baby|toddler|child|teenager)/i, type: 'range' }
    ];
    
    // Duration extraction
    const durationPatterns = [
      { pattern: /for (\d+) (years|months)/i, type: 'specific' },
      { pattern: /throughout my childhood/i, type: 'throughout' },
      { pattern: /until I was (\d+)/i, type: 'until_age' }
    ];
    
    // Trauma indicators
    const traumaIndicators = {
      physical_abuse: ['hit', 'beat', 'hurt', 'bruise', 'punish physically'],
      emotional_abuse: ['yell', 'scream', 'worthless', 'stupid', 'threaten'],
      neglect: ['alone', 'hungry', 'no one cared', 'dirty clothes'],
      sexual_abuse: ['touched', 'inappropriate', 'sexual'],
      // ... etc
    };
    
    return extraction;
  }
}
```

#### C. Real-time Brain Visualization Updates
```javascript
class LiveBrainUpdater {
  constructor(brainVisualization) {
    this.brain = brainVisualization;
    this.currentHighlights = new Map();
    this.animationQueue = [];
  }
  
  async updateFromExtraction(extractedData) {
    // Map trauma type to brain regions
    const affectedRegions = this.mapTraumaToRegions(extractedData);
    
    // Animate highlighting with gentle pulsing
    for (const [region, intensity] of affectedRegions) {
      this.animateRegionHighlight(region, {
        intensity,
        color: this.getTraumaColor(extractedData.traumaType),
        duration: 2000,
        pattern: 'pulse'
      });
    }
    
    // Update statistics panel
    this.updateStatsPanel(extractedData);
  }
  
  animateRegionHighlight(region, options) {
    // Smooth, therapeutic animations
    // Not jarring or clinical
    const animation = {
      region,
      startIntensity: this.currentHighlights.get(region) || 0,
      targetIntensity: options.intensity,
      duration: options.duration,
      easing: 'easeInOutQuad'
    };
    
    this.animationQueue.push(animation);
  }
}
```

### 3. Claude/Opus 4 Integration

#### System Prompt Design
```javascript
const SYSTEM_PROMPT = `You are a compassionate AI assistant helping someone explore their childhood experiences to create a personalized brain development map. Your role is to:

1. Create a safe, non-judgmental space for sharing
2. Ask gentle, open-ended questions that naturally lead to understanding their experiences
3. Validate their emotions and experiences
4. Extract key information without being clinical:
   - Types of adverse experiences (map to ACE categories internally)
   - Age ranges when events occurred
   - Duration and frequency
   - Protective factors and resilience
5. Guide the conversation naturally through different life areas
6. Recognize when to pause, validate, or change topics
7. Always prioritize the person's emotional comfort over data collection

Current conversation state: {conversationState}
Topics to explore: {remainingTopics}
Trust level: {trustLevel}

Remember: This is a therapeutic conversation, not an interrogation. Let the person guide the pace and depth.`;
```

#### API Integration
```javascript
class ClaudeConversationManager {
  constructor(apiKey) {
    this.claude = new Claude({ apiKey });
    this.model = 'claude-opus-4-20250514';
  }
  
  async getConversationalResponse(userInput, context) {
    const response = await this.claude.complete({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(context)
        },
        ...context.conversationHistory,
        {
          role: 'user',
          content: userInput
        }
      ],
      temperature: 0.7, // Warm but consistent
      max_tokens: 500
    });
    
    // Also get extraction in parallel
    const extraction = await this.claude.complete({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'Extract trauma indicators, ages, duration from this conversation...'
        },
        {
          role: 'user',
          content: `Conversation: ${userInput}\nContext: ${JSON.stringify(context)}`
        }
      ],
      temperature: 0.2 // More deterministic for extraction
    });
    
    return {
      conversationalResponse: response,
      extractedData: JSON.parse(extraction.content)
    };
  }
}
```

### 4. User Interface Design

#### Chat Interface Component
```jsx
const ConversationalAssessment = () => {
  return (
    <div className="flex h-screen">
      {/* Left: Chat Interface */}
      <div className="w-1/2 flex flex-col bg-gray-900">
        <div className="flex-1 overflow-y-auto p-6">
          <ChatHistory messages={messages} />
        </div>
        
        <ChatInput 
          onSend={handleUserMessage}
          suggestions={currentSuggestions}
          isPaused={isPaused}
        />
        
        <ConversationControls 
          onPause={handlePause}
          onSkipTopic={handleSkipTopic}
          onEndSession={handleEndSession}
        />
      </div>
      
      {/* Right: Live Brain Visualization */}
      <div className="w-1/2 relative">
        <LiveBrainVisualization 
          highlights={currentHighlights}
          animationMode="therapeutic"
        />
        
        <ProgressIndicator 
          topicsCovered={topicsCovered}
          trustLevel={trustLevel}
        />
        
        <InsightPanel 
          currentInsights={currentInsights}
          protectiveFactors={protectiveFactors}
        />
      </div>
    </div>
  );
};
```

#### Visual Design Elements
- **Calming color palette**: Deep purples, soft blues, gentle gradients
- **Therapeutic animations**: Slow pulses, gentle glows, smooth transitions
- **Progress visualization**: Constellation-style connection of covered topics
- **Emotional indicators**: Subtle UI changes based on conversation tone

### 5. Data Flow and Validation

```javascript
class ConversationDataValidator {
  validateExtraction(extracted, conversationContext) {
    const validated = {
      traumaEvents: [],
      timeline: new Map(),
      severity: new Map(),
      protectiveFactors: []
    };
    
    // Cross-reference mentioned ages with events
    // Ensure consistency in timeline
    // Flag any contradictions for gentle clarification
    
    return validated;
  }
  
  async requestClarification(topic, context) {
    // Generate gentle clarification prompts
    return {
      prompt: "I want to make sure I understood correctly...",
      options: [
        "Yes, that's right",
        "Actually, it was different",
        "I'd rather not clarify right now"
      ]
    };
  }
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up Claude/Opus 4 API integration
- Create basic chat interface
- Implement simple extraction for 2-3 trauma types
- Basic brain highlighting

### Phase 2: Conversational Intelligence (Week 3-4)
- Develop comprehensive system prompts
- Implement all trauma type extractions
- Add age and duration parsing
- Create conversation flow management

### Phase 3: Visualization Integration (Week 5-6)
- Real-time brain updates
- Smooth animations
- Progress tracking
- Insight generation

### Phase 4: Refinement (Week 7-8)
- User testing
- Conversation flow optimization
- Edge case handling
- Performance optimization

## Privacy and Security

```javascript
class PrivacyManager {
  constructor() {
    this.encryptionKey = null;
    this.sessionOnly = true;
  }
  
  async storeConversation(data) {
    if (!this.userConsent) return null;
    
    // Encrypt sensitive data
    const encrypted = await this.encrypt(data);
    
    // Store only in session by default
    if (this.sessionOnly) {
      sessionStorage.setItem('assessment', encrypted);
    } else {
      // Optional: Store in Mem0 with encryption
      await this.storeInMem0(encrypted);
    }
  }
}
```

## Success Metrics

1. **Engagement**: Average conversation duration > 15 minutes
2. **Completion**: 80%+ users complete full assessment
3. **Data Quality**: 90%+ accuracy in extraction vs manual review
4. **User Feedback**: 4.5+ star rating on experience
5. **Therapeutic Value**: Users report feeling heard and understood

## Future Enhancements

1. **Voice Integration**: Allow spoken responses
2. **Multilingual Support**: Culturally sensitive translations
3. **Therapeutic Recommendations**: Personalized healing resources
4. **Progress Tracking**: Return sessions to build on previous conversations
5. **Clinical Integration**: Export reports for healthcare providers