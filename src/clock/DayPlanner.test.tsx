import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DayPlanner } from './DayPlanner';
import * as exportSnapshot from './exportSnapshot';

vi.mock('./exportSnapshot', async () => {
  const actual = await vi.importActual<typeof exportSnapshot>('./exportSnapshot');
  return { ...actual, downloadDialsSnapshot: vi.fn().mockResolvedValue(undefined) };
});

describe('DayPlanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders both the morning and evening dials', () => {
    render(<DayPlanner />);

    expect(screen.getAllByText('12').length).toBeGreaterThanOrEqual(2);
    // '6' is legitimately duplicated by design: the morning dial shows it at
    // 6am and the evening dial independently shows it at 6pm (same reason
    // '12' above is duplicated between noon and the wrap to midnight).
    expect(screen.getAllByText('6').length).toBeGreaterThanOrEqual(2);
  });

  test('labels the dials with a sun emoji for AM and a moon emoji for PM', () => {
    render(<DayPlanner />);

    expect(screen.getByText('☀️ AM')).toBeInTheDocument();
    expect(screen.getByText('🌙 PM')).toBeInTheDocument();
  });

  test('renders a persisted segment on the correct dial', () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 6,
          endHour: 7,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);

    expect(screen.getByRole('button', { name: 'Gym' })).toBeInTheDocument();
  });

  test("switching between segments without closing the popup shows the newly clicked segment's label", () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 6,
          endHour: 7,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
        {
          id: '2',
          startHour: 8,
          endHour: 9,
          label: 'Breakfast',
          fill: 'hsl(40, 70%, 85%)',
          textColor: 'hsl(40, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));
    expect(screen.getByDisplayValue('Gym')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Breakfast' }));
    expect(screen.getByDisplayValue('Breakfast')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Gym')).not.toBeInTheDocument();
  });

  test('the "View all tasks" button opens and closes the task list modal', () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 6,
          endHour: 7,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);

    expect(screen.queryByRole('dialog', { name: 'All tasks' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View all tasks' }));
    expect(screen.getByRole('dialog', { name: 'All tasks' })).toBeInTheDocument();
    expect(screen.getByText('6am – 7am')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog', { name: 'All tasks' })).not.toBeInTheDocument();
  });

  test('the Clear button removes all segments after confirming', () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 6,
          endHour: 7,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<DayPlanner />);

    expect(screen.getByRole('button', { name: 'Gym' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(window.confirm).toHaveBeenCalledWith('Clear all tasks?');
    expect(screen.queryByRole('button', { name: 'Gym' })).not.toBeInTheDocument();
  });

  test('the Clear button does nothing if the confirmation is declined', () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 6,
          endHour: 7,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<DayPlanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Gym' })).toBeInTheDocument();
  });

  test('the "Download image" button captures both dial SVGs in order with their labels', () => {
    render(<DayPlanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Download image' }));

    expect(exportSnapshot.downloadDialsSnapshot).toHaveBeenCalledTimes(1);
    const [svgs, labels] = vi.mocked(exportSnapshot.downloadDialsSnapshot).mock.calls[0];
    expect(svgs).toHaveLength(2);
    expect(svgs[0].tagName.toLowerCase()).toBe('svg');
    expect(svgs[1].tagName.toLowerCase()).toBe('svg');
    expect(labels).toEqual(['☀️ AM', '🌙 PM']);
  });

  test('the todo list is always visible without needing a button to open it', () => {
    render(<DayPlanner />);

    expect(screen.getByText('💪')).toBeInTheDocument();
  });

  test('adding a todo shows it in the always-visible todo list', () => {
    render(<DayPlanner />);

    fireEvent.change(screen.getByPlaceholderText("Keep going!"), {
      target: { value: 'Buy groceries' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });
});
