# Research: pomodoro-timer

## Prior art

`useTodos`/`useSegments` establish this repo's hook pattern (local state +
`useEffect`, plain functions returned in an object) — `usePomodoroTimer`
follows the same shape, using `setInterval`/`clearInterval` instead of
`localStorage`.

## Alternatives considered

- **Persist countdown to localStorage** (like todos/segments) — rejected;
  user explicitly wants a plain reset-on-reload kitchen-timer feel.
- **Configurable duration** — rejected as unnecessary scope; hardcoded 20
  minutes matches the ask.
- **Audio alert on completion** — rejected; user chose browser notification
  instead, and this app has no existing audio.

## Resolved questions

- Controls: Start / Pause / Reset (decided with user).
- On completion: browser notification (permission requested on first
  Start) plus a visual (red) change; visual always applies even without
  notification permission.
- Persistence: none — resets to 20:00 on reload.
