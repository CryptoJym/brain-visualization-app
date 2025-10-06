import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

/**
 * Creates a 3D text label for a brain region marker
 * Uses CSS3DRenderer for HTML-based labels in 3D space
 *
 * @param {string} text - Label text to display
 * @param {Object} position - {x, y, z} position in Three.js space
 * @param {Object} options - Styling options
 * @returns {CSS3DObject} - 3D label object
 */
export const createBrainLabel = (text, position, options = {}) => {
  const {
    fontSize = '12px',
    fontFamily = 'Inter, system-ui, -apple-system, sans-serif',
    color = '#ffffff',
    backgroundColor = 'rgba(0, 0, 0, 0.75)',
    padding = '4px 8px',
    borderRadius = '4px',
    offsetY = 0.3, // Position above marker
    maxWidth = '120px'
  } = options;

  // Create HTML element for label
  const labelDiv = document.createElement('div');
  labelDiv.className = 'brain-region-label';
  labelDiv.textContent = text;

  // Apply styles
  labelDiv.style.position = 'absolute';
  labelDiv.style.fontSize = fontSize;
  labelDiv.style.fontFamily = fontFamily;
  labelDiv.style.color = color;
  labelDiv.style.backgroundColor = backgroundColor;
  labelDiv.style.padding = padding;
  labelDiv.style.borderRadius = borderRadius;
  labelDiv.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  labelDiv.style.whiteSpace = 'nowrap';
  labelDiv.style.maxWidth = maxWidth;
  labelDiv.style.overflow = 'hidden';
  labelDiv.style.textOverflow = 'ellipsis';
  labelDiv.style.pointerEvents = 'none'; // Don't block mouse events
  labelDiv.style.userSelect = 'none';
  labelDiv.style.textAlign = 'center';
  labelDiv.style.lineHeight = '1.2';
  labelDiv.style.fontWeight = '500';
  labelDiv.style.letterSpacing = '0.01em';
  labelDiv.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
  labelDiv.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

  // Create CSS3D object
  const label = new CSS3DObject(labelDiv);

  // Position label above/beside the marker
  label.position.set(
    position.x,
    position.y + offsetY,
    position.z
  );

  // Scale to appropriate size for 3D scene
  const scale = 0.005;
  label.scale.set(scale, scale, scale);

  return label;
};

/**
 * Creates labels for all brain region markers
 *
 * @param {Array} regionNodes - Array of region node objects from enumerateRegionNodes
 * @param {Object} options - Global styling options for all labels
 * @returns {Array<CSS3DObject>} - Array of 3D label objects
 */
export const createAllBrainLabels = (regionNodes, options = {}) => {
  return regionNodes
    .filter(node => node.magnitude > 5) // Only show labels for significant impacts
    .map(node => {
      // Customize label color based on severity
      const labelOptions = {
        ...options,
        backgroundColor: getSeverityBackgroundColor(node.severity, node.polarity)
      };

      return createBrainLabel(node.name, node.position, labelOptions);
    });
};

/**
 * Get background color for label based on severity and polarity
 */
const getSeverityBackgroundColor = (severity, polarity) => {
  const opacities = {
    subtle: 0.6,
    notable: 0.7,
    moderate: 0.75,
    severe: 0.85
  };

  const opacity = opacities[severity] || 0.7;

  // Slight color tint based on polarity
  if (polarity === 'hyperactivation') {
    return `rgba(80, 20, 20, ${opacity})`; // Dark red tint
  } else {
    return `rgba(20, 40, 80, ${opacity})`; // Dark blue tint
  }
};

/**
 * Update label visibility based on camera distance
 * Fades labels in/out smoothly as camera moves
 *
 * @param {Array<CSS3DObject>} labels - Array of label objects
 * @param {THREE.Camera} camera - Three.js camera
 * @param {number} fadeDistance - Distance at which labels start fading (default: 5)
 */
export const updateLabelVisibility = (labels, camera, fadeDistance = 5) => {
  labels.forEach(label => {
    const distance = camera.position.distanceTo(label.position);

    // Fade based on distance
    let opacity = 1.0;
    if (distance > fadeDistance) {
      opacity = Math.max(0, 1 - (distance - fadeDistance) / fadeDistance);
    }

    label.element.style.opacity = opacity.toString();
  });
};

/**
 * Create simplified labels for mobile/low-power devices
 * Reduces number of labels and uses simpler styling
 *
 * @param {Array} regionNodes - Array of region node objects
 * @returns {Array<CSS3DObject>} - Array of simplified label objects
 */
export const createSimplifiedLabels = (regionNodes) => {
  // Only show top 8 most impacted regions on mobile
  const topRegions = regionNodes
    .filter(node => node.magnitude > 15)
    .slice(0, 8);

  return topRegions.map(node =>
    createBrainLabel(node.name, node.position, {
      fontSize: '10px',
      padding: '3px 6px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      offsetY: 0.2
    })
  );
};

/**
 * Helper to remove all labels from scene
 *
 * @param {THREE.Scene} cssScene - CSS3D scene containing labels
 */
export const removeAllLabels = (cssScene) => {
  const labelsToRemove = [];
  cssScene.traverse(object => {
    if (object instanceof CSS3DObject) {
      labelsToRemove.push(object);
    }
  });

  labelsToRemove.forEach(label => {
    cssScene.remove(label);
    if (label.element && label.element.parentNode) {
      label.element.parentNode.removeChild(label.element);
    }
  });
};

export default {
  createBrainLabel,
  createAllBrainLabels,
  updateLabelVisibility,
  createSimplifiedLabels,
  removeAllLabels
};
