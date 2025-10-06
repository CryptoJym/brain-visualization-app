/**
 * OpenRouter API Service for AI-Generated Brain Visualizations
 * Uses image generation models to create personalized brain impact images
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Generate brain visualization image using OpenRouter
 * @param {string} prompt - Detailed description of brain alterations
 * @param {Object} options - Generation options
 * @returns {Promise<string>} - Image URL or base64
 */
export const generateBrainImage = async (prompt, options = {}) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = import.meta.env.VITE_IMAGE_MODEL;

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Add VITE_OPENROUTER_API_KEY to .env');
  }

  if (!model) {
    throw new Error('Image model not configured. Add VITE_IMAGE_MODEL to .env (e.g., the model ID from OpenRouter)');
  }

  try {
    // For image generation models, we need to use a different approach
    // DALL-E 3 requires specific parameters
    const isImageModel = model.includes('dall-e') || model.includes('stable-diffusion');

    const requestBody = isImageModel ? {
      model: model,
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      ...options
    } : {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      ...options
    };

    const apiUrl = isImageModel
      ? 'https://openrouter.ai/api/v1/images/generations'
      : OPENROUTER_API_URL;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Brain Visualization App'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API Response:', data);

    // For image generation models (DALL-E, Stable Diffusion)
    if (data.data && Array.isArray(data.data) && data.data[0]?.url) {
      console.log('Image URL from data array:', data.data[0].url);
      return data.data[0].url;
    }

    // For chat completion models
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in response:', data);
      throw new Error('No content in response. The model may not support image generation.');
    }

    // Check if content contains a URL (markdown format like ![](url))
    const markdownImageMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
    if (markdownImageMatch) {
      return markdownImageMatch[1];
    }

    // Check if content contains a plain URL
    const urlMatch = content.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
    if (urlMatch) {
      return urlMatch[1];
    }

    // Check if content is base64 image data
    if (content.startsWith('data:image/')) {
      return content;
    }

    // If content is just text with a URL somewhere
    if (content.includes('http')) {
      const urls = content.match(/https?:\/\/[^\s]+/g);
      if (urls && urls.length > 0) {
        return urls[0];
      }
    }

    // Return content as-is and let the component handle it
    console.warn('Unexpected content format, returning as-is:', content);
    return content;
  } catch (error) {
    console.error('Failed to generate brain image:', error);
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

  return generateBrainImage(prompt);
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
