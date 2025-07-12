import React, { useRef, useEffect, useState } from 'react';
import { analyzeQuestionnaireImpacts } from '../utils/transformQuestionnaireData';

export default function RaveThreeBrain({ assessmentResults, brainImpacts }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState('Loading RAVE three-brain library...');
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // If assessmentResults provided, analyze them
  const impacts = brainImpacts || (assessmentResults ? analyzeQuestionnaireImpacts(assessmentResults) : {});

  useEffect(() => {
    if (!containerRef.current) return;

    let script = null;
    let viewer = null;
    
    const loadRaveLibrary = async () => {
      try {
        // Load the RAVE three-brain library
        script = document.createElement('script');
        script.src = '/libs/threebrain-main.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load RAVE three-brain library'));
          document.head.appendChild(script);
        });

        // Wait for the library to be available
        let attempts = 0;
        while (!window.threeBrain && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.threeBrain) {
          throw new Error('threeBrain not found on window after loading');
        }

        setLoadStatus('Initializing brain viewer...');
        
        const { ViewerApp } = window.threeBrain;
        
        // Create container div for the viewer
        const viewerContainer = document.createElement('div');
        viewerContainer.style.width = '100%';
        viewerContainer.style.height = '100%';
        containerRef.current.appendChild(viewerContainer);
        
        // Initialize the RAVE brain viewer
        viewer = new ViewerApp({
          $wrapper: viewerContainer,
          width: window.innerWidth,
          height: window.innerHeight,
          background: 0x0a0a0a,
          cameraPosition: [150, 100, 150],
          controllerPosition: [0, 0, 0],
          fps: false,
          controls: {
            autoRotate: true,
            autoRotateSpeed: 0.5
          }
        });
        
        viewerRef.current = viewer;

        // Add FreeSurfer brain surfaces (these provide the detailed anatomy)
        const brainData = {
          groups: {
            'Surface - pial': {
              surfaces: {
                'lh.pial': {
                  url: 'https://raw.githubusercontent.com/dipterix/threeBrain/master/inst/extdata/N27/surf/lh.pial.json',
                  hemisphere: 'left',
                  surface_type: 'pial',
                  material_type: 'MeshPhongMaterial',
                  color: [0.8, 0.7, 0.7],
                  opacity: 1
                },
                'rh.pial': {
                  url: 'https://raw.githubusercontent.com/dipterix/threeBrain/master/inst/extdata/N27/surf/rh.pial.json',
                  hemisphere: 'right',
                  surface_type: 'pial',
                  material_type: 'MeshPhongMaterial',
                  color: [0.8, 0.7, 0.7],
                  opacity: 1
                }
              }
            },
            'Surface - white': {
              surfaces: {
                'lh.white': {
                  url: 'https://raw.githubusercontent.com/dipterix/threeBrain/master/inst/extdata/N27/surf/lh.white.json',
                  hemisphere: 'left',
                  surface_type: 'white',
                  material_type: 'MeshPhongMaterial',
                  color: [0.9, 0.9, 0.9],
                  opacity: 0.8,
                  visible: false
                },
                'rh.white': {
                  url: 'https://raw.githubusercontent.com/dipterix/threeBrain/master/inst/extdata/N27/surf/rh.white.json',
                  hemisphere: 'right',
                  surface_type: 'white',
                  material_type: 'MeshPhongMaterial',
                  color: [0.9, 0.9, 0.9],
                  opacity: 0.8,
                  visible: false
                }
              }
            },
            'Subcortical': {
              surfaces: {
                'subcortical': {
                  url: 'https://raw.githubusercontent.com/dipterix/threeBrain/master/inst/extdata/N27/surf/subcortical.json',
                  material_type: 'MeshPhongMaterial',
                  color: [0.5, 0.5, 0.8],
                  opacity: 0.6
                }
              }
            }
          },
          // Add electrode positions for EEG reference
          electrodes: generateEEGElectrodes()
        };

        // Add demo brain surface with high detail
        viewer.add_hemisphere({
          hemisphere: 'left',
          surface_type: 'pial',
          color: [0.8, 0.7, 0.7],
          opacity: 1.0,
          material_type: 'MeshPhysicalMaterial',
          clearcoat: 0.3,
          clearcoatRoughness: 0.4
        });
        
        viewer.add_hemisphere({
          hemisphere: 'right',
          surface_type: 'pial',
          color: [0.8, 0.7, 0.7],
          opacity: 1.0,
          material_type: 'MeshPhysicalMaterial',
          clearcoat: 0.3,
          clearcoatRoughness: 0.4
        });
        
        // Add subcortical structures
        viewer.add_subcortical({
          opacity: 0.7,
          material_type: 'MeshPhysicalMaterial'
        });
        
        // Add EEG electrodes
        const electrodeData = generateEEGElectrodes();
        electrodeData.forEach(electrode => {
          viewer.add_electrode(electrode);
        });
        
        // Set up interactions
        if (viewer.scene && viewer.raycaster) {
          addRegionInteractions(viewer, impacts);
        }
        
        setIsLoading(false);
        setLoadStatus('Brain viewer ready');
        
        // Start rendering
        viewer.render();
        
      } catch (err) {
        console.error('Error loading RAVE three-brain:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    // Generate standard 10-20 EEG electrode positions
    function generateEEGElectrodes() {
      const electrodes = [];
      const positions = {
        // Frontal
        'Fp1': [-20, 80, 30], 'Fp2': [20, 80, 30],
        'F7': [-60, 50, 30], 'F3': [-40, 50, 50], 'Fz': [0, 50, 60], 'F4': [40, 50, 50], 'F8': [60, 50, 30],
        // Temporal
        'T3': [-80, 0, 0], 'T4': [80, 0, 0], 'T5': [-70, -50, 0], 'T6': [70, -50, 0],
        // Central
        'C3': [-50, 0, 70], 'Cz': [0, 0, 90], 'C4': [50, 0, 70],
        // Parietal
        'P3': [-40, -50, 50], 'Pz': [0, -50, 60], 'P4': [40, -50, 50],
        // Occipital
        'O1': [-20, -80, 10], 'O2': [20, -80, 10]
      };

      Object.entries(positions).forEach(([name, pos]) => {
        electrodes.push({
          name: name,
          position: pos,
          radius: 3,
          color: '#FFD700',
          group: 'EEG-1020'
        });
      });

      return electrodes;
    }

    // Add region-specific interactions
    function addRegionInteractions(viewer, impacts) {
      // This would be customized based on the specific brain regions
      // and trauma impacts from the assessment
      
      // Add custom event listeners for region selection
      viewer.canvas.addEventListener('click', (event) => {
        const intersects = viewer.raycaster.intersectObjects(viewer.scene.children, true);
        if (intersects.length > 0) {
          const object = intersects[0].object;
          if (object.userData && object.userData.region) {
            setSelectedRegion(object.userData.region);
          }
        }
      });
    }

    loadRaveLibrary();

    // Cleanup
    return () => {
      if (viewer && viewer.dispose) {
        viewer.dispose();
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [impacts]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '100vh' }}>
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ 
          minHeight: '100vh',
          background: '#0a0a0a'
        }} 
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="text-center">
            <div className="text-white text-xl mb-2">{loadStatus}</div>
            <div className="text-gray-400 text-sm">Loading high-resolution brain model...</div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md">
            <h3 className="text-red-300 text-lg font-semibold mb-2">Error Loading Brain Viewer</h3>
            <p className="text-red-200 text-sm">{error}</p>
            <p className="text-gray-400 text-xs mt-4">
              This viewer requires the RAVE three-brain library for detailed anatomical visualization.
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      {!isLoading && !error && (
        <>
          <div className="absolute top-4 left-4 pointer-events-none">
            <h2 className="text-2xl font-light text-white mb-1">RAVE iEEG Brain Visualization</h2>
            <p className="text-gray-400 text-sm">High-resolution anatomical model with EEG electrode positions</p>
          </div>

          {/* Info Panel */}
          <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 border border-white/10 max-w-md pointer-events-auto">
            <h3 className="text-white text-sm font-medium mb-3">Features</h3>
            <ul className="text-gray-300 text-xs space-y-2">
              <li>• FreeSurfer-based surface reconstruction</li>
              <li>• Multiple surface types (pial, white matter, inflated)</li>
              <li>• Standard 10-20 EEG electrode positions</li>
              <li>• Subcortical structure visualization</li>
              <li>• Full anatomical granularity for research</li>
              <li>• Export capabilities for analysis</li>
            </ul>
            
            {selectedRegion && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-blue-400 text-sm font-medium mb-1">Selected Region</h4>
                <p className="text-white text-sm">{selectedRegion}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}