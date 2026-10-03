import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { WeekTaskListModal } from './WeekTaskListModal';
import { WEEKDAYS } from './weekDays';
import type { WeekDay } from './weekDays';
import type { Segment } from './types';

function emptyWeek(): Record<WeekDay, Segment[]> {
  const byDay = {} as Record<WeekDay, Segment[]>;
  WEEKDAYS.forEach((day) => {
    byDay[day] = [];
  });
  return byDay;
}

describe('WeekTaskListModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows a heading and "No tasks planned yet" for every empty day', () => {
    render(<WeekTaskListModal segmentsByDay={emptyWeek()} onClose={() => {}} />);

    expect(screen.getByText('Sunday')).toBeInTheDocument();
    expect(screen.getByText('Saturday')).toBeInTheDocument();
    expect(screen.getAllByText('No tasks planned yet')).toHaveLength(7);
  });

  test("lists a day's tasks under its own heading only", () => {
    const byDay = emptyWeek();
    byDay.monday = [
      { id: '1', startHour: 9, endHour: 10, label: 'Standup', fill: '', textColor: '' },
    ];

    render(<WeekTaskListModal segmentsByDay={byDay} onClose={() => {}} />);

    expect(screen.getByText('Standup')).toBeInTheDocument();
    expect(screen.getAllByText('No tasks planned yet')).toHaveLength(6);
  });

  test('the Close button calls onClose', () => {
    const handleClose = vi.fn();
    render(<WeekTaskListModal segmentsByDay={emptyWeek()} onClose={handleClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(handleClose).toHaveBeenCalled();
  });
});
