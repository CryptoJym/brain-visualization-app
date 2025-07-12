# Zengar Institute & Neurable EEG Integration Guide

## Overview

This brain visualization app is designed to work with:
1. **Zengar Institute NeurOptimal** - Primary neurofeedback system
2. **Neurable MW75** - Secondary/future integration

## Zengar Institute Integration

### What is NeurOptimal?
NeurOptimal is a dynamical neurofeedback system from Zengar Institute that:
- Monitors brain activity in real-time
- Provides feedback to help the brain self-regulate
- Works with 5 EEG sensors (C3, C4, Cz on scalp + ear clips)
- Non-invasive, no diagnosis required

### Current Integration Points

1. **Pre-Assessment Survey**
   - Users complete trauma assessment first
   - Results stored in Mem0 with unique user ID
   - Brain regions automatically highlighted

2. **During NeurOptimal Session**
   - Export session data from NeurOptimal
   - Upload to app for correlation with survey results
   - Track changes over multiple sessions

3. **Post-Session Analysis**
   - Compare pre/post brain activity
   - Update user's Mem0 memory with progress
   - Generate insights on improvement areas

### Data Flow

```
User Survey → Mem0 Storage → Brain Visualization
     ↓
NeurOptimal Session
     ↓
Session Data Export → App Import → Progress Tracking
```

## Neurable Integration (Future)

### Planned Features
- Real-time EEG streaming during assessment
- 6-channel brain activity monitoring
- Automatic trauma marker detection
- Integration with survey responses

### Development Roadmap
1. Complete Zengar integration first
2. Develop equations for Neurable data processing
3. Add real-time visualization
4. Implement combined analysis

## Technical Implementation

### Mem0 User Structure
```javascript
{
  userId: "user_john_doe_1234567890",
  displayName: "John Doe",
  memories: [
    {
      type: "assessment",
      timestamp: "2024-01-15T10:30:00Z",
      ace_count: 4,
      regions_affected: 7,
      primary_impacts: ["Amygdala", "Hippocampus"]
    },
    {
      type: "neuroptimal_session",
      timestamp: "2024-01-16T14:00:00Z",
      session_number: 1,
      duration: 33,
      improvements: ["reduced_anxiety", "better_focus"]
    }
  ]
}
```

### API Endpoints (Planned)

```javascript
// Upload NeurOptimal session data
POST /api/neuroptimal/session
{
  userId: "user_id",
  sessionData: {
    date: "2024-01-16",
    duration: 33,
    baseline: [...],
    changes: [...]
  }
}

// Get user progress
GET /api/user/{userId}/progress
Response: {
  assessments: [...],
  sessions: [...],
  improvements: [...],
  recommendations: [...]
}
```

## Security & Compliance

- **Mem0**: SOC 2 & HIPAA compliant
- **Data Storage**: Encrypted at rest
- **User Privacy**: Each user has isolated memory space
- **Session Data**: Never shared, fully deletable

## Setup Instructions

### 1. Configure Mem0
```env
VITE_MEM0_API_KEY=your_mem0_api_key
VITE_MEM0_ORG_ID=your_clinic_org_id
VITE_MEM0_PROJECT_ID=neuroptimal-assessments
```

### 2. User Flow
1. Patient creates account with unique identifier
2. Completes trauma assessment
3. Views personalized brain map
4. Attends NeurOptimal session
5. Practitioner uploads session data
6. Patient views progress over time

### 3. Practitioner Dashboard (Planned)
- View all patient assessments
- Upload session data
- Track patient progress
- Generate reports

## Benefits of This Approach

1. **Baseline Establishment**: Survey creates initial brain impact map
2. **Objective Tracking**: NeurOptimal provides measurable changes
3. **Personalized Insights**: Mem0 remembers everything for pattern analysis
4. **Privacy First**: SOC 2 compliant, patient-controlled data
5. **Clinical Integration**: Works with existing Zengar workflows

## Next Steps

1. **Immediate**: Use current survey system for patient intake
2. **Phase 2**: Add NeurOptimal data import functionality
3. **Phase 3**: Real-time session monitoring
4. **Phase 4**: Neurable integration for mobile assessment

## Support

For integration questions:
- Mem0 API: docs.mem0.ai
- Zengar Institute: zengar.com
- This app: [your contact]