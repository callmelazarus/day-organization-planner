# Plan: pomodoro-timer

Ordered implementation steps. Each step declares its file scope up front —
the agent should not touch files outside that scope without stopping to ask.

## Step 1: `usePomodoroTimer` hook

- **Scope:** `src/clock/usePomodoroTimer.ts`, `src/clock/usePomodoroTimer.test.ts`
- **Do:** Implement `usePomodoroTimer()` returning
  `{ remainingSeconds, isRunning, isComplete, start, pause, reset }`.
  `remainingSeconds` starts at `1200` (20 min). `start()` sets
  `isRunning: true` (resetting first to 1200 if `remainingSeconds === 0`);
  a `useEffect` ticks `remainingSeconds` down by 1 every 1000ms via
  `setInterval` while `isRunning`, clearing the interval on pause/unmount.
  When the tick would take `remainingSeconds` to 0, set `isRunning: false`
  and `isComplete: true`. `pause()` sets `isRunning: false` (interval
  cleared by the effect's cleanup). `reset()` sets `remainingSeconds: 1200`,
  `isRunning: false`, `isComplete: false`.
- **Verify:** Write tests first (TDD) using `vi.useFakeTimers()`: starts at
  1200; `start()` counts down one tick per second; `pause()` stops the
  countdown; `reset()` returns to 1200 and clears `isRunning`/`isComplete`;
  reaching 0 sets `isRunning: false` and `isComplete: true` and the interval
  stops advancing further (no negative values); calling `start()` again
  after completion resets to 1200 first. Run via `npm run test` /
  `scripts/validate.sh`.

## Step 2: `PomodoroTimer` component

- **Scope:** `src/clock/PomodoroTimer.tsx`, `src/clock/PomodoroTimer.test.tsx`
- **Do:** Render the `usePomodoroTimer()` state as `MM:SS` (zero-padded,
  e.g. `20:00`, `05:09`) at `font-size: 3.2em` (matching the app's `<h1>`),
  with Start/Pause/Reset buttons below it. Show "Start" when not running
  and "Pause" when running (single toggle button is fine), plus a separate
  Reset button. Apply a red text color when `isComplete`. On first Start
  click, if `window.Notification` exists and `Notification.permission ===
  'default'`, call `Notification.requestPermission()`. When the countdown
  transitions to `isComplete`, fire `new Notification(...)` only if
  `Notification.permission === 'granted'` (guard all `Notification` access
  behind `typeof Notification !== 'undefined'` so it degrades gracefully
  and is testable in jsdom).
- **Verify:** Component tests (TDD, written first) using
  `vi.useFakeTimers()` covering: renders `20:00` initially; clicking
  Start/Pause toggles the countdown (advance fake timers, assert display
  updates); Reset returns display to `20:00`; display turns red
  (inline style assertion) once countdown completes; a mocked
  `Notification` global is invoked on completion when permission is
  `'granted'`, and not invoked when permission is `'denied'`. Run via
  `npm run test`.

## Step 3: Wire into `App`

- **Scope:** `src/App.tsx`
- **Do:** Render `<PomodoroTimer />` in `App.tsx` alongside `<DayPlanner
  />`. `PomodoroTimer` owns its own `position: fixed; top; right;` inline
  style (matching this codebase's inline-style convention used throughout
  `src/clock/`), independent of the centered `.app` flow — no `App.css`
  change needed.
- **Verify:** Existing tests still pass. Run full `scripts/validate.sh`,
  then manually run the app and exercise Start/Pause/Reset and letting it
  reach 0:00 (fast-forwardable only via the unit tests — manual check
  confirms placement/visual only, not the full 20-minute wait).
