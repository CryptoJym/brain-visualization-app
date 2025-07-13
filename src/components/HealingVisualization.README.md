# Healing Journey Visualization

A comprehensive, emotionally uplifting 3D visualization component that shows users their brain healing progress over time using beautiful visual metaphors and celebration effects.

## Features

### 🌟 Core Visualizations

1. **Healing Tree** - Represents neuroplasticity growth
   - Branches grow based on healing progress
   - Sparkles and particle effects for active healing
   - Color changes to reflect health improvements

2. **Before/After Brain Comparison** - Shows transformation
   - Side-by-side wireframe brain models
   - Animated connections showing new neural pathways
   - Visual opacity changes to highlight improvements

3. **Timeline Visualization** - Longitudinal progress tracking
   - Interactive timeline with milestone markers
   - Color-coded healing levels
   - Smooth transitions between data points

4. **Progress Celebrations** - Milestone achievements
   - Particle fireworks for major milestones
   - Healing light bursts for daily progress
   - Custom animations for different achievement types

### 📊 Metrics & Analytics

- **Overall Healing Progress** - Percentage-based tracking
- **Brain Region Analysis** - Individual region healing rates
- **Healing Velocity** - Rate of improvement over time
- **Milestone Tracking** - Achievement system with rewards
- **Predictive Modeling** - Estimated time to full healing

### 🎨 Visual Effects

- **Particle Systems** - Multiple types for different celebrations
- **Healing Light** - Dynamic lighting that intensifies with progress
- **Neural Connections** - Animated pathways between brain regions
- **Wave Effects** - Healing waves across brain regions
- **Glow & Pulse** - Attention-drawing animations

## Usage

### Basic Implementation

```jsx
import HealingJourneyVisualization from './components/HealingJourneyVisualization';

function App() {
  const assessmentData = {
    brainImpacts: {
      amygdala: { severity: 0.3 },
      hippocampus: { severity: 0.4 },
      prefrontal_cortex: { severity: 0.2 }
    },
    responses: {
      anxietyLevel: 2,
      sleepQuality: 4,
      emotionalRegulation: 3
    }
  };

  const historicalData = [
    // Array of previous assessments
  ];

  return (
    <HealingJourneyVisualization
      assessmentData={assessmentData}
      historicalData={historicalData}
      userProfile={{
        healingActivities: ['therapy', 'meditation', 'exercise']
      }}
    />
  );
}
```

### With Integration

```jsx
import HealingJourneyIntegration from './components/HealingJourneyIntegration';

function UserDashboard({ userId }) {
  return (
    <HealingJourneyIntegration userId={userId} />
  );
}
```

### After Assessment Completion

```jsx
import { integrateHealingVisualization } from './components/HealingJourneyIntegration';

// After user completes assessment
const results = await integrateHealingVisualization(assessmentResults, userId);
if (results.success) {
  // Redirect to healing visualization
  window.location.href = '/healing-journey';
}
```

## Customization

### Healing Factors

You can customize healing factor multipliers in `HealingMetrics.js`:

```javascript
const HEALING_FACTORS = {
  therapy: { multiplier: 1.3, name: 'Professional therapy' },
  meditation: { multiplier: 1.2, name: 'Regular meditation' },
  // Add custom factors...
};
```

### Visual Themes

Modify colors and effects in the component:

```javascript
// Healing tree colors
const treeColors = {
  trunk: '#8B4513',
  leaves: new THREE.Color().setHSL(0.3, 0.8, 0.6)
};

// Particle colors
const particleColors = ['#FFD700', '#FFA500', '#FF6B6B'];
```

### Milestones

Define custom milestones in `HealingMetrics.js`:

```javascript
const HEALING_MILESTONES = [
  { id: 'custom', name: 'Custom Milestone', progress: 0.33 },
  // Add more...
];
```

## Data Structure

### Assessment Data Format

```javascript
{
  date: '2024-01-15T10:30:00Z',
  brainImpacts: {
    amygdala: { 
      severity: 0.7,  // 0-1 scale
      traumaTypes: ['emotional_abuse']
    },
    hippocampus: { severity: 0.6 },
    // ... other regions
  },
  responses: {
    anxietyLevel: 4,      // 1-5 scale
    depressionLevel: 3,   // 1-5 scale
    sleepQuality: 2,      // 1-5 scale
    // ... other metrics
  }
}
```

### User Profile Format

```javascript
{
  healingActivities: ['therapy', 'meditation', 'exercise'],
  age: 32,
  startDate: '2023-07-15T00:00:00Z'
}
```

## Performance Optimization

- **Particle Limits** - Maximum 200 particles per system
- **Animation Throttling** - 60 FPS cap with requestAnimationFrame
- **Memory Management** - Automatic cleanup of completed animations
- **LOD System** - Reduced detail for distant objects

## Accessibility

- **Reduced Motion** - Respects user's motion preferences
- **High Contrast** - Alternative color schemes available
- **Screen Reader** - Descriptive text for all visual elements
- **Keyboard Navigation** - Full keyboard support for controls

## Dependencies

```json
{
  "three": "^0.178.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.96.0",
  "framer-motion": "^12.23.3",
  "gsap": "^3.12.5"
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- WebGL 2.0 required

## Future Enhancements

- [ ] VR/AR support for immersive healing experiences
- [ ] Social features to share progress with support network
- [ ] AI-powered healing recommendations
- [ ] Integration with wearable devices for real-time data
- [ ] Guided meditation overlays
- [ ] Export healing reports as PDF
- [ ] Multi-language support

## Contributing

Feel free to submit issues and enhancement requests!