import { describe, expect, test } from 'vitest';
import { angleToHour, hourToAngle, buildArcPath } from './geometry';

describe('angleToHour', () => {
  test('nighttime dial maps the used half correctly', () => {
    expect(angleToHour('nighttime', 180)).toBe(18);
    expect(angleToHour('nighttime', 270)).toBe(21);
    expect(angleToHour('nighttime', 360)).toBe(24);
    expect(angleToHour('nighttime', 0)).toBe(24);
  });

  test('nighttime dial returns null for the unused half', () => {
    expect(angleToHour('nighttime', 90)).toBeNull();
    expect(angleToHour('nighttime', 179)).toBeNull();
  });

  test('daytime dial maps 7am through 6pm, crossing the noon mark', () => {
    expect(angleToHour('daytime', 210)).toBe(7);
    expect(angleToHour('daytime', 360)).toBe(12);
    expect(angleToHour('daytime', 0)).toBe(12);
    expect(angleToHour('daytime', 90)).toBe(15);
    expect(angleToHour('daytime', 180)).toBe(18);
  });

  test('daytime dial returns null for the 6am-7am dead zone', () => {
    expect(angleToHour('daytime', 181)).toBeNull();
    expect(angleToHour('daytime', 209)).toBeNull();
  });
});

describe('hourToAngle', () => {
  test('nighttime dial', () => {
    expect(hourToAngle('nighttime', 18)).toBe(180);
    expect(hourToAngle('nighttime', 21)).toBe(270);
    expect(hourToAngle('nighttime', 24)).toBe(360);
  });

  test('daytime dial', () => {
    expect(hourToAngle('daytime', 7)).toBe(210);
    expect(hourToAngle('daytime', 12)).toBe(360);
    expect(hourToAngle('daytime', 18)).toBe(540);
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
