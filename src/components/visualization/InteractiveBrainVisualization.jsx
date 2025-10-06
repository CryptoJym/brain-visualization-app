import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { enumerateRegionNodes, brainSystemsPalette } from '../../utils/brainRegionAtlas';
import createAnatomicalBrain, { createLimbicStructures } from '../../utils/anatomicalBrainGeometry';
import { createAllBrainLabels, updateLabelVisibility, removeAllLabels } from '../../utils/brainLabels';
import BrainLegend from './BrainLegend';

/**
 * Check browser compatibility for WebGL and required features
 * @returns {Object} - { compatible: boolean, reason?: string }
 */
const checkBrowserCompatibility = () => {
  // Check for WebGL support
  if (!window.WebGLRenderingContext) {
    return {
      compatible: false,
      reason: 'WebGL not supported by your browser'
    };
  }

  // Try to create a WebGL context
  const canvas = document.createElement('canvas');
  let gl;
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) {
    return {
      compatible: false,
      reason: 'Error creating WebGL context'
    };
  }

  if (!gl) {
    return {
      compatible: false,
      reason: 'WebGL not available in your browser'
    };
  }

  return { compatible: true };
};

/**
 * Detect if the user is on a mobile device
 * @returns {boolean}
 */
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detect if the user is on a touch-enabled device
 * @returns {boolean}
 */
const isTouchDevice = () => {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
};

/**
 * Detect device capabilities for performance optimization
 * @returns {Object} - Capability flags and device info
 */
const detectDeviceCapabilities = () => {
  const capabilities = {
    webGL2: !!window.WebGL2RenderingContext,
    touchDevice: isTouchDevice(),
    mobile: isMobileDevice(),
    highPerformance: false,
    lowMemory: false,
    gpuTier: 'medium',
    pixelRatio: window.devicePixelRatio || 1
  };

  // Try to detect GPU info for performance optimization
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      // Check for high-end desktop GPUs
      if (/NVIDIA|AMD|RTX|GTX|Radeon RX|Radeon Pro/i.test(renderer)) {
        capabilities.highPerformance = true;
        capabilities.gpuTier = 'high';
      }
      // Check for mobile/integrated GPUs (typically lower memory)
      else if (/Adreno|Mali|PowerVR|Intel|Iris/i.test(renderer)) {
        capabilities.lowMemory = true;
        capabilities.gpuTier = 'low';
      }

      // Store renderer info for debugging
      capabilities.renderer = renderer;
    }

    // Check max texture size as additional capability indicator
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (maxTextureSize >= 16384) {
      capabilities.highPerformance = true;
    }
  }

  return capabilities;
};

// Visible region markers - tiny pinpoint markers for precise anatomical location
const severityScale = (magnitude) => 0.008 + magnitude / 3000;

const magnitudeLabel = (impact) => {
  const abs = Math.abs(impact);
  if (abs > 45) return 'Severe';
  if (abs > 25) return 'Moderate';
  if (abs > 10) return 'Notable';
  return 'Subtle';
};

/**
 * Fallback component for browsers that don't support WebGL
 */
const WebGLFallback = ({ reason }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04010f',
        color: '#ffffff',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '2rem',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>
          3D Brain Visualization Unavailable
        </h2>
        <p style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
          {reason}
        </p>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1rem' }}>
          This visualization requires WebGL support. Please try:
        </p>
        <ul
          style={{
            textAlign: 'left',
            display: 'inline-block',
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.8'
          }}
        >
          <li>Using a modern browser (Chrome, Firefox, Safari, or Edge)</li>
          <li>Updating your browser to the latest version</li>
          <li>Enabling hardware acceleration in browser settings</li>
          <li>Updating your graphics drivers</li>
        </ul>
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          <strong>Note:</strong> Your assessment results are still available in text form above the visualization.
        </div>
      </div>
    </div>
  );
};

/**
 * Loading screen component with progress tracking
 */
const LoadingScreen = ({ progress = 0 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04010f',
        color: '#ffffff',
        zIndex: 1000,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '80%' }}>
        {/* Brain icon with pulsing animation */}
        <div
          style={{
            fontSize: '4rem',
            marginBottom: '1.5rem',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          🧠
        </div>

        <h2
          style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          Loading Brain Visualization
        </h2>

        {/* Progress bar container */}
        <div
          style={{
            width: '300px',
            maxWidth: '90vw',
            height: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '5px',
            margin: '0 auto 1rem',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Progress bar fill */}
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#8b5cf6',
              backgroundImage: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
            }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        {/* Progress percentage */}
        <div
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: '500'
          }}
        >
          {Math.round(progress)}%
        </div>

        {/* Loading tip */}
        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.5)',
            fontStyle: 'italic'
          }}
        >
          Preparing 3D neural pathways and anatomical structures...
        </p>
      </div>
    </div>
  );
};

/**
 * Error screen component with retry functionality
 */
const ErrorScreen = ({ message, onRetry }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04010f',
        color: '#ffffff',
        zIndex: 1000,
        padding: '2rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '2rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Error icon */}
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>

        <h2
          style={{
            fontSize: '1.5rem',
            marginBottom: '1rem',
            fontWeight: '600',
            color: '#ef4444'
          }}
        >
          Something Went Wrong
        </h2>

        <p
          style={{
            fontSize: '1rem',
            marginBottom: '2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}
        >
          {message || 'Failed to load brain visualization'}
        </p>

        {/* Retry button */}
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#7c3aed';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#8b5cf6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Try Again
          </button>
        )}

        <p
          style={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: '1.5'
          }}
        >
          If the problem persists, please try:
          <br />
          • Refreshing the page
          <br />
          • Checking your internet connection
          <br />
          • Using a different browser or device
        </p>
      </div>
    </div>
  );
};

/**
 * Keyboard shortcuts help panel
 */
const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
      onClick={onClose}
      role="dialog"
      aria-label="Keyboard shortcuts help"
      aria-modal="true"
    >
      <div
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff', margin: 0 }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
              lineHeight: 1
            }}
            aria-label="Close help panel"
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1rem', color: '#e0e0e0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', alignItems: 'start' }}>
            <div style={{ fontWeight: '600', color: '#8b5cf6', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              Arrow Keys
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Rotate camera view (Left/Right for horizontal, Up/Down for vertical movement)
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', alignItems: 'start' }}>
            <div style={{ fontWeight: '600', color: '#8b5cf6', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              + / =
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Zoom in (move camera closer)
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', alignItems: 'start' }}>
            <div style={{ fontWeight: '600', color: '#8b5cf6', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              - / _
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Zoom out (move camera farther)
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', alignItems: 'start' }}>
            <div style={{ fontWeight: '600', color: '#8b5cf6', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              R
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Reset camera to default view
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', alignItems: 'start' }}>
            <div style={{ fontWeight: '600', color: '#8b5cf6', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              ?
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Toggle this help panel
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            <strong style={{ color: '#8b5cf6' }}>Tip:</strong> You can also use your mouse to drag and rotate the 3D view, and scroll to zoom.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Create 3D anatomical orientation indicators
 * Shows Anterior/Posterior, Left/Right, Superior/Inferior axes
 */
const createOrientationIndicators = () => {
  const indicators = [];

  const directions = [
    { text: 'A', position: [0, 0, -2.8], color: '#ef4444', label: 'Anterior' },  // Front (red)
    { text: 'P', position: [0, 0, 2.8], color: '#3b82f6', label: 'Posterior' },  // Back (blue)
    { text: 'L', position: [-2.8, 0, 0], color: '#22c55e', label: 'Left' },      // Left (green)
    { text: 'R', position: [2.8, 0, 0], color: '#a855f7', label: 'Right' },      // Right (purple)
    { text: 'S', position: [0, 2.8, 0], color: '#eab308', label: 'Superior' },   // Top (yellow)
    { text: 'I', position: [0, -2.8, 0], color: '#ec4899', label: 'Inferior' }   // Bottom (pink)
  ];

  directions.forEach(dir => {
    const div = document.createElement('div');
    div.className = 'orientation-indicator';
    div.textContent = dir.text;
    div.title = dir.label;

    // Styling
    div.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    div.style.fontSize = '14px';
    div.style.fontWeight = '700';
    div.style.padding = '6px';
    div.style.borderRadius = '50%';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    div.style.color = dir.color;
    div.style.width = '28px';
    div.style.height = '28px';
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.style.border = `2px solid ${dir.color}`;
    div.style.boxShadow = `0 0 8px ${dir.color}40`;
    div.style.userSelect = 'none';
    div.style.pointerEvents = 'none';

    const indicator = new CSS3DObject(div);
    indicator.position.set(dir.position[0], dir.position[1], dir.position[2]);
    indicator.scale.set(0.004, 0.004, 0.004);

    indicators.push(indicator);
  });

  return indicators;
};

const InteractiveBrainVisualization = ({ assessmentResults }) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showStructural, setShowStructural] = useState(true);
  const [showFunctional, setShowFunctional] = useState(true);
  const [systemFilter, setSystemFilter] = useState('all');
  const [minimumMagnitude, setMinimumMagnitude] = useState(5);
  const [showCortex, setShowCortex] = useState(true);
  const [compatibilityError, setCompatibilityError] = useState(null);

  // Responsive design state - track if mobile view
  const [isMobileView, setIsMobileView] = useState(false);

  // Loading and error state management
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingError, setLoadingError] = useState(null);
  const retryCountRef = useRef(0);

  // Accessibility: High contrast mode
  const [highContrastMode, setHighContrastMode] = useState(false);

  // Accessibility: Keyboard shortcuts help panel
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // useMediaQuery effect - track screen size for responsive controls
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const regionNodes = useMemo(
    () => enumerateRegionNodes(assessmentResults?.brainImpacts || {}),
    [assessmentResults?.brainImpacts]
  );

  const systems = useMemo(() => {
    const unique = new Set();
    regionNodes.forEach(node => unique.add(node.system));
    return Array.from(unique);
  }, [regionNodes]);

  const summaryTotals = useMemo(() => {
    return regionNodes.reduce(
      (totals, node) => {
        if (node.polarity === 'hyperactivation') {
          totals.functional += 1;
        } else {
          totals.structural += 1;
        }
        return totals;
      },
      { structural: 0, functional: 0 }
    );
  }, [regionNodes]);

  // Reset camera to default view
  const handleResetView = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      camera.position.set(0, 0.5, 5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Retry loading on error
  const handleRetryLoad = () => {
    // Increment retry count
    retryCountRef.current += 1;

    // Reset error and loading states
    setLoadingError(null);
    setIsLoading(true);
    setLoadingProgress(0);

    // The useEffect will re-run when dependencies change
    // In this case, we're just resetting state to trigger re-initialization
    console.log(`Retry attempt ${retryCountRef.current}`);
  };

  const filteredNodes = useMemo(() => {
    return regionNodes.filter(node => {
      if (!showStructural && node.polarity === 'hypoactivity') {
        return false;
      }
      if (!showFunctional && node.polarity === 'hyperactivation') {
        return false;
      }
      if (systemFilter !== 'all' && node.system !== systemFilter) {
        return false;
      }
      if (node.magnitude < minimumMagnitude) {
        return false;
      }
      return true;
    });
  }, [regionNodes, showStructural, showFunctional, systemFilter, minimumMagnitude]);

  const topDrivers = useMemo(() => {
    if (!hoveredNode || !hoveredNode.hotspots) return [];
    return [...hoveredNode.hotspots]
      .sort((a, b) => Math.abs((b.impact ?? b.adjustedImpact ?? 0)) - Math.abs((a.impact ?? a.adjustedImpact ?? 0)))
      .slice(0, 3);
  }, [hoveredNode]);
  useEffect(() => {
    if (!mountRef.current) {
      return () => undefined;
    }

    // Check browser compatibility first
    const compatibility = checkBrowserCompatibility();
    if (!compatibility.compatible) {
      setCompatibilityError(compatibility.reason);
      return () => undefined;
    }

    // Detect device type and capabilities for optimized experience
    const isMobile = isMobileDevice();
    const isTouch = isTouchDevice();
    const deviceCapabilities = detectDeviceCapabilities();

    console.log('Device capabilities:', deviceCapabilities);

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#04010f');

    // Optimized camera for anatomical brain viewing
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 50);
    camera.position.set(0, 0.5, 5);

    // Optimize renderer settings based on device capabilities
    const renderer = new THREE.WebGLRenderer({
      antialias: !deviceCapabilities.lowMemory, // Disable antialiasing on low-end devices
      alpha: true,
      powerPreference: deviceCapabilities.highPerformance ? 'high-performance' : 'default'
    });

    // Adaptive pixel ratio for performance
    if (deviceCapabilities.highPerformance) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for high-end
    } else if (deviceCapabilities.lowMemory) {
      renderer.setPixelRatio(1); // Force 1x on low-end devices
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5x for medium
    }

    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Create CSS3D renderer for text labels
    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(width, height);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.left = '0';
    cssRenderer.domElement.style.pointerEvents = 'none'; // Allow clicks through to WebGL
    container.appendChild(cssRenderer.domElement);

    // CSS3D scene for labels (shares camera with WebGL scene)
    const cssScene = new THREE.Scene();

    // Enhanced orbit controls for smooth brain exploration
    // Adjust controls based on device type
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = isMobile ? 0.15 : 0.1; // Slightly more damping on mobile
    controls.rotateSpeed = isMobile ? 0.3 : 0.5; // Slower rotation on mobile for precision
    controls.zoomSpeed = isMobile ? 0.5 : 0.8; // Slower zoom on mobile
    controls.minDistance = 2.0;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI; // Allow full vertical rotation
    controls.minPolarAngle = 0;
    controls.enablePan = !isMobile; // Disable pan on mobile to avoid conflicts with touch gestures
    controls.panSpeed = 0.5;
    controls.target.set(0, 0, 0); // Look at center of brain

    // Touch-specific optimizations
    if (isTouch) {
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      };
    }

    controlsRef.current = controls;

    // Auto-framing function for optimal brain viewing
    const autoFrameBrain = () => {
      camera.position.set(0, 0.5, 5);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    // Initial auto-frame
    autoFrameBrain();

    // Much brighter lighting to see the brain structure
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 8, 10);
    const rimLight = new THREE.PointLight(0xa78bfa, 0.8, 50);
    rimLight.position.set(-7, 5, 8);
    const fillLight = new THREE.PointLight(0x60a5fa, 0.6, 50);
    fillLight.position.set(7, -3, -7);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(0, 0, -10);
    scene.add(ambientLight, keyLight, rimLight, fillLight, backLight);

    // Create anatomically accurate brain model (async)
    let anatomicalBrain = null;
    let limbicStructures = null;

    // Create loading manager for progress tracking
    const loadingManager = new THREE.LoadingManager();

    // Track loading progress
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      setLoadingProgress(progress);
      console.log(`Loading progress: ${Math.round(progress)}%`);
    };

    // Handle successful load completion
    loadingManager.onLoad = () => {
      console.log('✅ All assets loaded successfully');
      setIsLoading(false);
      setLoadingProgress(100);
    };

    // Handle loading errors
    loadingManager.onError = (url) => {
      console.error(`❌ Error loading asset: ${url}`);
      // Note: Brain model file needs to be downloaded from Sketchfab
      // See /public/models/DOWNLOAD_INSTRUCTIONS.md for details
      setLoadingError(`Brain model file not found. The file needs to be downloaded from Sketchfab - see /public/models/DOWNLOAD_INSTRUCTIONS.md`);
      setIsLoading(false);
    };

    // Load brain asynchronously with loading manager
    createAnatomicalBrain(loadingManager).then(brain => {
      anatomicalBrain = brain;
      anatomicalBrain.visible = showCortex;
      scene.add(anatomicalBrain);

      // Add limbic structures (amygdala, hippocampus) as children of brain for synchronized rotation
      limbicStructures = createLimbicStructures();
      anatomicalBrain.add(limbicStructures);

      // Optimize brain model materials for performance
      anatomicalBrain.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          if (child.material) {
            child.material.flatShading = true; // Faster rendering for complex meshes
          }
        }
      });

      // Add wireframe overlay after brain loads
      const wireframeGroup = new THREE.Group();
      wireframeGroup.visible = showCortex;
      anatomicalBrain.traverse((child) => {
        if (child.isMesh && child.geometry) {
          const wireframe = new THREE.LineSegments(
            new THREE.EdgesGeometry(child.geometry, 15),
            new THREE.LineBasicMaterial({
              color: 0x4a3f5e,
              transparent: true,
              opacity: 0.2,
              linewidth: 1
            })
          );
          wireframe.position.copy(child.position);
          wireframe.rotation.copy(child.rotation);
          wireframe.scale.copy(child.scale);
          wireframeGroup.add(wireframe);
        }
      });
      scene.add(wireframeGroup);
    }).catch(error => {
      console.error('Failed to load brain model:', error);
      setLoadingError(`Failed to load brain visualization: ${error.message}`);
      setIsLoading(false);
    });
    const regionGroup = new THREE.Group();
    const connectorGroup = new THREE.Group();
    const regionMeshes = [];

    // Create neural pathway disruptions between regions
    const pathwayGroup = new THREE.Group();

    filteredNodes.forEach((node, index) => {
      const radius = severityScale(node.magnitude);
      const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);

      // Clear color coding: Red/Orange for hyperactivation, Blue for hypoactivity
      // High contrast mode uses yellow/cyan for better visibility
      const isHyperactivation = node.polarity === 'hyperactivation';

      let primaryColor, emissiveColor;
      if (highContrastMode) {
        // High contrast colors for accessibility
        primaryColor = isHyperactivation ? new THREE.Color(0xffff00) : new THREE.Color(0x00ffff);
        emissiveColor = isHyperactivation ? new THREE.Color(0xffdd00) : new THREE.Color(0x00ddff);
      } else {
        // Standard colors
        primaryColor = isHyperactivation ? new THREE.Color(0xff4444) : new THREE.Color(0x4488ff);
        emissiveColor = isHyperactivation ? new THREE.Color(0xff6600) : new THREE.Color(0x2266cc);
      }

      const material = new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.35,
        flatShading: false, // Keep smooth shading for spheres
        metalness: 0.2,
        roughness: 0.4
      });
      const sphere = new THREE.Mesh(sphereGeometry, material);
      sphere.position.set(node.position[0], node.position[1], node.position[2]);
      sphere.userData = node;

      // Performance optimization: disable shadows (not used in this visualization)
      sphere.castShadow = false;
      sphere.receiveShadow = false;

      regionGroup.add(sphere);
      regionMeshes.push(sphere);

      // Subtle halo for affected regions
      const haloGeometry = new THREE.SphereGeometry(radius * 1.4, 24, 24);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide
      });
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      halo.position.copy(sphere.position);
      regionGroup.add(halo);

      // Neural pathway connections between related regions
      filteredNodes.forEach((targetNode, targetIndex) => {
        if (targetIndex <= index) return; // Avoid duplicate connections

        // Connect if regions share system or are functionally related
        const shouldConnect =
          node.system === targetNode.system ||
          (node.name.includes('Prefrontal') && targetNode.name.includes('Amygdala')) ||
          (node.name.includes('Hippocampus') && targetNode.name.includes('Prefrontal')) ||
          (node.name.includes('Amygdala') && targetNode.name.includes('Hippocampus'));

        if (shouldConnect) {
          // Create thick curved neural pathway
          const start = new THREE.Vector3(...node.position);
          const end = new THREE.Vector3(...targetNode.position);
          const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
          midpoint.add(new THREE.Vector3(0, 0.3, 0)); // Arc upward

          const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);

          // Create thick tube for pathway
          const pathwayIntensity = (node.magnitude + targetNode.magnitude) / 200;
          const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.015, 8, false);

          // Color based on disruption severity
          const pathwayColor = new THREE.Color().setHSL(
            0.05, // Red/orange hue
            0.9,
            0.5 - pathwayIntensity * 0.2
          );

          const pathwayMaterial = new THREE.MeshStandardMaterial({
            color: pathwayColor,
            emissive: pathwayColor,
            emissiveIntensity: 0.6 + pathwayIntensity * 0.4,
            transparent: true,
            opacity: 0.6 + pathwayIntensity * 0.3,
            roughness: 0.4,
            metalness: 0.2
          });

          const pathway = new THREE.Mesh(tubeGeometry, pathwayMaterial);
          pathway.userData = { baseOpacity: pathwayMaterial.opacity };
          pathwayGroup.add(pathway);
        }
      });
    });

    scene.add(pathwayGroup);

    scene.add(regionGroup);
    scene.add(connectorGroup);

    // Create 3D text labels for brain regions
    const labels = createAllBrainLabels(filteredNodes);
    labels.forEach(label => cssScene.add(label));

    // Create 3D anatomical orientation indicators
    const orientationIndicators = createOrientationIndicators();
    orientationIndicators.forEach(indicator => cssScene.add(indicator));

    let resilienceAura = null;
    if ((assessmentResults?.protectiveFactors?.length || 0) > 0) {
      const auraGeometry = new THREE.TorusGeometry(2.35, 0.08, 24, 96);
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.25
      });
      resilienceAura = new THREE.Mesh(auraGeometry, auraMaterial);
      resilienceAura.rotation.x = Math.PI / 2;
      scene.add(resilienceAura);
    }

    const pointer = new THREE.Vector2(999, 999);
    const raycaster = new THREE.Raycaster();
    const clock = new THREE.Clock();
    let hoverCache = null;
    let animationId = null;
    let pointerMoved = false; // Track if pointer has moved since last raycast

    const handlePointerMove = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      pointerMoved = true; // Flag that pointer moved
    };

    const handlePointerLeave = () => {
      pointer.x = 999;
      pointer.y = 999;
      hoverCache = null;
      setHoveredNode(null);
    };

    const handleResize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      camera.aspect = clientWidth / (clientHeight || 560);
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight || 560);
      cssRenderer.setSize(clientWidth, clientHeight || 560);
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handleResize);

    // Keyboard navigation for accessibility
    renderer.domElement.tabIndex = 0; // Make canvas focusable
    renderer.domElement.setAttribute('aria-label', 'Brain visualization 3D view. Use arrow keys to rotate, plus and minus to zoom, R to reset view.');

    const handleKeyDown = (event) => {
      const rotationSpeed = 0.05;
      const zoomSpeed = 0.2;

      switch(event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
          camera.lookAt(scene.position);
          break;
        case 'ArrowRight':
          event.preventDefault();
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotationSpeed);
          camera.lookAt(scene.position);
          break;
        case 'ArrowUp':
          event.preventDefault();
          camera.position.y += zoomSpeed;
          camera.lookAt(scene.position);
          break;
        case 'ArrowDown':
          event.preventDefault();
          camera.position.y -= zoomSpeed;
          camera.lookAt(scene.position);
          break;
        case '+':
        case '=':
          event.preventDefault();
          camera.position.multiplyScalar(0.9); // Zoom in
          break;
        case '-':
        case '_':
          event.preventDefault();
          camera.position.multiplyScalar(1.1); // Zoom out
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          // Reset camera to initial position
          camera.position.set(0, 2, 5);
          camera.lookAt(scene.position);
          controls.reset();
          break;
        case '?':
        case '/':
          if (event.shiftKey) { // '?' is Shift + '/'
            event.preventDefault();
            setShowKeyboardHelp(prev => !prev);
          }
          break;
      }
    };

    renderer.domElement.addEventListener('keydown', handleKeyDown);

    // Use ResizeObserver for container-specific resize detection (more robust)
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (entry.target === container) {
            handleResize();
          }
        }
      });
      resizeObserver.observe(container);
    }
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow anatomical brain rotation (limbic structures rotate with it as children)
      if (anatomicalBrain) {
        anatomicalBrain.rotation.y += 0.002;
      }

      // Pulsating neural pathway activity
      pathwayGroup.children.forEach((pathway, index) => {
        const pulse = (Math.sin(elapsed * 2 + index * 0.5) + 1) / 2;
        const baseOpacity = pathway.userData?.baseOpacity || 0.6;
        pathway.material.opacity = baseOpacity * (0.7 + pulse * 0.3);
        pathway.material.emissiveIntensity = 0.6 + pulse * 0.4;
      });

      // Region marker pulsation
      regionMeshes.forEach((mesh, index) => {
        const pulse = (Math.sin(elapsed * 1.8 + index * 0.5) + 1) / 2;
        const scale = 1 + pulse * 0.08 * (mesh.userData.magnitude / 50);
        mesh.scale.set(scale, scale, scale);
        mesh.material.emissiveIntensity = 0.5 + pulse * 0.4;
      });

      if (resilienceAura) {
        resilienceAura.rotation.z += 0.0015;
      }

      // Frustum culling for labels and indicators (performance optimization)
      const frustum = new THREE.Frustum();
      const projScreenMatrix = new THREE.Matrix4();
      projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(projScreenMatrix);

      // Update label visibility with frustum culling and distance fading
      labels.forEach(label => {
        if (frustum.containsPoint(label.position)) {
          const distance = camera.position.distanceTo(label.position);
          let opacity = 1.0;
          if (distance > 5) {
            opacity = Math.max(0, 1 - (distance - 5) / 5);
          }
          label.element.style.opacity = opacity.toString();
          label.visible = opacity > 0.1;
        } else {
          label.visible = false;
        }
      });

      // Make orientation indicators always face the camera (with frustum culling)
      orientationIndicators.forEach(indicator => {
        indicator.quaternion.copy(camera.quaternion);
        indicator.visible = frustum.containsPoint(indicator.position);
      });

      // Only perform raycasting when pointer has moved (performance optimization)
      if (pointerMoved) {
        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObjects(regionMeshes, false);
        if (intersections.length > 0) {
          const hovered = intersections[0].object.userData;
          if (!hoverCache || hoverCache.name !== hovered.name) {
            hoverCache = hovered;
            setHoveredNode(hovered);
          }
        } else if (hoverCache) {
          hoverCache = null;
          setHoveredNode(null);
        }
        pointerMoved = false; // Reset flag
      }

      controls.update();

      // Render both WebGL and CSS3D scenes
      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);

      // Disconnect ResizeObserver
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      controls.dispose();

      // Clean up CSS3D labels
      removeAllLabels(cssScene);

      // Dispose region markers
      regionGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      });

      // Dispose pathway connections
      pathwayGroup.children.forEach(pathway => {
        if (pathway.geometry) pathway.geometry.dispose();
        if (pathway.material) pathway.material.dispose();
      });

      connectorGroup.children.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      });

      // Dispose anatomical brain (if loaded)
      if (anatomicalBrain) {
        anatomicalBrain.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }

      // Dispose limbic structures (if loaded)
      if (limbicStructures) {
        limbicStructures.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          }
        });
      }
      if (resilienceAura) {
        resilienceAura.geometry.dispose();
        resilienceAura.material.dispose();
      }

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();

      // Clean up CSS3D renderer
      if (container.contains(cssRenderer.domElement)) {
        container.removeChild(cssRenderer.domElement);
      }
    };
  }, [filteredNodes, assessmentResults?.protectiveFactors?.length, showCortex, highContrastMode]);

  // Show fallback if browser doesn't support WebGL
  if (compatibilityError) {
    return <WebGLFallback reason={compatibilityError} />;
  }

  return (
    <div className="relative">
      {/* Loading Screen - shown while assets are loading */}
      {isLoading && !loadingError && (
        <LoadingScreen progress={loadingProgress} />
      )}

      {/* Error Screen - shown when loading fails */}
      {loadingError && (
        <ErrorScreen message={loadingError} onRetry={handleRetryLoad} />
      )}

      {/* Keyboard Shortcuts Help Panel */}
      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      {/* Main visualization content - hidden while loading or in error state */}
      <div style={{ visibility: (isLoading || loadingError) ? 'hidden' : 'visible' }}>
      {/* Responsive Controls - Desktop vs Mobile */}
      {!isMobileView ? (
        /* Desktop Controls - Full Experience */
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                className="accent-blue-400"
                checked={showStructural}
                onChange={(event) => setShowStructural(event.target.checked)}
              />
              Volume reductions ({summaryTotals.structural})
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                className="accent-orange-400"
                checked={showFunctional}
                onChange={(event) => setShowFunctional(event.target.checked)}
              />
              Hyperactivations ({summaryTotals.functional})
            </label>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                className="accent-purple-400"
                checked={showCortex}
                onChange={(event) => setShowCortex(event.target.checked)}
              />
              Show cortex
            </label>
          </div>

          {/* High Contrast Mode Toggle */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                className="accent-purple-400"
                checked={highContrastMode}
                onChange={(event) => setHighContrastMode(event.target.checked)}
                aria-label="Toggle high contrast mode for better visibility"
              />
              High Contrast Mode
            </label>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
            <button
              onClick={handleResetView}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-sm text-purple-200 transition-colors duration-200"
              aria-label="Reset camera view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset View
            </button>

            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-sm text-purple-200 transition-colors duration-200"
              aria-label="Show keyboard shortcuts"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help (?)
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Minimum intensity</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={minimumMagnitude}
                  onChange={(event) => setMinimumMagnitude(Number(event.target.value))}
                  className="accent-purple-400 w-40"
                  aria-label="Minimum impact intensity threshold"
                />
                <span className="text-sm text-gray-200">{minimumMagnitude}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Focus system</p>
            <select
              value={systemFilter}
              onChange={(event) => setSystemFilter(event.target.value)}
              className="bg-black/50 border border-white/10 text-gray-100 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label="Filter by neural system"
            >
              <option value="all">All neural systems</option>
              {systems.map(system => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        /* Mobile Controls - Simplified Interface */
        <div className="flex flex-col gap-3 mb-6">
          {/* Essential Controls Row */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleResetView}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-xs text-purple-200 transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }} // iOS tap target
              aria-label="Reset camera view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden xs:inline">Reset</span>
            </button>

            {/* High Contrast Toggle - Mobile */}
            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-200" style={{ minHeight: '44px' }}>
              <input
                type="checkbox"
                className="accent-purple-400 w-4 h-4"
                checked={highContrastMode}
                onChange={(event) => setHighContrastMode(event.target.checked)}
                aria-label="Toggle high contrast mode"
              />
              <span className="whitespace-nowrap">High Contrast</span>
            </label>

            {/* Help Button - Mobile */}
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-xs text-purple-200 transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="Show keyboard shortcuts"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden xs:inline">Help</span>
            </button>

            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-200" style={{ minHeight: '44px' }}>
              <input
                type="checkbox"
                className="accent-blue-400 w-4 h-4"
                checked={showStructural}
                onChange={(event) => setShowStructural(event.target.checked)}
                aria-label="Show volume reductions"
              />
              <span className="whitespace-nowrap">Volume ({summaryTotals.structural})</span>
            </label>

            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-200" style={{ minHeight: '44px' }}>
              <input
                type="checkbox"
                className="accent-orange-400 w-4 h-4"
                checked={showFunctional}
                onChange={(event) => setShowFunctional(event.target.checked)}
                aria-label="Show hyperactivations"
              />
              <span className="whitespace-nowrap">Hyper ({summaryTotals.functional})</span>
            </label>

            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-200" style={{ minHeight: '44px' }}>
              <input
                type="checkbox"
                className="accent-purple-400 w-4 h-4"
                checked={showCortex}
                onChange={(event) => setShowCortex(event.target.checked)}
                aria-label="Show brain cortex"
              />
              Cortex
            </label>
          </div>

          {/* System Filter - Full Width on Mobile */}
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <select
              value={systemFilter}
              onChange={(event) => setSystemFilter(event.target.value)}
              className="bg-transparent border-none text-gray-100 text-xs w-full focus:outline-none focus:ring-2 focus:ring-purple-400 rounded"
              style={{ minHeight: '40px' }}
              aria-label="Filter by neural system"
            >
              <option value="all">All Systems</option>
              {systems.map(system => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
          </div>

          {/* Intensity Slider - Compact Mobile Version */}
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400">Min Intensity</p>
              <span className="text-xs text-gray-200 font-medium">{minimumMagnitude}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={minimumMagnitude}
              onChange={(event) => setMinimumMagnitude(Number(event.target.value))}
              className="accent-purple-400 w-full"
              style={{ minHeight: '32px' }}
              aria-label="Minimum impact intensity threshold"
            />
          </div>
        </div>
      )}

      <div
        ref={mountRef}
        className="relative w-full h-[600px] rounded-3xl overflow-hidden ring-1 ring-white/10 bg-gradient-to-b from-slate-950 via-indigo-950/70 to-slate-950"
      >
        {/* Always-visible color legend */}
        <BrainLegend highContrastMode={highContrastMode} />
      </div>

      {hoveredNode && (
        <div className="pointer-events-none absolute top-8 left-8 max-w-md bg-black/80 border border-white/10 rounded-3xl p-6 backdrop-blur text-gray-100 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300 mb-1">{hoveredNode.system}</p>
              <h3 className="text-xl font-light text-white">{hoveredNode.name}</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs uppercase tracking-widest ${
                hoveredNode.polarity === 'hyperactivation'
                  ? 'bg-orange-500/20 text-orange-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}
            >
              {hoveredNode.polarity === 'hyperactivation' ? 'Hyperactivation' : 'Volume reduction'}
            </span>
          </div>
          <p className="text-4xl font-light text-white">
            {hoveredNode.impact >= 0 ? '+' : ''}{hoveredNode.impact.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-300 mb-4">Severity: {magnitudeLabel(hoveredNode.impact)}</p>

          {/* Region function description */}
          {hoveredNode.description && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs uppercase tracking-[0.25em] text-purple-300 mb-1">Function</p>
              <p className="text-sm text-gray-200 leading-relaxed">{hoveredNode.description}</p>
            </div>
          )}

          {topDrivers.length > 0 && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-2">Key drivers</p>
              <ul className="space-y-2 text-sm">
                {topDrivers.map((driver, index) => (
                  <li key={`${driver.questionId}-${index}`} className="flex justify-between gap-4">
                    <span className="flex-1 text-gray-200">{driver.summary || driver.title}</span>
                    <span className="text-gray-400">
                      {driver.impact >= 0 ? '+' : ''}{driver.impact.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Protective factor mitigation */}
          {hoveredNode.mitigation && hoveredNode.mitigation > 0 && (
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 mb-1">Protection</p>
              <p className="text-sm text-emerald-200">
                Impact reduced by <span className="font-semibold">{hoveredNode.mitigation.toFixed(1)}%</span> due to protective factors
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-300">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-blue-500" />
          <span>Blue markers = structural volume reductions (hypoactivity)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-red-500" />
          <span>Red/orange markers = hyperactivations</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2 w-6 rounded-full bg-orange-400" />
          <span>Glowing pathways = disrupted neural connections</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full border border-emerald-300" />
          <span>Green halo present when protective factors cushion severity</span>
        </div>
      </div>
      </div> {/* Close wrapper div for visibility control */}
    </div>
  );
};

export default InteractiveBrainVisualization;
