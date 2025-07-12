# Neurable EEG Integration Guide

## Overview

This brain visualization app now supports integration with Neurable MW75 headphones to combine:
- Survey-based trauma assessment
- Real-time EEG brain activity monitoring
- Automatic brain region highlighting based on both data sources

## How It Works

### 1. Survey System
The trauma questionnaire maps responses to specific brain regions:
- **Amygdala**: Fear processing (affected by physical abuse, violence)
- **Hippocampus**: Memory formation (affected by chronic stress, sexual abuse)
- **Prefrontal Cortex**: Executive control (affected by emotional neglect)
- **Anterior Cingulate**: Emotion regulation (affected by various traumas)

### 2. EEG Integration
The Neurable MW75 provides 6-channel EEG data:
- **Fp1/Fp2**: Frontal activity (emotional regulation)
- **T3/T4**: Temporal activity (memory processing)
- **O1/O2**: Occipital activity (visual processing)

### 3. Combined Analysis
The system combines both data sources:
- 70% weight on survey results (long-term impact)
- 30% weight on EEG data (current brain state)

## Usage Instructions

### Step 1: Complete the Survey
1. Navigate to the app
2. Click "Start Personalized Assessment"
3. Answer all trauma-related questions
4. Include age ranges when experiences occurred
5. Submit to generate your brain impact map

### Step 2: View Survey Results
- See affected brain regions highlighted
- Check impact percentages for each region
- Review trauma types and developmental periods
- Use "Impact View" or "Timeline View"

### Step 3: Add EEG Analysis
1. Click "Add EEG Analysis" button
2. Connect your Neurable MW75 headphones
3. Click "Connect Neurable MW75"
4. Start recording EEG data
5. Record for 2-3 minutes minimum

### Step 4: View Combined Results
- Survey impacts + real-time EEG patterns
- Comprehensive recommendations
- Region-specific analysis with both data types

## Brain Regions Explained

### Trauma-Affected Regions

**Amygdala**
- Fear center of the brain
- Hyperactive in PTSD
- Triggers fight-or-flight responses

**Hippocampus**
- Memory formation and consolidation
- Can physically shrink from chronic stress
- Causes flashbacks and intrusive memories

**Prefrontal Cortex**
- Executive control and decision-making
- Underactive in trauma survivors
- Affects emotional regulation

**Anterior Cingulate Cortex**
- Emotion processing and regulation
- Reduced volume in PTSD
- Affects pain perception

## EEG Markers of Trauma

### Frontal Regions (Fp1/Fp2)
- **Reduced Alpha (8-12 Hz)**: Emotional dysregulation
- **Elevated Beta (13-30 Hz)**: Hypervigilance, anxiety

### Temporal Regions (T3/T4)
- **Elevated Theta (4-7 Hz)**: Memory processing issues
- **Irregular Gamma (30-50 Hz)**: Sensory processing problems

### Hemispheric Asymmetry
- Imbalanced activity between left and right brain
- Common in trauma survivors
- Affects emotional processing

## Recommendations Based on Findings

### High Frontal Impact
- Cognitive Behavioral Therapy (CBT)
- Mindfulness meditation
- Neurofeedback training

### High Temporal Impact
- EMDR therapy
- Memory reconsolidation techniques
- Bilateral stimulation

### High Amygdala/Fear Response
- Exposure therapy
- Somatic experiencing
- Vagus nerve stimulation

## Technical Integration

### For Developers

The Neurable integration uses:
```javascript
// Connect to Neurable
const neurable = new NeurableSDK();
await neurable.connect();

// Stream EEG data
neurable.on('data', (eegData) => {
  // Process 6 channels
  analyzeEEGForTrauma(eegData);
});
```

### Data Format
```javascript
{
  Ch1: { // Fp1
    raw: Float32Array,
    powerBands: {
      delta: 0-4 Hz,
      theta: 4-7 Hz,
      alpha: 8-12 Hz,
      beta: 13-30 Hz,
      gamma: 30-50 Hz
    }
  },
  // ... Ch2-Ch6
}
```

## Privacy & Security

- All data is processed locally
- No survey responses are stored
- EEG data is analyzed in real-time
- Results are session-only

## Future Enhancements

1. **Real-time Feedback**
   - Live neurofeedback during recording
   - Breathing exercises based on EEG state

2. **Advanced Analysis**
   - Machine learning trauma detection
   - Longitudinal progress tracking

3. **Therapeutic Integration**
   - Export reports for therapists
   - Treatment protocol suggestions

## Support

For issues with:
- Survey system: Check console for errors
- Neurable connection: Ensure Bluetooth is enabled
- EEG data: Check headphone positioning

## Research References

- Van der Kolk, B. (2014). The Body Keeps the Score
- Lanius, R. et al. (2010). Default mode network in PTSD
- Patel, R. et al. (2012). Neurocircuitry models of PTSD