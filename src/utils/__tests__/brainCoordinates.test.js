import { describe, it, expect } from 'vitest';
import {
  mniToThreeJS,
  getRegionCoordinates,
  findClosestRegion,
} from '../brainCoordinates';

describe('brainCoordinates', () => {
  describe('mniToThreeJS', () => {
    it('should convert MNI coordinates to Three.js coordinates', () => {
      const mniCoords = [10, 20, 30];
      const threeCoords = mniToThreeJS(mniCoords);

      expect(threeCoords).toHaveProperty('x');
      expect(threeCoords).toHaveProperty('y');
      expect(threeCoords).toHaveProperty('z');

      // MNI X maps to Three.js X with scaling
      expect(threeCoords.x).toBe(10 * 0.01);
      // MNI Z maps to Three.js Y with scaling
      expect(threeCoords.y).toBe(30 * 0.01);
      // MNI Y maps to Three.js -Z with scaling (flipped)
      expect(threeCoords.z).toBe(-20 * 0.01);
    });

    it('should handle negative coordinates', () => {
      const mniCoords = [-10, -20, -30];
      const threeCoords = mniToThreeJS(mniCoords);

      expect(threeCoords.x).toBe(-10 * 0.01);
      expect(threeCoords.y).toBe(-30 * 0.01);
      expect(threeCoords.z).toBe(20 * 0.01); // Note: flipped sign
    });

    it('should handle zero coordinates', () => {
      const mniCoords = [0, 0, 0];
      const threeCoords = mniToThreeJS(mniCoords);

      expect(threeCoords.x).toBe(0);
      expect(threeCoords.y).toBe(0);
      expect(threeCoords.z).toBe(0);
    });

    it('should scale coordinates by 0.01', () => {
      const mniCoords = [100, 200, 300];
      const threeCoords = mniToThreeJS(mniCoords);

      expect(threeCoords.x).toBe(1);
      expect(threeCoords.y).toBe(3);
      expect(threeCoords.z).toBe(-2);
    });
  });

  describe('getRegionCoordinates', () => {
    it('should return an object with brain regions', () => {
      const coordinates = getRegionCoordinates();

      expect(coordinates).toBeDefined();
      expect(typeof coordinates).toBe('object');
    });

    it('should contain common brain regions', () => {
      const coordinates = getRegionCoordinates();

      // Check for some expected regions (normalized names)
      const regionKeys = Object.keys(coordinates);
      expect(regionKeys.length).toBeGreaterThan(0);

      // Regions should have required properties
      const firstRegion = coordinates[regionKeys[0]];
      expect(firstRegion).toHaveProperty('mni_coords');
      expect(firstRegion).toHaveProperty('three_coords');
      expect(firstRegion).toHaveProperty('structure_type');
      expect(firstRegion).toHaveProperty('hemisphere');
    });

    it('should normalize region names to lowercase with underscores', () => {
      const coordinates = getRegionCoordinates();
      const regionKeys = Object.keys(coordinates);

      // All keys should be lowercase and use underscores
      regionKeys.forEach(key => {
        expect(key).toBe(key.toLowerCase());
        expect(key).not.toMatch(/\s/); // No spaces
      });
    });

    it('should include both MNI and Three.js coordinates for each region', () => {
      const coordinates = getRegionCoordinates();
      const regionKeys = Object.keys(coordinates);

      regionKeys.forEach(key => {
        const region = coordinates[key];
        expect(Array.isArray(region.mni_coords)).toBe(true);
        expect(region.mni_coords.length).toBe(3);

        expect(region.three_coords).toHaveProperty('x');
        expect(region.three_coords).toHaveProperty('y');
        expect(region.three_coords).toHaveProperty('z');
      });
    });
  });

  describe('findClosestRegion', () => {
    it('should find a matching region for known impact areas', () => {
      // Common brain regions that should have matches
      const testCases = [
        'Amygdala',
        'Hippocampus',
        'Prefrontal Cortex',
        'Insula',
      ];

      testCases.forEach(regionName => {
        const result = findClosestRegion(regionName);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('mni_coords');
        expect(result).toHaveProperty('three_coords');
      });
    });

    it('should handle case-insensitive region names', () => {
      const result1 = findClosestRegion('Amygdala');
      const result2 = findClosestRegion('amygdala');
      const result3 = findClosestRegion('AMYGDALA');

      // All should return results (may differ based on implementation)
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result3).toBeDefined();
    });

    it('should return undefined or null for non-existent regions', () => {
      const result = findClosestRegion('Nonexistent Brain Region XYZ');
      expect(result === undefined || result === null).toBe(true);
    });
  });
});
