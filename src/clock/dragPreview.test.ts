import { describe, expect, test } from 'vitest';
import { computeDragPreview } from './dragPreview';
import { buildArcPath, hourToAngle } from './geometry';

describe('computeDragPreview', () => {
  test('returns null when either hour is missing (no drag in progress)', () => {
    expect(computeDragPreview('morning', null, 7, 200, 200, 60, 150)).toBeNull();
    expect(computeDragPreview('morning', 6, null, 200, 200, 60, 150)).toBeNull();
  });

  test('returns null when start and current hour are the same (no movement yet)', () => {
    expect(computeDragPreview('morning', 8, 8, 200, 200, 60, 150)).toBeNull();
  });

  test('normalizes direction so dragging backward produces the same preview as dragging forward', () => {
    const forward = computeDragPreview('morning', 6, 7, 200, 200, 60, 150);
    const backward = computeDragPreview('morning', 7, 6, 200, 200, 60, 150);
    expect(backward).toEqual(forward);
  });

  test('builds an arc path and label for a partial morning range', () => {
    const preview = computeDragPreview('morning', 6, 7, 200, 200, 60, 150);
    const expectedPath = buildArcPath(
      200,
      200,
      60,
      150,
      hourToAngle('morning', 6),
      hourToAngle('morning', 7)
    );

    expect(preview?.isFullCircle).toBe(false);
    expect(preview?.arcPath).toBe(expectedPath);
    expect(preview?.labelText).toBe('6am – 7am');
  });

  test('flags a full-circle preview for the entire evening dial and formats midnight', () => {
    const preview = computeDragPreview('evening', 12, 24, 200, 200, 60, 150);

    expect(preview?.isFullCircle).toBe(true);
    expect(preview?.arcPath).toBe('');
    expect(preview?.labelText).toBe('12pm – 12am');
  });

  test('computes the angular midpoint of the range', () => {
    const preview = computeDragPreview('morning', 6, 8, 200, 200, 60, 150);
    // hourToAngle('morning', 6) = 180, hourToAngle('morning', 8) = 240
    expect(preview?.midAngle).toBe(210);
  });
});
