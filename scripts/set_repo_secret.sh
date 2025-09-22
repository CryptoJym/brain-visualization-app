#!/bin/bash

# This script sets the VERCEL_PROJECT_ID secret for a GitHub repository.

# Check if gh is installed
if ! command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) could not be found. Please install it to continue."
    exit 1
fi

# Check for required arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <repo_name> <vercel_project_id>"
    exit 1
fi

REPO_NAME=$1
VERCEL_PROJECT_ID=$2

# Set repository secret
echo "Setting VERCEL_PROJECT_ID for repository $REPO_NAME..."
gh secret set VERCEL_PROJECT_ID --repo "$REPO_NAME" --body "$VERCEL_PROJECT_ID"

echo "Repository secret set successfully."
