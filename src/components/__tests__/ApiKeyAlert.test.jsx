import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ApiKeyAlert from '../ApiKeyAlert';

// Mock the apiKeyValidator module
vi.mock('../../utils/apiKeyValidator', () => ({
  generateErrorMessage: vi.fn((featureName) => {
    if (featureName === 'Missing Feature') {
      return {
        title: 'Missing API Configuration',
        message: 'This feature requires API keys',
        keys: ['VITE_TEST_API_KEY'],
      };
    }
    return null; // Feature is configured
  }),
  getSetupInstructions: vi.fn((key) => ({
    name: key.replace('VITE_', '').replace('_', ' '),
    url: 'https://example.com',
    steps: ['Step 1', 'Step 2'],
  })),
}));

describe('ApiKeyAlert', () => {
  it('should render nothing when feature is configured', () => {
    const { container } = render(<ApiKeyAlert featureName="Configured Feature" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render alert when feature has missing keys', () => {
    render(<ApiKeyAlert featureName="Missing Feature" />);

    expect(screen.getByText('Missing API Configuration')).toBeInTheDocument();
    expect(screen.getByText(/This feature requires API keys/)).toBeInTheDocument();
  });

  it('should display missing keys list when expanded', () => {
    render(<ApiKeyAlert featureName="Missing Feature" />);

    // Click to show details
    const toggleButton = screen.getByText(/Setup Instructions/);
    fireEvent.click(toggleButton);

    // Should show the key name (without VITE_ prefix)
    expect(screen.getByText('TEST_API_KEY')).toBeInTheDocument();
  });

  it('should toggle details on button click', () => {
    render(<ApiKeyAlert featureName="Missing Feature" />);

    const toggleButton = screen.getByText(/Setup Instructions/);

    // Initially should show "Show"
    expect(screen.getByText('Show')).toBeInTheDocument();

    // Click to show details
    fireEvent.click(toggleButton);
    expect(screen.getByText('Hide')).toBeInTheDocument();
    expect(screen.getByText('TEST_API_KEY')).toBeInTheDocument();

    // Click to hide details
    fireEvent.click(toggleButton);
    expect(screen.getByText('Show')).toBeInTheDocument();
  });

  it('should render with correct styling classes', () => {
    const { container } = render(<ApiKeyAlert featureName="Missing Feature" />);

    const alertDiv = container.querySelector('.bg-yellow-500\\/10');
    expect(alertDiv).toBeInTheDocument();
  });

  it('should show expand icon when details are hidden', () => {
    render(<ApiKeyAlert featureName="Missing Feature" />);

    // Should show right arrow (▶) and "Show" when collapsed
    expect(screen.getByText('▶')).toBeInTheDocument();
    expect(screen.getByText('Show')).toBeInTheDocument();
  });

  it('should show collapse icon when details are shown', () => {
    render(<ApiKeyAlert featureName="Missing Feature" />);

    const toggleButton = screen.getByText(/Setup Instructions/);
    fireEvent.click(toggleButton);

    // Should show down arrow (▼) and "Hide" when expanded
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByText('Hide')).toBeInTheDocument();
  });
});
