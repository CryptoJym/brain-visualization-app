import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isKeyConfigured,
  getConfigurationStatus,
  generateErrorMessage,
  FEATURE_REQUIREMENTS,
} from '../apiKeyValidator';

describe('apiKeyValidator', () => {
  describe('isKeyConfigured', () => {
    it('should return true for configured API key', () => {
      expect(isKeyConfigured('VITE_ANTHROPIC_API_KEY')).toBe(true);
    });

    it('should return false for undefined API key', () => {
      expect(isKeyConfigured('VITE_NONEXISTENT_KEY')).toBe(false);
    });

    it('should return false for empty API key', () => {
      vi.stubEnv('VITE_EMPTY_KEY', '');
      expect(isKeyConfigured('VITE_EMPTY_KEY')).toBe(false);
    });

    it('should return false for whitespace-only API key', () => {
      vi.stubEnv('VITE_WHITESPACE_KEY', '   ');
      expect(isKeyConfigured('VITE_WHITESPACE_KEY')).toBe(false);
    });
  });

  describe('getConfigurationStatus', () => {
    it('should return status object with all features', () => {
      const status = getConfigurationStatus();

      expect(status).toHaveProperty('Conversational Assessment');
      expect(status).toHaveProperty('AI Brain Visualizations');
      expect(status).toHaveProperty('Personalized Memory');
    });

    it('should mark feature as available when all keys are configured', () => {
      const status = getConfigurationStatus();

      // All keys are mocked in setup.js
      expect(status['Conversational Assessment'].available).toBe(true);
      expect(status['Conversational Assessment'].missingKeys).toEqual([]);
    });

    it('should identify missing keys for a feature', () => {
      vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');

      const status = getConfigurationStatus();

      expect(status['Conversational Assessment'].available).toBe(false);
      expect(status['Conversational Assessment'].missingKeys).toContain('VITE_ANTHROPIC_API_KEY');
    });
  });

  describe('generateErrorMessage', () => {
    it('should return null when feature is fully configured', () => {
      const error = generateErrorMessage('Conversational Assessment');
      expect(error).toBeNull();
    });

    it('should return error object when feature has missing keys', () => {
      vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');

      const error = generateErrorMessage('Conversational Assessment');

      expect(error).not.toBeNull();
      expect(error).toHaveProperty('title');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('missingKeys');
      expect(error.missingKeys).toContain('VITE_ANTHROPIC_API_KEY');
    });

    it('should return null for unknown feature name', () => {
      const error = generateErrorMessage('Nonexistent Feature');
      expect(error).toBeNull();
    });
  });

  describe('FEATURE_REQUIREMENTS', () => {
    it('should define requirements for Conversational Assessment', () => {
      expect(FEATURE_REQUIREMENTS).toHaveProperty('Conversational Assessment');
      expect(FEATURE_REQUIREMENTS['Conversational Assessment']).toContain('VITE_ANTHROPIC_API_KEY');
    });

    it('should define requirements for AI Brain Visualizations', () => {
      expect(FEATURE_REQUIREMENTS).toHaveProperty('AI Brain Visualizations');
      const requirements = FEATURE_REQUIREMENTS['AI Brain Visualizations'];

      // Should require either OpenRouter or NanoBanana
      expect(
        requirements.includes('VITE_OPENROUTER_API_KEY') ||
        requirements.includes('VITE_NANOBANANA_API_KEY')
      ).toBe(true);
    });

    it('should define requirements for Personalized Memory', () => {
      expect(FEATURE_REQUIREMENTS).toHaveProperty('Personalized Memory');
      expect(FEATURE_REQUIREMENTS['Personalized Memory']).toContain('VITE_MEM0_API_KEY');
    });
  });
});
