#!/bin/bash

# This script sets the VERCEL_TOKEN and VERCEL_ORG_ID secrets for a GitHub organization.

# Check if gh is installed
if ! command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) could not be found. Please install it to continue."
    exit 1
fi

# Check for required arguments
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <org_name> <vercel_token> <vercel_org_id>"
    exit 1
fi

ORG_NAME=$1
VERCEL_TOKEN=$2
VERCEL_ORG_ID=$3

# Set organization secrets
echo "Setting VERCEL_TOKEN for organization $ORG_NAME..."
gh secret set VERCEL_TOKEN --org "$ORG_NAME" --body "$VERCEL_TOKEN"

echo "Setting VERCEL_ORG_ID for organization $ORG_NAME..."
gh secret set VERCEL_ORG_ID --org "$ORG_NAME" --body "$VERCEL_ORG_ID"

echo "Organization secrets set successfully."
