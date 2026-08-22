# Design: task-list-modal

## Problem

The day's segments are only visible on the two circular dials (AM/PM),
split across two separate diagrams. There's no single place to see the
whole day's plan at a glance, in order, without visually scanning both
clocks and mentally merging them.

## Solution shape

A new `TaskListModal` component, opened by a button rendered at the bottom
of `DayPlanner`, below both dials.

- `DayPlanner` gains `isTaskListOpen` state (same pattern as
  `pendingCreate`/`pendingEdit`), toggled by the new button.
- `TaskListModal` receives the full merged `segments` array (both dials
  combined — `DayPlanner` already splits them by dial elsewhere, but this
  view needs the merged whole) and an `onClose` callback.
- Internally, it sorts a copy of `segments` by `startHour` ascending and
  renders a two-column table: **Time** (via the existing
  `formatHourRangeLabel(startHour, endHour)`) and **Task** (`label`).
- If `segments` is empty, it renders a simple message ("No tasks planned
  yet") instead of the table.
- Rendered as a backdrop + centered card overlay, styled consistently with
  the existing grey-card look (`SegmentPopup`'s `#d9d9d9` background,
  rounded corners, box-shadow).
- Closing: an explicit close button, clicking the backdrop, or pressing
  Escape — all call the same `onClose`.
- Read-only: no click behavior on rows. To edit or delete a segment, the
  user closes the modal and uses the existing dial-click flow.

## Non-goals

- No interactivity on list rows (no click-to-edit, no inline delete).
- No new sorting/filtering options — always chronological, always the full
  day.
- No changes to `Segment`, `useSegments`, `ClockDial`, or `SegmentPopup`.

## Open questions

None outstanding — resolved during brainstorming (see `research.md`).
