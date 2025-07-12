import React, { useRef, useEffect, useState } from 'react';
import { Niivue } from '@niivue/niivue';

export default function NiiVueBrain() {
  const canvasRef = useRef(null);
  const nvRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [meshOpacity, setMeshOpacity] = useState(1.0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize NiiVue
    const nv = new Niivue({
      backColor: [0, 0, 0, 1],
      show3Dcrosshair: false,
      onLocationChange: (data) => {
        // Handle click events on brain regions
        console.log('Clicked location:', data);
      }
    });
    
    nvRef.current = nv;
    nv.attachToCanvas(canvasRef.current);

    // Load brain anatomy and regions
    loadBrainAnatomy(nv);

    return () => {
      nv.dispose();
    };
  }, []);

  async function loadBrainAnatomy(nv) {
    try {
      // Base brain anatomy (T1-weighted MRI)
      const anatomyUrl = 'https://niivue.github.io/niivue-demo-images/mni152.nii.gz';
      
      // Brain atlases with labeled regions
      const atlasUrl = 'https://niivue.github.io/niivue-demo-images/aal.nii.gz';
      
      // Load volumes
      await nv.loadVolumes([
        {
          url: anatomyUrl,
          colorMap: 'gray',
          opacity: 1,
          visible: true
        }
      ]);

      // Load meshes for specific regions relevant to trauma
      await loadTraumaRegions(nv);
      
      // Set optimal view
      nv.setSliceType(nv.sliceTypeRender);
      nv.setClipPlane([0, 0, 90, 90]);
      
    } catch (error) {
      console.error('Error loading brain data:', error);
    }
  }

  async function loadTraumaRegions(nv) {
    // Key regions affected by trauma
    const traumaRegions = [
      {
        name: 'Amygdala',
        color: [1, 0, 0, 0.7], // Red
        description: 'Fear processing center. Hyperactive in PTSD, leading to heightened fear responses.',
        mesh: 'amygdala'
      },
      {
        name: 'Hippocampus',
        color: [0, 1, 0, 0.7], // Green
        description: 'Memory formation. Can shrink from chronic stress, causing memory issues.',
        mesh: 'hippocampus'
      },
      {
        name: 'Prefrontal Cortex',
        color: [0, 0, 1, 0.7], // Blue
        description: 'Executive control. Underactive in trauma, affecting emotional regulation.',
        mesh: 'prefrontal'
      },
      {
        name: 'Anterior Cingulate Cortex',
        color: [1, 1, 0, 0.7], // Yellow
        description: 'Emotion regulation. Reduced volume in PTSD patients.',
        mesh: 'acc'
      }
    ];

    // Load mesh representations
    try {
      // These would be actual mesh files in a real implementation
      // For now, we'll use the built-in mesh generation
      const meshes = [];
      
      // Add sample meshes (in production, load actual FreeSurfer meshes)
      meshes.push({
        url: 'https://niivue.github.io/niivue-demo-images/BrainMesh_ICBM152.lh.mz3',
        rgba255: [200, 200, 200, 255],
        opacity: meshOpacity,
        visible: true
      });

      await nv.loadMeshes(meshes);
    } catch (error) {
      console.error('Error loading trauma region meshes:', error);
    }
  }

  function handleRegionClick(region) {
    setSelectedRegion(region);
    
    // Highlight the selected region
    if (nvRef.current) {
      // Update visualization to highlight the selected region
      console.log('Selected region:', region);
    }
  }

  function handleOpacityChange(value) {
    setMeshOpacity(value);
    if (nvRef.current && nvRef.current.meshes.length > 0) {
      nvRef.current.setMeshProperty(0, 'opacity', value);
    }
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Canvas for NiiVue */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ cursor: 'crosshair' }}
      />

      {/* Header */}
      <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-xl rounded-lg p-4 text-white border border-gray-800 max-w-md">
        <h1 className="text-2xl font-light mb-2">Trauma & The Brain</h1>
        <p className="text-sm text-gray-400">
          Interactive visualization showing how trauma affects key brain regions
        </p>
      </div>

      {/* Trauma Region Legend */}
      <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-xl rounded-lg p-4 text-white border border-gray-800 max-w-sm">
        <h3 className="text-lg font-medium mb-3">Key Regions Affected by Trauma</h3>
        
        <div className="space-y-3">
          <div 
            className="cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
            onClick={() => handleRegionClick('amygdala')}
          >
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="font-medium">Amygdala</span>
            </div>
            <p className="text-xs text-gray-400 ml-6">
              Fear center - Overactive in PTSD
            </p>
          </div>

          <div 
            className="cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
            onClick={() => handleRegionClick('hippocampus')}
          >
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="font-medium">Hippocampus</span>
            </div>
            <p className="text-xs text-gray-400 ml-6">
              Memory center - Can shrink from chronic stress
            </p>
          </div>

          <div 
            className="cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
            onClick={() => handleRegionClick('pfc')}
          >
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="font-medium">Prefrontal Cortex</span>
            </div>
            <p className="text-xs text-gray-400 ml-6">
              Executive control - Impaired regulation
            </p>
          </div>

          <div 
            className="cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
            onClick={() => handleRegionClick('acc')}
          >
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="font-medium">Anterior Cingulate</span>
            </div>
            <p className="text-xs text-gray-400 ml-6">
              Emotion regulation - Reduced volume
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-xl rounded-lg p-4 text-white border border-gray-800">
        <h3 className="text-sm font-medium mb-2">Controls</h3>
        
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Brain Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={meshOpacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full mt-1"
            />
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Click + drag to rotate</p>
            <p>• Scroll to zoom</p>
            <p>• Right-click + drag to pan</p>
          </div>
        </div>
      </div>

      {/* Selected Region Details */}
      {selectedRegion && (
        <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-xl rounded-lg p-4 text-white border border-gray-800 max-w-md">
          <h3 className="text-lg font-medium mb-2 capitalize">{selectedRegion}</h3>
          
          {selectedRegion === 'amygdala' && (
            <div className="text-sm space-y-2">
              <p className="text-gray-300">
                The amygdala is the brain's fear center. In trauma survivors:
              </p>
              <ul className="text-gray-400 text-xs space-y-1 ml-4">
                <li>• Becomes hyperactive, creating constant vigilance</li>
                <li>• Triggers fight-or-flight responses to non-threats</li>
                <li>• Creates emotional memories that are hard to forget</li>
                <li>• Can be calmed through therapy and mindfulness</li>
              </ul>
            </div>
          )}
          
          {selectedRegion === 'hippocampus' && (
            <div className="text-sm space-y-2">
              <p className="text-gray-300">
                The hippocampus handles memory formation. Trauma affects it by:
              </p>
              <ul className="text-gray-400 text-xs space-y-1 ml-4">
                <li>• Chronic stress can physically shrink this region</li>
                <li>• Impairs ability to form new memories properly</li>
                <li>• Causes intrusive memories and flashbacks</li>
                <li>• Can regenerate with proper treatment</li>
              </ul>
            </div>
          )}
          
          {selectedRegion === 'pfc' && (
            <div className="text-sm space-y-2">
              <p className="text-gray-300">
                The prefrontal cortex manages executive functions. In trauma:
              </p>
              <ul className="text-gray-400 text-xs space-y-1 ml-4">
                <li>• Becomes underactive, reducing emotional control</li>
                <li>• Impairs decision-making and planning abilities</li>
                <li>• Weakens ability to regulate the amygdala</li>
                <li>• Can be strengthened through cognitive therapy</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}