# AR Therapy System Documentation

## Overview
The AR Therapy System provides immersive augmented reality therapy exercises designed to support healing and emotional regulation. It uses WebXR API to create AR experiences on compatible devices, with fallback 3D visualization for non-AR devices.

## Features

### 1. **AR Breathing Exercise** (`ARBreathingExercise.jsx`)
- Visual breathing guides with expanding/contracting orb
- Configurable breathing patterns (4-4-6-2 cycle)
- Progress tracking through multiple cycles
- Hand gesture controls (open palm to start, fist to stop)
- Ambient particle effects for immersion

### 2. **AR Safe Space** (`ARSafeSpace.jsx`)
- Multiple calming environments:
  - Peaceful Forest 🌲
  - Calm Beach 🏖️
  - Mountain Sanctuary ⛰️
  - Cosmic Peace 🌌
- Dynamic environment switching with pinch gesture
- Ambient sounds for each environment
- Customizable sky and ground colors

### 3. **AR Brain Tapping** (`ARBrainTapping.jsx`)
- Bilateral stimulation for emotional regulation
- Multiple tapping patterns:
  - Alternating (left-right)
  - Butterfly (simultaneous)
  - Custom (manual control)
- Adjustable speed (0.5x to 2x)
- Visual brain model showing active hemispheres
- Progress tracking (100 taps per session)

## Technical Architecture

### WebXR Service (`WebXRService.js`)
Core service handling:
- AR session management
- Device capability detection
- Hand tracking API integration
- Hit testing for object placement
- Anchor points for stable AR content
- Gesture recognition (pinch, open palm, fist)

### Device Compatibility
- **AR Mode**: Requires WebXR-compatible device (modern smartphones, AR glasses)
- **Fallback Mode**: Full 3D visualization for desktop/non-AR devices
- **Hand Tracking**: Optional feature for supported devices

## Usage

### Starting AR Therapy
1. From the main app, click "Try AR Therapy"
2. Choose an exercise from the available options
3. Follow on-screen instructions for setup
4. Use hand gestures or touch controls to interact

### Hand Gestures
- **Open Palm**: Start exercises, activate features
- **Fist**: Stop exercises, pause activities
- **Pinch**: Switch environments, select options

### Best Practices
1. Use in a well-lit, open space (2-3 meters clear area)
2. Hold device at comfortable viewing angle
3. Take breaks between exercises
4. Use headphones for ambient sounds

## Installation

1. Install dependencies:
```bash
npm install
```

2. The system requires these additional packages (already added to package.json):
- `@react-three/xr`: WebXR integration for React Three Fiber
- Existing Three.js and React Three Fiber dependencies

3. Run the development server:
```bash
npm run dev
```

## Browser Support
- Chrome/Edge on Android (AR mode)
- Safari on iOS with WebXR viewer (AR mode)
- Any modern browser (3D fallback mode)

## Future Enhancements
- Voice-guided instructions
- Biometric integration (heart rate, breathing rate)
- Session recording and progress tracking
- Therapist collaboration mode
- More therapy exercises (EMDR, grounding techniques)

## Security & Privacy
- All AR processing happens locally on device
- No camera data is transmitted or stored
- Session data can be optionally saved locally
- Hand tracking data is processed in real-time and discarded

## Troubleshooting

### AR Not Available
- Check device compatibility
- Ensure browser has camera permissions
- Try in well-lit environment
- Update browser to latest version

### Performance Issues
- Close other apps
- Reduce particle effects in settings
- Use simpler environments
- Check device temperature

### Hand Tracking Not Working
- Ensure hands are visible to camera
- Remove gloves or jewelry
- Improve lighting conditions
- Check if feature is supported on device