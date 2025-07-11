#!/bin/bash

echo "🧠 Starting Brain Visualization Fix with Grok + CrewAI + MEM0"
echo "=================================================="
echo ""
echo "This will analyze the 'scene or camera not available' error"
echo "and provide a comprehensive fix using Grok's AI capabilities."
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "grok_crew_venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv grok_crew_venv
fi

# Activate virtual environment
source grok_crew_venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -q --upgrade pip
pip install -q crewai langchain-community openai mem0ai

echo ""
echo "🚀 Launching Grok analysis..."
echo ""

# Run the analysis
python fix_brain_viz_with_grok.py

echo ""
echo "✅ Analysis complete! Check the generated reports."