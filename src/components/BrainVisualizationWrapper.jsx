import React, { useState, useEffect } from 'react';
import PersonalizedThreeBrain from './PersonalizedThreeBrain';
import SimpleBrainVisualization from './SimpleBrainVisualization';

export default function BrainVisualizationWrapper({ assessmentResults, brainImpacts }) {
  const [useSimpleVersion, setUseSimpleVersion] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Check if threebrain library fails to load after 10 seconds
    const timeout = setTimeout(() => {
      if (!window.threeBrain) {
        console.log('Falling back to simple brain visualization');
        setUseSimpleVersion(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  // Listen for errors from PersonalizedThreeBrain
  useEffect(() => {
    const handleError = (event) => {
      if (event.detail && event.detail.fallbackToSimple) {
        setUseSimpleVersion(true);
      }
    };

    window.addEventListener('brainVisualizationError', handleError);
    return () => window.removeEventListener('brainVisualizationError', handleError);
  }, []);

  if (useSimpleVersion) {
    return <SimpleBrainVisualization assessmentResults={assessmentResults} brainImpacts={brainImpacts} />;
  }

  return <PersonalizedThreeBrain assessmentResults={assessmentResults} brainImpacts={brainImpacts} />;
}