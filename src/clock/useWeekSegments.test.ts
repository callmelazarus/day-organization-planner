import { describe, expect, test, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useWeekSegments } from './useWeekSegments';
import { weekdayStorageKey } from './weekDays';

describe('useWeekSegments', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('starts with every weekday empty', () => {
    const { result } = renderHook(() => useWeekSegments());

    expect(result.current.byDay.sunday).toEqual([]);
    expect(result.current.byDay.monday).toEqual([]);
    expect(result.current.byDay.saturday).toEqual([]);
  });

  test('addSegment only adds to the specified weekday', () => {
    const { result } = renderHook(() => useWeekSegments());

    act(() => {
      result.current.addSegment('monday', 9, 10, 'Standup');
    });

    expect(result.current.byDay.monday).toHaveLength(1);
    expect(result.current.byDay.monday[0].label).toBe('Standup');
    expect(result.current.byDay.tuesday).toEqual([]);
    expect(result.current.byDay.sunday).toEqual([]);
  });

  test('each weekday persists under its own namespaced storage key', () => {
    const { result } = renderHook(() => useWeekSegments());

    act(() => {
      result.current.addSegment('friday', 18, 20, 'Movie night');
    });

    expect(localStorage.getItem(weekdayStorageKey('friday'))).toContain('Movie night');
    expect(localStorage.getItem(weekdayStorageKey('saturday'))).toBeNull();
  });

  test('clearDay only clears the specified weekday', () => {
    const { result } = renderHook(() => useWeekSegments());

    act(() => {
      result.current.addSegment('monday', 9, 10, 'Standup');
      result.current.addSegment('tuesday', 9, 10, 'Doctor');
    });

    act(() => {
      result.current.clearDay('monday');
    });

    expect(result.current.byDay.monday).toEqual([]);
    expect(result.current.byDay.tuesday).toHaveLength(1);
  });

  test('updateSegment and deleteSegment operate on the specified weekday only', () => {
    const { result } = renderHook(() => useWeekSegments());

    act(() => {
      result.current.addSegment('monday', 9, 10, 'Standup');
    });
    const id = result.current.byDay.monday[0].id;

    act(() => {
      result.current.updateSegment('monday', id, 'Daily standup');
    });
    expect(result.current.byDay.monday[0].label).toBe('Daily standup');

    act(() => {
      result.current.deleteSegment('monday', id);
    });
    expect(result.current.byDay.monday).toEqual([]);
  });
});
