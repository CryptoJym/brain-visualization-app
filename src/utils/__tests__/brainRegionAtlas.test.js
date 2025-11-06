import { describe, it, expect } from 'vitest';
import BASE_BRAIN_ATLAS, {
  brainSystemsPalette,
  getBrainRegionMetadata,
  enumerateRegionNodes,
} from '../brainRegionAtlas';

describe('brainRegionAtlas', () => {
  describe('BASE_BRAIN_ATLAS', () => {
    it('should contain brain region definitions', () => {
      expect(BASE_BRAIN_ATLAS).toBeDefined();
      expect(typeof BASE_BRAIN_ATLAS).toBe('object');
      expect(Object.keys(BASE_BRAIN_ATLAS).length).toBeGreaterThan(0);
    });

    it('should include common brain regions', () => {
      const expectedRegions = [
        'Amygdala',
        'Hippocampus',
        'Prefrontal Cortex',
        'Insula',
        'Thalamus',
      ];

      expectedRegions.forEach(region => {
        expect(BASE_BRAIN_ATLAS).toHaveProperty(region);
      });
    });

    it('should have required properties for each region', () => {
      const regionKeys = Object.keys(BASE_BRAIN_ATLAS);

      regionKeys.forEach(key => {
        const region = BASE_BRAIN_ATLAS[key];

        expect(region).toHaveProperty('position');
        expect(Array.isArray(region.position)).toBe(true);
        expect(region.position.length).toBe(3);

        expect(region).toHaveProperty('hemisphere');
        expect(region).toHaveProperty('system');
        expect(region).toHaveProperty('type');
        expect(region).toHaveProperty('description');
      });
    });

    it('should have valid position coordinates', () => {
      const regionKeys = Object.keys(BASE_BRAIN_ATLAS);

      regionKeys.forEach(key => {
        const region = BASE_BRAIN_ATLAS[key];
        const [x, y, z] = region.position;

        expect(typeof x).toBe('number');
        expect(typeof y).toBe('number');
        expect(typeof z).toBe('number');

        expect(isFinite(x)).toBe(true);
        expect(isFinite(y)).toBe(true);
        expect(isFinite(z)).toBe(true);
      });
    });

    it('should categorize regions by hemisphere', () => {
      const regionKeys = Object.keys(BASE_BRAIN_ATLAS);
      const validHemispheres = ['left', 'right', 'bilateral', 'midline'];

      regionKeys.forEach(key => {
        const region = BASE_BRAIN_ATLAS[key];
        expect(validHemispheres).toContain(region.hemisphere);
      });
    });

    it('should categorize regions by type', () => {
      const regionKeys = Object.keys(BASE_BRAIN_ATLAS);
      const validTypes = ['cortical', 'subcortical'];

      regionKeys.forEach(key => {
        const region = BASE_BRAIN_ATLAS[key];
        expect(validTypes).toContain(region.type);
      });
    });
  });

  describe('brainSystemsPalette', () => {
    it('should define color palette for brain systems', () => {
      expect(brainSystemsPalette).toBeDefined();
      expect(typeof brainSystemsPalette).toBe('object');
      expect(Object.keys(brainSystemsPalette).length).toBeGreaterThan(0);
    });

    it('should include colors for main brain systems', () => {
      const expectedSystems = [
        'Executive Control',
        'Limbic System',
        'Memory Network',
      ];

      expectedSystems.forEach(system => {
        expect(brainSystemsPalette).toHaveProperty(system);
      });
    });

    it('should have valid hex color codes', () => {
      const systemKeys = Object.keys(brainSystemsPalette);
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      systemKeys.forEach(key => {
        const color = brainSystemsPalette[key];
        expect(typeof color).toBe('string');
        expect(hexColorRegex.test(color)).toBe(true);
      });
    });
  });

  describe('getBrainRegionMetadata', () => {
    it('should return metadata for known brain regions', () => {
      const metadata = getBrainRegionMetadata('Amygdala');

      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty('position');
      expect(metadata).toHaveProperty('hemisphere');
      expect(metadata).toHaveProperty('system');
      expect(metadata).toHaveProperty('type');
      expect(metadata).toHaveProperty('description');
    });

    it('should return same data as BASE_BRAIN_ATLAS', () => {
      const regionName = 'Hippocampus';
      const metadata = getBrainRegionMetadata(regionName);
      const atlasData = BASE_BRAIN_ATLAS[regionName];

      expect(metadata).toEqual(atlasData);
    });

    it('should return undefined for unknown regions', () => {
      const metadata = getBrainRegionMetadata('Nonexistent Region XYZ');
      expect(metadata).toBeUndefined();
    });

    it('should handle all regions in atlas', () => {
      const regionKeys = Object.keys(BASE_BRAIN_ATLAS);

      regionKeys.forEach(key => {
        const metadata = getBrainRegionMetadata(key);
        expect(metadata).toBeDefined();
        expect(metadata).toEqual(BASE_BRAIN_ATLAS[key]);
      });
    });
  });

  describe('enumerateRegionNodes', () => {
    it('should return an array of region nodes', () => {
      const nodes = enumerateRegionNodes({});

      expect(Array.isArray(nodes)).toBe(true);
    });

    it('should include all atlas regions when no impacts provided', () => {
      const nodes = enumerateRegionNodes({});
      const atlasKeys = Object.keys(BASE_BRAIN_ATLAS);

      expect(nodes.length).toBeGreaterThan(0);
      // Should have nodes for all atlas regions
      expect(nodes.length).toBeGreaterThanOrEqual(atlasKeys.length);
    });

    it('should add impact data to regions when provided', () => {
      const brainImpacts = {
        'Amygdala': {
          impactType: 'volume_reduction',
          impactPercentage: 15,
          severity: 'moderate',
        },
      };

      const nodes = enumerateRegionNodes(brainImpacts);
      const amygdalaNode = nodes.find(node => node.name === 'Amygdala');

      expect(amygdalaNode).toBeDefined();
      expect(amygdalaNode).toHaveProperty('impact');
      expect(amygdalaNode.impact).toEqual(brainImpacts['Amygdala']);
    });

    it('should include position data for each node', () => {
      const nodes = enumerateRegionNodes({});

      nodes.forEach(node => {
        expect(node).toHaveProperty('position');
        expect(Array.isArray(node.position)).toBe(true);
        expect(node.position.length).toBe(3);
      });
    });

    it('should include system and type for each node', () => {
      const nodes = enumerateRegionNodes({});

      nodes.forEach(node => {
        expect(node).toHaveProperty('system');
        expect(node).toHaveProperty('type');
        expect(typeof node.system).toBe('string');
        expect(typeof node.type).toBe('string');
      });
    });
  });
});
