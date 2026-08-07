import { describe, expect, test, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSegments } from './useSegments';

describe('useSegments', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('starts empty when nothing is persisted', () => {
    const { result } = renderHook(() => useSegments());
    expect(result.current.segments).toEqual([]);
  });

  test('addSegment appends a new segment with a pastel color', () => {
    const { result } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 7, 'Gym');
    });

    expect(result.current.segments).toHaveLength(1);
    expect(result.current.segments[0]).toMatchObject({
      startHour: 6,
      endHour: 7,
      label: 'Gym',
    });
    expect(result.current.segments[0].fill).toMatch(/^hsl\(/);
  });

  test('newer segments are appended after older ones (renders on top)', () => {
    const { result } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 8, 'Gym');
      result.current.addSegment(7, 9, 'Podcast');
    });

    expect(result.current.segments.map((segment) => segment.label)).toEqual(['Gym', 'Podcast']);
  });

  test('updateSegment changes the label of an existing segment', () => {
    const { result } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 7, 'Gym');
    });
    const id = result.current.segments[0].id;

    act(() => {
      result.current.updateSegment(id, 'Workout');
    });

    expect(result.current.segments[0].label).toBe('Workout');
  });

  test('deleteSegment removes a segment', () => {
    const { result } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 7, 'Gym');
    });
    const id = result.current.segments[0].id;

    act(() => {
      result.current.deleteSegment(id);
    });

    expect(result.current.segments).toEqual([]);
  });

  test('persists segments to localStorage and reloads them', () => {
    const { result, unmount } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 7, 'Gym');
    });
    unmount();

    const { result: reloaded } = renderHook(() => useSegments());
    expect(reloaded.current.segments).toHaveLength(1);
    expect(reloaded.current.segments[0].label).toBe('Gym');
  });

  test('editing a segment moves it to the end of the array (renders on top)', () => {
    const { result } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 8, 'Gym');
      result.current.addSegment(7, 9, 'Podcast');
    });
    const gymId = result.current.segments[0].id;

    act(() => {
      result.current.updateSegment(gymId, 'Workout');
    });

    expect(result.current.segments.map((s) => s.label)).toEqual(['Podcast', 'Workout']);
  });

  test('degrades to an empty array when localStorage holds valid JSON that is not an array', () => {
    localStorage.setItem('circular-clock-mvp:segments', JSON.stringify({ not: 'an array' }));
    const { result } = renderHook(() => useSegments());
    expect(result.current.segments).toEqual([]);
  });
});
