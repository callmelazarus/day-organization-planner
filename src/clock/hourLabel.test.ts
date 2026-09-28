import { describe, expect, test } from 'vitest';
import { formatHourRangeLabel, hourLabel } from './hourLabel';

describe('hourLabel', () => {
  test('converts 24-hour values to 12-hour clock numbers', () => {
    expect(hourLabel(6)).toBe('6');
    expect(hourLabel(12)).toBe('12');
    expect(hourLabel(13)).toBe('1');
    expect(hourLabel(23)).toBe('11');
    expect(hourLabel(24)).toBe('12');
  });

  test('appends :30 for half-hour values', () => {
    expect(hourLabel(7.5)).toBe('7:30');
    expect(hourLabel(12.5)).toBe('12:30');
    expect(hourLabel(23.5)).toBe('11:30');
  });
});

describe('formatHourRangeLabel', () => {
  test('formats a morning range with am suffixes', () => {
    expect(formatHourRangeLabel(6, 7)).toBe('6am – 7am');
  });

  test('formats a range crossing from am to noon', () => {
    expect(formatHourRangeLabel(11, 12)).toBe('11am – 12pm');
  });

  test('formats an afternoon range with pm suffixes', () => {
    expect(formatHourRangeLabel(13, 14)).toBe('1pm – 2pm');
  });

  test('formats a range crossing midnight as 12am', () => {
    expect(formatHourRangeLabel(23, 24)).toBe('11pm – 12am');
  });

  test('formats the full evening dial span', () => {
    expect(formatHourRangeLabel(12, 24)).toBe('12pm – 12am');
  });

  test('formats a half-hour start', () => {
    expect(formatHourRangeLabel(7.5, 9)).toBe('7:30am – 9am');
  });

  test('formats a half-hour end', () => {
    expect(formatHourRangeLabel(7, 8.5)).toBe('7am – 8:30am');
  });

  test('formats a half-hour range crossing noon', () => {
    expect(formatHourRangeLabel(11.5, 12.5)).toBe('11:30am – 12:30pm');
  });
});
