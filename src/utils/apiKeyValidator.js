/**
 * API Key Validator
 * Checks if required API keys are configured and provides helpful error messages
 */

export const API_KEYS = {
  ANTHROPIC: 'VITE_ANTHROPIC_API_KEY',
  MEM0: 'VITE_MEM0_API_KEY',
  OPENROUTER: 'VITE_OPENROUTER_API_KEY',
  IMAGE_MODEL: 'VITE_IMAGE_MODEL',
};

export const FEATURE_REQUIREMENTS = {
  'AI Brain Visualizations': [API_KEYS.OPENROUTER, API_KEYS.IMAGE_MODEL],
  'Conversational Assessment': [API_KEYS.ANTHROPIC],
  'Memory & Persistence': [API_KEYS.MEM0],
};

/**
 * Check if a specific API key is configured
 */
export const isKeyConfigured = (keyName) => {
  const value = import.meta.env[keyName];
  return value && value.trim() !== '';
};

/**
 * Get missing API keys for a feature
 */
export const getMissingKeysForFeature = (featureName) => {
  const requiredKeys = FEATURE_REQUIREMENTS[featureName] || [];
  return requiredKeys.filter(key => !isKeyConfigured(key));
};

/**
 * Check if a feature is available
 */
export const isFeatureAvailable = (featureName) => {
  const missingKeys = getMissingKeysForFeature(featureName);
  return missingKeys.length === 0;
};

/**
 * Get all configuration status
 */
export const getConfigurationStatus = () => {
  const status = {};

  for (const [feature, keys] of Object.entries(FEATURE_REQUIREMENTS)) {
    const missingKeys = keys.filter(key => !isKeyConfigured(key));
    status[feature] = {
      available: missingKeys.length === 0,
      missingKeys: missingKeys,
    };
  }

  return status;
};

/**
 * Get setup instructions for missing keys
 */
export const getSetupInstructions = (keyName) => {
  const instructions = {
    [API_KEYS.ANTHROPIC]: {
      url: 'https://console.anthropic.com/',
      steps: [
        'Sign up for an Anthropic account',
        'Navigate to API Keys section',
        'Create a new API key',
        'Add to .env file: VITE_ANTHROPIC_API_KEY=your-key-here',
      ],
    },
    [API_KEYS.OPENROUTER]: {
      url: 'https://openrouter.ai/',
      steps: [
        'Sign up for an OpenRouter account',
        'Go to Keys section in dashboard',
        'Generate a new API key',
        'Add to .env file: VITE_OPENROUTER_API_KEY=your-key-here',
        'Set VITE_IMAGE_MODEL=openai/dall-e-3',
      ],
    },
    [API_KEYS.MEM0]: {
      url: 'https://mem0.ai/',
      steps: [
        'Sign up for a Mem0 account',
        'Access your API dashboard',
        'Copy your API key',
        'Add to .env file: VITE_MEM0_API_KEY=your-key-here',
      ],
    },
    [API_KEYS.IMAGE_MODEL]: {
      url: 'https://openrouter.ai/docs',
      steps: [
        'Recommended: openai/dall-e-3',
        'Alternative: stability-ai/stable-diffusion-xl',
        'Add to .env file: VITE_IMAGE_MODEL=openai/dall-e-3',
      ],
    },
  };

  return instructions[keyName] || {
    url: '',
    steps: ['Check .env.example for configuration instructions'],
  };
};

/**
 * Generate a friendly error message for missing API keys
 */
export const generateErrorMessage = (featureName) => {
  const missingKeys = getMissingKeysForFeature(featureName);

  if (missingKeys.length === 0) {
    return null;
  }

  const keyNames = missingKeys.map(key => key.replace('VITE_', '')).join(', ');

  return {
    title: `${featureName} Unavailable`,
    message: `This feature requires API configuration. Missing: ${keyNames}`,
    action: 'Configure API Keys',
    keys: missingKeys,
  };
};

/**
 * Log configuration status on app startup
 */
export const logConfigurationStatus = () => {
  const status = getConfigurationStatus();

  console.group('🔧 API Configuration Status');

  for (const [feature, config] of Object.entries(status)) {
    if (config.available) {
      console.log(`✅ ${feature}: Configured`);
    } else {
      console.warn(`⚠️  ${feature}: Missing keys - ${config.missingKeys.map(k => k.replace('VITE_', '')).join(', ')}`);
    }
  }

  console.groupEnd();

  // Show setup guide if any keys are missing
  const allMissing = Object.values(status).some(config => !config.available);
  if (allMissing) {
    console.info('📖 See .env.example for setup instructions');
  }
};
