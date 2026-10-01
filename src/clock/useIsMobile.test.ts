import { describe, expect, test, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useIsMobile } from './useIsMobile';

function setWindowWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
}

describe('useIsMobile', () => {
  afterEach(() => {
    setWindowWidth(1024);
  });

  test('reports mobile when the window is narrower than the breakpoint', () => {
    setWindowWidth(400);
    const { result } = renderHook(() => useIsMobile(480));
    expect(result.current).toBe(true);
  });

  test('reports not mobile when the window is wider than the breakpoint', () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile(480));
    expect(result.current).toBe(false);
  });

  test('treats the breakpoint width itself as mobile', () => {
    setWindowWidth(480);
    const { result } = renderHook(() => useIsMobile(480));
    expect(result.current).toBe(true);
  });

  test('updates when the window is resized', () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile(480));
    expect(result.current).toBe(false);

    act(() => {
      setWindowWidth(400);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });

  test('stops listening after unmount', () => {
    setWindowWidth(1024);
    const { result, unmount } = renderHook(() => useIsMobile(480));
    unmount();

    act(() => {
      setWindowWidth(400);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(false);
  });
});
