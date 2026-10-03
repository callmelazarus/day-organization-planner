import { describe, expect, test } from 'vitest';
import { formatFullDate, formatTimeInZone, formatZoneAbbreviation } from './dayInfo';

describe('formatFullDate', () => {
  test('formats as "Weekday Month D, YYYY" with no comma after the weekday', () => {
    const date = new Date(2026, 9, 3, 15, 30); // Saturday, October 3, 2026
    expect(formatFullDate(date)).toBe('Saturday October 3, 2026');
  });

  test('formats a different date correctly', () => {
    const date = new Date(2026, 0, 1, 0, 0); // Thursday, January 1, 2026
    expect(formatFullDate(date)).toBe('Thursday January 1, 2026');
  });
});

describe('formatTimeInZone', () => {
  test('formats a UTC time in Pacific time (America/Los_Angeles)', () => {
    const date = new Date(Date.UTC(2026, 0, 1, 20, 0)); // Jan 1 2026, 20:00 UTC
    expect(formatTimeInZone(date, 'America/Los_Angeles')).toBe('12:00 PM');
  });

  test('formats a UTC time in Eastern time (America/New_York)', () => {
    const date = new Date(Date.UTC(2026, 0, 1, 20, 0)); // Jan 1 2026, 20:00 UTC
    expect(formatTimeInZone(date, 'America/New_York')).toBe('3:00 PM');
  });
});

describe('formatZoneAbbreviation', () => {
  test('returns the standard-time abbreviation for a zone in winter', () => {
    const date = new Date(Date.UTC(2026, 0, 1, 20, 0)); // Jan 1 2026 — EST, not EDT
    expect(formatZoneAbbreviation(date, 'America/New_York')).toBe('EST');
  });

  test('returns the daylight-time abbreviation for a zone observing DST in summer', () => {
    const date = new Date(Date.UTC(2026, 6, 1, 20, 0)); // Jul 1 2026 — EDT
    expect(formatZoneAbbreviation(date, 'America/New_York')).toBe('EDT');
  });

  test('falls back to a GMT offset for a zone with no common short name', () => {
    const date = new Date(Date.UTC(2026, 6, 1, 20, 0));
    expect(formatZoneAbbreviation(date, 'Asia/Tokyo')).toBe('GMT+9');
  });
});
