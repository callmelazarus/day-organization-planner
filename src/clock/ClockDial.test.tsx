import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ClockDial } from './ClockDial';
import type { Segment } from './types';

describe('ClockDial', () => {
  afterEach(() => {
    cleanup();
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
