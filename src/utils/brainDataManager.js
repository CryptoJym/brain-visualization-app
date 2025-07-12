import * as THREE from 'three';

export class BrainDataManager {
  constructor() {
    this.surfaces = {};
    this.electrodes = {};
    this.parcellations = {};
    this.materials = this.initializeMaterials();
  }

  initializeMaterials() {
    return {
      pial: new THREE.MeshPhysicalMaterial({
        color: 0xffcccc,
        metalness: 0.1,
        roughness: 0.7,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        side: THREE.DoubleSide
      }),
      white: new THREE.MeshPhysicalMaterial({
        color: 0xf0f0f0,
        metalness: 0.05,
        roughness: 0.8,
        opacity: 0.9,
        transparent: true,
        side: THREE.DoubleSide
      }),
      inflated: new THREE.MeshPhysicalMaterial({
        color: 0xccccff,
        metalness: 0.2,
        roughness: 0.6,
        side: THREE.DoubleSide
      }),
      subcortical: {
        hippocampus: new THREE.MeshPhysicalMaterial({
          color: 0xffaa00,
          metalness: 0.3,
          roughness: 0.7,
          opacity: 0.8,
          transparent: true
        }),
        amygdala: new THREE.MeshPhysicalMaterial({
          color: 0xff0066,
          metalness: 0.3,
          roughness: 0.7,
          opacity: 0.8,
          transparent: true
        }),
        thalamus: new THREE.MeshPhysicalMaterial({
          color: 0x00aaff,
          metalness: 0.3,
          roughness: 0.7,
          opacity: 0.8,
          transparent: true
        }),
        caudate: new THREE.MeshPhysicalMaterial({
          color: 0x00ff66,
          metalness: 0.3,
          roughness: 0.7,
          opacity: 0.8,
          transparent: true
        }),
        putamen: new THREE.MeshPhysicalMaterial({
          color: 0xaa00ff,
          metalness: 0.3,
          roughness: 0.7,
          opacity: 0.8,
          transparent: true
        }),
        brainstem: new THREE.MeshPhysicalMaterial({
          color: 0x666666,
          metalness: 0.2,
          roughness: 0.8,
          opacity: 0.9,
          transparent: true
        })
      }
    };
  }

  async loadFreeSurferSurfaces() {
    // Public FreeSurfer data repositories
    const sources = [
      {
        name: 'GitHub RAVE Data',
        baseUrl: 'https://raw.githubusercontent.com/dipterix/threeBrain/master/inst/extdata/N27/surf',
        format: 'json'
      },
      {
        name: 'Alternative Source',
        baseUrl: 'https://rave-ieeg.github.io/three-brain-js/data/N27/surf',
        format: 'json'
      }
    ];

    const surfaceFiles = [
      { file: 'lh.pial', hemisphere: 'left', type: 'pial' },
      { file: 'rh.pial', hemisphere: 'right', type: 'pial' },
      { file: 'lh.white', hemisphere: 'left', type: 'white' },
      { file: 'rh.white', hemisphere: 'right', type: 'white' },
      { file: 'lh.inflated', hemisphere: 'left', type: 'inflated' },
      { file: 'rh.inflated', hemisphere: 'right', type: 'inflated' }
    ];

    for (const source of sources) {
      let success = true;
      const loadedSurfaces = {};

      for (const surface of surfaceFiles) {
        try {
          const url = `${source.baseUrl}/${surface.file}.json`;
          console.log(`📥 Loading ${surface.file} from ${source.name}...`);
          
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const data = await response.json();
          loadedSurfaces[surface.file] = {
            ...data,
            ...surface,
            source: source.name
          };
        } catch (error) {
          console.warn(`Failed to load ${surface.file} from ${source.name}:`, error);
          success = false;
          break;
        }
      }

      if (success) {
        this.surfaces = { ...this.surfaces, ...loadedSurfaces };
        console.log(`✅ Successfully loaded all surfaces from ${source.name}`);
        return true;
      }
    }

    // If remote loading fails, create demo surfaces
    console.warn('⚠️ Could not load FreeSurfer data, creating demo surfaces...');
    this.createDemoSurfaces(surfaceFiles);
    return false;
  }

  createDemoSurfaces(surfaceFiles) {
    surfaceFiles.forEach(surface => {
      const geometry = this.createBrainHemisphere(surface.hemisphere, surface.type);
      this.surfaces[surface.file] = {
        vertices: Array.from(geometry.attributes.position.array).reduce((acc, val, idx) => {
          if (idx % 3 === 0) acc.push([]);
          acc[acc.length - 1].push(val);
          return acc;
        }, []),
        faces: Array.from(geometry.index.array).reduce((acc, val, idx) => {
          if (idx % 3 === 0) acc.push([]);
          acc[acc.length - 1].push(val);
          return acc;
        }, []),
        ...surface,
        source: 'demo'
      };
    });
  }

  createBrainHemisphere(hemisphere, type) {
    // Create anatomically-inspired brain hemisphere
    const geometry = new THREE.SphereGeometry(50, 64, 48, 0, Math.PI);
    
    // Deform to create brain-like shape
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Apply deformations for brain shape
      let newX = x * 1.2; // Widen
      let newY = y * 0.9; // Compress vertically
      let newZ = z * 1.4; // Elongate front-to-back
      
      // Add frontal lobe bulge
      if (z > 20 && y > 0) {
        newZ += 10 * Math.exp(-(Math.pow(y - 20, 2) / 200));
      }
      
      // Add temporal lobe
      if (Math.abs(y) < 20 && z < 0) {
        newX *= 1.3;
      }
      
      // Create sulci and gyri patterns
      const noise = this.generateBrainSurfaceNoise(newX, newY, newZ);
      newX += noise.x;
      newY += noise.y;
      newZ += noise.z;
      
      // Hemisphere offset
      if (hemisphere === 'left') {
        newX = Math.abs(newX) * -1 - 5;
      } else {
        newX = Math.abs(newX) + 5;
      }
      
      // Inflated surface modifications
      if (type === 'inflated') {
        const length = Math.sqrt(newX * newX + newY * newY + newZ * newZ);
        const scale = 60 / length; // Inflate to sphere
        newX *= scale * 0.9;
        newY *= scale * 0.9;
        newZ *= scale * 0.9;
      }
      
      positions.setXYZ(i, newX, newY, newZ);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }

  generateBrainSurfaceNoise(x, y, z) {
    // Create realistic sulci and gyri patterns
    const scale = 0.05;
    const amplitude = 2;
    
    // Multiple octaves of noise for detail
    const noise1 = Math.sin(x * scale) * Math.cos(y * scale) * amplitude;
    const noise2 = Math.sin(x * scale * 2) * Math.cos(z * scale * 2) * amplitude * 0.5;
    const noise3 = Math.cos(y * scale * 4) * Math.sin(z * scale * 4) * amplitude * 0.25;
    
    return {
      x: noise1 + noise2,
      y: noise2 + noise3,
      z: noise1 + noise3
    };
  }

  async loadSubcorticalStructures() {
    // Define subcortical structures with anatomical properties
    const structures = [
      {
        name: 'Left-Hippocampus',
        type: 'hippocampus',
        position: [-25, -10, -15],
        scale: [15, 8, 25],
        rotation: [0, 0.2, 0]
      },
      {
        name: 'Right-Hippocampus',
        type: 'hippocampus',
        position: [25, -10, -15],
        scale: [15, 8, 25],
        rotation: [0, -0.2, 0]
      },
      {
        name: 'Left-Amygdala',
        type: 'amygdala',
        position: [-22, -5, -20],
        scale: [10, 10, 12],
        rotation: [0, 0, 0]
      },
      {
        name: 'Right-Amygdala',
        type: 'amygdala',
        position: [22, -5, -20],
        scale: [10, 10, 12],
        rotation: [0, 0, 0]
      },
      {
        name: 'Left-Thalamus',
        type: 'thalamus',
        position: [-10, 0, 5],
        scale: [20, 15, 20],
        rotation: [0, 0, 0]
      },
      {
        name: 'Right-Thalamus',
        type: 'thalamus',
        position: [10, 0, 5],
        scale: [20, 15, 20],
        rotation: [0, 0, 0]
      },
      {
        name: 'Brain-Stem',
        type: 'brainstem',
        position: [0, -30, -20],
        scale: [25, 35, 25],
        rotation: [0.3, 0, 0]
      }
    ];

    structures.forEach(struct => {
      const geometry = this.createSubcorticalGeometry(struct.type);
      this.surfaces[struct.name] = {
        geometry,
        ...struct,
        isSubcortical: true
      };
    });
  }

  createSubcorticalGeometry(type) {
    let geometry;
    
    switch (type) {
      case 'hippocampus':
        // Create curved seahorse-like shape
        geometry = new THREE.CylinderGeometry(1, 0.5, 2, 8, 4);
        // Add curve deformation
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i);
          const curve = Math.sin(y * Math.PI) * 0.3;
          positions.setX(i, positions.getX(i) + curve);
        }
        break;
        
      case 'amygdala':
        // Create almond-shaped structure
        geometry = new THREE.SphereGeometry(1, 16, 12);
        geometry.scale(0.8, 1, 1.2);
        break;
        
      case 'thalamus':
        // Create egg-shaped structure
        geometry = new THREE.SphereGeometry(1, 16, 16);
        geometry.scale(1, 0.8, 1.1);
        break;
        
      case 'brainstem':
        // Create tapered cylinder
        geometry = new THREE.CylinderGeometry(0.6, 1, 2, 12, 4);
        break;
        
      default:
        geometry = new THREE.SphereGeometry(1, 16, 16);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }

  load10_20Electrodes() {
    // Standard 10-20 EEG electrode positions in MNI space
    // These are approximate positions on a standard brain
    return {
      // Frontal
      'Fp1': { position: [-20, 80, 30], group: 'frontal', color: 0xff0000 },
      'Fp2': { position: [20, 80, 30], group: 'frontal', color: 0xff0000 },
      'F7': { position: [-60, 50, 30], group: 'frontal', color: 0xff0000 },
      'F3': { position: [-40, 50, 50], group: 'frontal', color: 0xff0000 },
      'Fz': { position: [0, 50, 60], group: 'frontal', color: 0xff0000 },
      'F4': { position: [40, 50, 50], group: 'frontal', color: 0xff0000 },
      'F8': { position: [60, 50, 30], group: 'frontal', color: 0xff0000 },
      
      // Temporal
      'T3': { position: [-80, 0, 0], group: 'temporal', color: 0x00ff00 },
      'T4': { position: [80, 0, 0], group: 'temporal', color: 0x00ff00 },
      'T5': { position: [-70, -50, 0], group: 'temporal', color: 0x00ff00 },
      'T6': { position: [70, -50, 0], group: 'temporal', color: 0x00ff00 },
      
      // Central
      'C3': { position: [-50, 0, 70], group: 'central', color: 0x0000ff },
      'Cz': { position: [0, 0, 90], group: 'central', color: 0x0000ff },
      'C4': { position: [50, 0, 70], group: 'central', color: 0x0000ff },
      
      // Parietal
      'P3': { position: [-40, -50, 50], group: 'parietal', color: 0xffff00 },
      'Pz': { position: [0, -50, 60], group: 'parietal', color: 0xffff00 },
      'P4': { position: [40, -50, 50], group: 'parietal', color: 0xffff00 },
      
      // Occipital
      'O1': { position: [-20, -80, 10], group: 'occipital', color: 0xff00ff },
      'O2': { position: [20, -80, 10], group: 'occipital', color: 0xff00ff },
      
      // Additional 10-10 positions
      'AF3': { position: [-30, 65, 40], group: 'frontal', color: 0xff6600 },
      'AF4': { position: [30, 65, 40], group: 'frontal', color: 0xff6600 },
      'FC1': { position: [-20, 25, 65], group: 'frontal-central', color: 0x9900ff },
      'FC2': { position: [20, 25, 65], group: 'frontal-central', color: 0x9900ff },
      'FC5': { position: [-55, 25, 40], group: 'frontal-central', color: 0x9900ff },
      'FC6': { position: [55, 25, 40], group: 'frontal-central', color: 0x9900ff },
      'CP1': { position: [-20, -25, 65], group: 'central-parietal', color: 0x00ffff },
      'CP2': { position: [20, -25, 65], group: 'central-parietal', color: 0x00ffff },
      'CP5': { position: [-55, -25, 40], group: 'central-parietal', color: 0x00ffff },
      'CP6': { position: [55, -25, 40], group: 'central-parietal', color: 0x00ffff },
      'PO3': { position: [-30, -65, 40], group: 'parietal-occipital', color: 0xff0099 },
      'PO4': { position: [30, -65, 40], group: 'parietal-occipital', color: 0xff0099 }
    };
  }

  // Get Desikan-Killiany atlas regions
  getDesikanKillianyRegions() {
    return {
      left: [
        'lh-bankssts', 'lh-caudalanteriorcingulate', 'lh-caudalmiddlefrontal',
        'lh-cuneus', 'lh-entorhinal', 'lh-fusiform', 'lh-inferiorparietal',
        'lh-inferiortemporal', 'lh-isthmuscingulate', 'lh-lateraloccipital',
        'lh-lateralorbitofrontal', 'lh-lingual', 'lh-medialorbitofrontal',
        'lh-middletemporal', 'lh-parahippocampal', 'lh-paracentral',
        'lh-parsopercularis', 'lh-parsorbitalis', 'lh-parstriangularis',
        'lh-pericalcarine', 'lh-postcentral', 'lh-posteriorcingulate',
        'lh-precentral', 'lh-precuneus', 'lh-rostralanteriorcingulate',
        'lh-rostralmiddlefrontal', 'lh-superiorfrontal', 'lh-superiorparietal',
        'lh-superiortemporal', 'lh-supramarginal', 'lh-frontalpole',
        'lh-temporalpole', 'lh-transversetemporal', 'lh-insula'
      ],
      right: [
        // Same regions for right hemisphere with 'rh-' prefix
      ]
    };
  }
}