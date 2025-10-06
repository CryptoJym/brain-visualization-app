import brainCoordinates from '../data/brain_coordinates.json';

/**
 * Convert MNI coordinates (mm) to Three.js scene coordinates
 * MNI space: Origin at anterior commissure, axes in mm
 * Three.js: Origin at center, Y-up right-handed coordinate system
 *
 * @param {number[]} mniCoords - [x, y, z] in mm from MNI152 space
 * @returns {THREE.Vector3} - Position in Three.js scene space
 */
export const mniToThreeJS = (mniCoords) => {
  const [x, y, z] = mniCoords;

  // Scale factor: MNI is in mm, typical brain is ~160mm wide
  // We want to fit in a scene of ~2 units wide, so scale by 0.01
  const scale = 0.01;

  return {
    x: x * scale,      // Left(-) to Right(+) - same as MNI
    y: z * scale,      // Inferior(-) to Superior(+) - MNI Z becomes Three.js Y
    z: -y * scale      // Posterior(-) to Anterior(+) - MNI Y becomes Three.js -Z (flipped)
  };
};

/**
 * Get all brain region coordinates indexed by region name
 * @returns {Object} - Map of region names to MNI coordinates and metadata
 */
export const getRegionCoordinates = () => {
  const coordinateMap = {};

  brainCoordinates.regions.forEach(region => {
    const normalizedName = region.name.toLowerCase().replace(/\s+/g, '_');
    coordinateMap[normalizedName] = {
      mni_coords: region.mni_coords,
      three_coords: mniToThreeJS(region.mni_coords),
      structure_type: region.structure_type,
      hemisphere: region.hemisphere,
      impact_type: region.aces_impact_type,
      severity_multiplier: region.severity_multiplier,
      volume_mm3: region.volume_mm3
    };
  });

  return coordinateMap;
};

/**
 * Find the closest matching brain region for a given impact area
 * Maps from the impact calculation names to anatomical regions
 *
 * @param {string} impactArea - Area name from impact calculations
 * @returns {Object|null} - Region data or null if no match
 */
export const findRegionForImpact = (impactArea) => {
  const regionMap = getRegionCoordinates();

  // Mapping from impact area names to anatomical regions
  const impactToRegion = {
    // Emotional regulation
    'amygdala': ['left_amygdala', 'right_amygdala'],
    'emotional_regulation': ['left_amygdala', 'right_amygdala'],

    // Memory
    'hippocampus': ['left_hippocampus', 'right_hippocampus'],
    'memory': ['left_hippocampus', 'right_hippocampus'],

    // Executive function
    'prefrontal_cortex': ['left_caudate', 'right_caudate'], // Caudate connects to PFC
    'executive_function': ['left_caudate', 'right_caudate'],

    // Sensory processing
    'thalamus': ['left_thalamus', 'right_thalamus'],
    'sensory_processing': ['left_thalamus', 'right_thalamus'],

    // Reward system
    'nucleus_accumbens': ['left_accumbens', 'right_accumbens'],
    'reward': ['left_accumbens', 'right_accumbens'],

    // Motor control
    'basal_ganglia': ['left_putamen', 'right_putamen', 'left_pallidum', 'right_pallidum'],
    'motor_control': ['left_putamen', 'right_putamen'],

    // Autonomic
    'brainstem': ['brain-stem'],
    'autonomic': ['brain-stem']
  };

  const normalizedArea = impactArea.toLowerCase().replace(/\s+/g, '_');
  const regionNames = impactToRegion[normalizedArea];

  if (!regionNames || regionNames.length === 0) {
    console.warn(`No anatomical region found for impact area: ${impactArea}`);
    return null;
  }

  // Return all matching regions
  return regionNames.map(name => ({
    name,
    ...regionMap[name]
  })).filter(r => r.mni_coords);
};

/**
 * Get coordinate system metadata
 * @returns {Object} - Atlas information
 */
export const getAtlasInfo = () => ({
  name: brainCoordinates.atlas_name,
  coordinate_system: brainCoordinates.coordinate_system,
  units: brainCoordinates.units,
  purpose: brainCoordinates.purpose,
  total_regions: brainCoordinates.regions.length
});

export default {
  mniToThreeJS,
  getRegionCoordinates,
  findRegionForImpact,
  getAtlasInfo
};
