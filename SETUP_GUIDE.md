# Brain Visualization App - Secure Setup Guide

## Overview

This app now includes:
- **Supabase Authentication**: Secure user accounts
- **Mem0 AI Memory**: Intelligent storage of assessment results
- **Saved Assessments**: View past results without retaking tests

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Once created, go to Settings → API
4. Copy your:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJS...`

### 2. Mem0 AI Setup

1. Go to [mem0.ai](https://mem0.ai) and sign up
2. Navigate to your dashboard
3. Copy your **API Key**

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MEM0_API_KEY=your_mem0_api_key
```

### 4. Supabase Database Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create assessments table (optional - for backup)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_data JSONB NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on assessments
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own assessments
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" ON assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON assessments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments" ON assessments
  FOR DELETE USING (auth.uid() = user_id);
```

## How It Works

### For Users:

1. **First Time**:
   - Click "Start Personalized Assessment"
   - Create an account (email + password)
   - Take the assessment
   - Results are automatically saved to Mem0

2. **Returning Users**:
   - Sign in with your account
   - Click "View Your Saved Assessments"
   - See all past assessments without retaking
   - View personalized insights based on patterns

### Data Security:

- **Authentication**: Handled by Supabase (SOC 2 compliant)
- **Memory Storage**: Mem0 AI (HIPAA compliant option available)
- **Encryption**: All data encrypted in transit and at rest
- **Privacy**: Each user's data is isolated and private

### Mem0 Features:

1. **Intelligent Memory**:
   - Remembers all your assessments
   - Identifies patterns over time
   - Provides personalized insights

2. **Natural Language Search**:
   - "What brain regions are most affected?"
   - "Show my trauma patterns"
   - "How has my brain changed over time?"

3. **Privacy Controls**:
   - Delete all memories with one click
   - Export your data anytime
   - Full GDPR compliance

## Verification Without Retaking Test

Now you can verify the system works by:

1. Creating an account
2. Taking the assessment once
3. Signing out and back in
4. Viewing your saved assessment
5. Seeing the exact same brain visualization

No need to retake the test - your results are securely stored and retrievable!

## Local Development

```bash
npm install
npm run dev
```

Then visit: http://localhost:5173

## Production Deployment

Add these environment variables to Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MEM0_API_KEY`

## Troubleshooting

If auth isn't working:
- Check your Supabase URL and anon key
- Ensure Supabase project is not paused
- Check browser console for errors

If Mem0 isn't saving:
- Verify your API key is correct
- Check you have credits in your Mem0 account
- Look for errors in browser console

## Demo Mode

The app works without configuration but:
- No authentication (no user accounts)
- No saved assessments
- Results stored only in browser localStorage