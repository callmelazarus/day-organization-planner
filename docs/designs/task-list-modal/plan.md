# Plan: task-list-modal

Ordered implementation steps. Each step declares its file scope up front —
the agent should not touch files outside that scope without stopping to ask.

## Step 1: Build `TaskListModal`

- **Scope:** `src/clock/TaskListModal.tsx`, `src/clock/TaskListModal.test.tsx`
- **Do:** New component taking `segments: Segment[]` and `onClose: () =>
  void`. Renders a fixed backdrop + centered grey card (styled like
  `SegmentPopup`). Sorts a copy of `segments` by `startHour` ascending. If
  empty, renders a "No tasks planned yet" message; otherwise a `<table>`
  with **Time** (`formatHourRangeLabel(startHour, endHour)`) and **Task**
  (`label`) columns. Closes via a close button, backdrop click, or
  Escape key — all call `onClose`.
- **Verify:** New tests cover: empty state message, chronological sort
  across mixed/out-of-order input, backdrop click calls `onClose`, Escape
  key calls `onClose`.

## Step 2: Wire the button and modal into `DayPlanner`

- **Scope:** `src/clock/DayPlanner.tsx`, `src/clock/DayPlanner.test.tsx`
- **Do:** Add `isTaskListOpen` state and a button below both dials (e.g.
  "View all tasks") that opens it. Render `<TaskListModal>` with the full
  merged `segments` array and `onClose` clearing the state.
- **Verify:** New test: clicking the button shows the modal with a
  segment's time/label; closing hides it. `bash scripts/validate.sh`
  passes in full (type check, lint, tests, build).
