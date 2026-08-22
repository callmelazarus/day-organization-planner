import { describe, expect, test } from 'vitest';
import { angleToHour, hourToAngle, buildArcPath } from './geometry';

describe('angleToHour', () => {
  test('morning dial maps the used half correctly', () => {
    expect(angleToHour('morning', 180)).toBe(6);
    expect(angleToHour('morning', 270)).toBe(9);
    expect(angleToHour('morning', 360)).toBe(12);
    expect(angleToHour('morning', 0)).toBe(12);
  });

  test('morning dial returns null for the unused half', () => {
    expect(angleToHour('morning', 90)).toBeNull();
    expect(angleToHour('morning', 179)).toBeNull();
  });

  test('evening dial maps 12pm through 11pm', () => {
    expect(angleToHour('evening', 0)).toBe(12);
    expect(angleToHour('evening', 180)).toBe(18);
    expect(angleToHour('evening', 270)).toBe(21);
    expect(angleToHour('evening', 330)).toBe(23);
  });

  test('evening dial returns null for the 11pm-12am dead zone', () => {
    expect(angleToHour('evening', 331)).toBeNull();
    expect(angleToHour('evening', 350)).toBeNull();
  });

  test('the 0deg/360deg seam resolves to 12, the dial start (not the removed 12am hour)', () => {
    expect(angleToHour('evening', 360)).toBe(12);
    expect(angleToHour('evening', 0)).toBe(12);
  });
});

describe('hourToAngle', () => {
  test('morning dial', () => {
    expect(hourToAngle('morning', 6)).toBe(180);
    expect(hourToAngle('morning', 9)).toBe(270);
    expect(hourToAngle('morning', 12)).toBe(360);
  });

  test('evening dial', () => {
    expect(hourToAngle('evening', 12)).toBe(0);
    expect(hourToAngle('evening', 18)).toBe(180);
    expect(hourToAngle('evening', 24)).toBe(360);
  });
});

describe('buildArcPath', () => {
  test('builds a quarter-circle donut slice', () => {
    const path = buildArcPath(200, 200, 50, 100, 0, 90);
    expect(path).toBe('M 200 100 A 100 100 0 0 1 300 200 L 250 200 A 50 50 0 0 0 200 150 Z');
  });

  test('uses the large-arc flag for spans over 180deg', () => {
    const path = buildArcPath(200, 200, 50, 100, 0, 200);
    expect(path).toContain('A 100 100 0 1 1');
  });

  test('uses the small-arc flag for spans under 180deg', () => {
    const path = buildArcPath(200, 200, 50, 100, 0, 90);
    expect(path).toContain('A 100 100 0 0 1');
  });
});
