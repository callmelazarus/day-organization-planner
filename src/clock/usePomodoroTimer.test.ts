import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePomodoroTimer } from './usePomodoroTimer';

describe('usePomodoroTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('starts at 20 minutes, not running, not complete', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    expect(result.current.remainingSeconds).toBe(1200);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  test('start() begins counting down one second per tick', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingSeconds).toBe(1199);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remainingSeconds).toBe(1196);
  });

  test('pause() stops the countdown', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remainingSeconds).toBe(1198);

    act(() => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.remainingSeconds).toBe(1198);
  });

  test('reset() returns to 20 minutes and clears running/complete', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.remainingSeconds).toBe(1200);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  test('reaching 0 stops the countdown and marks it complete, without going negative', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(1200 * 1000);
    });

    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isComplete).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.remainingSeconds).toBe(0);
  });

  test('start() after completion resets to 20 minutes before counting down again', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(1200 * 1000);
    });
    expect(result.current.isComplete).toBe(true);

    act(() => {
      result.current.start();
    });
    expect(result.current.remainingSeconds).toBe(1200);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingSeconds).toBe(1199);
  });

  test('adjustMinutes(1) adds a minute to the remaining time', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.adjustMinutes(1);
    });

    expect(result.current.remainingSeconds).toBe(1260);
  });

  test('adjustMinutes(-1) subtracts a minute from the remaining time', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.adjustMinutes(-1);
    });

    expect(result.current.remainingSeconds).toBe(1140);
  });

  test('adjustMinutes(-1) does not go below 0', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.reset();
    });
    for (let i = 0; i < 21; i += 1) {
      act(() => {
        result.current.adjustMinutes(-1);
      });
    }

    expect(result.current.remainingSeconds).toBe(0);
  });

  test('adjustMinutes(1) clears isComplete once time is added back after completion', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(1200 * 1000);
    });
    expect(result.current.isComplete).toBe(true);

    act(() => {
      result.current.adjustMinutes(1);
    });

    expect(result.current.remainingSeconds).toBe(60);
    expect(result.current.isComplete).toBe(false);
  });

  test('adjustMinutes(-1) at 0 stays complete', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(1200 * 1000);
    });
    expect(result.current.isComplete).toBe(true);

    act(() => {
      result.current.adjustMinutes(-1);
    });

    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isComplete).toBe(true);
  });

  test('unmounting while running clears the interval', () => {
    const { result, unmount } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.start();
    });
    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(5000);
      });
    }).not.toThrow();
  });
});
