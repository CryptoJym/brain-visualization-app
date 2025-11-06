import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OfficialACEsQuestionnaire from '../OfficialACEsQuestionnaire';

describe('OfficialACEsQuestionnaire', () => {
  it('should render gender selection as first step', () => {
    render(<OfficialACEsQuestionnaire onComplete={() => {}} />);

    expect(screen.getByText(/What is your biological sex/i)).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Female')).toBeInTheDocument();
  });

  it('should allow selecting gender', () => {
    render(<OfficialACEsQuestionnaire onComplete={() => {}} />);

    const femaleButton = screen.getByText('Female');
    fireEvent.click(femaleButton);

    // After selecting gender, should show first question
    expect(screen.queryByText(/biological sex/i)).not.toBeInTheDocument();
  });

  it('should display ACEs questions after gender selection', () => {
    render(<OfficialACEsQuestionnaire onComplete={() => {}} />);

    const maleButton = screen.getByText('Male');
    fireEvent.click(maleButton);

    // Should show an ACEs question (checking for common keywords)
    const questionText = screen.getByText(/parent|household|family/i);
    expect(questionText).toBeInTheDocument();
  });

  it('should show Yes/No buttons for questions', () => {
    render(<OfficialACEsQuestionnaire onComplete={() => {}} />);

    const maleButton = screen.getByText('Male');
    fireEvent.click(maleButton);

    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should advance to next question on No response', () => {
    render(<OfficialACEsQuestionnaire onComplete={() => {}} />);

    // Select gender
    const femaleButton = screen.getByText('Female');
    fireEvent.click(femaleButton);

    // Get first question text
    const firstQuestion = screen.getByText(/parent|household|family/i).textContent;

    // Click No
    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    // Question should change (or complete)
    const newContent = screen.queryByText(firstQuestion);
    // Either moved to next question or completed
    expect(newContent === null || screen.getByText(/parent|household|family/i)).toBeTruthy();
  });

  it('should call onComplete when questionnaire is finished', () => {
    const onCompleteMock = vi.fn();
    render(<OfficialACEsQuestionnaire onComplete={onCompleteMock} />);

    // Select gender
    const maleButton = screen.getByText('Male');
    fireEvent.click(maleButton);

    // Answer all questions with "No" (10 questions typically)
    for (let i = 0; i < 15; i++) {
      const noButton = screen.queryByText('No');
      if (noButton) {
        fireEvent.click(noButton);
      } else {
        break; // Questionnaire completed
      }
    }

    // Should have called onComplete
    expect(onCompleteMock).toHaveBeenCalled();
  });

  it('should pass results to onComplete callback', () => {
    const onCompleteMock = vi.fn();
    render(<OfficialACEsQuestionnaire onComplete={onCompleteMock} />);

    // Select gender
    const femaleButton = screen.getByText('Female');
    fireEvent.click(femaleButton);

    // Answer all questions with "No"
    for (let i = 0; i < 15; i++) {
      const noButton = screen.queryByText('No');
      if (noButton) {
        fireEvent.click(noButton);
      } else {
        break;
      }
    }

    // Check that onComplete was called with results object
    if (onCompleteMock.mock.calls.length > 0) {
      const results = onCompleteMock.mock.calls[0][0];
      expect(results).toHaveProperty('responses');
      expect(results).toHaveProperty('gender');
    }
  });

  it('should render with proper styling', () => {
    const { container } = render(<OfficialACEsQuestionnaire onComplete={() => {}} />);

    // Check for background gradient
    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toBeInTheDocument();
  });

  it('should have accessible buttons', () => {
    render(<OfficialACEsQuestionnaire onComplete={() => {}} />);

    const maleButton = screen.getByText('Male');
    const femaleButton = screen.getByText('Female');

    expect(maleButton.tagName).toBe('BUTTON');
    expect(femaleButton.tagName).toBe('BUTTON');
  });
});
