import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExamCalendar from './App'; // Assuming App.js exports ExamCalendar as default

// --- Date Mocking Setup ---
// We mock the date to ensure tests are consistent regardless of when they are run.
// Let's set a date *before* the first exam for initial tests.
const MOCK_DATE_BEFORE_EXAMS = '2025-04-10T10:00:00.000Z';
const RealDate = Date; // Save the original Date object

// Helper function to mock the date
const mockDate = (isoDate) => {
  global.Date = class extends RealDate {
    constructor(...args) {
      // If called with arguments, behave like the original Date constructor
      if (args.length) {
        // eslint-disable-next-line constructor-super
        return super(...args);
      }
      // If called without arguments (e.g., new Date()), return the mock date
      return new RealDate(isoDate);
    }

    // Mock Date.now() as well
    static now() {
      return new RealDate(isoDate).getTime();
    }

    // Keep other static methods like parse, UTC, etc.
    static parse(dateString) {
        return RealDate.parse(dateString);
    }

    static UTC(...args) {
        return RealDate.UTC(...args);
    }

    // Ensure instanceof works correctly
    static [Symbol.hasInstance](instance) {
        return instance instanceof RealDate;
    }
  };
};

// Restore the original Date object after all tests in this file
afterAll(() => {
  global.Date = RealDate;
});
// --- End Date Mocking Setup ---


// --- Component Modifications Needed for Testing ---
// For better testability, let's assume these changes are made in App.js:
// 1. Add `data-testid="confetti-container"` to the confetti div.
// 2. Add `role="progressbar"` and aria attributes to the progress bar div.
/*
  // In App.js - Progress Bar:
  <div
    className="progress-bar"
    style={{ width: `${progress}%` }}
    role="progressbar"
    aria-valuenow={progress}
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span className="progress-text">{progress}% Done!</span>
  </div>

  // In App.js - Confetti:
  {celebrate && (
    <div className="confetti-container" data-testid="confetti-container">
      // ... confetti elements ...
    </div>
  )}
*/
// --- End Component Modifications ---


describe('ExamCalendar Component', () => {

  beforeEach(() => {
    // Reset date mock before each test to the initial state
    mockDate(MOCK_DATE_BEFORE_EXAMS);
    // Reset Jest's fake timers if they were used
    jest.useRealTimers();
  });

  test('renders the main title and initial subtitle', () => {
    render(<ExamCalendar />);
    expect(screen.getByRole('heading', { name: /April 2025 Final year Exam Timetable/i })).toBeInTheDocument();
    // Initial state: 0 exams completed, 6 total
    expect(screen.getByText(/You've got this! 6 exams to go!/i)).toBeInTheDocument();
  });

  test('renders the calendar header days', () => {
    render(<ExamCalendar />);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test('renders calendar days and identifies days with exams', () => {
    render(<ExamCalendar />);
    // Check specific day numbers exist
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();

    // Check day 11 has an exam indicator and the correct time
    const day11Cell = screen.getByText('11').closest('.calendar-day');
    expect(day11Cell).toHaveClass('has-exam');
    expect(day11Cell).toHaveTextContent('2pm-4pm'); // Check time indicator within the cell

    // Check a day without an exam (e.g., day 10 - assuming it's rendered)
    const day10Cell = screen.getByText('10').closest('.calendar-day');
    expect(day10Cell).not.toHaveClass('has-exam');
  });

  test('renders the progress bar with initial 0% progress', () => {
    render(<ExamCalendar />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(screen.getByText('0% Done!')).toBeInTheDocument();
    expect(progressBar).toHaveStyle('width: 0%');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  test('clicking an exam day opens the details popup with correct info', () => {
    render(<ExamCalendar />);
    const day15Cell = screen.getByText('15').closest('.calendar-day');

    fireEvent.click(day15Cell);

    // Check popup is visible and has correct content
    expect(screen.getByRole('heading', { name: /Cloud Computing/i })).toBeInTheDocument();
    expect(screen.getByText(/15th TUE, April 2025/i)).toBeInTheDocument();
    expect(screen.getByText('11am-1pm')).toBeInTheDocument(); // Time in details
    expect(screen.getByText(/FLT HALL II/i)).toBeInTheDocument(); // Venue
    // Check generic motivation for a middle exam
    expect(screen.getByText(/Keep going! You're making progress! ✨/i)).toBeInTheDocument();
  });

  test('clicking the close button closes the details popup', () => {
    render(<ExamCalendar />);
    const day17Cell = screen.getByText('17').closest('.calendar-day');

    // Open popup
    fireEvent.click(day17Cell);
    expect(screen.getByRole('heading', { name: /Computer Graphics/i })).toBeInTheDocument();

    // Click close button (assuming it has text '×')
    const closeButton = screen.getByRole('button', { name: /×/i });
    fireEvent.click(closeButton);

    // Check popup is closed
    expect(screen.queryByRole('heading', { name: /Computer Graphics/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/17th THUR, April 2025/i)).not.toBeInTheDocument();
  });

  test('clicking the first exam day shows specific motivation', () => {
    render(<ExamCalendar />);
    const day11Cell = screen.getByText('11').closest('.calendar-day');
    fireEvent.click(day11Cell);
    expect(screen.getByText(/First exam! You'll do great! 💪/i)).toBeInTheDocument();
  });

  test('clicking the last exam day shows specific motivation and triggers celebration', () => {
    render(<ExamCalendar />);
    const day25Cell = screen.getByText('25').closest('.calendar-day');
    fireEvent.click(day25Cell);

    // Check last exam motivation in details popup
    expect(screen.getByText(/Last exam! Almost there! 🎉/i)).toBeInTheDocument();

    // Check for celebration text and container
    expect(screen.getByText(/🎉 Final Exam! Freedom is near! 🎉/i)).toBeInTheDocument();
    // Use data-testid added to the component
    expect(screen.getByTestId('confetti-container')).toBeInTheDocument();
  });

  test('celebration confetti disappears after timeout', () => {
    jest.useFakeTimers(); // Tell Jest to use fake timers

    render(<ExamCalendar />);
    const day25Cell = screen.getByText('25').closest('.calendar-day');
    fireEvent.click(day25Cell);

    // Confetti should be visible initially
    expect(screen.getByTestId('confetti-container')).toBeInTheDocument();

    // Fast-forward time by 5 seconds (5000ms)
    act(() => { // Wrap state update causing timer callback in act
        jest.advanceTimersByTime(5000);
    });


    // Confetti should be gone
    expect(screen.queryByTestId('confetti-container')).not.toBeInTheDocument();
    expect(screen.queryByText(/🎉 Final Exam! Freedom is near! 🎉/i)).not.toBeInTheDocument();

    // No need to call jest.useRealTimers() here, beforeEach handles cleanup
  });

  // --- Tests with Date Mocked to a later time ---
  describe('ExamCalendar Component - After First Exam', () => {
    const MOCK_DATE_AFTER_FIRST_EXAM = '2025-04-12T10:00:00.000Z'; // Day after first exam

    beforeEach(() => {
      mockDate(MOCK_DATE_AFTER_FIRST_EXAM);
    });

    test('updates progress bar and subtitle after first exam', () => {
      render(<ExamCalendar />);
      const totalExams = 6;
      const completedExams = 1;
      const expectedProgress = Math.round((completedExams / totalExams) * 100); // 17%

      const progressBar = screen.getByRole('progressbar');
      expect(screen.getByText(`${expectedProgress}% Done!`)).toBeInTheDocument();
      expect(progressBar).toHaveStyle(`width: ${expectedProgress}%`);
      expect(progressBar).toHaveAttribute('aria-valuenow', `${expectedProgress}`);

      // Subtitle should reflect remaining exams
      expect(screen.getByText(/You've got this! 5 exams to go!/i)).toBeInTheDocument();
    });

    test('marks past exam days with "past" class and current day with "today"', () => {
      // Mock date to be the day of the second exam
      mockDate('2025-04-15T10:00:00.000Z');
      render(<ExamCalendar />);

      const day11Cell = screen.getByText('11').closest('.calendar-day');
      expect(day11Cell).toHaveClass('past');

      const day15Cell = screen.getByText('15').closest('.calendar-day');
      expect(day15Cell).toHaveClass('today');
      expect(day15Cell).not.toHaveClass('past');

      const day16Cell = screen.getByText('16').closest('.calendar-day');
      expect(day16Cell).not.toHaveClass('past');
      expect(day16Cell).not.toHaveClass('today');
    });
  });
});
const isToday = new Date().getDate() === day && /* ... other checks */;
// This comparison uses the *time* component as well.
// new Date(year, month-1, day) creates a date at midnight (00:00:00).
// new Date() uses the mocked time (e.g., 10:00:00).
// So, on the *actual* day (like April 15th in the test), midnight IS less than 10:00 AM.
const isPast = new Date(currentYear, currentMonth - 1, day) < new Date();
