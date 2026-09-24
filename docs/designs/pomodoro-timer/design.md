# Design: pomodoro-timer

## Problem

There's no way to time-box focused work while planning a day. A simple,
always-visible 20-minute countdown gives the user a lightweight pomodoro-style
timer without leaving the page.

## Solution shape

- `usePomodoroTimer` hook owns the countdown state (`remainingSeconds`,
  `isRunning`, `isComplete`) and exposes `start`/`pause`/`reset`. It drives
  the countdown with `setInterval` while running and stops itself at 0.
- `PomodoroTimer` component renders the `MM:SS` display (same font size as
  the "Day Planner" `<h1>`, 3.2em) plus Start/Pause/Reset buttons, and turns
  the display red when the countdown completes.
- `PomodoroTimer` is rendered from `App.tsx`, fixed-positioned top-right of
  the page — it's page-level chrome, not part of `DayPlanner`.
- On completion, a browser `Notification` fires if permission was granted
  (requested lazily on first Start click); the red visual state always
  applies regardless of notification support/permission.

## Non-goals

- No persistence across reload — refreshing resets to 20:00.
- No configurable duration — hardcoded 20 minutes.
- No sound/audio alert.
- No multiple/concurrent timers.

## Open questions

None — resolved during brainstorming (see `research.md`).
