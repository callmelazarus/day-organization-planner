import { describe, expect, test, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useNotes } from './useNotes';

describe('useNotes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('starts empty when nothing is persisted', () => {
    const { result } = renderHook(() => useNotes());
    expect(result.current.notes).toBe('');
  });

  test('setNotes updates the notes and persists them', () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.setNotes('call the dentist');
    });

    expect(result.current.notes).toBe('call the dentist');
    expect(localStorage.getItem('circular-clock-mvp:notes')).toBe('call the dentist');
  });

  test('restores persisted notes on mount', () => {
    localStorage.setItem('circular-clock-mvp:notes', 'saved earlier');
    const { result } = renderHook(() => useNotes());
    expect(result.current.notes).toBe('saved earlier');
  });
});
