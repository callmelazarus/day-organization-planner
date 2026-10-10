import { describe, expect, test } from 'vitest';
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  WEEKDAY_FULL_LABELS,
  getTodayWeekday,
  weekdayStorageKey,
  getAdjacentWeekday,
} from './weekDays';

describe('weekDays', () => {
  test('WEEKDAYS is ordered Sunday through Saturday to match Date#getDay()', () => {
    expect(WEEKDAYS).toEqual([
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
    ]);
  });

  test('every weekday has a short and full label', () => {
    WEEKDAYS.forEach((day) => {
      expect(WEEKDAY_LABELS[day]).toBeTruthy();
      expect(WEEKDAY_FULL_LABELS[day]).toBeTruthy();
    });
  });

  test('getTodayWeekday maps Date#getDay() to the matching weekday', () => {
    expect(getTodayWeekday(new Date(2026, 0, 1))).toBe('thursday'); // Jan 1 2026 is a Thursday
    expect(getTodayWeekday(new Date(2026, 0, 5))).toBe('monday'); // Jan 5 2026 is a Monday
  });

  test('weekdayStorageKey produces a distinct, namespaced key per weekday', () => {
    const keys = WEEKDAYS.map(weekdayStorageKey);
    expect(new Set(keys).size).toBe(WEEKDAYS.length);
    expect(weekdayStorageKey('sunday')).toBe('circular-clock-mvp:week:sunday');
  });

  test('getAdjacentWeekday advances to the next day, wrapping Saturday to Sunday', () => {
    expect(getAdjacentWeekday('monday', 'next')).toBe('tuesday');
    expect(getAdjacentWeekday('saturday', 'next')).toBe('sunday');
  });

  test('getAdjacentWeekday goes back to the previous day, wrapping Sunday to Saturday', () => {
    expect(getAdjacentWeekday('monday', 'previous')).toBe('sunday');
    expect(getAdjacentWeekday('sunday', 'previous')).toBe('saturday');
  });
});
