# RAVE Three-Brain Implementation Fix

## Problem
The RAVE three-brain component was throwing errors:
- `c.add_hemisphere is not a function`
- `c.add_subcortical is not a function`
- `c.add_electrode is not a function`

## Root Cause
The RAVE three-brain library doesn't have these specific methods. It's actually a wrapper around Three.js that provides the `ViewerApp` class for initialization, but expects you to use standard Three.js APIs for adding content.

## Solution

### 1. Correct API Pattern
```javascript
// ✅ CORRECT: Access Three.js scene
const scene = viewer.canvas.scene;
const camera = viewer.canvas.camera;
const renderer = viewer.canvas.renderer;

// ❌ INCORRECT: These methods don't exist
viewer.add_hemisphere(...)
viewer.add_subcortical(...)
viewer.add_electrode(...)
```

### 2. Key Changes Made
1. **Import Three.js properly** - Made THREE available globally for the RAVE library
2. **Use correct scene access** - Access scene via `viewer.canvas.scene`
3. **Standard Three.js patterns** - Use `scene.add()` with Three.js meshes
4. **Proper lighting** - Added ambient and directional lights
5. **CDN fallback** - Try multiple CDN sources for the library
6. **Anatomical geometry** - Created brain-like shapes using merged spheres
7. **EEG electrodes** - Add as standard Three.js sphere meshes
8. **Correct interactions** - Custom raycaster implementation

### 3. Implementation Details

#### Library Loading
```javascript
// Try multiple CDN sources with fallback
const cdnUrls = [
  'https://unpkg.com/@dipterix/threebrain-js@2.1.0/dist/threebrain.min.js',
  'https://cdn.jsdelivr.net/npm/@dipterix/threebrain-js@2.1.0/dist/threebrain.min.js',
  '/libs/threebrain-main.js' // local fallback
];
```

#### Creating Brain Geometry
```javascript
// Create anatomically-inspired shapes
function createBrainGeometry(hemisphere, surfaceType) {
  const geometries = [];
  
  // Main hemisphere
  const mainGeo = new THREE.SphereGeometry(40, 32, 24);
  mainGeo.scale(1.2, 1, 1.4);
  
  // Add frontal lobe bulge
  const frontalGeo = new THREE.SphereGeometry(25, 16, 12);
  frontalGeo.scale(1, 0.8, 1.2);
  
  // Merge all geometries
  return THREE.BufferGeometryUtils.mergeGeometries(geometries);
}
```

#### Adding Objects to Scene
```javascript
// Add brain surfaces
const material = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(0.8, 0.7, 0.7),
  clearcoat: 0.3,
  clearcoatRoughness: 0.4
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh); // Standard Three.js pattern
```

## Result
The RAVE three-brain viewer now:
- ✅ Loads without errors
- ✅ Displays anatomically-inspired brain geometry
- ✅ Shows EEG electrode positions
- ✅ Supports click interactions
- ✅ Has proper lighting and materials
- ✅ Ready for real brain surface data

## Next Steps
To achieve full anatomical accuracy:
1. Load actual FreeSurfer brain surface data (JSON format)
2. Parse vertex and face data to create BufferGeometry
3. Apply appropriate materials and shaders
4. Add region labels and parcellations
5. Integrate with EEG data streams

## References
- RAVE iEEG: https://github.com/dipterix/threeBrain
- Three.js BufferGeometry: https://threejs.org/docs/#api/en/core/BufferGeometry
- FreeSurfer surfaces: https://surfer.nmr.mgh.harvard.edu/