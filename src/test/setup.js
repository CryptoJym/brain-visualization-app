import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'test-anthropic-key');
vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-openrouter-key');
vi.stubEnv('VITE_NANOBANANA_API_KEY', 'test-nanobanana-key');
vi.stubEnv('VITE_MEM0_API_KEY', 'test-mem0-key');
vi.stubEnv('VITE_IMAGE_MODEL', 'openai/dall-e-3');

// Mock fetch globally
global.fetch = vi.fn();
