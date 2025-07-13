import React, { useState } from 'react';
import PropTypes from 'prop-types';

const BrainCanvas = ({ brainData, onRegionClick, selectedRegion }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Color mapping based on impact severity
  const getImpactColor = (severity) => {
    const colorMap = {
      severe: '#dc2626',    // red-600
      high: '#ea580c',      // orange-600
      moderate: '#f59e0b',  // amber-600
      mild: '#65a30d',      // lime-600
      normal: '#e5e7eb',    // gray-200
    };
    return colorMap[severity] || colorMap.normal;
  };

  // Get impact data for a specific region
  const getRegionData = (regionName) => {
    return brainData?.[regionName] || { severity: 'normal', impact: 0 };
  };

  // Handle region interactions
  const handleRegionClick = (regionName, event) => {
    event.stopPropagation();
    if (onRegionClick) {
      onRegionClick(regionName, getRegionData(regionName));
    }
  };

  const handleRegionHover = (regionName) => {
    setHoveredRegion(regionName);
  };

  const handleRegionLeave = () => {
    setHoveredRegion(null);
  };

  // SVG brain regions with anatomically accurate paths
  const brainRegions = {
    // Left hemisphere regions
    'Prefrontal Cortex': {
      path: 'M 150 100 Q 120 80, 100 100 Q 90 130, 100 160 L 120 180 L 150 180 Q 170 160, 170 130 Q 170 100, 150 100',
      side: 'left',
      label: { x: 125, y: 140 }
    },
    'Motor Cortex': {
      path: 'M 150 180 L 120 180 L 130 220 L 160 220 Q 170 200, 150 180',
      side: 'left',
      label: { x: 140, y: 200 }
    },
    'Sensory Cortex': {
      path: 'M 160 220 L 130 220 L 140 260 L 170 260 Q 180 240, 160 220',
      side: 'left',
      label: { x: 150, y: 240 }
    },
    'Parietal Cortex': {
      path: 'M 170 260 L 140 260 L 150 300 L 180 300 Q 190 280, 170 260',
      side: 'left',
      label: { x: 160, y: 280 }
    },
    'Temporal Lobe': {
      path: 'M 100 160 Q 90 130, 100 100 Q 80 120, 70 150 Q 70 180, 80 200 L 100 180 L 100 160',
      side: 'left',
      label: { x: 85, y: 150 }
    },
    'Occipital Lobe': {
      path: 'M 180 300 L 150 300 Q 140 320, 150 340 Q 170 340, 190 330 Q 190 310, 180 300',
      side: 'left',
      label: { x: 165, y: 320 }
    },
    'Hippocampus': {
      path: 'M 120 250 Q 110 240, 100 250 Q 100 270, 110 280 Q 120 280, 130 270 Q 130 250, 120 250',
      side: 'left',
      label: { x: 115, y: 265 }
    },
    'Amygdala': {
      path: 'M 110 230 Q 100 220, 90 230 Q 90 240, 100 250 Q 110 250, 120 240 Q 120 230, 110 230',
      side: 'left',
      label: { x: 105, y: 235 }
    },
    
    // Right hemisphere regions (mirrored)
    'Prefrontal Cortex Right': {
      path: 'M 350 100 Q 380 80, 400 100 Q 410 130, 400 160 L 380 180 L 350 180 Q 330 160, 330 130 Q 330 100, 350 100',
      side: 'right',
      label: { x: 375, y: 140 }
    },
    'Motor Cortex Right': {
      path: 'M 350 180 L 380 180 L 370 220 L 340 220 Q 330 200, 350 180',
      side: 'right',
      label: { x: 360, y: 200 }
    },
    'Sensory Cortex Right': {
      path: 'M 340 220 L 370 220 L 360 260 L 330 260 Q 320 240, 340 220',
      side: 'right',
      label: { x: 350, y: 240 }
    },
    'Parietal Cortex Right': {
      path: 'M 330 260 L 360 260 L 350 300 L 320 300 Q 310 280, 330 260',
      side: 'right',
      label: { x: 340, y: 280 }
    },
    'Temporal Lobe Right': {
      path: 'M 400 160 Q 410 130, 400 100 Q 420 120, 430 150 Q 430 180, 420 200 L 400 180 L 400 160',
      side: 'right',
      label: { x: 415, y: 150 }
    },
    'Occipital Lobe Right': {
      path: 'M 320 300 L 350 300 Q 360 320, 350 340 Q 330 340, 310 330 Q 310 310, 320 300',
      side: 'right',
      label: { x: 335, y: 320 }
    },
    'Hippocampus Right': {
      path: 'M 380 250 Q 390 240, 400 250 Q 400 270, 390 280 Q 380 280, 370 270 Q 370 250, 380 250',
      side: 'right',
      label: { x: 385, y: 265 }
    },
    'Amygdala Right': {
      path: 'M 390 230 Q 400 220, 410 230 Q 410 240, 400 250 Q 390 250, 380 240 Q 380 230, 390 230',
      side: 'right',
      label: { x: 395, y: 235 }
    },
    
    // Central structures
    'Thalamus': {
      path: 'M 240 220 Q 220 210, 200 220 Q 200 240, 220 250 L 250 250 Q 270 240, 270 220 Q 250 210, 240 220',
      side: 'center',
      label: { x: 235, y: 230 }
    },
    'Hypothalamus': {
      path: 'M 230 250 L 220 250 Q 210 260, 220 270 L 250 270 Q 260 260, 250 250 L 230 250',
      side: 'center',
      label: { x: 235, y: 260 }
    },
    'Brain Stem': {
      path: 'M 240 270 L 220 270 Q 210 280, 210 300 L 210 340 Q 220 350, 240 350 Q 260 350, 270 340 L 270 300 Q 270 280, 260 270 L 240 270',
      side: 'center',
      label: { x: 240, y: 310 }
    },
    'Cerebellum': {
      path: 'M 240 350 Q 220 350, 210 340 Q 200 350, 200 370 Q 210 390, 240 390 Q 270 390, 280 370 Q 280 350, 270 340 Q 260 350, 240 350',
      side: 'center',
      label: { x: 240, y: 370 }
    },
    'Corpus Callosum': {
      path: 'M 200 200 Q 240 190, 280 200 Q 280 210, 270 220 L 250 220 L 220 220 Q 200 210, 200 200',
      side: 'center',
      label: { x: 240, y: 205 }
    },
    'Anterior Cingulate Cortex': {
      path: 'M 240 180 Q 220 170, 200 180 Q 200 190, 210 200 L 270 200 Q 280 190, 280 180 Q 260 170, 240 180',
      side: 'center',
      label: { x: 240, y: 185 }
    },
    'Insula': {
      path: 'M 180 200 Q 170 190, 160 200 Q 160 220, 170 230 Q 180 230, 190 220 Q 190 200, 180 200',
      side: 'left',
      label: { x: 175, y: 215 }
    },
    'Insula Right': {
      path: 'M 320 200 Q 330 190, 340 200 Q 340 220, 330 230 Q 320 230, 310 220 Q 310 200, 320 200',
      side: 'right',
      label: { x: 325, y: 215 }
    }
  };

  return (
    <div className="brain-canvas-container">
      <svg
        width="500"
        height="450"
        viewBox="0 0 500 450"
        className="brain-svg"
        style={{ backgroundColor: '#f9fafb', borderRadius: '8px' }}
      >
        {/* Brain outline */}
        <path
          d="M 250 50 Q 150 50, 100 100 Q 50 150, 50 250 Q 50 350, 100 400 Q 150 430, 250 430 Q 350 430, 400 400 Q 450 350, 450 250 Q 450 150, 400 100 Q 350 50, 250 50"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="2"
          opacity="0.5"
        />
        
        {/* Render brain regions */}
        {Object.entries(brainRegions).map(([regionName, regionInfo]) => {
          const regionData = getRegionData(regionName);
          const isSelected = selectedRegion === regionName;
          const isHovered = hoveredRegion === regionName;
          
          return (
            <g key={regionName}>
              <path
                d={regionInfo.path}
                fill={getImpactColor(regionData.severity)}
                stroke={isSelected ? '#1f2937' : '#6b7280'}
                strokeWidth={isSelected ? '3' : '1'}
                opacity={isHovered ? 0.8 : 0.9}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={(e) => handleRegionClick(regionName, e)}
                onMouseEnter={() => handleRegionHover(regionName)}
                onMouseLeave={handleRegionLeave}
              />
              
              {/* Show labels on hover */}
              {isHovered && (
                <text
                  x={regionInfo.label.x}
                  y={regionInfo.label.y}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#1f2937"
                  textAnchor="middle"
                  pointerEvents="none"
                  style={{
                    filter: 'drop-shadow(0 0 3px white)'
                  }}
                >
                  {regionName}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Legend */}
        <g transform="translate(20, 20)">
          <text x="0" y="0" fontSize="14" fontWeight="bold" fill="#1f2937">
            Impact Severity
          </text>
          {Object.entries({
            severe: 'Severe',
            high: 'High',
            moderate: 'Moderate',
            mild: 'Mild',
            normal: 'Normal'
          }).map(([key, label], index) => (
            <g key={key} transform={`translate(0, ${20 + index * 20})`}>
              <rect
                x="0"
                y="0"
                width="15"
                height="15"
                fill={getImpactColor(key)}
                stroke="#6b7280"
                strokeWidth="1"
              />
              <text x="20" y="12" fontSize="12" fill="#4b5563">
                {label}
              </text>
            </g>
          ))}
        </g>
        
        {/* Tooltip for hovered region */}
        {hoveredRegion && (
          <g transform={`translate(${brainRegions[hoveredRegion].label.x}, ${brainRegions[hoveredRegion].label.y + 20})`}>
            <rect
              x="-60"
              y="-5"
              width="120"
              height="30"
              fill="white"
              stroke="#6b7280"
              strokeWidth="1"
              rx="4"
              opacity="0.95"
            />
            <text
              x="0"
              y="5"
              fontSize="11"
              fill="#1f2937"
              textAnchor="middle"
            >
              {hoveredRegion}
            </text>
            <text
              x="0"
              y="18"
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
            >
              {getRegionData(hoveredRegion).severity} impact
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

BrainCanvas.propTypes = {
  brainData: PropTypes.objectOf(PropTypes.shape({
    severity: PropTypes.oneOf(['severe', 'high', 'moderate', 'mild', 'normal']),
    impact: PropTypes.number
  })),
  onRegionClick: PropTypes.func,
  selectedRegion: PropTypes.string
};

BrainCanvas.defaultProps = {
  brainData: {},
  onRegionClick: null,
  selectedRegion: null
};

export default BrainCanvas;