/**
 * NanoBanana API Service for AI-Generated Brain Visualizations
 * Uses the custom GCP Cloud Run service for medical image generation
 */

const NANOBANANA_API_URL = import.meta.env.VITE_NANOBANANA_API_URL;
const NANOBANANA_PROJECT_ID = import.meta.env.VITE_NANOBANANA_PROJECT_ID;

/**
 * Generate brain visualization image using NanoBanana API
 * @param {string} prompt - Detailed description of brain alterations
 * @param {Object} options - Generation options
 * @returns {Promise<string>} - Image URL or base64
 */
export const generateBrainImage = async (prompt, options = {}) => {
  if (!NANOBANANA_API_URL) {
    throw new Error('NanoBanana API URL not configured. Add VITE_NANOBANANA_API_URL to .env');
  }

  try {
    const requestBody = {
      prompt: prompt,
      project_id: NANOBANANA_PROJECT_ID,
      size: options.size || "1024x1024",
      quality: options.quality || "standard",
      n: options.n || 1,
      style: options.style || "natural",
      ...options
    };

    console.log('NanoBanana API Request:', { url: NANOBANANA_API_URL, prompt: prompt.substring(0, 100) + '...' });

    const response = await fetch(`${NANOBANANA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-ID': NANOBANANA_PROJECT_ID
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NanoBanana API error:', errorText);
      throw new Error(`NanoBanana API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('NanoBanana API Response:', data);

    // Handle different response formats
    if (data.image_url) {
      return data.image_url;
    }

    if (data.data && Array.isArray(data.data) && data.data[0]?.url) {
      return data.data[0].url;
    }

    if (data.url) {
      return data.url;
    }

    // Check for base64 encoded image
    if (data.image && data.image.startsWith('data:image/')) {
      return data.image;
    }

    // If response contains base64 without prefix
    if (data.image && data.image.length > 100) {
      return `data:image/png;base64,${data.image}`;
    }

    console.error('Unexpected response format from NanoBanana:', data);
    throw new Error('NanoBanana returned unexpected response format');

  } catch (error) {
    console.error('Failed to generate brain image with NanoBanana:', error);

    // Check if this is a CORS error
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.warn('NanoBanana CORS error detected. This is expected if the Cloud Run service is not deployed with CORS support.');
      console.warn('The placeholder image does not support CORS. Deploy the actual NanoBanana API to fix this.');
    }

    throw error;
  }
};

/**
 * Generate side-by-side brain comparison image
 * @param {Object} brainImpact - Brain region impact data
 * @param {string} baselineImageUrl - URL to baseline healthy brain image
 * @returns {Promise<string>} - Generated image URL
 */
export const generateComparisonImage = async (brainImpact, baselineImageUrl = null) => {
  const {
    regionName,
    impactPercentage,
    impactType, // 'volume_reduction' or 'hyperactivation'
    description
  } = brainImpact;

  const prompt = `Side-by-side brain comparison, anatomically accurate medical illustration.

LEFT: Healthy ${regionName} - normal size and shape
RIGHT: ${regionName} - ${impactType === 'volume_reduction' ? `smaller, reduced by ${Math.abs(impactPercentage)}%` : `larger, increased activity ${Math.abs(impactPercentage)}%`}

Clean medical diagram style. Label both sides. Simple arrows pointing to the ${regionName}.
Show brain cross-section. Clear, educational, anatomically correct.`;

  return generateBrainImage(prompt, {
    quality: "hd",
    style: "natural"
  });
};

/**
 * Generate prompts for all impacted brain regions
 * @param {Object} assessmentResults - Full assessment results with brainImpacts
 * @returns {Array} - Array of prompt objects for each region
 */
export const generateAllRegionPrompts = (assessmentResults) => {
  const { brainImpacts } = assessmentResults;
  const prompts = [];

  Object.entries(brainImpacts || {}).forEach(([regionName, data]) => {
    const impactType = data.totalImpact < 0 ? 'volume_reduction' : 'hyperactivation';
    const impactPercentage = data.totalImpact;

    prompts.push({
      regionName,
      impactPercentage,
      impactType,
      description: getRegionDescription(regionName, impactType, impactPercentage),
      priority: Math.abs(impactPercentage) // Higher impact = higher priority
    });
  });

  // Sort by priority (highest impact first)
  return prompts.sort((a, b) => b.priority - a.priority);
};

/**
 * Get detailed description of brain region impact
 * @param {string} regionName - Name of brain region
 * @param {string} impactType - Type of impact
 * @param {number} impactPercentage - Percentage of impact
 * @returns {string} - Detailed description
 */
const getRegionDescription = (regionName, impactType, impactPercentage) => {
  const severity = Math.abs(impactPercentage) > 25 ? 'large' : Math.abs(impactPercentage) > 10 ? 'medium' : 'small';

  const descriptions = {
    'Prefrontal Cortex': {
      volume_reduction: `Front part of brain is smaller. Controls planning and decisions.`,
      hyperactivation: `Front part of brain is working overtime.`
    },
    'Amygdala': {
      volume_reduction: `Emotion center is smaller.`,
      hyperactivation: `Emotion center is larger and more active. Processes fear and threats.`
    },
    'Hippocampus': {
      volume_reduction: `Memory center is smaller. ${severity} size reduction.`,
      hyperactivation: `Memory center is more active than normal.`
    },
    'Anterior Cingulate Cortex': {
      volume_reduction: `Attention and emotion area is smaller.`,
      hyperactivation: `Attention and emotion area is working harder.`
    },
    'Corpus Callosum': {
      volume_reduction: `Connection between left and right brain is thinner.`,
      hyperactivation: `Connection between brain halves is more active.`
    }
  };

  return descriptions[regionName]?.[impactType] ||
    `${regionName} is ${impactType === 'volume_reduction' ? 'smaller' : 'more active'} (${Math.abs(impactPercentage)}% change).`;
};
