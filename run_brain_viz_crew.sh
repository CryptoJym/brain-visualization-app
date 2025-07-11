#!/bin/bash

echo "🚀 Brain Visualization Deployment Fix Crew"
echo "========================================"
echo ""

# Check for Python and required packages
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "crew_venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv crew_venv
fi

# Activate virtual environment
source crew_venv/bin/activate

# Install required packages
echo "📦 Installing required packages..."
pip install -q --upgrade pip
pip install -q crewai langchain-anthropic mem0ai

# Set up environment variables
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"

# Run the crew
echo ""
echo "🧠 Starting CrewAI agents..."
echo ""
python3 setup_brain_viz_crew.py

echo ""
echo "✅ Crew work completed!"
echo ""
echo "Next steps:"
echo "1. Review brain_viz_deployment_fix.md for findings"
echo "2. Apply recommended fixes"
echo "3. Redeploy to Vercel"