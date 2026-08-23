import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DayPlanner } from './DayPlanner';

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
