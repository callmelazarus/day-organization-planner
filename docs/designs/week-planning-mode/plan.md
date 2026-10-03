# Week Planning Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second "Week" planning mode, toggled by a switch, that lets the user plan all 7 weekdays independently (as recurring templates) without disturbing the existing single-day mode or the shared to-do list.

**Architecture:** Generalize the existing `useSegments` hook to take a storage key, so the existing single-day bucket and 7 new per-weekday buckets reuse the same persistence logic. A new `mode` ('single' | 'week') and `selectedDay` state in `DayPlanner` pick which bucket feeds the Day/Night dials; neither is persisted — every fresh load starts in Day mode. A small CSS-opacity crossfade hook wraps both the mode switch and the day switch. Toolbar actions branch on mode: Download/View-all-tasks aggregate across all 7 days in week mode, Clear stays scoped to the selected day.

**Tech Stack:** TypeScript + React 19, Vitest + Testing Library, plain CSS (inline style objects, matching existing component conventions) — no new dependencies.

**Spec:** `docs/designs/week-planning-mode/design.md` (also see `research.md` and `behavior-locks.md`)

## Global Constraints

- `scripts/validate.sh` (tsc --noEmit, eslint, vitest run, build) must pass before this plan's work is declared done — run it after the final step and show its output.
- Per this repo's `CLAUDE.md` commit protocol: **never run `git commit`.** Every step ends by staging its changes (`git add`) and stopping for the user's explicit review/go-ahead — this overrides the writing-plans/executing-plans skills' normal "commit each step" guidance.
- Stay within each step's declared file scope. If a change requires touching a file outside that scope, stop and output the `SCOPE QUESTION:` message (see `CLAUDE.md`) instead of proceeding.
- No new npm dependencies and no animation library — crossfades are plain CSS `opacity` transitions.
- New weekday storage keys are namespaced `circular-clock-mvp:week:<day>` (e.g. `circular-clock-mvp:week:monday`); the existing single-day key `circular-clock-mvp:segments` must never change.
- Match existing styling conventions: inline React style objects (no new CSS files), dark theme colors `#242424` (page background), `#1a1a1a` (panel/button background), `#2e2e2e` (dial base), `#f5b942` (day accent), `#6c63ff` (night accent), `#1f9e9e` (teal — existing toggle accent), font falls back to `system-ui` (the app's `Poppins` family applies automatically via `:root`).
- Mode and the week mode's selected day are never persisted to `localStorage`: every fresh page load starts in Day mode, and every time Week mode is entered the selected day resets to today's weekday.

---

## Step 1: Weekday domain module and `Mode` type

- **Scope:** `src/clock/types.ts`, `src/clock/weekDays.ts` (create), `src/clock/weekDays.test.ts` (create)
- **Do:**
  - [ ] Add `export type Mode = 'single' | 'week';` to `src/clock/types.ts` (alongside the existing `DialType`/`Segment`/`Todo` types).
  - [ ] Write `src/clock/weekDays.test.ts`:

    ```ts
    import { describe, expect, test } from 'vitest';
    import {
      WEEKDAYS,
      WEEKDAY_LABELS,
      WEEKDAY_FULL_LABELS,
      getTodayWeekday,
      weekdayStorageKey,
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
    });
    ```

  - [ ] Run it to confirm it fails because `weekDays.ts` doesn't exist yet:
    `npx vitest run src/clock/weekDays.test.ts` → expect FAIL ("Cannot find module './weekDays'").
  - [ ] Create `src/clock/weekDays.ts`:

    ```ts
    export type WeekDay =
      | 'sunday'
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday';

    export const WEEKDAYS: WeekDay[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    export const WEEKDAY_LABELS: Record<WeekDay, string> = {
      sunday: 'Sun',
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
    };

    export const WEEKDAY_FULL_LABELS: Record<WeekDay, string> = {
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
    };

    export function getTodayWeekday(now: Date = new Date()): WeekDay {
      return WEEKDAYS[now.getDay()];
    }

    export function weekdayStorageKey(day: WeekDay): string {
      return `circular-clock-mvp:week:${day}`;
    }
    ```

  - [ ] Stage the changes: `git add src/clock/types.ts src/clock/weekDays.ts src/clock/weekDays.test.ts`
- **Verify:** `npx vitest run src/clock/weekDays.test.ts` → all 4 tests PASS. `npx tsc --noEmit` → no errors.

---

## Step 2: Generalize `useSegments` to accept a storage key

- **Scope:** `src/clock/useSegments.ts`, `src/clock/useSegments.test.ts`
- **Do:**
  - [ ] Append these two tests to the existing `describe('useSegments', ...)` block in `src/clock/useSegments.test.ts` (add `SEGMENTS_STORAGE_KEY` to the existing import from `./useSegments`):

    ```ts
    test('accepts a custom storage key so multiple independent instances can coexist', () => {
      const { result: a } = renderHook(() => useSegments('custom:a'));
      const { result: b } = renderHook(() => useSegments('custom:b'));

      act(() => {
        a.current.addSegment(6, 7, 'Gym');
      });

      expect(a.current.segments).toHaveLength(1);
      expect(b.current.segments).toHaveLength(0);
      expect(localStorage.getItem('custom:a')).toContain('Gym');
      expect(localStorage.getItem('custom:b')).toBeNull();
    });

    test('a custom storage key never touches the default single-day key', () => {
      const { result } = renderHook(() => useSegments('custom:a'));

      act(() => {
        result.current.addSegment(6, 7, 'Gym');
      });

      expect(localStorage.getItem(SEGMENTS_STORAGE_KEY)).toBeNull();
    });
    ```

  - [ ] Run the test file to confirm these two new tests fail (no named export `SEGMENTS_STORAGE_KEY`, and `useSegments` doesn't yet accept an argument meaningfully):
    `npx vitest run src/clock/useSegments.test.ts` → expect FAIL.
  - [ ] Replace the body of `src/clock/useSegments.ts` with:

    ```ts
    import { useEffect, useState } from 'react';
    import { generatePastelColor } from './pastelColor';
    import type { Segment } from './types';

    export interface UseSegmentsResult {
      segments: Segment[];
      addSegment: (startHour: number, endHour: number, label: string) => void;
      updateSegment: (id: string, label: string) => void;
      deleteSegment: (id: string) => void;
      clearSegments: () => void;
    }

    export const SEGMENTS_STORAGE_KEY = 'circular-clock-mvp:segments';

    function loadSegments(storageKey: string): Segment[] {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as Segment[]) : [];
      } catch {
        return [];
      }
    }

    function saveSegments(storageKey: string, segments: Segment[]): void {
      localStorage.setItem(storageKey, JSON.stringify(segments));
    }

    let idCounter = 0;
    function generateId(): string {
      idCounter += 1;
      return `segment-${idCounter}-${Date.now()}`;
    }

    export function useSegments(storageKey: string = SEGMENTS_STORAGE_KEY): UseSegmentsResult {
      const [segments, setSegments] = useState<Segment[]>(() => loadSegments(storageKey));

      useEffect(() => {
        saveSegments(storageKey, segments);
      }, [storageKey, segments]);

      function addSegment(startHour: number, endHour: number, label: string): void {
        const { fill, textColor } = generatePastelColor();
        setSegments((prev) => [
          ...prev,
          { id: generateId(), startHour, endHour, label, fill, textColor },
        ]);
      }

      function updateSegment(id: string, label: string): void {
        setSegments((prev) => {
          const target = prev.find((segment) => segment.id === id);
          if (!target) return prev;
          return [...prev.filter((segment) => segment.id !== id), { ...target, label }];
        });
      }

      function deleteSegment(id: string): void {
        setSegments((prev) => prev.filter((segment) => segment.id !== id));
      }

      function clearSegments(): void {
        setSegments([]);
      }

      return { segments, addSegment, updateSegment, deleteSegment, clearSegments };
    }
    ```

    Note: every existing call site (`useSegments()` with no argument) keeps working unchanged because the parameter defaults to the original `SEGMENTS_STORAGE_KEY` — single-day mode's storage is untouched (Lock 1).
  - [ ] Stage the changes: `git add src/clock/useSegments.ts src/clock/useSegments.test.ts`
- **Verify:** `npx vitest run src/clock/useSegments.test.ts` → all tests (existing + 2 new) PASS.

---

## Step 3: `useWeekSegments` — the 7 recurring weekday buckets

- **Scope:** `src/clock/useWeekSegments.ts` (create), `src/clock/useWeekSegments.test.ts` (create)
- **Do:**
  - [ ] Write `src/clock/useWeekSegments.test.ts`:

    ```ts
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
    ```

  - [ ] Run it to confirm it fails (module doesn't exist): `npx vitest run src/clock/useWeekSegments.test.ts` → expect FAIL.
  - [ ] Create `src/clock/useWeekSegments.ts`:

    ```ts
    import { useSegments } from './useSegments';
    import type { UseSegmentsResult } from './useSegments';
    import type { Segment } from './types';
    import { weekdayStorageKey } from './weekDays';
    import type { WeekDay } from './weekDays';

    export interface UseWeekSegmentsResult {
      byDay: Record<WeekDay, Segment[]>;
      addSegment: (day: WeekDay, startHour: number, endHour: number, label: string) => void;
      updateSegment: (day: WeekDay, id: string, label: string) => void;
      deleteSegment: (day: WeekDay, id: string) => void;
      clearDay: (day: WeekDay) => void;
    }

    export function useWeekSegments(): UseWeekSegmentsResult {
      const sunday = useSegments(weekdayStorageKey('sunday'));
      const monday = useSegments(weekdayStorageKey('monday'));
      const tuesday = useSegments(weekdayStorageKey('tuesday'));
      const wednesday = useSegments(weekdayStorageKey('wednesday'));
      const thursday = useSegments(weekdayStorageKey('thursday'));
      const friday = useSegments(weekdayStorageKey('friday'));
      const saturday = useSegments(weekdayStorageKey('saturday'));

      const perDay: Record<WeekDay, UseSegmentsResult> = {
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
      };

      const byDay: Record<WeekDay, Segment[]> = {
        sunday: sunday.segments,
        monday: monday.segments,
        tuesday: tuesday.segments,
        wednesday: wednesday.segments,
        thursday: thursday.segments,
        friday: friday.segments,
        saturday: saturday.segments,
      };

      function addSegment(day: WeekDay, startHour: number, endHour: number, label: string): void {
        perDay[day].addSegment(startHour, endHour, label);
      }

      function updateSegment(day: WeekDay, id: string, label: string): void {
        perDay[day].updateSegment(id, label);
      }

      function deleteSegment(day: WeekDay, id: string): void {
        perDay[day].deleteSegment(id);
      }

      function clearDay(day: WeekDay): void {
        perDay[day].clearSegments();
      }

      return { byDay, addSegment, updateSegment, deleteSegment, clearDay };
    }
    ```

    Note: calling `useSegments` 7 times with fixed literal keys is rules-of-hooks-safe — the same 7 calls happen in the same order on every render, regardless of which weekday is selected.
  - [ ] Stage the changes: `git add src/clock/useWeekSegments.ts src/clock/useWeekSegments.test.ts`
- **Verify:** `npx vitest run src/clock/useWeekSegments.test.ts` → all 5 tests PASS.

---

## Step 4: `useCrossfadeTransition` — the shared fade hook

- **Scope:** `src/clock/useCrossfadeTransition.ts` (create), `src/clock/useCrossfadeTransition.test.ts` (create)
- **Do:**
  - [ ] Write `src/clock/useCrossfadeTransition.test.ts`:

    ```ts
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
    });
    ```

  - [ ] Run it to confirm it fails (module doesn't exist): `npx vitest run src/clock/useCrossfadeTransition.test.ts` → expect FAIL.
  - [ ] Create `src/clock/useCrossfadeTransition.ts`:

    ```ts
    import { useState } from 'react';

    export const CROSSFADE_DURATION_MS = 160;

    export interface UseCrossfadeTransitionResult {
      isFaded: boolean;
      run: (update: () => void) => void;
    }

    export function useCrossfadeTransition(
      durationMs: number = CROSSFADE_DURATION_MS
    ): UseCrossfadeTransitionResult {
      const [isFaded, setIsFaded] = useState(false);

      function run(update: () => void): void {
        setIsFaded(true);
        setTimeout(() => {
          update();
          setIsFaded(false);
        }, durationMs);
      }

      return { isFaded, run };
    }
    ```

  - [ ] Stage the changes: `git add src/clock/useCrossfadeTransition.ts src/clock/useCrossfadeTransition.test.ts`
- **Verify:** `npx vitest run src/clock/useCrossfadeTransition.test.ts` → both tests PASS.

---

## Step 5: `ModeToggle` component

- **Scope:** `src/clock/ModeToggle.tsx` (create), `src/clock/ModeToggle.test.tsx` (create)
- **Do:**
  - [ ] Write `src/clock/ModeToggle.test.tsx`:

    ```tsx
    import { describe, expect, test, vi, afterEach } from 'vitest';
    import { render, screen, fireEvent, cleanup } from '@testing-library/react';
    import { ModeToggle } from './ModeToggle';

    describe('ModeToggle', () => {
      afterEach(() => {
        cleanup();
      });

      test('renders Day and Week labels', () => {
        render(<ModeToggle mode="single" onToggle={() => {}} />);
        expect(screen.getByText('Day')).toBeInTheDocument();
        expect(screen.getByText('Week')).toBeInTheDocument();
      });

      test('reflects single mode via aria-checked=false', () => {
        render(<ModeToggle mode="single" onToggle={() => {}} />);
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
      });

      test('reflects week mode via aria-checked=true', () => {
        render(<ModeToggle mode="week" onToggle={() => {}} />);
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
      });

      test('calls onToggle when clicked', () => {
        const handleToggle = vi.fn();
        render(<ModeToggle mode="single" onToggle={handleToggle} />);

        fireEvent.click(screen.getByRole('switch'));

        expect(handleToggle).toHaveBeenCalled();
      });
    });
    ```

  - [ ] Run it to confirm it fails (module doesn't exist): `npx vitest run src/clock/ModeToggle.test.tsx` → expect FAIL.
  - [ ] Create `src/clock/ModeToggle.tsx`. Position is fixed top-left of the viewport, stacked directly below the existing `CurrentTimeToggle` (which sits at `top: 16, left: 16` with a 48px height — `top: 76` clears it with a 12px gap):

    ```tsx
    import type { ReactElement } from 'react';
    import type { Mode } from './types';

    export interface ModeToggleProps {
      mode: Mode;
      onToggle: () => void;
    }

    const ACTIVE_BG = '#1f9e9e';
    const ACTIVE_TEXT = '#e7fbf8';
    const INACTIVE_TEXT = '#999';

    export function ModeToggle({ mode, onToggle }: ModeToggleProps): ReactElement {
      const isWeek = mode === 'week';

      return (
        <button
          type="button"
          role="switch"
          aria-checked={isWeek}
          aria-label="Toggle between single-day and week planning mode"
          onClick={onToggle}
          style={{
            position: 'fixed',
            top: 76,
            left: 16,
            zIndex: 5,
            display: 'inline-flex',
            border: '1px solid #3a3a3a',
            borderRadius: 999,
            backgroundColor: '#1a1a1a',
            padding: 3,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <span
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: '0.85rem',
              fontWeight: 500,
              backgroundColor: isWeek ? 'transparent' : ACTIVE_BG,
              color: isWeek ? INACTIVE_TEXT : ACTIVE_TEXT,
            }}
          >
            Day
          </span>
          <span
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: '0.85rem',
              fontWeight: 500,
              backgroundColor: isWeek ? ACTIVE_BG : 'transparent',
              color: isWeek ? ACTIVE_TEXT : INACTIVE_TEXT,
            }}
          >
            Week
          </span>
        </button>
      );
    }
    ```

  - [ ] Stage the changes: `git add src/clock/ModeToggle.tsx src/clock/ModeToggle.test.tsx`
- **Verify:** `npx vitest run src/clock/ModeToggle.test.tsx` → all 4 tests PASS.

---

## Step 6: `WeekDaySelector` component

- **Scope:** `src/clock/WeekDaySelector.tsx` (create), `src/clock/WeekDaySelector.test.tsx` (create)
- **Do:**
  - [ ] Write `src/clock/WeekDaySelector.test.tsx`:

    ```tsx
    import { describe, expect, test, vi, afterEach } from 'vitest';
    import { render, screen, fireEvent, cleanup } from '@testing-library/react';
    import { WeekDaySelector } from './WeekDaySelector';

    describe('WeekDaySelector', () => {
      afterEach(() => {
        cleanup();
      });

      test('renders all 7 weekday buttons in order', () => {
        render(<WeekDaySelector selectedDay="monday" todayDay="monday" onSelect={() => {}} />);

        const buttons = screen.getAllByRole('button');
        expect(buttons.map((b) => b.textContent?.replace(' •', ''))).toEqual([
          'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
        ]);
      });

      test('marks only the selected day as pressed', () => {
        render(<WeekDaySelector selectedDay="wednesday" todayDay="monday" onSelect={() => {}} />);

        expect(screen.getByRole('button', { name: /Wed/ })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /^Mon/ })).toHaveAttribute('aria-pressed', 'false');
      });

      test("marks today's button with a dot regardless of selection", () => {
        render(<WeekDaySelector selectedDay="wednesday" todayDay="friday" onSelect={() => {}} />);

        expect(screen.getByRole('button', { name: /Fri/ })).toHaveTextContent('Fri •');
        expect(screen.getByRole('button', { name: /^Mon/ })).not.toHaveTextContent('•');
      });

      test('calls onSelect with the clicked weekday', () => {
        const handleSelect = vi.fn();
        render(<WeekDaySelector selectedDay="monday" todayDay="monday" onSelect={handleSelect} />);

        fireEvent.click(screen.getByRole('button', { name: /^Fri/ }));

        expect(handleSelect).toHaveBeenCalledWith('friday');
      });
    });
    ```

  - [ ] Run it to confirm it fails (module doesn't exist): `npx vitest run src/clock/WeekDaySelector.test.tsx` → expect FAIL.
  - [ ] Create `src/clock/WeekDaySelector.tsx`:

    ```tsx
    import type { ReactElement } from 'react';
    import { WEEKDAYS, WEEKDAY_LABELS } from './weekDays';
    import type { WeekDay } from './weekDays';

    export interface WeekDaySelectorProps {
      selectedDay: WeekDay;
      todayDay: WeekDay;
      onSelect: (day: WeekDay) => void;
    }

    export function WeekDaySelector({
      selectedDay,
      todayDay,
      onSelect,
    }: WeekDaySelectorProps): ReactElement {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {WEEKDAYS.map((day) => {
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => onSelect(day)}
                aria-pressed={isSelected}
                style={{
                  border: '1px solid #3a3a3a',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#1f9e9e' : '#1a1a1a',
                  color: isSelected ? '#e7fbf8' : '#999',
                }}
              >
                {WEEKDAY_LABELS[day]}
                {day === todayDay ? <span aria-hidden="true"> •</span> : null}
              </button>
            );
          })}
        </div>
      );
    }
    ```

  - [ ] Stage the changes: `git add src/clock/WeekDaySelector.tsx src/clock/WeekDaySelector.test.tsx`
- **Verify:** `npx vitest run src/clock/WeekDaySelector.test.tsx` → all 4 tests PASS.

---

## Step 7: `WeekTaskListModal` component (aggregate, grouped by day)

- **Scope:** `src/clock/WeekTaskListModal.tsx` (create), `src/clock/WeekTaskListModal.test.tsx` (create)
- **Do:**
  - [ ] Write `src/clock/WeekTaskListModal.test.tsx`:

    ```tsx
    import { describe, expect, test, vi, afterEach } from 'vitest';
    import { render, screen, fireEvent, cleanup } from '@testing-library/react';
    import { WeekTaskListModal } from './WeekTaskListModal';
    import { WEEKDAYS } from './weekDays';
    import type { WeekDay } from './weekDays';
    import type { Segment } from './types';

    function emptyWeek(): Record<WeekDay, Segment[]> {
      const byDay = {} as Record<WeekDay, Segment[]>;
      WEEKDAYS.forEach((day) => {
        byDay[day] = [];
      });
      return byDay;
    }

    describe('WeekTaskListModal', () => {
      afterEach(() => {
        cleanup();
      });

      test('shows a heading and "No tasks planned yet" for every empty day', () => {
        render(<WeekTaskListModal segmentsByDay={emptyWeek()} onClose={() => {}} />);

        expect(screen.getByText('Sunday')).toBeInTheDocument();
        expect(screen.getByText('Saturday')).toBeInTheDocument();
        expect(screen.getAllByText('No tasks planned yet')).toHaveLength(7);
      });

      test("lists a day's tasks under its own heading only", () => {
        const byDay = emptyWeek();
        byDay.monday = [
          { id: '1', startHour: 9, endHour: 10, label: 'Standup', fill: '', textColor: '' },
        ];

        render(<WeekTaskListModal segmentsByDay={byDay} onClose={() => {}} />);

        expect(screen.getByText('Standup')).toBeInTheDocument();
        expect(screen.getAllByText('No tasks planned yet')).toHaveLength(6);
      });

      test('the Close button calls onClose', () => {
        const handleClose = vi.fn();
        render(<WeekTaskListModal segmentsByDay={emptyWeek()} onClose={handleClose} />);

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(handleClose).toHaveBeenCalled();
      });
    });
    ```

  - [ ] Run it to confirm it fails (module doesn't exist): `npx vitest run src/clock/WeekTaskListModal.test.tsx` → expect FAIL.
  - [ ] Create `src/clock/WeekTaskListModal.tsx` (mirrors the existing `TaskListModal`'s shell and styling, grouped by weekday heading):

    ```tsx
    import { useEffect } from 'react';
    import type { ReactElement } from 'react';
    import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
    import { formatHourRangeLabel } from './hourLabel';
    import { WEEKDAYS, WEEKDAY_FULL_LABELS } from './weekDays';
    import type { WeekDay } from './weekDays';
    import type { Segment } from './types';

    export interface WeekTaskListModalProps {
      segmentsByDay: Record<WeekDay, Segment[]>;
      onClose: () => void;
    }

    export function WeekTaskListModal({
      segmentsByDay,
      onClose,
    }: WeekTaskListModalProps): ReactElement {
      useEffect(() => {
        function handleKeyDown(event: KeyboardEvent): void {
          if (event.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [onClose]);

      function handleBackdropClick(event: ReactMouseEvent<HTMLDivElement>): void {
        if (event.target === event.currentTarget) onClose();
      }

      function handleBackdropKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          onClose();
        }
      }

      return (
        <div
          role="presentation"
          onClick={handleBackdropClick}
          onKeyDown={handleBackdropKeyDown}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="All tasks this week"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: 24,
              borderRadius: 12,
              backgroundColor: '#d9d9d9',
              color: '#1a1a1a',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              minWidth: 320,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>All tasks this week</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{ backgroundColor: '#9e9e9e', color: '#1a1a1a' }}
              >
                Close
              </button>
            </div>

            {WEEKDAYS.map((day) => {
              const sortedSegments = [...segmentsByDay[day]].sort(
                (a, b) => a.startHour - b.startHour
              );
              return (
                <section key={day}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1rem' }}>{WEEKDAY_FULL_LABELS[day]}</h3>
                  {sortedSegments.length === 0 ? (
                    <p style={{ margin: '0 0 8px' }}>No tasks planned yet</p>
                  ) : (
                    <table style={{ borderCollapse: 'collapse', marginBottom: 8 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '4px 16px 4px 0' }}>Time</th>
                          <th style={{ textAlign: 'left', padding: '4px 0' }}>Task</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedSegments.map((segment) => (
                          <tr key={segment.id}>
                            <td style={{ padding: '4px 16px 4px 0', whiteSpace: 'nowrap' }}>
                              {formatHourRangeLabel(segment.startHour, segment.endHour)}
                            </td>
                            <td style={{ padding: '4px 0' }}>{segment.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      );
    }
    ```

  - [ ] Stage the changes: `git add src/clock/WeekTaskListModal.tsx src/clock/WeekTaskListModal.test.tsx`
- **Verify:** `npx vitest run src/clock/WeekTaskListModal.test.tsx` → all 3 tests PASS.

---

## Step 8: Aggregate week image export

- **Scope:** `src/clock/exportSnapshot.ts`, `src/clock/exportSnapshot.test.ts`
- **Do:**
  - [ ] Add `downloadWeekSnapshot` and `formatWeekSnapshotFilename` to the import line at the top of `src/clock/exportSnapshot.test.ts`, then append these tests after the existing `describe('downloadDialsSnapshot', ...)` block (reusing the `makeFakeSvg` and `FakeImage` helpers already defined in that file):

    ```ts
    describe('formatWeekSnapshotFilename', () => {
      test('formats a date as week-planner-YYYY-MM-DD.png', () => {
        const date = new Date(2026, 7, 22);
        expect(formatWeekSnapshotFilename(date)).toBe('week-planner-2026-08-22.png');
      });
    });

    describe('downloadWeekSnapshot', () => {
      let fillRect: ReturnType<typeof vi.fn>;
      let drawImage: ReturnType<typeof vi.fn>;
      let fillText: ReturnType<typeof vi.fn>;
      let clickedAnchor: HTMLAnchorElement | undefined;

      beforeEach(() => {
        vi.stubGlobal('Image', FakeImage);

        fillRect = vi.fn();
        drawImage = vi.fn();
        fillText = vi.fn();

        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
          fillRect,
          drawImage,
          fillText,
          set fillStyle(_value: string) {},
          set font(_value: string) {},
          set textAlign(_value: string) {},
        } as unknown as CanvasRenderingContext2D);

        vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
          callback: BlobCallback
        ) {
          callback(new Blob(['fake'], { type: 'image/png' }));
        });

        URL.createObjectURL = vi.fn(() => 'blob:fake-url');
        URL.revokeObjectURL = vi.fn();

        clickedAnchor = undefined;
        const originalCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'a') {
            clickedAnchor = element as HTMLAnchorElement;
            vi.spyOn(element, 'click').mockImplementation(() => {});
          }
          return element;
        });
      });

      afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
      });

      test('draws a heading and both dial images for every day row', async () => {
        const rows = [
          { heading: 'SUNDAY', svgs: [makeFakeSvg(), makeFakeSvg()], dialLabels: ['☀️ Day', '🌙 Night'] },
          { heading: 'MONDAY', svgs: [makeFakeSvg(), makeFakeSvg()], dialLabels: ['☀️ Day', '🌙 Night'] },
        ];

        await downloadWeekSnapshot(rows);

        expect(fillRect).toHaveBeenCalled();
        expect(drawImage).toHaveBeenCalledTimes(4);
        expect(fillText).toHaveBeenCalledWith('SUNDAY', expect.any(Number), expect.any(Number));
        expect(fillText).toHaveBeenCalledWith('MONDAY', expect.any(Number), expect.any(Number));
      });

      test('exports a PNG and triggers a download with the week-dated filename', async () => {
        const rows = [
          { heading: 'SUNDAY', svgs: [makeFakeSvg(), makeFakeSvg()], dialLabels: ['☀️ Day', '🌙 Night'] },
        ];

        await downloadWeekSnapshot(rows);

        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(clickedAnchor?.download).toBe(formatWeekSnapshotFilename(new Date()));
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
      });
    });
    ```

  - [ ] Run the test file to confirm the new tests fail (no such exports yet): `npx vitest run src/clock/exportSnapshot.test.ts` → expect FAIL, existing tests still PASS.
  - [ ] Replace the full contents of `src/clock/exportSnapshot.ts` with:

    ```ts
    const BACKGROUND_COLOR = '#242424';
    const LABEL_COLOR = '#e8e8e8';
    const LABEL_FONT = '20px system-ui, sans-serif';
    const HEADING_FONT = 'bold 22px system-ui, sans-serif';
    const GAP = 40;
    const LABEL_GAP = 8;
    const LABEL_FONT_SIZE = 20;
    const PADDING = 20;
    const HEADING_HEIGHT = 36;
    const ROW_GAP = 32;

    export function formatSnapshotFilename(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `day-planner-${year}-${month}-${day}.png`;
    }

    export function formatWeekSnapshotFilename(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `week-planner-${year}-${month}-${day}.png`;
    }

    function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
      const serialized = new XMLSerializer().serializeToString(svg);
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load dial SVG as an image'));
        image.src = dataUrl;
      });
    }

    function drawRow(
      ctx: CanvasRenderingContext2D,
      images: HTMLImageElement[],
      labels: string[],
      originX: number,
      originY: number
    ): void {
      const dialSize = images[0]?.naturalWidth ?? 0;
      images.forEach((image, index) => {
        const x = originX + index * (dialSize + GAP);
        ctx.drawImage(image, x, originY, dialSize, dialSize);
        ctx.fillText(
          labels[index] ?? '',
          x + dialSize / 2,
          originY + dialSize + LABEL_GAP + LABEL_FONT_SIZE
        );
      });
    }

    export async function downloadDialsSnapshot(
      svgs: SVGSVGElement[],
      labels: string[]
    ): Promise<void> {
      const images = await Promise.all(svgs.map(svgToImage));
      const dialSize = images[0]?.naturalWidth ?? 0;

      const canvas = document.createElement('canvas');
      canvas.width = PADDING * 2 + dialSize * images.length + GAP * (images.length - 1);
      canvas.height = PADDING * 2 + dialSize + LABEL_GAP + LABEL_FONT_SIZE;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = LABEL_COLOR;
      ctx.font = LABEL_FONT;
      ctx.textAlign = 'center';

      drawRow(ctx, images, labels, PADDING, PADDING);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to create PNG blob');

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = formatSnapshotFilename(new Date());
      anchor.click();
      URL.revokeObjectURL(url);
    }

    export interface WeekDaySnapshotRow {
      heading: string;
      svgs: SVGSVGElement[];
      dialLabels: string[];
    }

    export async function downloadWeekSnapshot(rows: WeekDaySnapshotRow[]): Promise<void> {
      const rowsWithImages = await Promise.all(
        rows.map(async (row) => ({
          heading: row.heading,
          dialLabels: row.dialLabels,
          images: await Promise.all(row.svgs.map(svgToImage)),
        }))
      );

      const dialSize = rowsWithImages[0]?.images[0]?.naturalWidth ?? 0;
      const maxDialsPerRow = Math.max(...rowsWithImages.map((row) => row.images.length), 0);
      const rowWidth = PADDING * 2 + dialSize * maxDialsPerRow + GAP * (maxDialsPerRow - 1);
      const rowHeight = HEADING_HEIGHT + dialSize + LABEL_GAP + LABEL_FONT_SIZE;

      const canvas = document.createElement('canvas');
      canvas.width = rowWidth;
      canvas.height =
        PADDING * 2 + rowHeight * rowsWithImages.length + ROW_GAP * (rowsWithImages.length - 1);

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';

      rowsWithImages.forEach((row, index) => {
        const rowOriginY = PADDING + index * (rowHeight + ROW_GAP);

        ctx.fillStyle = LABEL_COLOR;
        ctx.font = HEADING_FONT;
        ctx.fillText(row.heading, canvas.width / 2, rowOriginY + HEADING_HEIGHT - LABEL_GAP);

        ctx.font = LABEL_FONT;
        drawRow(ctx, row.images, row.dialLabels, PADDING, rowOriginY + HEADING_HEIGHT);
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to create PNG blob');

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = formatWeekSnapshotFilename(new Date());
      anchor.click();
      URL.revokeObjectURL(url);
    }
    ```

    Note: `downloadDialsSnapshot` now delegates its row-drawing to the shared `drawRow` helper that `downloadWeekSnapshot` also uses, but its observable behavior (canvas size, draw calls, filename) is unchanged — the existing tests for it must keep passing untouched.
  - [ ] Stage the changes: `git add src/clock/exportSnapshot.ts src/clock/exportSnapshot.test.ts`
- **Verify:** `npx vitest run src/clock/exportSnapshot.test.ts` → all tests (existing + new) PASS.

---

## Step 9: Wire it all into `DayPlanner`

- **Scope:** `src/clock/DayPlanner.tsx`, `src/clock/DayPlanner.test.tsx`, `docs/designs/week-planning-mode/behavior-locks.md`
- **Do:**
  - [ ] In `src/clock/DayPlanner.test.tsx`, replace this existing test:

    ```ts
    test('renders the current-time toggle button, off by default with no current-time line shown', () => {
      render(<DayPlanner />);

      const toggle = screen.getByRole('button', { name: /current time/i });
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expect(document.querySelector('[data-testid="current-time-line"]')).not.toBeInTheDocument();
    });
    ```

    with:

    ```ts
    test('renders the current-time toggle button, on by default with a current-time line shown', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
      vi.setSystemTime(new Date(2026, 0, 1, 10, 0));

      render(<DayPlanner />);

      const toggle = screen.getByRole('button', { name: /current time/i });
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
      expect(document.querySelectorAll('[data-testid="current-time-line"]')).toHaveLength(1);

      vi.useRealTimers();
    });
    ```

  - [ ] Replace this existing test:

    ```ts
    test('clicking the current-time toggle shows a current-time line on the dial matching the current time, and hides it again when clicked off', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
      vi.setSystemTime(new Date(2026, 0, 1, 10, 0));

      render(<DayPlanner />);

      const toggle = screen.getByRole('button', { name: /current time/i });
      fireEvent.click(toggle);

      expect(toggle).toHaveAttribute('aria-pressed', 'true');
      expect(document.querySelectorAll('[data-testid="current-time-line"]')).toHaveLength(1);

      fireEvent.click(toggle);

      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expect(document.querySelector('[data-testid="current-time-line"]')).not.toBeInTheDocument();

      vi.useRealTimers();
    });
    ```

    with (default is now on, so the sequence flips to "off then back on"):

    ```ts
    test('clicking the current-time toggle hides the current-time line, and clicking again shows it', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
      vi.setSystemTime(new Date(2026, 0, 1, 10, 0));

      render(<DayPlanner />);

      const toggle = screen.getByRole('button', { name: /current time/i });
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
      expect(document.querySelectorAll('[data-testid="current-time-line"]')).toHaveLength(1);

      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expect(document.querySelector('[data-testid="current-time-line"]')).not.toBeInTheDocument();

      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
      expect(document.querySelectorAll('[data-testid="current-time-line"]')).toHaveLength(1);

      vi.useRealTimers();
    });
    ```

  - [ ] Append these new tests inside the same `describe('DayPlanner', ...)` block, right before its closing `});`:

    ```ts
    test('defaults to Day mode with no weekday selector shown', () => {
      render(<DayPlanner />);

      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
      expect(screen.queryByText('Sun')).not.toBeInTheDocument();
    });

    test('switching modes does not affect the shared to-do list', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday

      render(<DayPlanner />);

      fireEvent.change(screen.getByPlaceholderText('Keep going!'), {
        target: { value: 'Buy groceries' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('switch'));
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('switch'));
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();

      vi.useRealTimers();
    });

    test('switching to Week mode shows the weekday selector defaulting to today', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday

      render(<DayPlanner />);
      fireEvent.click(screen.getByRole('switch'));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('button', { name: /^Mon/ })).toHaveAttribute('aria-pressed', 'true');

      vi.useRealTimers();
    });

    test('a segment saved in week mode for one weekday only shows up when that weekday is selected', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday
      localStorage.setItem(
        'circular-clock-mvp:week:monday',
        JSON.stringify([
          { id: '1', startHour: 8, endHour: 9, label: 'Standup', fill: '', textColor: '' },
        ])
      );

      render(<DayPlanner />);
      fireEvent.click(screen.getByRole('switch'));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole('button', { name: 'Standup' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /^Tue/ }));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByRole('button', { name: 'Standup' })).not.toBeInTheDocument();

      vi.useRealTimers();
    });

    test('Clear in week mode only clears the selected weekday, leaving single-day mode and other weekdays untouched', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday
      localStorage.setItem(
        'circular-clock-mvp:segments',
        JSON.stringify([
          { id: 's1', startHour: 8, endHour: 9, label: 'SingleDayTask', fill: '', textColor: '' },
        ])
      );
      localStorage.setItem(
        'circular-clock-mvp:week:monday',
        JSON.stringify([
          { id: 'm1', startHour: 8, endHour: 9, label: 'MondayTask', fill: '', textColor: '' },
        ])
      );
      localStorage.setItem(
        'circular-clock-mvp:week:tuesday',
        JSON.stringify([
          { id: 't1', startHour: 8, endHour: 9, label: 'TuesdayTask', fill: '', textColor: '' },
        ])
      );

      render(<DayPlanner />);
      fireEvent.click(screen.getByRole('switch'));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
      const confirmDialog = screen.getByRole('dialog', { name: "Clear Monday's tasks?" });
      fireEvent.click(within(confirmDialog).getByRole('button', { name: 'Clear' }));

      expect(screen.queryByRole('button', { name: 'MondayTask' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /^Tue/ }));
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.getByRole('button', { name: 'TuesdayTask' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('switch'));
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.getByRole('button', { name: 'SingleDayTask' })).toBeInTheDocument();

      vi.useRealTimers();
    });

    test('Download image in week mode exports all 7 weekdays as one stacked image', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday

      render(<DayPlanner />);
      fireEvent.click(screen.getByRole('switch'));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      fireEvent.click(screen.getByRole('button', { name: 'Download image' }));

      expect(exportSnapshot.downloadWeekSnapshot).toHaveBeenCalledTimes(1);
      const [rows] = vi.mocked(exportSnapshot.downloadWeekSnapshot).mock.calls[0];
      expect(rows).toHaveLength(7);
      expect(rows[0].heading).toBe('SUNDAY');
      expect(rows.every((row) => row.svgs.length === 2)).toBe(true);

      vi.useRealTimers();
    });

    test('View all tasks in week mode opens the week-grouped task list', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday
      localStorage.setItem(
        'circular-clock-mvp:week:monday',
        JSON.stringify([
          { id: 'm1', startHour: 8, endHour: 9, label: 'MondayTask', fill: '', textColor: '' },
        ])
      );

      render(<DayPlanner />);
      fireEvent.click(screen.getByRole('switch'));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      fireEvent.click(screen.getByRole('button', { name: 'View all tasks' }));

      expect(screen.getByRole('dialog', { name: 'All tasks this week' })).toBeInTheDocument();
      expect(screen.getByText('MondayTask')).toBeInTheDocument();

      vi.useRealTimers();
    });
    ```

  - [ ] Update the mock at the top of `src/clock/DayPlanner.test.tsx` to also stub `downloadWeekSnapshot`:

    ```ts
    vi.mock('./exportSnapshot', async () => {
      const actual = await vi.importActual<typeof exportSnapshot>('./exportSnapshot');
      return {
        ...actual,
        downloadDialsSnapshot: vi.fn().mockResolvedValue(undefined),
        downloadWeekSnapshot: vi.fn().mockResolvedValue(undefined),
      };
    });
    ```

  - [ ] Run the test file to confirm the new/changed tests fail (DayPlanner doesn't yet have week mode): `npx vitest run src/clock/DayPlanner.test.tsx` → expect FAIL.
  - [ ] Replace the full contents of `src/clock/DayPlanner.tsx` with:

    ```tsx
    import { useRef, useState } from 'react';
    import type { MouseEvent, ReactElement } from 'react';
    import { ClockDial } from './ClockDial';
    import { ConfirmModal } from './ConfirmModal';
    import { CurrentTimeToggle } from './CurrentTimeToggle';
    import { ModeToggle } from './ModeToggle';
    import { SegmentPopup } from './SegmentPopup';
    import { TaskListModal } from './TaskListModal';
    import { TodoList } from './TodoList';
    import { WeekDaySelector } from './WeekDaySelector';
    import { WeekTaskListModal } from './WeekTaskListModal';
    import { getFractionalHour } from './currentTime';
    import { downloadDialsSnapshot, downloadWeekSnapshot } from './exportSnapshot';
    import { useCrossfadeTransition } from './useCrossfadeTransition';
    import { useCurrentTime } from './useCurrentTime';
    import { useSegments } from './useSegments';
    import { useTodos } from './useTodos';
    import { useWeekSegments } from './useWeekSegments';
    import { MOBILE_BREAKPOINT_PX, useIsMobile } from './useIsMobile';
    import { WEEKDAYS, WEEKDAY_FULL_LABELS, getTodayWeekday } from './weekDays';
    import type { WeekDay } from './weekDays';
    import type { Mode, Segment } from './types';

    const CURRENT_TIME_REFRESH_MS = 30000;

    const DAYTIME_LABEL = '☀️ Day';
    const NIGHTTIME_LABEL = '🌙 Night';

    interface Anchor {
      x: number;
      y: number;
    }

    interface PendingCreate {
      startHour: number;
      endHour: number;
      anchor: Anchor;
    }

    interface PendingEdit {
      segment: Segment;
      anchor: Anchor;
    }

    function noopSegmentClick(): void {}
    function noopCreateSegment(): void {}

    function filterDaytime(segments: Segment[]): Segment[] {
      return segments.filter((segment) => segment.startHour >= 7 && segment.startHour < 18);
    }

    function filterNighttime(segments: Segment[]): Segment[] {
      return segments.filter((segment) => segment.startHour >= 18);
    }

    export function DayPlanner(): ReactElement {
      const singleDay = useSegments();
      const week = useWeekSegments();
      const { todos, addTodo, deleteTodo, toggleStar, toggleDone, moveTodoUp, clearTodos } =
        useTodos();

      const [mode, setMode] = useState<Mode>('single');
      const [selectedDay, setSelectedDay] = useState<WeekDay>(() => getTodayWeekday());
      const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);
      const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);
      const [isTaskListOpen, setIsTaskListOpen] = useState(false);
      const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
      const [isCurrentTimeOn, setIsCurrentTimeOn] = useState(true);
      const dialsRowRef = useRef<HTMLDivElement>(null);
      const weekExportRefs = useRef<Record<WeekDay, HTMLDivElement | null>>({
        sunday: null,
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
      });
      const isMobile = useIsMobile(MOBILE_BREAKPOINT_PX);
      const now = useCurrentTime(CURRENT_TIME_REFRESH_MS);
      const currentHour = isCurrentTimeOn ? getFractionalHour(now) : null;
      const { isFaded, run } = useCrossfadeTransition();

      const activeSegments = mode === 'single' ? singleDay.segments : week.byDay[selectedDay];
      const daytimeSegments = filterDaytime(activeSegments);
      const nighttimeSegments = filterNighttime(activeSegments);

      const daytimePendingRange =
        pendingCreate && pendingCreate.startHour >= 7 && pendingCreate.startHour < 18
          ? { startHour: pendingCreate.startHour, endHour: pendingCreate.endHour }
          : null;
      const nighttimePendingRange =
        pendingCreate && pendingCreate.startHour >= 18
          ? { startHour: pendingCreate.startHour, endHour: pendingCreate.endHour }
          : null;

      function addActiveSegment(startHour: number, endHour: number, label: string): void {
        if (mode === 'single') singleDay.addSegment(startHour, endHour, label);
        else week.addSegment(selectedDay, startHour, endHour, label);
      }

      function updateActiveSegment(id: string, label: string): void {
        if (mode === 'single') singleDay.updateSegment(id, label);
        else week.updateSegment(selectedDay, id, label);
      }

      function deleteActiveSegment(id: string): void {
        if (mode === 'single') singleDay.deleteSegment(id);
        else week.deleteSegment(selectedDay, id);
      }

      function clearActiveSegments(): void {
        if (mode === 'single') singleDay.clearSegments();
        else week.clearDay(selectedDay);
      }

      function handleCreateSegment(startHour: number, endHour: number, anchor: Anchor): void {
        setPendingEdit(null);
        setPendingCreate({ startHour, endHour, anchor });
      }

      function handleSegmentClick(segment: Segment, event: MouseEvent<SVGElement>): void {
        setPendingCreate(null);
        setPendingEdit({ segment, anchor: { x: event.clientX, y: event.clientY } });
      }

      function handleClear(): void {
        setIsClearConfirmOpen(true);
      }

      function handleToggleMode(): void {
        const nextMode: Mode = mode === 'single' ? 'week' : 'single';
        run(() => {
          setMode(nextMode);
          if (nextMode === 'week') setSelectedDay(getTodayWeekday());
        });
      }

      function handleSelectDay(day: WeekDay): void {
        if (day === selectedDay) return;
        run(() => setSelectedDay(day));
      }

      function handleDownload(): void {
        if (mode === 'single') {
          const svgs = dialsRowRef.current?.querySelectorAll('svg');
          if (!svgs || svgs.length < 2) return;
          downloadDialsSnapshot(Array.from(svgs), [DAYTIME_LABEL, NIGHTTIME_LABEL]);
          return;
        }

        const rows = WEEKDAYS.map((day) => {
          const container = weekExportRefs.current[day];
          const svgs = container?.querySelectorAll('svg');
          return {
            heading: WEEKDAY_FULL_LABELS[day].toUpperCase(),
            svgs: svgs ? Array.from(svgs) : [],
            dialLabels: [DAYTIME_LABEL, NIGHTTIME_LABEL],
          };
        }).filter((row) => row.svgs.length === 2);

        downloadWeekSnapshot(rows);
      }

      const clearConfirmMessage =
        mode === 'single' ? 'Clear all tasks?' : `Clear ${WEEKDAY_FULL_LABELS[selectedDay]}'s tasks?`;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <CurrentTimeToggle
            isOn={isCurrentTimeOn}
            onToggle={() => setIsCurrentTimeOn((prev) => !prev)}
          />
          <ModeToggle mode={mode} onToggle={handleToggleMode} />

          {mode === 'week' && (
            <WeekDaySelector
              selectedDay={selectedDay}
              todayDay={getTodayWeekday()}
              onSelect={handleSelectDay}
            />
          )}

          <div
            ref={dialsRowRef}
            data-testid="dials-row"
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: isMobile ? 24 : 40,
              justifyContent: 'center',
              opacity: isFaded ? 0 : 1,
              transition: 'opacity 160ms ease',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <ClockDial
                dial="daytime"
                segments={daytimeSegments}
                onSegmentClick={handleSegmentClick}
                onCreateSegment={handleCreateSegment}
                pendingRange={daytimePendingRange}
                currentHour={currentHour}
              />
              <span style={{ fontSize: 20 }}>{DAYTIME_LABEL}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <ClockDial
                dial="nighttime"
                segments={nighttimeSegments}
                onSegmentClick={handleSegmentClick}
                onCreateSegment={handleCreateSegment}
                pendingRange={nighttimePendingRange}
                currentHour={currentHour}
              />
              <span style={{ fontSize: 20 }}>{NIGHTTIME_LABEL}</span>
            </div>
          </div>

          {mode === 'week' && (
            <div style={{ position: 'fixed', left: -10000, top: -10000 }} aria-hidden="true">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  ref={(el) => {
                    weekExportRefs.current[day] = el;
                  }}
                >
                  <ClockDial
                    dial="daytime"
                    segments={filterDaytime(week.byDay[day])}
                    onSegmentClick={noopSegmentClick}
                    onCreateSegment={noopCreateSegment}
                    currentHour={currentHour}
                  />
                  <ClockDial
                    dial="nighttime"
                    segments={filterNighttime(week.byDay[day])}
                    onSegmentClick={noopSegmentClick}
                    onCreateSegment={noopCreateSegment}
                    currentHour={currentHour}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={handleDownload}>
              Download image
            </button>
            <button type="button" onClick={() => setIsTaskListOpen(true)}>
              View all tasks
            </button>
            <button type="button" onClick={handleClear}>
              Clear
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>
            {mode === 'single'
              ? 'Download & View all tasks act on this single day.'
              : 'Download & View all tasks aggregate all 7 days. Clear only wipes the selected day.'}
          </p>

          <TodoList
            todos={todos}
            onAdd={addTodo}
            onDelete={deleteTodo}
            onToggleStar={toggleStar}
            onToggleDone={toggleDone}
            onMoveUp={moveTodoUp}
            onClearAll={clearTodos}
          />

          {isTaskListOpen && mode === 'single' && (
            <TaskListModal segments={singleDay.segments} onClose={() => setIsTaskListOpen(false)} />
          )}
          {isTaskListOpen && mode === 'week' && (
            <WeekTaskListModal segmentsByDay={week.byDay} onClose={() => setIsTaskListOpen(false)} />
          )}

          {isClearConfirmOpen && (
            <ConfirmModal
              message={clearConfirmMessage}
              confirmLabel="Clear"
              onConfirm={() => {
                clearActiveSegments();
                setIsClearConfirmOpen(false);
              }}
              onCancel={() => setIsClearConfirmOpen(false)}
            />
          )}

          {pendingCreate && (
            <SegmentPopup
              key={`${pendingCreate.startHour}-${pendingCreate.endHour}`}
              x={pendingCreate.anchor.x}
              y={pendingCreate.anchor.y}
              onSubmit={(label) => {
                addActiveSegment(pendingCreate.startHour, pendingCreate.endHour, label);
                setPendingCreate(null);
              }}
              onCancel={() => setPendingCreate(null)}
            />
          )}

          {pendingEdit && (
            <SegmentPopup
              key={pendingEdit.segment.id}
              x={pendingEdit.anchor.x}
              y={pendingEdit.anchor.y}
              initialLabel={pendingEdit.segment.label}
              onSubmit={(label) => {
                updateActiveSegment(pendingEdit.segment.id, label);
                setPendingEdit(null);
              }}
              onDelete={() => {
                deleteActiveSegment(pendingEdit.segment.id);
                setPendingEdit(null);
              }}
              onCancel={() => setPendingEdit(null)}
            />
          )}
        </div>
      );
    }
    ```

  - [ ] Update `docs/designs/week-planning-mode/behavior-locks.md`: replace each lock's `**Test pointer:** TBD during implementation...` line with the actual test name and file, e.g. Lock 1 → `src/clock/useSegments.test.ts` ("accepts a custom storage key..." and "a custom storage key never touches the default single-day key") plus `src/clock/DayPlanner.test.tsx` ("Clear in week mode only clears the selected weekday..."); Lock 2 → `src/clock/useWeekSegments.test.ts`; Lock 3 → `src/clock/DayPlanner.test.tsx` ("switching modes does not affect the shared to-do list"); Lock 4 → `src/clock/DayPlanner.test.tsx` ("renders the current-time toggle button, on by default..." and "defaults to Day mode..."); Lock 5 → `src/clock/DayPlanner.test.tsx` ("switching to Week mode shows the weekday selector defaulting to today"); Lock 6 → `src/clock/DayPlanner.test.tsx` ("Clear in week mode only clears the selected weekday...").
  - [ ] Stage the changes: `git add src/clock/DayPlanner.tsx src/clock/DayPlanner.test.tsx docs/designs/week-planning-mode/behavior-locks.md`
- **Verify:** `npx vitest run src/clock/DayPlanner.test.tsx` → all tests (existing, updated, and new) PASS.

---

## Step 10: Full validation and wrap-up

- **Scope:** `docs/designs/week-planning-mode/session-state.md`, `docs/designs/week-planning-mode/progress.md` (create)
- **Do:**
  - [ ] Run the full verification gate: `./scripts/validate.sh` (type check, lint, full test suite, build). Fix any failures surfaced by running all files together (e.g. lint rules not caught per-file) before proceeding.
  - [ ] Create `docs/designs/week-planning-mode/progress.md` with a dated entry summarizing what was built and the `scripts/validate.sh` result (PASS/FAIL), following the template at `docs/designs/_template/progress.md`.
  - [ ] Update `docs/designs/week-planning-mode/session-state.md`: mark implementation complete, note the `scripts/validate.sh` result, and set "Next action" to "Awaiting user review of the staged diff before committing."
  - [ ] Stage the changes: `git add docs/designs/week-planning-mode/session-state.md docs/designs/week-planning-mode/progress.md`
  - [ ] **Stop.** Do not run `git commit`. Show the user the full `scripts/validate.sh` output and let them review the complete staged diff (`git status`) before they give explicit go-ahead to commit.
- **Verify:** `./scripts/validate.sh` exits 0 with "=== All checks passed ===" as its last line.
