import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SegmentArc } from './SegmentArc';
import type { Segment } from './types';

const segment: Segment = {
  id: '1',
  startHour: 8,
  endHour: 9,
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
          dial="daytime"
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
          dial="daytime"
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

  test('renders a full-circle (12-hour) segment as a clickable stroked circle', () => {
    const fullDaySegment: Segment = {
      id: '2',
      startHour: 7,
      endHour: 19,
      label: 'Sleep',
      fill: 'hsl(220, 70%, 85%)',
      textColor: 'hsl(220, 70%, 30%)',
    };
    const handleClick = vi.fn();

    render(
      <svg>
        <SegmentArc
          segment={fullDaySegment}
          dial="daytime"
          cx={200}
          cy={200}
          innerRadius={60}
          outerRadius={150}
          onClick={handleClick}
        />
      </svg>
    );

    const el = screen.getByRole('button', { name: 'Sleep' });
    expect(el.tagName).toBe('circle');
    fireEvent.click(el);
    expect(handleClick).toHaveBeenCalledWith(fullDaySegment, expect.anything());
  });

  test('renders the label as visible text in the segment textColor, not blocking clicks', () => {
    render(
      <svg>
        <SegmentArc
          segment={segment}
          dial="daytime"
          cx={200}
          cy={200}
          innerRadius={60}
          outerRadius={150}
          onClick={() => {}}
        />
      </svg>
    );

    const label = screen.getByText('Gym');
    expect(label.tagName).toBe('text');
    expect(label).toHaveAttribute('fill', 'hsl(180, 70%, 30%)');
    expect(label).toHaveAttribute('pointer-events', 'none');
  });

  test('renders the label as visible text for a full-circle segment too', () => {
    const fullDaySegment: Segment = {
      id: '2',
      startHour: 7,
      endHour: 19,
      label: 'Sleep',
      fill: 'hsl(220, 70%, 85%)',
      textColor: 'hsl(220, 70%, 30%)',
    };

    render(
      <svg>
        <SegmentArc
          segment={fullDaySegment}
          dial="daytime"
          cx={200}
          cy={200}
          innerRadius={60}
          outerRadius={150}
          onClick={() => {}}
        />
      </svg>
    );

    const label = screen.getByText('Sleep');
    expect(label.tagName).toBe('text');
    expect(label).toHaveAttribute('fill', 'hsl(220, 70%, 30%)');
  });
});
