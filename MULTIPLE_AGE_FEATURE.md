# Multiple Age Period Selection Feature

## Overview
Enhanced the ACEs questionnaire to allow users to select multiple age periods when trauma occurred, providing more accurate brain impact assessments for chronic or recurring trauma.

## What Changed

### Previous Behavior
- Users could only select ONE age period per trauma
- Limited accuracy for chronic trauma spanning years
- Underestimated impact of early + repeated exposure

### New Behavior
- Users can select MULTIPLE age periods
- Clear instruction: "Select all that apply"
- Visual feedback with purple highlighting and checkmarks
- "Continue" button shows count of selected periods

## Technical Implementation

### UI Changes
```jsx
// Multiple selection with visual feedback
<button className={`${
  selectedAges.includes(range.value)
    ? 'bg-purple-600/20 border-purple-500/50 ring-2 ring-purple-500/30'
    : 'bg-white/5 hover:bg-white/10 border-white/10'
}`}>
```

### Data Structure
```javascript
// Old: Single age string
ageData: { 'emotional_abuse': '6-8' }

// New: Array of ages
ageData: { 'emotional_abuse': ['0-2', '3-5', '6-8'] }
```

### Impact Calculation
- System uses the HIGHEST multiplier from selected periods
- Example: Ages 0-2 (3.5x) + Ages 6-8 (2.0x) = Uses 3.5x
- Reflects neuroscience research on critical periods

## Why This Matters

1. **Chronic Trauma**: Many ACEs span multiple developmental stages
2. **Critical Periods**: Early childhood (0-5) has higher vulnerability
3. **Accurate Assessment**: Better reflects real trauma patterns
4. **Research Alignment**: Matches how trauma impacts developing brains

## User Experience

1. Answer "Yes" to trauma question
2. See "When did this happen? (Select all that apply)"
3. Click multiple age ranges (highlighted in purple)
4. Click "Continue (X age periods selected)"
5. Continue to frequency question

## Live URL
https://brain-visualization-app.vercel.app/

This enhancement significantly improves the accuracy of brain impact calculations, especially for users who experienced trauma across multiple developmental periods.