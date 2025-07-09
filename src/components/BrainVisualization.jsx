import React, { useState } from 'react';
import AnatomicalBrainVisualization from './AnatomicalBrainVisualization';
import { brainRegions } from '../utils/traumaBrainMapping';

function BrainVisualization() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Example impacts for general exploration
  const exampleImpacts = {
    amygdala: {
      traumaTypes: ['physical_abuse', 'emotional_abuse'],
      ageRanges: ['4-6', '10-12'],
      impactStrength: 0.9
    },
    hippocampus: {
      traumaTypes: ['chronic_stress', 'neglect'],
      ageRanges: ['0-3', '7-9'],
      impactStrength: 0.8
    },
    dlPFC: {
      traumaTypes: ['emotional_neglect'],
      ageRanges: ['throughout'],
      impactStrength: 0.7
    },
    ACC: {
      traumaTypes: ['physical_abuse'],
      ageRanges: ['7-9'],
      impactStrength: 0.6
    },
    insula: {
      traumaTypes: ['medical_trauma'],
      ageRanges: ['4-6'],
      impactStrength: 0.5
    }
  };
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light text-white mb-2">
            Neuroscience of Adversity
          </h1>
          <p className="text-gray-400">
            Explore how childhood experiences shape brain development
          </p>
        </div>
      </div>
      
      {/* Main visualization */}
      <div className="w-full h-full">
        <AnatomicalBrainVisualization 
          brainImpacts={exampleImpacts}
        />
      </div>
      
      {/* Information Panel */}
      <div className="absolute top-24 left-6 w-96 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-medium text-white mb-4">Understanding Brain Development</h2>
          
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h3 className="text-white font-medium mb-2">How ACEs Affect the Brain</h3>
              <p>
                Adverse Childhood Experiences (ACEs) can significantly impact brain development, 
                particularly during critical periods when specific regions are maturing.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Key Brain Regions</h3>
              <ul className="space-y-2">
                <li>
                  <strong className="text-white">Amygdala:</strong> Threat detection and fear processing
                </li>
                <li>
                  <strong className="text-white">Hippocampus:</strong> Memory formation and stress regulation
                </li>
                <li>
                  <strong className="text-white">Prefrontal Cortex:</strong> Executive function and emotion regulation
                </li>
                <li>
                  <strong className="text-white">Insula:</strong> Body awareness and empathy
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Developmental Windows</h3>
              <ul className="space-y-1">
                <li>• <strong className="text-white">0-3 years:</strong> Foundational architecture</li>
                <li>• <strong className="text-white">4-6 years:</strong> Emotional regulation systems</li>
                <li>• <strong className="text-white">7-12 years:</strong> Social and cognitive systems</li>
                <li>• <strong className="text-white">13-18 years:</strong> Executive function refinement</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400">
              Click on any brain region to learn more about its function and how trauma affects it.
            </p>
          </div>
        </div>
      </div>
      
      {/* Example Impacts Legend */}
      <div className="absolute bottom-6 left-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-medium text-white mb-3">Example Trauma Impacts</h3>
          <div className="space-y-2 text-xs text-gray-400">
            <p>This visualization shows example impacts including:</p>
            <ul className="ml-4 space-y-1">
              <li>• Physical and emotional abuse</li>
              <li>• Chronic stress and neglect</li>
              <li>• Medical trauma</li>
            </ul>
            <p className="mt-2 text-gray-500">
              Take the assessment for your personalized brain map
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrainVisualization;