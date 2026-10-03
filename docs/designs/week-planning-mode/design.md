# Design: week-planning-mode

## Problem

The app currently supports planning only a single day: one set of segments,
shown on the Day/Night dials, stored under one localStorage key. There's no
way to plan out a whole week at once — which is how the user actually wants
to use the app on, e.g., a Friday, to lay out the upcoming weekend (and the
rest of the week) in one sitting. Today that would mean overwriting the
single day's plan repeatedly, losing each day's plan as you move to the next.

## Solution shape

Add a second top-level mode, toggled by a switch, alongside the existing
single-day mode. The two modes share the same visual language (Day/Night
dials, toolbar, to-do list) but differ in which data feeds the dials and in
the scope of a couple of toolbar actions.

- **Mode switch** ("Day" / "Week"): a pill switch, fixed to the top-left of
  the viewport, stacked directly below the existing current-time toggle
  button (🕐) so the two don't collide. Always initializes to **Day** mode
  on page load — mode is not persisted across reloads.
- **Week day selector**: a row of 7 buttons (Sun–Sat), shown above the
  clock dials only in week mode. Clicking a day swaps the dials to that
  day's segments. The selected day is visually highlighted (distinct from
  the rest) and always defaults to today's weekday whenever week mode is
  entered.
- **Per-weekday storage**: each weekday is a *recurring template* — one
  bucket per weekday name (Sun...Sat) that persists indefinitely and gets
  overwritten the next time that weekday is planned, rather than being tied
  to a specific calendar date. Single-day mode's existing storage and
  behavior are untouched. `useSegments` is generalized to take a storage
  key so both single-day mode and each weekday bucket reuse the same
  hook/logic instead of duplicating it.
- **To-do list**: entirely unaffected by mode or day — same shared list,
  same storage key, in both modes.
- **Toolbar scope**: "Download image" and "View all tasks" aggregate across
  all 7 days in week mode (stacked image export, one section per day; task
  list grouped under weekday headings). "Clear" stays scoped to only the
  currently selected day, even in week mode, to avoid an easy way to wipe
  the whole week by accident.
- **Current-time indicator default**: while touching page-load defaults,
  the existing current-time toggle (previously defaulting off) now
  defaults to **on** every time the page loads.
- **Transitions**: a soft CSS opacity crossfade (~150–180ms fade out, then
  in) on the dial content for both mode switches (Day ⇄ Week) and
  day-to-day switches within week mode. Plain CSS, no animation library.

A static HTML mockup (`mockup.html` in this directory) was used to iterate
on the toggle placement, day-row layout, and crossfade feel before writing
this doc.

## Non-goals

- No calendar-date-specific weekly plans — weekday buckets are recurring
  templates, not tied to a specific week's date.
- No multi-week history, retention, or archiving of past weekday plans.
- No change to single-day mode's existing storage key or behavior.
- No change to the to-do list's behavior, storage, or shared-ness across
  modes.
- No new animation dependency — CSS transitions only.

## Open questions

None outstanding — all resolved during brainstorming (see
`research.md` → Resolved questions).
