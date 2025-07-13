/**
 * WebXR Service for AR Therapy Sessions
 * Handles WebXR session management, device detection, and AR features
 */

class WebXRService {
  constructor() {
    this.xrSession = null;
    this.xrRefSpace = null;
    this.xrViewerSpace = null;
    this.isSupported = false;
    this.isHandTrackingSupported = false;
    this.activeAnchors = new Map();
    this.frameCallbacks = [];
  }

  /**
   * Check if WebXR AR is supported
   */
  async checkSupport() {
    if ('xr' in navigator) {
      try {
        this.isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        
        // Check for hand tracking support
        if (this.isSupported && 'XRHand' in window) {
          const testSession = await navigator.xr.requestSession('immersive-ar', {
            optionalFeatures: ['hand-tracking']
          });
          this.isHandTrackingSupported = testSession.inputSources.some(
            source => source.hand !== undefined
          );
          await testSession.end();
        }
      } catch (error) {
        console.warn('WebXR AR check failed:', error);
        this.isSupported = false;
      }
    }
    return this.isSupported;
  }

  /**
   * Start an AR session
   */
  async startARSession(canvas, options = {}) {
    if (!this.isSupported) {
      throw new Error('WebXR AR is not supported on this device');
    }

    try {
      const sessionOptions = {
        requiredFeatures: ['local-floor'],
        optionalFeatures: [
          'bounded-floor',
          'hand-tracking',
          'hit-test',
          'anchors',
          'plane-detection',
          'mesh-detection'
        ],
        ...options
      };

      this.xrSession = await navigator.xr.requestSession('immersive-ar', sessionOptions);
      
      // Configure WebGL context
      const gl = canvas.getContext('webgl2', { 
        xrCompatible: true,
        alpha: true,
        preserveDrawingBuffer: true
      });

      await gl.makeXRCompatible();
      
      // Set up XR layer
      const xrLayer = new XRWebGLLayer(this.xrSession, gl);
      await this.xrSession.updateRenderState({ 
        baseLayer: xrLayer,
        depthNear: 0.1,
        depthFar: 100.0
      });

      // Get reference spaces
      this.xrRefSpace = await this.xrSession.requestReferenceSpace('local-floor');
      this.xrViewerSpace = await this.xrSession.requestReferenceSpace('viewer');

      // Set up event listeners
      this.xrSession.addEventListener('end', this.onSessionEnd.bind(this));
      this.xrSession.addEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));

      return {
        session: this.xrSession,
        gl,
        refSpace: this.xrRefSpace
      };
    } catch (error) {
      console.error('Failed to start AR session:', error);
      throw error;
    }
  }

  /**
   * End the current AR session
   */
  async endSession() {
    if (this.xrSession) {
      await this.xrSession.end();
    }
  }

  /**
   * Create an anchor at a specific position
   */
  async createAnchor(position, rotation = null) {
    if (!this.xrSession || !this.xrSession.restorePersistentAnchor) {
      throw new Error('Anchors not supported in current session');
    }

    try {
      const anchorPose = new XRRigidTransform(
        position,
        rotation || { x: 0, y: 0, z: 0, w: 1 }
      );

      const anchor = await this.xrSession.createAnchor(anchorPose, this.xrRefSpace);
      const anchorId = `anchor_${Date.now()}`;
      this.activeAnchors.set(anchorId, anchor);

      return anchorId;
    } catch (error) {
      console.error('Failed to create anchor:', error);
      throw error;
    }
  }

  /**
   * Perform a hit test for placing objects
   */
  async performHitTest(screenX, screenY) {
    if (!this.xrSession) return null;

    try {
      const hitTestSource = await this.xrSession.requestHitTestSource({
        space: this.xrViewerSpace,
        offsetRay: new XRRay({ x: screenX, y: screenY, z: 0 })
      });

      return hitTestSource;
    } catch (error) {
      console.error('Hit test failed:', error);
      return null;
    }
  }

  /**
   * Get hand tracking data
   */
  getHandTrackingData(frame) {
    if (!frame || !this.xrSession) return null;

    const hands = {
      left: null,
      right: null
    };

    for (const inputSource of this.xrSession.inputSources) {
      if (inputSource.hand) {
        const handData = {
          joints: {},
          gestures: []
        };

        // Get joint positions
        for (const [jointName, joint] of inputSource.hand.entries()) {
          const jointPose = frame.getJointPose(joint, this.xrRefSpace);
          if (jointPose) {
            handData.joints[jointName] = {
              position: jointPose.transform.position,
              radius: jointPose.radius
            };
          }
        }

        // Detect basic gestures
        handData.gestures = this.detectGestures(handData.joints);

        if (inputSource.handedness === 'left') {
          hands.left = handData;
        } else if (inputSource.handedness === 'right') {
          hands.right = handData;
        }
      }
    }

    return hands;
  }

  /**
   * Detect hand gestures
   */
  detectGestures(joints) {
    const gestures = [];

    if (!joints || Object.keys(joints).length === 0) return gestures;

    // Detect pinch gesture
    if (joints['thumb-tip'] && joints['index-finger-tip']) {
      const distance = this.calculateDistance(
        joints['thumb-tip'].position,
        joints['index-finger-tip'].position
      );
      
      if (distance < 0.02) { // 2cm threshold
        gestures.push({ type: 'pinch', confidence: 1.0 - (distance / 0.02) });
      }
    }

    // Detect open palm
    if (this.isOpenPalm(joints)) {
      gestures.push({ type: 'open-palm', confidence: 0.9 });
    }

    // Detect fist
    if (this.isFist(joints)) {
      gestures.push({ type: 'fist', confidence: 0.9 });
    }

    return gestures;
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Check if hand is in open palm position
   */
  isOpenPalm(joints) {
    // Simple heuristic: check if fingers are extended
    const fingerTips = [
      'index-finger-tip',
      'middle-finger-tip',
      'ring-finger-tip',
      'pinky-finger-tip'
    ];

    const fingerBases = [
      'index-finger-metacarpal',
      'middle-finger-metacarpal',
      'ring-finger-metacarpal',
      'pinky-finger-metacarpal'
    ];

    let extendedCount = 0;
    for (let i = 0; i < fingerTips.length; i++) {
      if (joints[fingerTips[i]] && joints[fingerBases[i]]) {
        const distance = this.calculateDistance(
          joints[fingerTips[i]].position,
          joints[fingerBases[i]].position
        );
        if (distance > 0.08) { // 8cm threshold
          extendedCount++;
        }
      }
    }

    return extendedCount >= 3;
  }

  /**
   * Check if hand is in fist position
   */
  isFist(joints) {
    // Check if fingers are curled
    const fingerTips = [
      'index-finger-tip',
      'middle-finger-tip',
      'ring-finger-tip',
      'pinky-finger-tip'
    ];

    const palm = joints['middle-finger-metacarpal'];
    if (!palm) return false;

    let curledCount = 0;
    for (const tipName of fingerTips) {
      if (joints[tipName]) {
        const distance = this.calculateDistance(
          joints[tipName].position,
          palm.position
        );
        if (distance < 0.05) { // 5cm threshold
          curledCount++;
        }
      }
    }

    return curledCount >= 3;
  }

  /**
   * Add a frame callback
   */
  addFrameCallback(callback) {
    this.frameCallbacks.push(callback);
  }

  /**
   * Remove a frame callback
   */
  removeFrameCallback(callback) {
    const index = this.frameCallbacks.indexOf(callback);
    if (index > -1) {
      this.frameCallbacks.splice(index, 1);
    }
  }

  /**
   * Main render loop
   */
  startRenderLoop(renderer) {
    const render = (time, frame) => {
      if (!this.xrSession) return;

      this.xrSession.requestAnimationFrame(render);

      // Call frame callbacks
      for (const callback of this.frameCallbacks) {
        callback(time, frame);
      }

      // Let the renderer handle the actual rendering
      if (renderer) {
        renderer(time, frame);
      }
    };

    this.xrSession.requestAnimationFrame(render);
  }

  /**
   * Handle session end
   */
  onSessionEnd() {
    this.xrSession = null;
    this.xrRefSpace = null;
    this.xrViewerSpace = null;
    this.activeAnchors.clear();
    this.frameCallbacks = [];
  }

  /**
   * Handle input source changes
   */
  onInputSourcesChange(event) {
    console.log('Input sources changed:', {
      added: event.added.length,
      removed: event.removed.length
    });
  }

  /**
   * Get device capabilities
   */
  getCapabilities() {
    return {
      ar: this.isSupported,
      handTracking: this.isHandTrackingSupported,
      anchors: 'createAnchor' in (this.xrSession || {}),
      hitTest: true,
      planeDetection: true
    };
  }
}

// Create singleton instance
const webXRService = new WebXRService();
export default webXRService;