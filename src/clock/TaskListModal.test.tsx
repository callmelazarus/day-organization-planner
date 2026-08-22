import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TaskListModal } from './TaskListModal';
import type { Segment } from './types';

function makeSegment(overrides: Partial<Segment>): Segment {
  return {
    id: 'id',
    startHour: 6,
    endHour: 7,
    label: 'Task',
    fill: 'hsl(0, 70%, 85%)',
    textColor: 'hsl(0, 70%, 30%)',
    ...overrides,
  };
}

describe('TaskListModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows an empty-state message when there are no segments', () => {
    render(<TaskListModal segments={[]} onClose={() => {}} />);

    expect(screen.getByText('No tasks planned yet')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('renders segments in chronological order regardless of input order', () => {
    const segments = [
      makeSegment({ id: '1', startHour: 14, endHour: 15, label: 'Afternoon meeting' }),
      makeSegment({ id: '2', startHour: 6, endHour: 7, label: 'Gym' }),
      makeSegment({ id: '3', startHour: 9, endHour: 10, label: 'Breakfast' }),
    ];

    render(<TaskListModal segments={segments} onClose={() => {}} />);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Gym'),
      expect.stringContaining('Breakfast'),
      expect.stringContaining('Afternoon meeting'),
    ]);
  });

  test('shows the time range and label for each segment', () => {
    render(
      <TaskListModal
        segments={[makeSegment({ startHour: 13, endHour: 14, label: 'Lunch' })]}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('1pm – 2pm')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  test('calls onClose when the close button is clicked', () => {
    const handleClose = vi.fn();
    render(<TaskListModal segments={[]} onClose={handleClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(handleClose).toHaveBeenCalled();
  });

  test('calls onClose when the backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(<TaskListModal segments={[]} onClose={handleClose} />);

    fireEvent.click(screen.getByRole('presentation'));

    expect(handleClose).toHaveBeenCalled();
  });

  test('does not call onClose when the dialog card itself is clicked', () => {
    const handleClose = vi.fn();
    render(<TaskListModal segments={[]} onClose={handleClose} />);

    fireEvent.click(screen.getByRole('dialog'));

    expect(handleClose).not.toHaveBeenCalled();
  });

  test('calls onClose when Escape is pressed', () => {
    const handleClose = vi.fn();
    render(<TaskListModal segments={[]} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalled();
  });
});
