# Behavior Locks: week-planning-mode

Invariants that must hold once this design is implemented. A behavior lock
is broken if any future change makes its proof condition false.

## Lock 1: Single-day mode's data is isolated from week mode

- **Invariant:** Adding, editing, or deleting segments in week mode (any
  weekday bucket) never reads or writes single-day mode's existing
  storage key (`circular-clock-mvp:segments`), and vice versa.
- **Proof condition:** A test that performs week-mode segment mutations
  and asserts the single-day storage key's contents are unchanged, and a
  test that performs single-day mutations and asserts no weekday bucket
  key changes.
- **Test pointer:** `src/clock/useSegments.test.ts` ("accepts a custom
  storage key so multiple independent instances can coexist" and "a custom
  storage key never touches the default single-day key") and
  `src/clock/DayPlanner.test.tsx` ("Clear in week mode only clears the
  selected weekday, leaving single-day mode and other weekdays untouched").

## Lock 2: Each weekday bucket is independent

- **Invariant:** Editing one weekday's segments (e.g. Monday) never
  mutates another weekday's stored segments (e.g. Tuesday).
- **Proof condition:** A test that writes segments to one weekday's
  storage key and asserts every other weekday's key is untouched.
- **Test pointer:** `src/clock/useWeekSegments.test.ts`.

## Lock 3: To-do list is shared and untouched by mode/day switching

- **Invariant:** Switching between Day/Week mode, or between weekdays
  within week mode, never reads from or writes to the to-do list's
  storage key or state.
- **Proof condition:** A test that switches modes/days repeatedly and
  asserts the to-do list's storage key and rendered contents never
  change as a result.
- **Test pointer:** `src/clock/DayPlanner.test.tsx` ("switching modes does
  not affect the shared to-do list").

## Lock 4: Fresh page load always starts in Day mode with the time indicator on

- **Invariant:** On every fresh page load, regardless of any prior
  session's state, the app initializes with mode = Day and the
  current-time indicator toggle = on. Neither value is read from
  persisted storage.
- **Proof condition:** A test that mounts the app fresh and asserts the
  initial mode is `'single'` and `isCurrentTimeOn` is `true`.
- **Test pointer:** `src/clock/DayPlanner.test.tsx` ("renders the
  current-time toggle button, on by default with a current-time line
  shown" and "defaults to Day mode with no weekday selector shown").

## Lock 5: Entering week mode always defaults to today's weekday

- **Invariant:** Whenever week mode is entered (from a fresh load or by
  toggling from Day mode), the selected weekday defaults to today's
  weekday — never a previously-selected or persisted weekday.
- **Proof condition:** A test that mocks the current date to a known
  weekday, switches into week mode, and asserts the selected day matches
  that weekday.
- **Test pointer:** `src/clock/DayPlanner.test.tsx` ("switching to Week
  mode shows the weekday selector defaulting to today").

## Lock 6: Clear stays scoped to the selected day in week mode

- **Invariant:** Clicking "Clear" while in week mode only removes the
  currently selected weekday's segments — it never removes segments from
  any other weekday.
- **Proof condition:** A test that populates multiple weekdays with
  segments, clears while one weekday is selected, and asserts only that
  weekday's segments were removed.
- **Test pointer:** `src/clock/DayPlanner.test.tsx` ("Clear in week mode
  only clears the selected weekday, leaving single-day mode and other
  weekdays untouched").
