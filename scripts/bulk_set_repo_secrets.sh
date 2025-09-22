#!/bin/bash

# This script bulk-sets the VERCEL_PROJECT_ID secret for multiple GitHub repositories from a file.

# Check if gh is installed
if ! command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) could not be found. Please install it to continue."
    exit 1
fi

# Check for required arguments
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <input_file>"
    echo "Input file format: one repository per line, with format <repo_name> <vercel_project_id>"
    exit 1
fi

INPUT_FILE=$1

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Input file not found: $INPUT_FILE"
    exit 1
fi

# Loop through the input file and set repository secrets
while read -r REPO_NAME VERCEL_PROJECT_ID; do
    if [ -n "$REPO_NAME" ] && [ -n "$VERCEL_PROJECT_ID" ]; then
        echo "Setting VERCEL_PROJECT_ID for repository $REPO_NAME..."
        gh secret set VERCEL_PROJECT_ID --repo "$REPO_NAME" --body "$VERCEL_PROJECT_ID"
    fi
done < "$INPUT_FILE"

echo "Bulk repository secrets set successfully."
