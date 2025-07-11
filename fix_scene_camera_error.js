// Fix for "error, scene or camera not available" issue

/* 
THE PROBLEM:
When clicking on the brain visualization, it tries to access scene or camera
but they might not be properly initialized or accessible through the viewer.canvas object.

THE SOLUTION:
We need to ensure that:
1. The viewer is properly initialized
2. The canvas, scene, and camera are stored in refs for later access
3. Error handling prevents crashes when these objects aren't available
4. The click handler checks for availability before accessing

Here's the fix to apply to PersonalizedThreeBrain.jsx:
*/

// Add these refs at the top of the component:
const sceneRef = useRef(null);
const cameraRef = useRef(null);
const rendererRef = useRef(null);

// In the initializeVisualization function, after creating viewer:
// Store references for later use
if (viewer.canvas) {
  sceneRef.current = viewer.canvas.scene;
  cameraRef.current = viewer.canvas.camera;
  rendererRef.current = viewer.canvas.renderer;
}

// Replace the mouse event handlers with safer versions:
const handleMouseMove = (event) => {
  if (!cameraRef.current || !sceneRef.current) {
    console.warn('Scene or camera not available yet');
    return;
  }
  
  const rect = containerRef.current.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, cameraRef.current);
  const intersects = raycaster.intersectObjects(regionMeshes);

  // Rest of the mouse move logic...
};

const handleClick = (event) => {
  if (!cameraRef.current || !sceneRef.current) {
    console.warn('Scene or camera not available yet');
    return;
  }
  
  if (hoveredMesh) {
    setSelectedRegion(hoveredMesh.userData);
  }
};

// Also add error boundary for the render method:
if (viewer.canvas && viewer.canvas.needsUpdate) {
  try {
    viewer.canvas.needsUpdate = true;
    viewer.canvas.render();
  } catch (error) {
    console.error('Error rendering:', error);
  }
}