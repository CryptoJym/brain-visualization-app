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

  const prompt = `Medical illustration showing side-by-side comparison of human brain regions.

LEFT SIDE: Healthy ${regionName} with normal structure and function
RIGHT SIDE: ${regionName} showing ${impactType === 'volume_reduction' ? 'structural volume reduction' : 'functional hyperactivation'} of ${Math.abs(impactPercentage)}%

Style: Clean medical textbook illustration, anatomically accurate, professional medical visualization.
Label both sides clearly.
Show cross-sectional view highlighting the ${regionName}.
Include subtle annotations pointing to key differences.
${description ? `Additional context: ${description}` : ''}

High quality, detailed, scientific accuracy, educational purpose.`;

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
  const severityMap = {
    severe: Math.abs(impactPercentage) > 45,
    significant: Math.abs(impactPercentage) > 25,
    moderate: Math.abs(impactPercentage) > 10,
    subtle: true
  };

  const severity = Object.keys(severityMap).find(key => severityMap[key]);

  const descriptions = {
    'Prefrontal Cortex': {
      volume_reduction: `Reduced gray matter density in executive control centers, affecting decision-making, impulse control, and emotional regulation. ${severity} structural changes visible in prefrontal regions.`,
      hyperactivation: `Overactive prefrontal circuits showing compensatory activation patterns in response to chronic stress.`
    },
    'Amygdala': {
      volume_reduction: `Amygdala showing altered structural integrity and reduced volume.`,
      hyperactivation: `Enlarged and hyperactive amygdala exhibiting heightened threat response and emotional reactivity. ${severity} functional changes in fear processing centers.`
    },
    'Hippocampus': {
      volume_reduction: `Hippocampal atrophy with ${severity} volume loss affecting memory consolidation and stress hormone regulation. Visible reduction in dentate gyrus and CA regions.`,
      hyperactivation: `Hyperactive hippocampal circuits showing altered memory processing patterns.`
    },
    'Anterior Cingulate Cortex': {
      volume_reduction: `ACC showing reduced volume in conflict monitoring and emotional regulation areas.`,
      hyperactivation: `Overactive ACC with heightened error detection and emotional conflict processing.`
    }
  };

  return descriptions[regionName]?.[impactType] ||
    `${impactType === 'volume_reduction' ? 'Structural volume reduction' : 'Functional hyperactivation'} in ${regionName} with ${severity} impact (${Math.abs(impactPercentage)}% change).`;
};
