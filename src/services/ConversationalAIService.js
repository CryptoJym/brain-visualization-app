// Conversational AI Service for trauma assessment
// Integrates with Claude/Anthropic API for natural conversation

class ConversationalAIService {
  constructor(apiKey) {
    this.apiKey = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-opus-20240229'; // Can be updated to Opus 4 when available
    this.conversationHistory = [];
    this.extractedData = {
      traumaTypes: {},
      protectiveFactors: false,
      biologicalSex: null,
      currentAge: null
    };
  }

  // System prompt that guides Claude to be both conversational and extract data
  getSystemPrompt() {
    return `You are a compassionate, trauma-informed counselor helping someone create a personalized brain map based on their life experiences. Your role is to:

1. Have a natural, empathetic conversation about their childhood and life experiences
2. While conversing, internally track any adverse childhood experiences (ACEs) mentioned
3. Gently explore timeframes and ages when experiences occurred
4. Never make the person feel like they're filling out a form
5. Validate their experiences and provide supportive responses
6. Extract the following data points through natural conversation:
   - Physical abuse, sexual abuse, emotional abuse
   - Physical neglect, emotional neglect
   - Household dysfunction (substance abuse, mental illness, domestic violence, separation, incarceration)
   - Community factors (bullying, violence, poverty, discrimination, isolation)
   - Life-threatening events (accidents, disasters, medical trauma)
   - Attachment disruptions (caregiver changes, deaths, abandonment)
   - Educational challenges
   - Any protective factors (supportive adults, therapy, resilience)

IMPORTANT: After each user response, append a JSON block with extracted data:
\`\`\`json
{
  "extracted": {
    "traumaType": "identifier_if_mentioned",
    "ageRange": ["0-3", "3-5", "6-11", "11-13", "14-18"],
    "duration": "single|days|weeks|months|years|throughout",
    "confidence": "high|medium|low"
  }
}
\`\`\`

Be warm, patient, and follow their lead. If they seem overwhelmed, offer to pause or change topics.`;
  }

  // Start a new assessment conversation
  async startConversation() {
    const openingMessage = await this.sendMessage(
      "Start the conversation warmly, introduce yourself, and explain that you'll help create a personalized brain map based on their life experiences. Ask an open-ended question about their childhood to begin."
    );
    
    return this.parseResponse(openingMessage);
  }

  // Send a message and get Claude's response
  async sendMessage(userMessage, isInitial = false) {
    try {
      const messages = isInitial ? [] : [
        ...this.conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          system: this.getSystemPrompt(),
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.content[0].text;

      // Update conversation history
      if (!isInitial) {
        this.conversationHistory.push({ role: 'user', content: userMessage });
      }
      this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

      return assistantMessage;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      // Fallback to guided conversation if API fails
      return this.getFallbackResponse(userMessage);
    }
  }

  // Parse Claude's response to extract both conversation and data
  parseResponse(response) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    let extractedData = null;
    let conversationalText = response;

    if (jsonMatch) {
      try {
        extractedData = JSON.parse(jsonMatch[1]);
        // Remove JSON from conversational text
        conversationalText = response.replace(/```json[\s\S]*?```/g, '').trim();
      } catch (e) {
        console.error('Failed to parse extracted data:', e);
      }
    }

    // Update our extracted data if we found any
    if (extractedData?.extracted) {
      this.updateExtractedData(extractedData.extracted);
    }

    return {
      message: conversationalText,
      extracted: extractedData?.extracted || null,
      currentData: this.extractedData
    };
  }

  // Update the accumulated extracted data
  updateExtractedData(newData) {
    if (newData.traumaType && newData.confidence !== 'low') {
      // Initialize trauma type if not exists
      if (!this.extractedData.traumaTypes[newData.traumaType]) {
        this.extractedData.traumaTypes[newData.traumaType] = {
          experienced: 'yes',
          ageRanges: [],
          duration: null
        };
      }

      // Add age ranges
      if (newData.ageRange) {
        const existing = this.extractedData.traumaTypes[newData.traumaType].ageRanges;
        newData.ageRange.forEach(range => {
          if (!existing.includes(range)) {
            existing.push(range);
          }
        });
      }

      // Update duration if more specific
      if (newData.duration && !this.extractedData.traumaTypes[newData.traumaType].duration) {
        this.extractedData.traumaTypes[newData.traumaType].duration = newData.duration;
      }
    }

    // Extract demographic info from conversation
    if (newData.biologicalSex) {
      this.extractedData.biologicalSex = newData.biologicalSex;
    }
    if (newData.currentAge) {
      this.extractedData.currentAge = newData.currentAge;
    }
    if (newData.protectiveFactors) {
      this.extractedData.protectiveFactors = true;
    }
  }

  // Get fallback responses if API is unavailable
  getFallbackResponse(userMessage) {
    const responses = {
      initial: "Hi there, I'm here to help you create a personalized brain map based on your life experiences. This is a safe space to share at your own pace. To start, could you tell me a bit about what your childhood was like?",
      
      general: [
        "Thank you for sharing that with me. It takes courage to open up about these experiences. Can you tell me more about what that was like for you?",
        "I hear you, and I appreciate you trusting me with this. How old were you when this was happening?",
        "That sounds really challenging. Were there any adults in your life who provided support during that time?",
        "I can understand how that would have been difficult. Did this happen once or was it ongoing?",
        "Your experiences are valid and important. Is there anything else from that time period you'd like to share?"
      ]
    };

    if (this.conversationHistory.length === 0) {
      return responses.initial;
    }

    // Return a random general response
    const randomIndex = Math.floor(Math.random() * responses.general.length);
    return responses.general[randomIndex];
  }

  // Check if we have enough data to generate a brain map
  hasEnoughData() {
    return Object.keys(this.extractedData.traumaTypes).length > 0 || 
           this.conversationHistory.length > 10;
  }

  // Convert extracted data to questionnaire format
  getQuestionnaireFormat() {
    const answers = {};
    
    // Convert trauma types to questionnaire answer format
    Object.entries(this.extractedData.traumaTypes).forEach(([type, data]) => {
      answers[type] = {
        experienced: data.experienced || 'yes',
        ageRanges: data.ageRanges || [],
        duration: data.duration || 'unknown'
      };
    });

    // Add protective factors
    if (this.extractedData.protectiveFactors) {
      answers.protective = { experienced: 'yes' };
    }

    return {
      answers,
      biologicalSex: this.extractedData.biologicalSex || 'female',
      currentAge: this.extractedData.currentAge || '25-34',
      conversationHistory: this.conversationHistory
    };
  }

  // Generate a summary of the conversation
  getSummary() {
    const traumaCount = Object.keys(this.extractedData.traumaTypes).length;
    const hasProtective = this.extractedData.protectiveFactors;
    
    return {
      traumaTypesIdentified: traumaCount,
      hasProtectiveFactors: hasProtective,
      conversationLength: this.conversationHistory.length,
      readyForVisualization: this.hasEnoughData()
    };
  }
}

export default ConversationalAIService;