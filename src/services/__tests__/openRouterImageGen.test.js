import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateBrainImage, generateRegionVisualization } from '../openRouterImageGen';

describe('openRouterImageGen', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateBrainImage', () => {
    it('should throw error if API key not configured', async () => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', '');

      await expect(generateBrainImage('test prompt'))
        .rejects
        .toThrow('OpenRouter API key not configured');
    });

    it('should make POST request to OpenRouter API', async () => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-api-key');
      vi.stubEnv('VITE_IMAGE_MODEL', 'openai/dall-e-3');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: 'https://example.com/image.png' }],
        }),
      });

      const prompt = 'Side-by-side brain comparison';
      await generateBrainImage(prompt);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/images/generations',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include prompt and model in request', async () => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');
      vi.stubEnv('VITE_IMAGE_MODEL', 'openai/dall-e-3');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: 'https://example.com/image.png' }],
        }),
      });

      const prompt = 'Brain with highlighted regions';
      await generateBrainImage(prompt);

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.prompt).toBe(prompt);
      expect(requestBody.model).toBe('openai/dall-e-3');
    });

    it('should return image URL from response', async () => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');

      const imageUrl = 'https://example.com/brain-image.png';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: imageUrl }],
        }),
      });

      const result = await generateBrainImage('test prompt');
      expect(result).toBe(imageUrl);
    });

    it('should throw error on API failure', async () => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      await expect(generateBrainImage('test prompt'))
        .rejects
        .toThrow();
    });

    it('should handle network errors', async () => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(generateBrainImage('test prompt'))
        .rejects
        .toThrow();
    });

    it('should use custom options when provided', async () => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');
      vi.stubEnv('VITE_IMAGE_MODEL', 'openai/dall-e-3');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: 'https://example.com/image.png' }],
        }),
      });

      const options = {
        size: '512x512',
        quality: 'hd',
      };

      await generateBrainImage('test prompt', options);

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.size).toBe('512x512');
      expect(requestBody.quality).toBe('hd');
    });
  });

  describe('generateRegionVisualization', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');
      vi.stubEnv('VITE_IMAGE_MODEL', 'openai/dall-e-3');
    });

    it('should generate visualization for brain region', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: 'https://example.com/amygdala.png' }],
        }),
      });

      const result = await generateRegionVisualization({
        regionName: 'Amygdala',
        impactType: 'volume_reduction',
        impactPercentage: 15,
        severity: 'moderate',
      });

      expect(result).toBe('https://example.com/amygdala.png');
      expect(global.fetch).toHaveBeenCalled();

      // Check that prompt includes region name
      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.prompt.toLowerCase()).toContain('amygdala');
    });

    it('should create appropriate prompt for volume reduction', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: 'https://example.com/hippocampus.png' }],
        }),
      });

      await generateRegionVisualization({
        regionName: 'Hippocampus',
        impactType: 'volume_reduction',
        impactPercentage: 20,
        severity: 'moderate',
      });

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      // Should mention reduction and be side-by-side comparison
      expect(requestBody.prompt.toLowerCase()).toMatch(/smaller|reduced|reduction/);
      expect(requestBody.prompt.toLowerCase()).toContain('side');
    });

    it('should create appropriate prompt for hyperactivation', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: 'https://example.com/prefrontal.png' }],
        }),
      });

      await generateRegionVisualization({
        regionName: 'Prefrontal Cortex',
        impactType: 'hyperactivation',
        impactPercentage: 30,
        severity: 'high',
      });

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      // Should mention increased activity
      expect(requestBody.prompt.toLowerCase()).toMatch(/larger|increased|activity|overtime/);
    });

    it('should include percentage in prompt', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: 'https://example.com/insula.png' }],
        }),
      });

      await generateRegionVisualization({
        regionName: 'Insula',
        impactType: 'volume_reduction',
        impactPercentage: 25,
        severity: 'moderate',
      });

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.prompt).toContain('25');
    });
  });
});
