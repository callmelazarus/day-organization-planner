import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { WeekDaySelector } from './WeekDaySelector';

describe('WeekDaySelector', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders all 7 weekday buttons in order', () => {
    render(<WeekDaySelector selectedDay="monday" todayDay="monday" onSelect={() => {}} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => b.textContent?.replace(' •', ''))).toEqual([
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
    ]);
  });

  test('marks only the selected day as pressed', () => {
    render(<WeekDaySelector selectedDay="wednesday" todayDay="monday" onSelect={() => {}} />);

    expect(screen.getByRole('button', { name: /Wed/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^Mon/ })).toHaveAttribute('aria-pressed', 'false');
  });

  test("marks today's button with a dot regardless of selection", () => {
    render(<WeekDaySelector selectedDay="wednesday" todayDay="friday" onSelect={() => {}} />);

    expect(screen.getByRole('button', { name: /Fri/ })).toHaveTextContent('Fri •');
    expect(screen.getByRole('button', { name: /^Mon/ })).not.toHaveTextContent('•');
  });

  test('calls onSelect with the clicked weekday', () => {
    const handleSelect = vi.fn();
    render(<WeekDaySelector selectedDay="monday" todayDay="monday" onSelect={handleSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /^Fri/ }));

    expect(handleSelect).toHaveBeenCalledWith('friday');
  });
});
