import { describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCrossfadeTransition } from './useCrossfadeTransition';

describe('useCrossfadeTransition', () => {
  test('starts not faded', () => {
    const { result } = renderHook(() => useCrossfadeTransition(160));
    expect(result.current.isFaded).toBe(false);
  });

  test('run() fades out, applies the update mid-transition, then fades back in', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCrossfadeTransition(160));
    const update = vi.fn();

    act(() => {
      result.current.run(update);
    });

    expect(result.current.isFaded).toBe(true);
    expect(update).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(160);
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(result.current.isFaded).toBe(false);

    vi.useRealTimers();
  });

  test('calling run() again before the first timer fires supersedes it, so only the second update runs', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCrossfadeTransition(160));
    const updateA = vi.fn();
    const updateB = vi.fn();

    act(() => {
      result.current.run(updateA);
    });

    act(() => {
      vi.advanceTimersByTime(80);
    });

    act(() => {
      result.current.run(updateB);
    });

    act(() => {
      vi.advanceTimersByTime(160);
    });

    expect(updateA).not.toHaveBeenCalled();
    expect(updateB).toHaveBeenCalledTimes(1);
    expect(result.current.isFaded).toBe(false);

    vi.useRealTimers();
  });

  test('clears the pending timeout on unmount so the update never fires after unmount', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useCrossfadeTransition(160));
    const update = vi.fn();

    act(() => {
      result.current.run(update);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(160);
    });

    expect(update).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
