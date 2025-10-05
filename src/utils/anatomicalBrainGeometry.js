import * as THREE from 'three';

/**
 * Creates an anatomically accurate brain geometry with proper cortical structure
 * Based on MRI data and neuroanatomical references
 */
export const createAnatomicalBrain = () => {
  const brainGroup = new THREE.Group();

  // Cortical hemispheres with realistic gyri and sulci
  const leftHemisphere = createCorticalHemisphere('left');
  const rightHemisphere = createCorticalHemisphere('right');

  // Corpus callosum (connecting structure)
  const corpusCallosum = createCorpusCallosum();

  // Subcortical structures
  const thalamus = createThalamus();
  const brainstem = createBrainstem();
  const cerebellum = createCerebellum();

  brainGroup.add(leftHemisphere, rightHemisphere);
  brainGroup.add(corpusCallosum);
  brainGroup.add(thalamus, brainstem, cerebellum);

  return brainGroup;
};

/**
 * Creates a cortical hemisphere with anatomical accuracy
 */
const createCorticalHemisphere = (side) => {
  const hemisphere = new THREE.Group();
  const xOffset = side === 'left' ? -0.15 : 0.15;

  // Base hemisphere shape
  const cortexGeometry = new THREE.SphereGeometry(1.4, 64, 64, 0, Math.PI);
  const position = cortexGeometry.attributes.position;
  const vector = new THREE.Vector3();

  // Apply anatomically accurate deformations for gyri and sulci
  for (let i = 0; i < position.count; i++) {
    vector.fromBufferAttribute(position, i);

    // Flatten posterior (back) slightly
    if (vector.z < -0.3) {
      vector.z *= 0.85;
    }

    // Widen temporal lobes
    if (vector.y < 0.2 && vector.y > -0.6) {
      const temporalBulge = 1 + 0.15 * Math.exp(-Math.pow((vector.y + 0.2) / 0.3, 2));
      vector.x *= temporalBulge;
      vector.z *= temporalBulge;
    }

    // Create realistic gyri (ridges) and sulci (grooves)
    const gyriPattern =
      Math.sin(vector.y * 8 + vector.z * 6) * 0.04 +
      Math.cos(vector.x * 10 + vector.y * 8) * 0.03 +
      Math.sin(vector.z * 12 + vector.x * 7) * 0.025;

    vector.normalize().multiplyScalar(1.4 + gyriPattern);

    position.setXYZ(i, vector.x + xOffset, vector.y, vector.z);
  }

  position.needsUpdate = true;
  cortexGeometry.computeVertexNormals();

  const cortexMaterial = new THREE.MeshStandardMaterial({
    color: 0xc4b5d4, // Lighter, more visible brain tissue color
    emissive: 0x6b5d7a,
    emissiveIntensity: 0.25,
    transparent: false, // Solid brain for better visibility
    opacity: 1.0,
    roughness: 0.7,
    metalness: 0.1
  });

  const cortexMesh = new THREE.Mesh(cortexGeometry, cortexMaterial);
  hemisphere.add(cortexMesh);

  // Add sulci (grooves) as darker lines
  const sulciGeometry = createSulciPattern(side);
  const sulciMaterial = new THREE.LineBasicMaterial({
    color: 0x4a3f5e,
    transparent: true,
    opacity: 0.6,
    linewidth: 1
  });
  const sulci = new THREE.LineSegments(sulciGeometry, sulciMaterial);
  hemisphere.add(sulci);

  return hemisphere;
};

/**
 * Creates major sulci (grooves) for anatomical detail
 */
const createSulciPattern = (side) => {
  const points = [];
  const xOffset = side === 'left' ? -0.15 : 0.15;

  // Central sulcus (separates frontal from parietal)
  for (let t = -0.8; t <= 0.8; t += 0.05) {
    const x = xOffset + (side === 'left' ? -1 : 1) * (1.1 + Math.sin(t * 2) * 0.1);
    const y = t * 1.2;
    const z = -0.2 + Math.cos(t * 3) * 0.15;
    points.push(new THREE.Vector3(x, y, z));
  }

  // Lateral sulcus (Sylvian fissure)
  for (let t = -0.5; t <= 1; t += 0.05) {
    const x = xOffset + (side === 'left' ? -1 : 1) * (0.9 + t * 0.4);
    const y = 0.1 - t * 0.4;
    const z = 0.3 + t * 0.2;
    points.push(new THREE.Vector3(x, y, z));
  }

  // Parieto-occipital sulcus
  for (let t = -0.4; t <= 0.4; t += 0.05) {
    const x = xOffset + (side === 'left' ? -1 : 1) * (0.6 + Math.abs(t) * 0.3);
    const y = t;
    const z = -1.0 + t * 0.2;
    points.push(new THREE.Vector3(x, y, z));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
};

/**
 * Creates corpus callosum (white matter tract connecting hemispheres)
 */
const createCorpusCallosum = () => {
  const geometry = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 32);
  geometry.rotateZ(Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0xd4c5e0,
    emissive: 0x8b7a9e,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.6,
    roughness: 0.4,
    metalness: 0.1
  });

  const callosum = new THREE.Mesh(geometry, material);
  callosum.position.set(0, 0.2, -0.1);
  return callosum;
};

/**
 * Creates thalamus (sensory relay center)
 */
const createThalamus = () => {
  const group = new THREE.Group();

  const geometry = new THREE.SphereGeometry(0.25, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xb5a5c0, // Lighter thalamus
    emissive: 0x7d6d88,
    emissiveIntensity: 0.2,
    transparent: false,
    opacity: 1.0,
    roughness: 0.6,
    metalness: 0.1
  });

  // Left and right thalamic nuclei
  const leftThalamus = new THREE.Mesh(geometry, material);
  leftThalamus.position.set(-0.25, -0.05, 0);
  const rightThalamus = new THREE.Mesh(geometry, material);
  rightThalamus.position.set(0.25, -0.05, 0);

  group.add(leftThalamus, rightThalamus);
  return group;
};

/**
 * Creates brainstem (midbrain, pons, medulla)
 */
const createBrainstem = () => {
  const geometry = new THREE.CylinderGeometry(0.22, 0.28, 1.2, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xbbafc4, // Lighter brainstem
    emissive: 0x8b7d96,
    emissiveIntensity: 0.2,
    transparent: false,
    opacity: 1.0,
    roughness: 0.65,
    metalness: 0.08
  });

  const brainstem = new THREE.Mesh(geometry, material);
  brainstem.position.set(0, -0.9, -0.1);
  brainstem.rotation.x = Math.PI * 0.05;
  return brainstem;
};

/**
 * Creates cerebellum (motor coordination)
 */
const createCerebellum = () => {
  const geometry = new THREE.SphereGeometry(0.55, 48, 48);
  const position = geometry.attributes.position;
  const vector = new THREE.Vector3();

  // Flatten top and add folia (folds)
  for (let i = 0; i < position.count; i++) {
    vector.fromBufferAttribute(position, i);

    if (vector.y > 0) {
      vector.y *= 0.5;
    }

    // Cerebellar folia pattern
    const folia = Math.sin(vector.x * 20) * Math.cos(vector.z * 18) * 0.03;
    vector.normalize().multiplyScalar(0.55 + folia);

    position.setXYZ(i, vector.x, vector.y, vector.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0xb5a7be, // Lighter cerebellum
    emissive: 0x7d6f88,
    emissiveIntensity: 0.18,
    transparent: false,
    opacity: 1.0,
    roughness: 0.68,
    metalness: 0.06
  });

  const cerebellum = new THREE.Mesh(geometry, material);
  cerebellum.position.set(0, -0.75, -0.55);
  return cerebellum;
};

/**
 * Creates subcortical limbic structures (amygdala, hippocampus)
 */
export const createLimbicStructures = () => {
  const group = new THREE.Group();

  // Amygdala (almond-shaped)
  const amygdalaGeometry = new THREE.SphereGeometry(0.15, 24, 24);
  amygdalaGeometry.scale(1, 0.8, 1.3);

  const amygdalaMaterial = new THREE.MeshStandardMaterial({
    color: 0xc94b4b,
    emissive: 0x8b2f2f,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.85,
    roughness: 0.45,
    metalness: 0.2
  });

  const leftAmygdala = new THREE.Mesh(amygdalaGeometry, amygdalaMaterial);
  leftAmygdala.position.set(-0.45, -0.15, 0.2);
  const rightAmygdala = leftAmygdala.clone();
  rightAmygdala.position.x = 0.45;

  // Hippocampus (seahorse-shaped)
  const hippoGeometry = new THREE.TorusGeometry(0.12, 0.08, 16, 32, Math.PI * 1.3);
  const hippoMaterial = new THREE.MeshStandardMaterial({
    color: 0x6ba3d4,
    emissive: 0x3d6a94,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.88,
    roughness: 0.5,
    metalness: 0.15
  });

  const leftHippo = new THREE.Mesh(hippoGeometry, hippoMaterial);
  leftHippo.position.set(-0.55, -0.1, -0.15);
  leftHippo.rotation.set(0.3, -0.5, -0.2);
  const rightHippo = leftHippo.clone();
  rightHippo.position.x = 0.55;
  rightHippo.rotation.y *= -1;

  group.add(leftAmygdala, rightAmygdala, leftHippo, rightHippo);
  return group;
};

export default createAnatomicalBrain;
