# Behavior Locks: drag-preview

Invariants that must hold once this design is implemented. A behavior lock
is broken if any future change makes its proof condition false.

## Lock 1: Preview arc edges always land exactly on an hour tick

- **Invariant:** The preview arc's start and end angles must always equal
  `hourToAngle(dial, hour)` for some whole hour in the dial's hour set —
  never a fractional angle.
- **Proof condition:** The preview is built only from `dragStartHour`/
  `dragCurrentHour`, both of which are produced by `hourFromPointer`'s
  `Math.round(hour)`. As long as the preview never uses the raw
  (unrounded) pointer angle, this holds by construction.
- **Test pointer:** Manual verification (pointer drag isn't testable in
  jsdom) — see Task verification step in `plan.md`.

## Lock 2: No preview flashes on a plain click

- **Invariant:** A pointer down+up with no movement (`dragCurrentHour ===
  dragStartHour`) must render no preview arc and no label.
- **Proof condition:** Preview rendering is gated on `endHour > startHour`,
  the same condition already guarding the `onCreateSegment` call on
  release.
- **Test pointer:** Manual verification.

## Lock 3: Full-circle evening-dial drag doesn't degenerate

- **Invariant:** A drag spanning the full evening dial (12pm–12am) must
  render as a visible stroked circle preview, not an invisible
  zero-length path.
- **Proof condition:** Preview rendering reuses the existing `isFullCircle`
  branch already used for the background wedge and `SegmentArc`.
- **Test pointer:** Manual verification; mirrors the existing coverage
  pattern for `isFullCircle` in `src/clock/ClockDial.test.tsx`.

## Lock 4: Create-range preview persists through the label popup

- **Invariant:** After releasing a valid drag (which opens the create
  popup), the wedge and label for that exact range must stay visible for
  as long as the popup is open, and disappear only when `DayPlanner`
  clears `pendingCreate` (submit, cancel, or delete) — never at the moment
  of release itself.
- **Proof condition:** `ClockDial` falls back to rendering
  `computeDragPreview` for its `pendingRange` prop whenever no live drag is
  in progress; `DayPlanner` only clears `pendingRange` (by clearing
  `pendingCreate`) on popup submit/cancel, not on pointer-up.
- **Test pointer:** Manual verification — see `plan.md` Task 5.
