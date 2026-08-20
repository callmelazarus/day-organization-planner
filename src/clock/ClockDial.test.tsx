import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClockDial } from './ClockDial';
import type { Segment } from './types';

describe('ClockDial', () => {
  test('renders standard clock hour labels for the morning dial', () => {
    render(
      <ClockDial dial="morning" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    ['6', '7', '8', '9', '10', '11', '12'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('renders all 12 hour labels for the evening dial', () => {
    render(
      <ClockDial dial="evening" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  test('renders a clickable arc for each segment and forwards clicks', () => {
    const segment: Segment = {
      id: '1',
      startHour: 6,
      endHour: 7,
      label: 'Gym',
      fill: 'hsl(0, 70%, 85%)',
      textColor: 'hsl(0, 70%, 30%)',
    };
    const handleClick = vi.fn();

    render(
      <ClockDial
        dial="morning"
        segments={[segment]}
        onSegmentClick={handleClick}
        onCreateSegment={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));
    expect(handleClick).toHaveBeenCalledWith(segment, expect.anything());
  });

  test('renders a stroked circle background for the full-circle evening dial, and an arc path for the partial morning dial', () => {
    const { container: eveningContainer } = render(
      <ClockDial dial="evening" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );
    expect(eveningContainer.querySelector('[data-testid="dial-background"]')?.tagName).toBe('circle');

    const { container: morningContainer } = render(
      <ClockDial dial="morning" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );
    expect(morningContainer.querySelector('[data-testid="dial-background"]')?.tagName).toBe('path');
  });

  test('renders no drag preview before any pointer interaction', () => {
    const { container } = render(
      <ClockDial dial="morning" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    expect(container.querySelector('[data-testid="drag-preview"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="drag-preview-label"]')).not.toBeInTheDocument();
  });

  test('renders a frozen preview from pendingRange when no drag is in progress', () => {
    const { container } = render(
      <ClockDial
        dial="morning"
        segments={[]}
        onSegmentClick={() => {}}
        onCreateSegment={() => {}}
        pendingRange={{ startHour: 6, endHour: 7 }}
      />
    );

    expect(container.querySelector('[data-testid="drag-preview"]')).toBeInTheDocument();
    expect(screen.getByText('6am – 7am')).toBeInTheDocument();
  });
});
