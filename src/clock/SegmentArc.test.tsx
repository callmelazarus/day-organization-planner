import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SegmentArc } from './SegmentArc';
import type { Segment } from './types';

const segment: Segment = {
  id: '1',
  startHour: 6,
  endHour: 7,
  label: 'Gym',
  fill: 'hsl(180, 70%, 85%)',
  textColor: 'hsl(180, 70%, 30%)',
};

describe('SegmentArc', () => {
  afterEach(() => {
    cleanup();
  });
  test('renders a clickable path with the segment fill color', () => {
    render(
      <svg>
        <SegmentArc
          segment={segment}
          dial="morning"
          cx={200}
          cy={200}
          innerRadius={60}
          outerRadius={150}
          onClick={() => {}}
        />
      </svg>
    );

    const path = screen.getByRole('button', { name: 'Gym' });
    expect(path).toHaveAttribute('fill', 'hsl(180, 70%, 85%)');
  });

  test('calls onClick with the segment when clicked', () => {
    const handleClick = vi.fn();
    render(
      <svg>
        <SegmentArc
          segment={segment}
          dial="morning"
          cx={200}
          cy={200}
          innerRadius={60}
          outerRadius={150}
          onClick={handleClick}
        />
      </svg>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));
    expect(handleClick).toHaveBeenCalledWith(segment, expect.anything());
  });
});
