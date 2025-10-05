# Quick Start Implementation Guide
## Replacing Geometric Primitives with Anatomical Brain Mesh

**Goal**: Replace current geometric brain with anatomically accurate 3D model and position markers at real MNI coordinates.

**Estimated Time**: 2-4 hours for basic implementation

---

## Phase 1: Download Brain Mesh (15 minutes)

### Recommended: Sketchfab "Brain with labeled parts"

1. **Go to**: https://sketchfab.com/3d-models/brain-with-labeled-parts-28c8971e11334e8b97a2a0d6235992e8

2. **Download**:
   - Click "Download 3D Model" button
   - Select GLB format (best for Three.js)
   - Download will include: `brain-labeled.glb`

3. **Place in project**:
   ```bash
   mkdir -p public/models
   mv ~/Downloads/brain-labeled.glb public/models/
   ```

4. **Add attribution** to project (CC-BY license requirement):
   - Create `/public/ATTRIBUTIONS.md`
   - Add: "Brain 3D model: 'Brain with labeled parts' by AbdulMuhaymin (Sketchfab, CC-BY)"

---

## Phase 2: Load Brain Mesh in Three.js (30 minutes)

### Update `anatomicalBrainGeometry.js`

Replace the current geometric primitive creation with GLB loading:

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Loads anatomically accurate brain mesh from GLB file
 * @returns {Promise<THREE.Group>} Brain mesh group
 */
export const createAnatomicalBrain = async () => {
  const brainGroup = new THREE.Group();

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      '/models/brain-labeled.glb',
      (gltf) => {
        const brainMesh = gltf.scene;

        // Scale to match current scene units
        brainMesh.scale.set(0.5, 0.5, 0.5);

        // Apply semi-transparent material for cortex visibility
        brainMesh.traverse((child) => {
          if (child.isMesh) {
            // Store original material
            child.userData.originalMaterial = child.material.clone();

            // Apply semi-transparent material to see internal structures
            child.material = new THREE.MeshStandardMaterial({
              color: child.material.color || 0xc4b5d4,
              transparent: true,
              opacity: 0.35,
              roughness: 0.8,
              metalness: 0.05,
              side: THREE.DoubleSide
            });
          }
        });

        brainGroup.add(brainMesh);
        resolve(brainGroup);
      },
      (progress) => {
        console.log('Loading brain mesh:', Math.round((progress.loaded / progress.total) * 100) + '%');
      },
      (error) => {
        console.error('Error loading brain mesh:', error);
        reject(error);
      }
    );
  });
};

// Keep limbic structures function for now (can replace later)
export const createLimbicStructures = () => {
  // Existing implementation...
};
```

### Update Visualization Component

Modify `/src/components/visualization/InteractiveBrainVisualization.jsx` to use async loading:

```javascript
// Inside the component, replace brain creation:
useEffect(() => {
  const loadBrain = async () => {
    try {
      const brain = await createAnatomicalBrain();
      brainRef.current = brain;
      sceneRef.current.add(brain);

      // Add limbic structures
      const limbicStructures = createLimbicStructures();
      sceneRef.current.add(limbicStructures);

    } catch (error) {
      console.error('Failed to load brain:', error);
      // Fallback to geometric primitives
      const fallbackBrain = createGeometricBrain();
      sceneRef.current.add(fallbackBrain);
    }
  };

  loadBrain();
}, []);
```

---

## Phase 3: Extract Brain Coordinates (30 minutes)

### Option A: Use Provided Python Script (RECOMMENDED)

```bash
# Install dependencies
pip install nilearn numpy

# Extract trauma-relevant coordinates (fastest)
python scripts/extract_brain_coordinates.py \
  --atlas trauma-relevant \
  --output public/data/brain_coordinates.json \
  --pretty

# OR extract full Harvard-Oxford atlas (more complete)
python scripts/extract_brain_coordinates.py \
  --atlas harvard-oxford \
  --output public/data/brain_coordinates.json \
  --pretty
```

This creates a JSON file like:
```json
{
  "atlas_name": "Harvard-Oxford (Trauma-Relevant Subset)",
  "coordinate_system": "MNI152",
  "units": "mm",
  "regions": [
    {
      "name": "Left Amygdala",
      "mni_coords": [-23.0, -5.0, -18.0],
      "aces_impact_type": "emotional_regulation",
      "severity_multiplier": 1.5
    }
  ]
}
```

### Option B: Manual Coordinate Entry

Create `/public/data/brain_coordinates.json` with key regions:

```json
{
  "atlas_name": "Manual Entry",
  "coordinate_system": "MNI152",
  "units": "mm",
  "regions": [
    {"name": "Left Amygdala", "mni_coords": [-23, -5, -18], "structure_type": "limbic"},
    {"name": "Right Amygdala", "mni_coords": [23, -4, -18], "structure_type": "limbic"},
    {"name": "Left Hippocampus", "mni_coords": [-28, -21, -18], "structure_type": "limbic"},
    {"name": "Right Hippocampus", "mni_coords": [28, -20, -18], "structure_type": "limbic"},
    {"name": "Left Prefrontal Cortex", "mni_coords": [-10, 45, 25], "structure_type": "cortical"},
    {"name": "Right Prefrontal Cortex", "mni_coords": [10, 45, 25], "structure_type": "cortical"}
  ]
}
```

---

## Phase 4: Position Markers at Real Coordinates (1 hour)

### Load Coordinates

```javascript
// In InteractiveBrainVisualization.jsx
import brainCoordinates from '/data/brain_coordinates.json';

/**
 * Convert MNI coordinates (mm) to Three.js scene coordinates
 * @param {number[]} mniCoords - [x, y, z] in mm
 * @returns {THREE.Vector3} - Three.js position
 */
const mniToThreeJS = (mniCoords) => {
  const [x, y, z] = mniCoords;

  // MNI coordinates are in mm from center
  // Scale to our scene units (divide by 100 for cm, then scale as needed)
  return new THREE.Vector3(
    x / 100,    // Left(-) to Right(+)
    y / 100,    // Posterior(-) to Anterior(+)
    z / 100     // Inferior(-) to Superior(+)
  );
};
```

### Update Marker Positioning

Replace estimated positions with atlas-based positions:

```javascript
// Instead of hardcoded positions, map from coordinates JSON
const createImpactMarkers = (brainImpacts) => {
  const markerGroup = new THREE.Group();

  // Create lookup from region names to MNI coordinates
  const coordLookup = {};
  brainCoordinates.regions.forEach(region => {
    coordLookup[region.name.toLowerCase()] = region.mni_coords;
  });

  Object.entries(brainImpacts).forEach(([region, impact]) => {
    // Try to find coordinates for this region
    const regionKey = region.toLowerCase().replace(/_/g, ' ');
    let mniCoords = coordLookup[regionKey];

    if (!mniCoords) {
      // Fallback to estimated position (for regions not in atlas)
      console.warn(`No coordinates found for ${region}, using fallback`);
      mniCoords = getFallbackPosition(region);
    }

    // Convert to Three.js position
    const position = mniToThreeJS(mniCoords);

    // Create marker
    const marker = createMarker(region, impact, position);
    markerGroup.add(marker);
  });

  return markerGroup;
};
```

---

## Phase 5: Test and Refine (1 hour)

### Testing Checklist

1. **Brain loads correctly**:
   ```bash
   npm run dev
   ```
   - Open browser console
   - Check for "Loading brain mesh: 100%" message
   - Verify no GLB loading errors

2. **Markers appear at correct positions**:
   - Load demo (ACE score 10)
   - Verify markers align with brain anatomy
   - Check that amygdala markers are in temporal lobes
   - Verify hippocampus markers are medial temporal

3. **Scale is appropriate**:
   - Brain should fill viewport but not overflow
   - Markers should be visible and proportional
   - Adjust brain scale if needed: `brainMesh.scale.set(X, X, X)`

4. **Performance is acceptable**:
   - FPS should be 30+ (check browser DevTools)
   - If slow, try lower polygon model or optimize materials

### Common Issues & Fixes

**Issue**: Brain too large/small
```javascript
// Adjust scale in createAnatomicalBrain:
brainMesh.scale.set(0.5, 0.5, 0.5); // Make smaller
brainMesh.scale.set(2.0, 2.0, 2.0); // Make larger
```

**Issue**: Brain positioned incorrectly
```javascript
// Center the brain:
brainMesh.position.set(0, 0, 0);
```

**Issue**: Markers not aligned with brain structures
```javascript
// Adjust MNI coordinate scaling:
const mniToThreeJS = (mniCoords) => {
  const [x, y, z] = mniCoords;
  const scale = 0.01; // Experiment with this value
  return new THREE.Vector3(x * scale, y * scale, z * scale);
};
```

**Issue**: Brain too opaque
```javascript
// Adjust opacity in material:
child.material.opacity = 0.2; // More transparent
child.material.opacity = 0.5; // Less transparent
```

---

## Phase 6: Add Labels (Optional, 30 minutes)

### CSS3D Labels

```javascript
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

const createRegionLabel = (name, position) => {
  const labelDiv = document.createElement('div');
  labelDiv.className = 'brain-label';
  labelDiv.textContent = name;
  labelDiv.style.cssText = `
    color: white;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    background: rgba(0, 0, 0, 0.7);
    padding: 4px 8px;
    border-radius: 4px;
    pointer-events: none;
  `;

  const label = new CSS3DObject(labelDiv);
  label.position.copy(position);
  label.position.y += 0.5; // Float above marker

  return label;
};

// Add CSS3DRenderer alongside WebGLRenderer
const css3dRenderer = new CSS3DRenderer();
css3dRenderer.setSize(window.innerWidth, window.innerHeight);
css3dRenderer.domElement.style.position = 'absolute';
css3dRenderer.domElement.style.top = 0;
css3dRenderer.domElement.style.pointerEvents = 'none';
containerRef.current.appendChild(css3dRenderer.domElement);

// Render both in animation loop:
renderer.render(scene, camera);
css3dRenderer.render(scene, camera);
```

---

## Success Criteria

After implementation, verify:

- ✅ Brain mesh loads and displays correctly
- ✅ Markers positioned at anatomically accurate locations
- ✅ Amygdala markers are in temporal lobes (not floating in center)
- ✅ Hippocampus markers are medial temporal (below and inside)
- ✅ Prefrontal markers are in front of brain
- ✅ Performance is smooth (30+ FPS)
- ✅ Demo data (ACE score 10) shows multiple accurate impacts

---

## Next Steps After Basic Implementation

1. **Add region labels** (CSS3D or troika-three-text)
2. **Create persistent legend** (color meanings, severity scale)
3. **Enhance hover tooltips** (show ACE source, impact details)
4. **Add anatomical orientation** (Anterior/Posterior indicators)
5. **Implement cutaway view** (slice through cortex to show limbic structures)

---

## Troubleshooting

### GLB Won't Load
- Check file path: `/public/models/brain-labeled.glb`
- Verify file isn't corrupted (open in Blender or online viewer)
- Check browser console for CORS errors
- Try different browser (Chrome, Firefox)

### Coordinates Don't Match
- Verify coordinate system (should be MNI152)
- Check if brain mesh is in different orientation
- Adjust rotation: `brainMesh.rotation.y = Math.PI`

### Performance Issues
- Reduce polygon count (use lower-poly model)
- Simplify materials (remove transparency)
- Limit number of markers visible at once
- Use Level-of-Detail (LOD) for distant objects

---

**Implementation Time Estimate**: 2-4 hours for developer familiar with Three.js

**Files to Modify**:
- `/src/utils/anatomicalBrainGeometry.js` - Load GLB instead of primitives
- `/src/components/visualization/InteractiveBrainVisualization.jsx` - Update loading logic
- `/public/models/` - Add brain-labeled.glb
- `/public/data/` - Add brain_coordinates.json

**New Dependencies**: None (GLTFLoader already available in Three.js examples)
