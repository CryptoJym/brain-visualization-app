#!/bin/bash

# Brain Model Setup Script
# This script helps install the brain 3D model for the visualization

echo "🧠 Brain Model Setup"
echo "==================="
echo ""

MODEL_DIR="./public/models"
TARGET_FILE="$MODEL_DIR/brain-labeled.glb"

# Check if model already exists
if [ -f "$TARGET_FILE" ]; then
    echo "✅ Brain model already exists at $TARGET_FILE"
    ls -lh "$TARGET_FILE"
    exit 0
fi

# Check common download locations
DOWNLOADS_DIR="$HOME/Downloads"
POTENTIAL_FILES=(
    "$DOWNLOADS_DIR/brain-with-labeled-parts.glb"
    "$DOWNLOADS_DIR/brain_with_labeled_parts.glb"
    "$DOWNLOADS_DIR/brain-labeled.glb"
    "$DOWNLOADS_DIR/source.glb"
    "$DOWNLOADS_DIR/brain.glb"
)

echo "🔍 Searching for brain model in Downloads folder..."
echo ""

FOUND_FILE=""
for file in "${POTENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found: $file"
        FOUND_FILE="$file"
        break
    fi
done

if [ -n "$FOUND_FILE" ]; then
    echo ""
    echo "📦 Moving brain model to project..."
    cp "$FOUND_FILE" "$TARGET_FILE"
    echo "✅ Brain model installed successfully!"
    echo ""
    echo "📊 File size: $(ls -lh "$TARGET_FILE" | awk '{print $5}')"
    echo "📍 Location: $TARGET_FILE"
    echo ""
    echo "🚀 Next step: Restart your dev server (npm run dev)"
else
    echo "❌ No brain model found in Downloads folder"
    echo ""
    echo "📥 Download Instructions:"
    echo "=========================="
    echo ""
    echo "Option 1: Sketchfab (Recommended - Easy)"
    echo "1. Visit: https://sketchfab.com/3d-models/brain-with-labeled-parts-28c8971e11334e8b97a2a0d6235992e8"
    echo "2. Create free account (if needed)"
    echo "3. Click 'Download 3D Model'"
    echo "4. Select GLB format"
    echo "5. Save to Downloads folder"
    echo "6. Run this script again: ./setup-brain-model.sh"
    echo ""
    echo "OR"
    echo ""
    echo "Manual installation:"
    echo "1. Download the GLB file from Sketchfab"
    echo "2. Rename it to: brain-labeled.glb"
    echo "3. Move it to: $MODEL_DIR/"
    echo ""
    echo "See $MODEL_DIR/DOWNLOAD_INSTRUCTIONS.md for more details"
fi
