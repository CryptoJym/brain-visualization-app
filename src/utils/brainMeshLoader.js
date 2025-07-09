import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// Brain region mapping to mesh parts
// This maps our region IDs to common brain atlas labels
export const regionToMeshPartMapping = {
  // Frontal regions
  dlPFC: ['superiorfrontal', 'middlefrontal', 'rostralmiddlefrontal'],
  vmPFC: ['medialorbitofrontal', 'frontalpole'],
  OFC: ['lateralorbitofrontal', 'medialorbitofrontal'],
  ACC: ['rostralanteriorcingulate', 'caudalanteriorcingulate'],
  
  // Temporal regions
  amygdala: ['amygdala'],
  hippocampus: ['hippocampus'],
  STG: ['superiortemporal'],
  MTG: ['middletemporal'],
  ITG: ['inferiortemporal'],
  fusiform_gyrus: ['fusiform'],
  
  // Parietal regions
  IPL: ['inferiorparietal'],
  SPL: ['superiorparietal'],
  precuneus: ['precuneus'],
  angular_gyrus: ['angulargyrus'],
  
  // Subcortical
  thalamus: ['thalamus'],
  hypothalamus: ['hypothalamus'],
  caudate: ['caudate'],
  putamen: ['putamen'],
  globus_pallidus: ['pallidum'],
  nucleus_accumbens: ['accumbens'],
  
  // Brainstem
  PAG: ['periaqueductal'],
  locus_coeruleus: ['locus_coeruleus'],
  raphe_nuclei: ['raphe'],
  
  // Cerebellum
  cerebellar_vermis: ['vermis'],
  cerebellar_hemispheres: ['cerebellum'],
  
  // Other
  insula: ['insula'],
  corpus_callosum: ['corpuscallosum']
};

// Load brain mesh from URL or local file
export async function loadBrainMesh(url) {
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const brainModel = gltf.scene;
        
        // Process the model
        brainModel.traverse((child) => {
          if (child.isMesh) {
            // Make the brain semi-transparent
            child.material = new THREE.MeshPhongMaterial({
              color: 0xffcccc,
              transparent: true,
              opacity: 0.3,
              side: THREE.DoubleSide
            });
            
            // Store original material for later use
            child.userData.originalMaterial = child.material.clone();
          }
        });
        
        resolve(brainModel);
      },
      (progress) => {
        console.log('Loading brain model...', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading brain model:', error);
        reject(error);
      }
    );
  });
}

// Create region highlights on the brain mesh
export function createRegionHighlight(brainMesh, regionId, impactData) {
  const meshParts = regionToMeshPartMapping[regionId] || [];
  const highlights = [];
  
  brainMesh.traverse((child) => {
    if (child.isMesh && child.name) {
      // Check if this mesh part corresponds to our region
      const meshName = child.name.toLowerCase();
      const isRegionMesh = meshParts.some(part => 
        meshName.includes(part.toLowerCase())
      );
      
      if (isRegionMesh) {
        // Create highlight material based on impact
        const highlightColor = impactData.impactStrength > 0.8 ? 0xff0000 :
                              impactData.impactStrength > 0.5 ? 0xffa500 :
                              impactData.impactStrength > 0 ? 0xffff00 : 0xcccccc;
        
        const highlightMaterial = new THREE.MeshPhongMaterial({
          color: highlightColor,
          transparent: true,
          opacity: 0.7,
          emissive: highlightColor,
          emissiveIntensity: 0.3
        });
        
        // Store original material and apply highlight
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }
        child.material = highlightMaterial;
        
        highlights.push({
          mesh: child,
          originalMaterial: child.userData.originalMaterial,
          highlightMaterial
        });
      }
    }
  });
  
  return highlights;
}

// Reset all highlights
export function resetBrainHighlights(brainMesh) {
  brainMesh.traverse((child) => {
    if (child.isMesh && child.userData.originalMaterial) {
      child.material = child.userData.originalMaterial;
    }
  });
}

// Create a fallback brain mesh if no model is available
export function createFallbackBrainMesh() {
  const group = new THREE.Group();
  
  // Create a more detailed brain shape using multiple geometries
  
  // Main brain body (cerebrum)
  const cerebrumGeometry = new THREE.SphereGeometry(3, 64, 64);
  cerebrumGeometry.scale(1.2, 1, 1.4);
  
  // Create the longitudinal fissure (split between hemispheres)
  const fissureGeometry = new THREE.BoxGeometry(0.1, 4, 4);
  const fissure = new THREE.Mesh(
    fissureGeometry,
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  
  // Left hemisphere
  const leftHemisphere = new THREE.Mesh(
    cerebrumGeometry,
    new THREE.MeshPhongMaterial({ 
      color: 0xffc0cb,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
  );
  leftHemisphere.position.set(-0.6, 0, 0);
  
  // Right hemisphere
  const rightHemisphere = new THREE.Mesh(
    cerebrumGeometry.clone(),
    new THREE.MeshPhongMaterial({ 
      color: 0xffc0cb,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
  );
  rightHemisphere.position.set(0.6, 0, 0);
  
  // Cerebellum with more detail
  const cerebellumGeometry = new THREE.SphereGeometry(1.8, 32, 32);
  cerebellumGeometry.scale(1.5, 0.8, 1.2);
  
  // Add ridges to cerebellum
  const cerebellum = new THREE.Mesh(
    cerebellumGeometry,
    new THREE.MeshPhongMaterial({ 
      color: 0xffd4e5,
      transparent: true,
      opacity: 0.4,
      bumpScale: 0.1
    })
  );
  cerebellum.position.set(0, -2.5, -2.5);
  
  // Brain stem with more detail
  const brainStemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.5, -0.5),
    new THREE.Vector3(0, -2.0, -1.0),
    new THREE.Vector3(0, -3.0, -1.5),
    new THREE.Vector3(0, -3.5, -2.0)
  ]);
  
  const brainStemGeometry = new THREE.TubeGeometry(brainStemCurve, 20, 0.6, 8, false);
  const brainStem = new THREE.Mesh(
    brainStemGeometry,
    new THREE.MeshPhongMaterial({ 
      color: 0xffe4e1,
      transparent: true,
      opacity: 0.4
    })
  );
  
  // Add all parts to the group
  group.add(leftHemisphere);
  group.add(rightHemisphere);
  group.add(fissure);
  group.add(cerebellum);
  group.add(brainStem);
  
  return group;
}