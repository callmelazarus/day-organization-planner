import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCurrentTime } from './useCurrentTime';

describe('useCurrentTime', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    });
    vi.setSystemTime(new Date(2026, 0, 1, 9, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns the current time at mount', () => {
    const { result } = renderHook(() => useCurrentTime(30000));
    expect(result.current.getHours()).toBe(9);
    expect(result.current.getMinutes()).toBe(0);
  });

  test('updates as real time passes', () => {
    const { result } = renderHook(() => useCurrentTime(30000));

    act(() => {
      vi.setSystemTime(new Date(2026, 0, 1, 9, 5));
      vi.advanceTimersByTime(30000);
    });

    expect(result.current.getHours()).toBe(9);
    expect(result.current.getMinutes()).toBe(5);
  });

  test('does not update faster than the given interval', () => {
    const { result } = renderHook(() => useCurrentTime(30000));

    act(() => {
      vi.setSystemTime(new Date(2026, 0, 1, 9, 5));
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.getMinutes()).toBe(0);
  });

  test('stops updating after unmount', () => {
    const { result, unmount } = renderHook(() => useCurrentTime(30000));
    unmount();

    expect(() => {
      act(() => {
        vi.setSystemTime(new Date(2026, 0, 1, 9, 5));
        vi.advanceTimersByTime(30000);
      });
    }).not.toThrow();

    expect(result.current.getMinutes()).toBe(0);
  });
});
