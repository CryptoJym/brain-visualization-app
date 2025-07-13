# Conversational AI Assessment Guide

## Overview

The Brain Visualization App now features a revolutionary conversational AI assessment powered by Claude/Opus 4. Instead of filling out traditional questionnaires, users can have a natural, empathetic conversation with an AI counselor while their brain map updates in real-time.

## How It Works

### 1. **Natural Language Processing**
- Users share their experiences through conversation, not checkboxes
- The AI extracts trauma indicators, age ranges, and duration naturally from the dialogue
- No direct questions about sensitive topics - the AI follows the user's lead

### 2. **Real-Time Brain Visualization**
- As users share their story, brain regions light up based on identified experiences
- 3D brain model with gentle pulsing effects for affected regions
- Live indicator shows the conversation is active

### 3. **Data Extraction**
The AI simultaneously:
- Maintains an empathetic, supportive conversation
- Extracts structured data needed for brain mapping
- Identifies all 34 ACE categories through context

### 4. **Privacy & Control**
- Users can pause or stop at any time
- Conversation data is processed locally
- Option to save assessments with Mem0 (SOC 2 & HIPAA compliant)

## Technical Implementation

### Components

1. **ConversationalAIService** (`/src/services/ConversationalAIService.js`)
   - Manages Claude API integration
   - Handles message parsing and data extraction
   - Converts conversational data to assessment format

2. **ConversationalAssessment** (`/src/components/ConversationalAssessment.jsx`)
   - Split-screen interface: chat on left, brain visualization on right
   - Real-time message handling
   - Progress tracking and completion

3. **LiveBrainVisualization** (`/src/components/LiveBrainVisualization.jsx`)
   - 3D brain model using Three.js
   - Real-time updates with smooth transitions
   - Glow effects using post-processing

### Data Flow

```
User Message → Claude API → Response Parsing → Data Extraction → Brain Update
                    ↓
              Empathetic Response → Chat Display
```

### Setup

1. **Add Anthropic API Key**
   ```env
   VITE_ANTHROPIC_API_KEY=your_api_key_here
   ```

2. **Deploy to Vercel**
   - Add the API key as an environment variable in Vercel dashboard
   - Deploy as usual

### API Integration

The system uses Claude's structured output capabilities:
- System prompt guides empathetic conversation
- JSON extraction blocks capture trauma data
- Confidence levels ensure accuracy

Example extraction:
```json
{
  "extracted": {
    "traumaType": "emotional_neglect",
    "ageRange": ["3-5", "6-11"],
    "duration": "throughout",
    "confidence": "high"
  }
}
```

## User Experience

### Starting the Conversation
- Warm, welcoming introduction
- Explanation of the process
- Open-ended question to begin

### During the Conversation
- Natural flow following user's pace
- Validation and support for shared experiences
- Visual feedback as brain regions activate

### Completion
- Option to complete when enough data is gathered
- Full brain map visualization
- Export and save options

## Advantages Over Traditional Questionnaires

1. **More Natural**: Feels like talking to a counselor, not filling forms
2. **Less Clinical**: Reduces re-traumatization through supportive dialogue
3. **More Accurate**: Context provides nuanced understanding
4. **Better Engagement**: Interactive visualization maintains interest
5. **Flexible Pacing**: Users control depth and speed

## Privacy & Ethics

- No conversation data stored without explicit consent
- Fallback responses if API unavailable
- Clear indicators of AI interaction
- Option to switch to traditional questionnaire

## Future Enhancements

- Voice input for even more natural interaction
- Multiple language support
- Integration with EEG data (Neurable)
- Therapeutic recommendations based on findings