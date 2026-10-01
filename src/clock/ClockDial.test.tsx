import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ClockDial } from './ClockDial';
import type { Segment } from './types';

describe('ClockDial', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders the SVG at a fixed intrinsic size but lets it shrink to fit a narrower container', () => {
    const { container } = render(
      <ClockDial dial="daytime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '400');
    expect(svg).toHaveAttribute('height', '400');
    expect(svg).toHaveStyle({ maxWidth: '100%', height: 'auto' });
  });

  test('renders hour labels for the daytime dial (7am-6pm)', () => {
    render(
      <ClockDial dial="daytime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    ['7', '8', '9', '10', '11', '12', '1', '2', '3', '4', '5', '6'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('renders hour labels for the nighttime dial (6pm-12am)', () => {
    render(
      <ClockDial dial="nighttime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    ['6', '7', '8', '9', '10', '11', '12'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('renders a clickable arc for each segment and forwards clicks', () => {
    const segment: Segment = {
      id: '1',
      startHour: 8,
      endHour: 9,
      label: 'Gym',
      fill: 'hsl(0, 70%, 85%)',
      textColor: 'hsl(0, 70%, 30%)',
    };
    const handleClick = vi.fn();

    render(
      <ClockDial
        dial="daytime"
        segments={[segment]}
        onSegmentClick={handleClick}
        onCreateSegment={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));
    expect(handleClick).toHaveBeenCalledWith(segment, expect.anything());
  });

  test('renders a full solid dark circle as the base for both dials, even though neither uses its full range', () => {
    const { container: nighttimeContainer } = render(
      <ClockDial dial="nighttime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );
    expect(nighttimeContainer.querySelector('[data-testid="dial-background"]')?.tagName).toBe(
      'circle'
    );

    const { container: daytimeContainer } = render(
      <ClockDial dial="daytime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );
    expect(daytimeContainer.querySelector('[data-testid="dial-background"]')?.tagName).toBe(
      'circle'
    );
  });

  test('renders the used hour range as a colored arc on top of the dark base (not a full circle)', () => {
    const { container: nighttimeContainer } = render(
      <ClockDial dial="nighttime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );
    expect(nighttimeContainer.querySelector('[data-testid="dial-range"]')?.tagName).toBe('path');

    const { container: daytimeContainer } = render(
      <ClockDial dial="daytime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );
    expect(daytimeContainer.querySelector('[data-testid="dial-range"]')?.tagName).toBe('path');
  });

  test('renders an hour tick mark at each labeled hour on the daytime dial', () => {
    const { container } = render(
      <ClockDial dial="daytime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    expect(container.querySelectorAll('[data-testid="hour-tick"]')).toHaveLength(12);
  });

  test('renders an hour tick mark at each labeled hour on the nighttime dial', () => {
    const { container } = render(
      <ClockDial dial="nighttime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    expect(container.querySelectorAll('[data-testid="hour-tick"]')).toHaveLength(7);
  });

  test('hour tick marks are longer than half-hour tick marks', () => {
    const { container } = render(
      <ClockDial dial="daytime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    function lineLength(line: Element): number {
      const x1 = Number(line.getAttribute('x1'));
      const y1 = Number(line.getAttribute('y1'));
      const x2 = Number(line.getAttribute('x2'));
      const y2 = Number(line.getAttribute('y2'));
      return Math.hypot(x2 - x1, y2 - y1);
    }

    const hourTick = container.querySelector('[data-testid="hour-tick"]');
    const halfHourTick = container.querySelector('[data-testid="half-hour-tick"]');
    expect(hourTick).not.toBeNull();
    expect(halfHourTick).not.toBeNull();
    expect(lineLength(hourTick as Element)).toBeGreaterThan(lineLength(halfHourTick as Element));
  });

  test('renders a half-hour tick mark between each labeled hour on the daytime dial', () => {
    const { container } = render(
      <ClockDial dial="daytime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    // 12 labeled hours (7am-6pm) -> 11 half-hour points between them.
    expect(container.querySelectorAll('[data-testid="half-hour-tick"]')).toHaveLength(11);
  });

  test('renders a half-hour tick mark between each labeled hour on the nighttime dial', () => {
    const { container } = render(
      <ClockDial dial="nighttime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    // 7 labeled hours (6pm-12am) -> 6 half-hour points between them.
    expect(container.querySelectorAll('[data-testid="half-hour-tick"]')).toHaveLength(6);
  });

  test('renders no drag preview before any pointer interaction', () => {
    const { container } = render(
      <ClockDial dial="daytime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    expect(container.querySelector('[data-testid="drag-preview"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="drag-preview-label"]')).not.toBeInTheDocument();
  });

  test('renders a frozen preview from pendingRange when no drag is in progress', () => {
    const { container } = render(
      <ClockDial
        dial="daytime"
        segments={[]}
        onSegmentClick={() => {}}
        onCreateSegment={() => {}}
        pendingRange={{ startHour: 7, endHour: 8 }}
      />
    );

    expect(container.querySelector('[data-testid="drag-preview"]')).toBeInTheDocument();
    expect(screen.getByText('7am – 8am')).toBeInTheDocument();
  });

  test('renders the daytime dial used-range highlight in a soft orange/yellow', () => {
    const { container } = render(
      <ClockDial dial="daytime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    expect(container.querySelector('[data-testid="dial-range"]')).toHaveAttribute(
      'fill',
      '#f5b942'
    );
  });

  test('renders the nighttime dial used-range highlight in a soft purple/blue', () => {
    const { container } = render(
      <ClockDial dial="nighttime" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    expect(container.querySelector('[data-testid="dial-range"]')).toHaveAttribute(
      'fill',
      '#6c63ff'
    );
  });
});
