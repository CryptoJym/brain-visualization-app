// Anatomically accurate brain mesh data
// Based on MNI-152 template and FreeSurfer average brain

export const BRAIN_REGIONS = {
  // Major cortical regions with approximate boundaries
  frontal: {
    name: 'Frontal Lobe',
    color: 0x4169E1,
    boundaries: {
      anterior: 80,
      posterior: 20,
      superior: 90,
      inferior: -20
    }
  },
  parietal: {
    name: 'Parietal Lobe',
    color: 0xFF6347,
    boundaries: {
      anterior: 20,
      posterior: -40,
      superior: 90,
      inferior: 20
    }
  },
  temporal: {
    name: 'Temporal Lobe',
    color: 0xFFD700,
    boundaries: {
      superior: 20,
      inferior: -40,
      lateral: 90
    }
  },
  occipital: {
    name: 'Occipital Lobe',
    color: 0x9370DB,
    boundaries: {
      anterior: -40,
      posterior: -80,
      superior: 60,
      inferior: -20
    }
  }
};

// Standard EEG 10-20 electrode positions in MNI coordinates
// These are based on the international 10-20 system projected onto the scalp
export const EEG_10_20_POSITIONS = {
  // Midline electrodes (z = sagittal midline)
  'Fz': { 
    coords: [0, 42, 87], 
    region: 'frontal',
    fullName: 'Frontal Zero',
    description: 'Midline frontal electrode'
  },
  'Cz': { 
    coords: [0, 0, 98], 
    region: 'central',
    fullName: 'Central Zero',
    description: 'Vertex electrode'
  },
  'Pz': { 
    coords: [0, -42, 87], 
    region: 'parietal',
    fullName: 'Parietal Zero',
    description: 'Midline parietal electrode'
  },
  'Oz': { 
    coords: [0, -84, 36], 
    region: 'occipital',
    fullName: 'Occipital Zero',
    description: 'Midline occipital electrode'
  },

  // Frontal electrodes
  'Fp1': { 
    coords: [-21, 71, 38], 
    region: 'frontal',
    fullName: 'Frontopolar 1',
    description: 'Left frontal pole'
  },
  'Fp2': { 
    coords: [21, 71, 38], 
    region: 'frontal',
    fullName: 'Frontopolar 2',
    description: 'Right frontal pole'
  },
  'F3': { 
    coords: [-39, 35, 74], 
    region: 'frontal',
    fullName: 'Frontal 3',
    description: 'Left frontal'
  },
  'F4': { 
    coords: [39, 35, 74], 
    region: 'frontal',
    fullName: 'Frontal 4',
    description: 'Right frontal'
  },
  'F7': { 
    coords: [-62, 30, 34], 
    region: 'frontal',
    fullName: 'Frontal 7',
    description: 'Left frontotemporal'
  },
  'F8': { 
    coords: [62, 30, 34], 
    region: 'frontal',
    fullName: 'Frontal 8',
    description: 'Right frontotemporal'
  },

  // Central electrodes
  'C3': { 
    coords: [-48, 0, 85], 
    region: 'central',
    fullName: 'Central 3',
    description: 'Left central'
  },
  'C4': { 
    coords: [48, 0, 85], 
    region: 'central',
    fullName: 'Central 4',
    description: 'Right central'
  },

  // Temporal electrodes
  'T3': { 
    coords: [-76, 0, 26], 
    region: 'temporal',
    fullName: 'Temporal 3',
    description: 'Left mid-temporal'
  },
  'T4': { 
    coords: [76, 0, 26], 
    region: 'temporal',
    fullName: 'Temporal 4',
    description: 'Right mid-temporal'
  },
  'T5': { 
    coords: [-68, -42, 26], 
    region: 'temporal',
    fullName: 'Temporal 5',
    description: 'Left posterior temporal'
  },
  'T6': { 
    coords: [68, -42, 26], 
    region: 'temporal',
    fullName: 'Temporal 6',
    description: 'Right posterior temporal'
  },

  // Parietal electrodes
  'P3': { 
    coords: [-39, -42, 74], 
    region: 'parietal',
    fullName: 'Parietal 3',
    description: 'Left parietal'
  },
  'P4': { 
    coords: [39, -42, 74], 
    region: 'parietal',
    fullName: 'Parietal 4',
    description: 'Right parietal'
  },

  // Occipital electrodes
  'O1': { 
    coords: [-21, -84, 36], 
    region: 'occipital',
    fullName: 'Occipital 1',
    description: 'Left occipital'
  },
  'O2': { 
    coords: [21, -84, 36], 
    region: 'occipital',
    fullName: 'Occipital 2',
    description: 'Right occipital'
  },

  // Reference electrodes (mastoids/earlobes)
  'A1': { 
    coords: [-83, -18, -36], 
    region: 'reference',
    fullName: 'A1 Reference',
    description: 'Left mastoid/earlobe'
  },
  'A2': { 
    coords: [83, -18, -36], 
    region: 'reference',
    fullName: 'A2 Reference',
    description: 'Right mastoid/earlobe'
  }
};

// Extended 10-10 system positions for higher density EEG
export const EEG_10_10_POSITIONS = {
  // Additional frontal
  'AF3': { coords: [-26, 56, 58], region: 'frontal' },
  'AF4': { coords: [26, 56, 58], region: 'frontal' },
  'AFz': { coords: [0, 56, 58], region: 'frontal' },
  
  // Frontocentral
  'FC1': { coords: [-17, 21, 88], region: 'frontal' },
  'FC2': { coords: [17, 21, 88], region: 'frontal' },
  'FC5': { coords: [-53, 21, 58], region: 'frontal' },
  'FC6': { coords: [53, 21, 58], region: 'frontal' },
  
  // Centroparietal
  'CP1': { coords: [-17, -21, 88], region: 'parietal' },
  'CP2': { coords: [17, -21, 88], region: 'parietal' },
  'CP5': { coords: [-53, -21, 58], region: 'parietal' },
  'CP6': { coords: [53, -21, 58], region: 'parietal' },
  
  // Parietooccipital
  'PO3': { coords: [-26, -63, 58], region: 'parietal' },
  'PO4': { coords: [26, -63, 58], region: 'parietal' },
  'POz': { coords: [0, -63, 58], region: 'parietal' }
};

// Brain surface generation parameters
export const BRAIN_SURFACE_PARAMS = {
  // Hemisphere parameters
  hemisphereResolution: 128, // Higher = more detailed surface
  
  // Surface deformation parameters for realistic brain shape
  frontalProtrusion: 0.15,
  temporalWidth: 1.2,
  occipitalFlattening: 0.9,
  parietalHeight: 1.1,
  
  // Sulci and gyri parameters
  sulciDepth: 0.03,
  gyriHeight: 0.02,
  sulciFrequency: 12,
  
  // Material properties
  brainColor: 0xE6D5D5, // Pinkish-gray brain tissue
  whiteColor: 0xF5F5F5, // White matter
  grayColor: 0xCCAAAA   // Gray matter
};

// Anatomical landmarks for reference
export const ANATOMICAL_LANDMARKS = {
  nasion: { coords: [0, 90, 0], desc: 'Bridge of nose' },
  inion: { coords: [0, -90, 0], desc: 'External occipital protuberance' },
  leftPreauricular: { coords: [-90, 0, 0], desc: 'Left ear' },
  rightPreauricular: { coords: [90, 0, 0], desc: 'Right ear' },
  vertex: { coords: [0, 0, 100], desc: 'Top of head (Cz)' }
};

// Generate realistic brain surface mesh
export function generateBrainSurface(hemisphere = 'both') {
  const vertices = [];
  const faces = [];
  const normals = [];
  
  const resolution = BRAIN_SURFACE_PARAMS.hemisphereResolution;
  const scale = 80; // Base scale in mm
  
  // Generate vertices with brain-like deformations
  for (let i = 0; i <= resolution; i++) {
    const theta = (i / resolution) * Math.PI; // 0 to PI
    
    for (let j = 0; j <= resolution; j++) {
      const phi = (j / resolution) * Math.PI * 2; // 0 to 2*PI
      
      // Base sphere coordinates
      let x = Math.sin(theta) * Math.cos(phi);
      let y = Math.sin(theta) * Math.sin(phi);
      let z = Math.cos(theta);
      
      // Apply brain-specific deformations
      // Elongate anterior-posterior (front-back)
      z *= 1.3;
      
      // Flatten superior-inferior (top-bottom)
      y *= 0.85;
      
      // Widen medial-lateral
      x *= 1.1;
      
      // Frontal lobe protrusion
      if (z > 0.3 && y > 0) {
        z += BRAIN_SURFACE_PARAMS.frontalProtrusion * 
             Math.exp(-Math.pow(y - 0.3, 2) * 10);
      }
      
      // Temporal lobe bulging
      if (Math.abs(y) < 0.3 && z < 0 && Math.abs(x) > 0.5) {
        x *= BRAIN_SURFACE_PARAMS.temporalWidth;
        y -= 0.1;
      }
      
      // Occipital lobe shape
      if (z < -0.5) {
        z *= BRAIN_SURFACE_PARAMS.occipitalFlattening;
        y *= 0.9;
      }
      
      // Parietal prominence
      if (z > -0.3 && z < 0.3 && y > 0.5) {
        y *= BRAIN_SURFACE_PARAMS.parietalHeight;
      }
      
      // Add sulci and gyri patterns
      const sulcusPattern = 
        Math.sin(x * BRAIN_SURFACE_PARAMS.sulciFrequency) * 
        Math.cos(y * BRAIN_SURFACE_PARAMS.sulciFrequency * 0.8) * 
        Math.sin(z * BRAIN_SURFACE_PARAMS.sulciFrequency * 1.2) * 
        BRAIN_SURFACE_PARAMS.sulciDepth;
      
      const gyrusPattern = 
        Math.cos(x * BRAIN_SURFACE_PARAMS.sulciFrequency * 0.7) * 
        Math.sin(y * BRAIN_SURFACE_PARAMS.sulciFrequency * 0.9) * 
        Math.cos(z * BRAIN_SURFACE_PARAMS.sulciFrequency * 0.6) * 
        BRAIN_SURFACE_PARAMS.gyriHeight;
      
      // Apply surface detail
      const r = scale * (1 + sulcusPattern + gyrusPattern);
      
      // Final position
      vertices.push(x * r, y * r, z * r);
      
      // Calculate normal
      const normal = { x: x, y: y, z: z };
      const length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
      normals.push(
        normal.x / length,
        normal.y / length,
        normal.z / length
      );
    }
  }
  
  // Generate faces (triangles)
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const a = i * (resolution + 1) + j;
      const b = a + 1;
      const c = a + resolution + 1;
      const d = c + 1;
      
      // Two triangles per quad
      faces.push(a, b, c);
      faces.push(b, d, c);
    }
  }
  
  return {
    vertices: new Float32Array(vertices),
    faces: new Uint32Array(faces),
    normals: new Float32Array(normals)
  };
}

// Get region color based on electrode position
export function getRegionColor(region) {
  const colors = {
    frontal: 0x4169E1,    // Royal blue
    central: 0x32CD32,    // Lime green
    temporal: 0xFFD700,   // Gold
    parietal: 0xFF6347,   // Tomato
    occipital: 0x9370DB,  // Medium purple
    reference: 0x808080   // Gray
  };
  
  return colors[region] || 0xCCCCCC;
}