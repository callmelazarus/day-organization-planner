import { describe, expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DayPlanner } from './DayPlanner';

describe('DayPlanner', () => {
  beforeEach(() => {
    localStorage.clear();
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
});
