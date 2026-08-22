# Behavior Locks: task-list-modal

Invariants that must hold once this design is implemented. A behavior lock
is broken if any future change makes its proof condition false.

## Lock 1: List is always in chronological order

- **Invariant:** Rows in the modal are always ordered by `startHour`
  ascending, regardless of which dial (morning/evening) a segment belongs
  to or the order segments were created in.
- **Proof condition:** The modal sorts a copy of the merged segments array
  by `startHour` before rendering — it never renders `segments` in
  incoming order.
- **Test pointer:** `src/clock/TaskListModal.test.tsx` — assert row order
  given segments passed in non-chronological / cross-dial order.

## Lock 2: Empty day shows a message, never an empty table

- **Invariant:** When there are zero segments across both dials, the modal
  renders the empty-state message and no `<table>` element.
- **Proof condition:** Rendering branches on `segments.length === 0` before
  the table.
- **Test pointer:** `src/clock/TaskListModal.test.tsx` — render with
  `segments={[]}` and assert the message is present and no table role
  exists.

## Lock 3: Modal never mutates segment data

- **Invariant:** Opening, viewing, or closing the modal never calls
  `addSegment`/`updateSegment`/`deleteSegment` — it is purely a read view
  over whatever `segments` it's given.
- **Proof condition:** `TaskListModal`'s props are `segments` and
  `onClose` only — no mutation callbacks are passed in or invoked.
- **Test pointer:** Structural — enforced by `TaskListModalProps` type
  signature in `src/clock/TaskListModal.tsx`.
