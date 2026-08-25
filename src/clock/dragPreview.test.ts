import { describe, expect, test } from 'vitest';
import { computeDragPreview } from './dragPreview';
import { buildArcPath, hourToAngle } from './geometry';

describe('computeDragPreview', () => {
  test('returns null when either hour is missing (no drag in progress)', () => {
    expect(computeDragPreview('daytime', null, 8, 200, 200, 60, 150)).toBeNull();
    expect(computeDragPreview('daytime', 7, null, 200, 200, 60, 150)).toBeNull();
  });

  test('returns null when start and current hour are the same (no movement yet)', () => {
    expect(computeDragPreview('daytime', 8, 8, 200, 200, 60, 150)).toBeNull();
  });

  test('normalizes direction so dragging backward produces the same preview as dragging forward', () => {
    const forward = computeDragPreview('daytime', 7, 8, 200, 200, 60, 150);
    const backward = computeDragPreview('daytime', 8, 7, 200, 200, 60, 150);
    expect(backward).toEqual(forward);
  });

  test('builds an arc path and label for a partial daytime range', () => {
    const preview = computeDragPreview('daytime', 7, 8, 200, 200, 60, 150);
    const expectedPath = buildArcPath(
      200,
      200,
      60,
      150,
      hourToAngle('daytime', 7),
      hourToAngle('daytime', 8)
    );

    expect(preview?.isFullCircle).toBe(false);
    expect(preview?.arcPath).toBe(expectedPath);
    expect(preview?.labelText).toBe('7am – 8am');
  });

  test('flags a full-circle preview when the span reaches 360deg', () => {
    // No real dial's hour range spans a full 24/12 hours anymore, but the
    // full-circle detection itself is generic and stays covered here.
    const preview = computeDragPreview('daytime', 7, 19, 200, 200, 60, 150);

    expect(preview?.isFullCircle).toBe(true);
    expect(preview?.arcPath).toBe('');
  });

  test('computes the angular midpoint of the range', () => {
    const preview = computeDragPreview('daytime', 7, 9, 200, 200, 60, 150);
    // hourToAngle('daytime', 7) = 210, hourToAngle('daytime', 9) = 270
    expect(preview?.midAngle).toBe(240);
  });
});
