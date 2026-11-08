import { describe, expect, test, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAvatarChoice } from './useAvatarChoice';

describe('useAvatarChoice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to guy', () => {
    const { result } = renderHook(() => useAvatarChoice());
    expect(result.current.avatarId).toBe('guy');
  });

  test('setAvatarId updates and persists the choice', () => {
    const { result } = renderHook(() => useAvatarChoice());

    act(() => {
      result.current.setAvatarId('ninja');
    });

    expect(result.current.avatarId).toBe('ninja');
    expect(localStorage.getItem('circular-clock-mvp:avatar')).toBe('ninja');
  });

  test('restores a persisted choice on mount', () => {
    localStorage.setItem('circular-clock-mvp:avatar', 'gal');
    const { result } = renderHook(() => useAvatarChoice());
    expect(result.current.avatarId).toBe('gal');
  });

  test('falls back to guy when the stored value is not a known avatar', () => {
    localStorage.setItem('circular-clock-mvp:avatar', 'wizard');
    const { result } = renderHook(() => useAvatarChoice());
    expect(result.current.avatarId).toBe('guy');
  });
});
