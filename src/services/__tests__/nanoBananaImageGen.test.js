import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateBrainImage, generateRegionVisualization } from '../nanoBananaImageGen';

describe('nanoBananaImageGen', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateBrainImage', () => {
    it('should throw error if API URL not configured', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', '');

      await expect(generateBrainImage('test prompt'))
        .rejects
        .toThrow('NanoBanana API URL not configured');
    });

    it('should make POST request to NanoBanana API', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');
      vi.stubEnv('VITE_NANOBANANA_PROJECT_ID', 'test-project');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image_url: 'https://example.com/image.png' }),
      });

      const prompt = 'Side-by-side brain comparison';
      await generateBrainImage(prompt);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.nanobanana.test/generate',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Project-ID': 'test-project',
          }),
        })
      );
    });

    it('should include prompt in request body', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image_url: 'https://example.com/image.png' }),
      });

      const prompt = 'Brain with highlighted amygdala';
      await generateBrainImage(prompt);

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.prompt).toBe(prompt);
    });

    it('should return image_url from response', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');

      const imageUrl = 'https://example.com/brain-image.png';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image_url: imageUrl }),
      });

      const result = await generateBrainImage('test prompt');
      expect(result).toBe(imageUrl);
    });

    it('should handle data array response format', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');

      const imageUrl = 'https://example.com/image.png';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ url: imageUrl }] }),
      });

      const result = await generateBrainImage('test prompt');
      expect(result).toBe(imageUrl);
    });

    it('should handle base64 image responses', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');

      const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANS...';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image: base64Image }),
      });

      const result = await generateBrainImage('test prompt');
      expect(result).toBe(base64Image);
    });

    it('should add data URI prefix to base64 without prefix', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');

      const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image: base64Data }),
      });

      const result = await generateBrainImage('test prompt');
      expect(result).toBe(`data:image/png;base64,${base64Data}`);
    });

    it('should throw error on API failure', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      await expect(generateBrainImage('test prompt'))
        .rejects
        .toThrow('NanoBanana API error: 500 Internal Server Error');
    });

    it('should use default options when not provided', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image_url: 'https://example.com/image.png' }),
      });

      await generateBrainImage('test prompt');

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.size).toBe('1024x1024');
      expect(requestBody.quality).toBe('standard');
      expect(requestBody.n).toBe(1);
      expect(requestBody.style).toBe('natural');
    });

    it('should allow custom options', async () => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image_url: 'https://example.com/image.png' }),
      });

      const options = {
        size: '512x512',
        quality: 'hd',
        style: 'vivid',
      };

      await generateBrainImage('test prompt', options);

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.size).toBe('512x512');
      expect(requestBody.quality).toBe('hd');
      expect(requestBody.style).toBe('vivid');
    });
  });

  describe('generateRegionVisualization', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_NANOBANANA_API_URL', 'https://api.nanobanana.test');
    });

    it('should generate visualization for brain region', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image_url: 'https://example.com/amygdala.png' }),
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

    it('should include impact information in prompt', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image_url: 'https://example.com/hippocampus.png' }),
      });

      await generateRegionVisualization({
        regionName: 'Hippocampus',
        impactType: 'volume_reduction',
        impactPercentage: 20,
        severity: 'moderate',
      });

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      // Should mention volume reduction and percentage
      expect(requestBody.prompt.toLowerCase()).toMatch(/smaller|reduced|reduction/);
      expect(requestBody.prompt).toContain('20');
    });

    it('should handle hyperactivation impact type', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ image_url: 'https://example.com/insula.png' }),
      });

      await generateRegionVisualization({
        regionName: 'Insula',
        impactType: 'hyperactivation',
        impactPercentage: 25,
        severity: 'high',
      });

      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      // Should mention increased activity or similar
      expect(requestBody.prompt.toLowerCase()).toMatch(/larger|increased|activity|overtime/);
    });
  });
});
