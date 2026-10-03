import { describe, expect, test } from 'vitest';
import { getFractionalHour } from './currentTime';

describe('getFractionalHour', () => {
  test('returns a whole number for an exact hour', () => {
    expect(getFractionalHour(new Date(2026, 0, 1, 7, 0))).toBe(7);
  });

  test('returns a half value for the half hour', () => {
    expect(getFractionalHour(new Date(2026, 0, 1, 7, 30))).toBe(7.5);
  });

  test('handles midnight as 0', () => {
    expect(getFractionalHour(new Date(2026, 0, 1, 0, 0))).toBe(0);
  });

  test('handles 11:45pm close to end of day', () => {
    expect(getFractionalHour(new Date(2026, 0, 1, 23, 45))).toBe(23.75);
  });

  test('uses the Date object\'s local time, not UTC', () => {
    const date = new Date(2026, 0, 1, 14, 15);
    expect(getFractionalHour(date)).toBe(14.25);
  });
});
