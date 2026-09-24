# Behavior Locks: pomodoro-timer

Invariants that must hold once this design is implemented. A behavior lock
is broken if any future change makes its proof condition false.

## Lock 1: The countdown never goes negative

- **Invariant:** `remainingSeconds` is always in `[0, 1200]`; it never ticks
  below 0.
- **Proof condition:** The tick effect stops the interval and sets
  `isRunning: false` / `isComplete: true` the moment `remainingSeconds`
  would reach 0, rather than continuing to decrement.
- **Test pointer:** `src/clock/usePomodoroTimer.test.ts`

## Lock 2: Pausing stops the interval

- **Invariant:** While `isRunning` is `false`, `remainingSeconds` never
  changes on its own.
- **Proof condition:** The tick effect's cleanup clears the interval
  whenever `isRunning` becomes `false` (pause, completion, or unmount).
- **Test pointer:** `src/clock/usePomodoroTimer.test.ts`

## Lock 3: No notification without permission

- **Invariant:** `Notification` is only constructed when
  `Notification.permission === 'granted'`; the visual (red) completion
  state applies regardless of notification support or permission.
- **Proof condition:** Completion handling in `PomodoroTimer` checks
  permission before constructing a `Notification`, and the red-text style
  is driven by `isComplete` alone, not by notification success.
- **Test pointer:** `src/clock/PomodoroTimer.test.tsx`
