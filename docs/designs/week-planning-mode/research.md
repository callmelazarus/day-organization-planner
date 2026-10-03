# Research: week-planning-mode

## Prior art

No external libraries or patterns were pulled in. Reviewed the existing
codebase for conventions to follow:

- `useSegments.ts` / `useTodos.ts` — flat-array-in-localStorage hook
  pattern, one storage key each, JSON-serialized.
- `DayPlanner.tsx` — current single-mode layout: centered column, Day/Night
  dials side by side, toolbar below, `TodoList` below that.
- `CurrentTimeToggle.tsx` — existing fixed-position circular toggle at
  `top:16, left:16`, which the new mode switch needs to sit near without
  colliding.
- `ClockDial.tsx` / `dialColor.ts` — Day/Night dial split at hour 18,
  accent colors (`#f5b942` day, `#6c63ff` night) on a dark theme
  (`#242424` background, `#2e2e2e` dial base).
- A throwaway static HTML mockup (`mockup.html`, this directory) was built
  to iterate on toggle placement and transition feel without touching real
  code — approximated dial segments with CSS conic-gradients rather than
  the real SVG geometry, since the goal was layout/interaction, not visual
  fidelity.

## Alternatives considered

- **Calendar-date-tied weekly plans** (each specific date gets its own
  stored plan) — rejected in favor of a recurring weekday template model:
  simpler storage (no cleanup/retention strategy needed), and matches the
  user's actual workflow (habitually planning "the weekend," not a
  specific calendar week).
- **Single 24h dial per day in week mode** — rejected in favor of keeping
  the existing Day/Night dial split, for visual consistency between modes
  and to avoid building a second dial variant.
- **Toolbar scoped to the selected day only in week mode** — rejected;
  user wants Download and View all tasks to aggregate across the whole
  week (stacked image export, weekday-grouped task list). Clear remains
  scoped to the selected day only, as the safer default for a destructive
  action.
- **Persisting last-used mode and last-selected weekday across reloads** —
  initially proposed, then rejected: the user wants every page load to
  always start in Day mode with the current-time indicator on, regardless
  of what was last used. Dropping this persistence also simplifies the
  design — no `mode` or `selectedDay` storage keys are needed; week mode
  always defaults its day selector to today's weekday when entered.

## Resolved questions

- *Recurring weekday template vs. calendar-date-tied plans?* → Recurring
  weekday template.
- *Keep Day/Night dial split in week mode, or one 24h dial per day?* →
  Keep the Day/Night split.
- *Toolbar scope in week mode?* → Download and View all tasks aggregate
  across all 7 days; Clear stays scoped to the selected day only.
- *Mode switch placement?* → Fixed top-left of the viewport, stacked
  directly below the existing current-time toggle button.
- *Switch labels?* → "Day" / "Week".
- *Page-load defaults?* → Always Day mode; current-time indicator now
  defaults on (changed from its previous default of off). Neither mode
  nor the week mode's selected day persist across reloads — week mode
  always defaults its day selector to today's weekday when entered.
- *Animation style?* → CSS opacity crossfade (~150–180ms), no library.
