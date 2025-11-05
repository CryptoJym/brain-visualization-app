import React, { useState } from 'react';

export default function RealBrainViewer() {
  const [activeViewer, setActiveViewer] = useState('brainfacts');
  
  const viewers = {
    brainfacts: {
      name: 'BrainFacts 3D Brain',
      url: 'https://www.brainfacts.org/3d-brain',
      description: 'Interactive 3D brain with clickable regions. Click on Amygdala, Hippocampus, or Frontal Cortex to learn about trauma effects.'
    },
    scalable: {
      name: 'Scalable Brain Atlas',
      url: 'https://scalablebrainatlas.incf.org/human/NMM1103',
      description: 'Professional brain atlas with detailed anatomical regions. Search for amygdala, hippocampus, or prefrontal cortex.'
    },
    allen: {
      name: 'Allen Brain Atlas',
      url: 'https://atlas.brain-map.org/',
      description: 'Research-grade brain atlas from the Allen Institute.'
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-white/10 p-4">
        <h1 className="text-2xl font-light mb-2">Real Brain Anatomy Viewer</h1>
        <p className="text-gray-400 text-sm mb-4">
          These are actual medical/research brain visualization tools showing real anatomy
        </p>
        
        {/* Viewer selector */}
        <div className="flex gap-2">
          {Object.entries(viewers).map(([key, viewer]) => (
            <button
              key={key}
              onClick={() => setActiveViewer(key)}
              className={`px-4 py-2 rounded transition-colors ${
                activeViewer === key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {viewer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Viewer info */}
      <div className="bg-black/40 backdrop-blur-sm px-4 py-3 border-b border-white/10">
        <p className="text-sm text-gray-300">
          {viewers[activeViewer].description}
        </p>
      </div>

      {/* Iframe container */}
      <div className="flex-1 relative">
        <iframe
          key={activeViewer}
          src={viewers[activeViewer].url}
          className="w-full h-full border-0"
          allow="fullscreen"
          title={viewers[activeViewer].name}
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 border-t border-white/10 p-4">
        <h3 className="text-sm font-medium mb-2">Key Brain Regions for Trauma:</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-red-400 font-medium">Amygdala:</span>
            <p className="text-gray-400 text-xs mt-1">
              Fear center - Overactive in PTSD, triggers fight-or-flight
            </p>
          </div>
          <div>
            <span className="text-green-400 font-medium">Hippocampus:</span>
            <p className="text-gray-400 text-xs mt-1">
              Memory center - Can shrink from chronic stress, causes flashbacks
            </p>
          </div>
          <div>
            <span className="text-blue-400 font-medium">Prefrontal Cortex:</span>
            <p className="text-gray-400 text-xs mt-1">
              Control center - Underactive in trauma, impairs emotional regulation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}