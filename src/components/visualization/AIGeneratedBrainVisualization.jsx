import React, { useState, useEffect, useMemo } from 'react';
import * as nanoBanana from '../../services/nanoBananaImageGen';
import * as openRouter from '../../services/openRouterImageGen';
import ApiKeyAlert from '../ApiKeyAlert';

// Determine which service to use based on environment configuration
const NANOBANANA_AVAILABLE = !!import.meta.env.VITE_NANOBANANA_API_URL;

// Use NanoBanana as primary, OpenRouter as fallback
const imageService = NANOBANANA_AVAILABLE ? nanoBanana : openRouter;

/**
 * AI-Generated Brain Visualization
 * Uses NanoBanana (primary) or OpenRouter (fallback) to create personalized medical illustrations
 * showing brain impacts based on ACE assessment results
 */
const AIGeneratedBrainVisualization = ({ assessmentResults }) => {
  const [generatedImages, setGeneratedImages] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Get all region prompts sorted by severity
  const regionPrompts = useMemo(() => {
    return imageService.generateAllRegionPrompts(assessmentResults);
  }, [assessmentResults]);

  // Generate images for all impacted regions
  const generateAllImages = async () => {
    setIsGenerating(true);
    setError(null);
    const images = {};
    let activeFallback = usingFallback;

    for (const region of regionPrompts) {
      setCurrentRegion(region.regionName);

      try {
        // Try primary service (NanoBanana or OpenRouter based on config)
        const service = activeFallback ? openRouter : imageService;
        const imageUrl = await service.generateComparisonImage({
          regionName: region.regionName,
          impactPercentage: region.impactPercentage,
          impactType: region.impactType,
          description: region.description
        });

        images[region.regionName] = {
          url: imageUrl,
          impact: region.impactPercentage,
          type: region.impactType,
          description: region.description
        };

        setGeneratedImages({ ...images });
      } catch (err) {
        console.error(`Failed to generate image for ${region.regionName}:`, err);

        // Check if this is a CORS error and NanoBanana is configured
        if (NANOBANANA_AVAILABLE && !activeFallback && (err.message.includes('Failed to fetch') || err.name === 'TypeError')) {
          console.warn('⚠️ CORS error detected. Falling back to OpenRouter for image generation.');
          setUsingFallback(true);
          activeFallback = true;

          // Retry this region with OpenRouter
          try {
            const imageUrl = await openRouter.generateComparisonImage({
              regionName: region.regionName,
              impactPercentage: region.impactPercentage,
              impactType: region.impactType,
              description: region.description
            });

            images[region.regionName] = {
              url: imageUrl,
              impact: region.impactPercentage,
              type: region.impactType,
              description: region.description
            };

            setGeneratedImages({ ...images });
            continue; // Success with fallback, continue to next region
          } catch (fallbackErr) {
            console.error(`Fallback to OpenRouter also failed for ${region.regionName}:`, fallbackErr);
            setError(`Failed to generate visualization for ${region.regionName}`);
            break;
          }
        }

        setError(`Failed to generate visualization for ${region.regionName}`);
        break;
      }
    }

    setIsGenerating(false);
    setCurrentRegion(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-light text-white">
          AI-Generated Brain Impact Visualization
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Personalized medical illustrations showing structural and functional changes
          in your brain regions based on your ACE assessment results.
        </p>
        <p className="text-xs text-gray-500">
          Powered by {usingFallback ? 'OpenRouter (Fallback)' : (NANOBANANA_AVAILABLE ? 'NanoBanana AI' : 'OpenRouter')}
        </p>
        {usingFallback && NANOBANANA_AVAILABLE && (
          <p className="text-xs text-yellow-500">
            ⚠️ Using fallback due to CORS. Deploy NanoBanana API to enable direct service.
          </p>
        )}
      </div>

      {/* API Key Configuration Alert */}
      <ApiKeyAlert featureName="AI Brain Visualizations" />

      {/* Generate Button */}
      {Object.keys(generatedImages).length === 0 && !isGenerating && (
        <div className="flex justify-center">
          <button
            onClick={generateAllImages}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Generate Personalized Brain Visualizations
          </button>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
          <p className="text-white text-lg">Generating visualization...</p>
          {currentRegion && (
            <p className="text-gray-400 mt-2">
              Creating comparison for: <span className="text-purple-400">{currentRegion}</span>
            </p>
          )}
          <p className="text-gray-500 text-sm mt-4">
            This may take a minute as we generate detailed medical illustrations
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={generateAllImages}
            className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Generated Images Grid */}
      {Object.keys(generatedImages).length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">
              {Object.keys(generatedImages).length} of {regionPrompts.length} regions visualized
            </p>
            {!isGenerating && Object.keys(generatedImages).length < regionPrompts.length && (
              <button
                onClick={generateAllImages}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm"
              >
                Generate Remaining
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(generatedImages).map(([regionName, data]) => (
              <div
                key={regionName}
                className="relative group cursor-pointer"
                onClick={() => setSelectedRegion(regionName)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
                  {/* Image */}
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <img
                      src={data.url}
                      alt={`${regionName} comparison`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIExvYWRpbmc8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-light text-white">{regionName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        data.type === 'volume_reduction'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-orange-500/20 text-orange-300'
                      }`}>
                        {data.impact > 0 ? '+' : ''}{data.impact.toFixed(1)}%
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2">
                      {data.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className={`w-2 h-2 rounded-full ${
                        data.type === 'volume_reduction' ? 'bg-blue-400' : 'bg-orange-400'
                      }`} />
                      <span>
                        {data.type === 'volume_reduction' ? 'Structural Volume Reduction' : 'Functional Hyperactivation'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Image Modal */}
      {selectedRegion && generatedImages[selectedRegion] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedRegion(null)}
        >
          <div
            className="relative max-w-6xl w-full bg-gray-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRegion(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>

            <div className="p-8">
              <h2 className="text-3xl font-light text-white mb-6">{selectedRegion}</h2>

              <img
                src={generatedImages[selectedRegion].url}
                alt={`${selectedRegion} detailed comparison`}
                className="w-full rounded-xl mb-6"
              />

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-lg ${
                    generatedImages[selectedRegion].type === 'volume_reduction'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-orange-500/20 text-orange-300'
                  }`}>
                    Impact: {generatedImages[selectedRegion].impact > 0 ? '+' : ''}
                    {generatedImages[selectedRegion].impact.toFixed(1)}%
                  </span>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  {generatedImages[selectedRegion].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium mb-2">AI-Generated Medical Illustrations</h4>
            <p className="text-sm text-gray-400">
              These visualizations are AI-generated representations based on your assessment results
              and current neuroscience research. They show side-by-side comparisons of healthy brain regions
              versus regions showing trauma-related alterations. For clinical evaluation, please consult
              a healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratedBrainVisualization;
