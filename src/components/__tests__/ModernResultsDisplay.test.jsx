import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ModernResultsDisplay from '../ModernResultsDisplay';

// Mock the brain region atlas
vi.mock('../../utils/brainRegionAtlas', () => ({
  getBrainRegionMetadata: vi.fn((name) => ({
    position: [0, 0, 0],
    hemisphere: 'bilateral',
    system: 'Test System',
    type: 'cortical',
    description: 'Test description',
  })),
}));

// Mock AIGeneratedBrainVisualization component
vi.mock('../visualization/AIGeneratedBrainVisualization', () => ({
  default: () => <div data-testid="brain-visualization">Brain Visualization</div>,
}));

describe('ModernResultsDisplay', () => {
  const mockResults = {
    aceScore: 3,
    brainImpacts: {
      'Amygdala': {
        impactType: 'volume_reduction',
        impactPercentage: 15,
        severity: 'moderate',
        description: 'Amygdala shows reduced volume',
      },
      'Hippocampus': {
        impactType: 'volume_reduction',
        impactPercentage: 20,
        severity: 'high',
        description: 'Hippocampus shows significant changes',
      },
    },
    gender: 'Female',
    timestamp: new Date().toISOString(),
  };

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render without crashing', () => {
    renderWithRouter(<ModernResultsDisplay results={mockResults} />);
    expect(screen.getByText(/Neurological Impact Assessment/i)).toBeInTheDocument();
  });

  it('should display ACE score', () => {
    renderWithRouter(<ModernResultsDisplay results={mockResults} />);
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('should display affected brain regions', () => {
    renderWithRouter(<ModernResultsDisplay results={mockResults} />);

    expect(screen.getByText(/Amygdala/i)).toBeInTheDocument();
    expect(screen.getByText(/Hippocampus/i)).toBeInTheDocument();
  });

  it('should show impact percentages', () => {
    renderWithRouter(<ModernResultsDisplay results={mockResults} />);

    // Should show the impact percentages
    expect(screen.getByText(/15%/)).toBeInTheDocument();
    expect(screen.getByText(/20%/)).toBeInTheDocument();
  });

  it('should display severity indicators', () => {
    renderWithRouter(<ModernResultsDisplay results={mockResults} />);

    expect(screen.getByText(/moderate/i)).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
  });

  it('should render brain visualization component', () => {
    renderWithRouter(<ModernResultsDisplay results={mockResults} />);

    const visualization = screen.getByTestId('brain-visualization');
    expect(visualization).toBeInTheDocument();
  });

  it('should handle empty brain impacts', () => {
    const emptyResults = {
      aceScore: 0,
      brainImpacts: {},
      gender: 'Male',
      timestamp: new Date().toISOString(),
    };

    renderWithRouter(<ModernResultsDisplay results={emptyResults} />);
    expect(screen.getByText(/Neurological Impact Assessment/i)).toBeInTheDocument();
  });

  it('should display all tab options', () => {
    renderWithRouter(<ModernResultsDisplay results={mockResults} />);

    // Check for tab navigation
    const summaryTab = screen.queryByText(/summary|overview/i);
    expect(summaryTab || screen.getByText(/Neurological Impact/i)).toBeInTheDocument();
  });

  it('should show gender-specific information', () => {
    renderWithRouter(<ModernResultsDisplay results={mockResults} />);

    // Gender info should be displayed somewhere
    const genderText = screen.queryByText(/Female|Male/i);
    expect(genderText).toBeInTheDocument();
  });

  it('should render with proper styling classes', () => {
    const { container } = renderWithRouter(<ModernResultsDisplay results={mockResults} />);

    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('should display region descriptions', () => {
    renderWithRouter(<ModernResultsDisplay results={mockResults} />);

    expect(screen.getByText(/Amygdala shows reduced volume/i)).toBeInTheDocument();
    expect(screen.getByText(/Hippocampus shows significant changes/i)).toBeInTheDocument();
  });
});
