import React, { useState, useEffect } from 'react';

export default function NeurableIntegration({ onEEGData }) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [eegData, setEegData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Neurable MW75 electrode positions mapped to 10-20 system
  const neurableElectrodes = {
    'Ch1': { position: 'Fp1', region: 'frontal', description: 'Left prefrontal' },
    'Ch2': { position: 'Fp2', region: 'frontal', description: 'Right prefrontal' },
    'Ch3': { position: 'T3', region: 'temporal', description: 'Left temporal' },
    'Ch4': { position: 'T4', region: 'temporal', description: 'Right temporal' },
    'Ch5': { position: 'O1', region: 'occipital', description: 'Left occipital' },
    'Ch6': { position: 'O2', region: 'occipital', description: 'Right occipital' }
  };
  
  // Brain region to trauma correlation
  const traumaEEGMarkers = {
    frontal: {
      alpha: { range: [8, 12], traumaIndicator: 'reduced', description: 'Emotional regulation issues' },
      beta: { range: [13, 30], traumaIndicator: 'elevated', description: 'Hypervigilance' }
    },
    temporal: {
      theta: { range: [4, 7], traumaIndicator: 'elevated', description: 'Memory processing disruption' },
      gamma: { range: [30, 50], traumaIndicator: 'irregular', description: 'Sensory processing issues' }
    },
    occipital: {
      alpha: { range: [8, 12], traumaIndicator: 'asymmetric', description: 'Visual processing alterations' }
    }
  };

  // Simulate Neurable connection (in production, use their SDK)
  const connectToNeurable = async () => {
    setConnectionStatus('connecting');
    
    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus('connected');
      // In production: Initialize Neurable SDK here
      // const neurable = new NeurableSDK();
      // await neurable.connect();
    }, 2000);
  };

  // Start EEG recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Simulate EEG data collection
    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
      
      // Generate simulated EEG data (replace with real Neurable data)
      const simulatedData = generateSimulatedEEGData();
      setEegData(simulatedData);
      
      // Analyze for trauma markers
      const analysis = analyzeEEGForTrauma(simulatedData);
      if (onEEGData) {
        onEEGData(analysis);
      }
    }, 1000);
    
    // Store interval ID for cleanup
    return () => clearInterval(interval);
  };

  // Generate simulated EEG data (replace with real Neurable API)
  const generateSimulatedEEGData = () => {
    const data = {};
    
    Object.entries(neurableElectrodes).forEach(([channel, info]) => {
      data[channel] = {
        raw: Array.from({ length: 256 }, () => Math.random() * 100 - 50),
        powerBands: {
          delta: Math.random() * 30 + 10,
          theta: Math.random() * 20 + 5,
          alpha: Math.random() * 40 + 20,
          beta: Math.random() * 30 + 10,
          gamma: Math.random() * 20 + 5
        },
        coherence: Math.random(),
        asymmetry: Math.random() * 2 - 1
      };
    });
    
    return data;
  };

  // Analyze EEG data for trauma markers
  const analyzeEEGForTrauma = (data) => {
    const traumaIndicators = {
      regions: {},
      overallScore: 0,
      recommendations: []
    };
    
    // Analyze each channel
    Object.entries(data).forEach(([channel, channelData]) => {
      const electrode = neurableElectrodes[channel];
      const region = electrode.region;
      
      if (!traumaIndicators.regions[region]) {
        traumaIndicators.regions[region] = {
          score: 0,
          markers: []
        };
      }
      
      // Check for trauma markers in power bands
      const markers = traumaEEGMarkers[region];
      if (markers) {
        if (markers.alpha && channelData.powerBands.alpha < 25) {
          traumaIndicators.regions[region].markers.push({
            type: 'Reduced alpha',
            severity: 'moderate',
            description: markers.alpha.description
          });
          traumaIndicators.regions[region].score += 0.3;
        }
        
        if (markers.beta && channelData.powerBands.beta > 35) {
          traumaIndicators.regions[region].markers.push({
            type: 'Elevated beta',
            severity: 'high',
            description: markers.beta.description
          });
          traumaIndicators.regions[region].score += 0.4;
        }
      }
      
      // Check for asymmetry (trauma indicator)
      if (Math.abs(channelData.asymmetry) > 0.5) {
        traumaIndicators.regions[region].markers.push({
          type: 'Hemispheric asymmetry',
          severity: 'moderate',
          description: 'Imbalanced brain activity'
        });
        traumaIndicators.regions[region].score += 0.2;
      }
    });
    
    // Calculate overall trauma score
    const scores = Object.values(traumaIndicators.regions).map(r => r.score);
    traumaIndicators.overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Generate recommendations
    if (traumaIndicators.overallScore > 0.6) {
      traumaIndicators.recommendations.push('Consider neurofeedback therapy');
      traumaIndicators.recommendations.push('Practice mindfulness meditation');
    }
    if (traumaIndicators.regions.frontal?.score > 0.5) {
      traumaIndicators.recommendations.push('Cognitive behavioral therapy may help');
    }
    
    return traumaIndicators;
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      <h2 className="text-xl font-medium mb-4">Neurable EEG Integration</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Device Status:</span>
          <span className={`font-medium ${
            connectionStatus === 'connected' ? 'text-green-400' : 
            connectionStatus === 'connecting' ? 'text-yellow-400' : 
            'text-red-400'
          }`}>
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'connecting' ? 'Connecting...' :
             'Disconnected'}
          </span>
        </div>
        
        {connectionStatus === 'disconnected' && (
          <button
            onClick={connectToNeurable}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Connect Neurable MW75
          </button>
        )}
      </div>

      {/* Recording Controls */}
      {connectionStatus === 'connected' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg">EEG Recording</h3>
            {isRecording && (
              <span className="text-sm text-gray-400">
                Recording: {formatTime(recordingDuration)}
              </span>
            )}
          </div>
          
          <button
            onClick={() => isRecording ? setIsRecording(false) : startRecording()}
            className={`w-full px-4 py-2 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
      )}

      {/* Live EEG Data */}
      {eegData && isRecording && (
        <div className="space-y-4">
          <h3 className="text-lg mb-2">Live Brain Activity</h3>
          
          {/* Electrode readings */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(neurableElectrodes).map(([channel, info]) => {
              const data = eegData[channel];
              if (!data) return null;
              
              return (
                <div key={channel} className="bg-gray-800 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{info.position}</span>
                    <span className="text-xs text-gray-400">{info.description}</span>
                  </div>
                  
                  {/* Power band indicators */}
                  <div className="space-y-1">
                    {Object.entries(data.powerBands).map(([band, power]) => (
                      <div key={band} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-12">{band}:</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                            style={{ width: `${Math.min(power, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10">
                          {power.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Recording Instructions:</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Ensure Neurable MW75 is properly positioned on your head</li>
              <li>• Sit comfortably and try to minimize movement</li>
              <li>• Record for at least 2-3 minutes for accurate analysis</li>
              <li>• Your brain patterns will be analyzed for trauma markers</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}