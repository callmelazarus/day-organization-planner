# Design: drag-preview

## Problem

Dragging on a `ClockDial` to create a segment gives no visual feedback until
release — the user can't see what hour range they're about to create, and
only finds out after the `SegmentPopup` opens. This makes it hard to line up
a drag with the intended hours (e.g. exactly 1pm–2pm).

## Solution shape

`ClockDial` already tracks `dragStartHour`/`dragCurrentHour` in state while a
pointer drag is in progress, both rounded to the nearest whole hour by
`hourFromPointer`. Add a derived preview, rendered only while
`endHour > startHour` (the same guard already used to decide whether to fire
`onCreateSegment` on release, so a plain click with no movement shows
nothing):

- A dashed, neutral (gray/blue, semi-transparent) arc spanning
  `[startHour, endHour]`, built with the existing `buildArcPath`/
  `hourToAngle` helpers and reusing the `isFullCircle` branch already used
  for the background wedge, so a full-circle drag on the evening dial
  doesn't degenerate to an invisible path.
- A `<text>` label centered radially over the arc's angular midpoint,
  showing the range (e.g. "1pm – 2pm"), built from the existing `hourLabel`
  helper with an am/pm suffix appended (the floating label has no
  surrounding dial context to disambiguate on its own, unlike the tick
  labels).

Both are purely local, derived-from-existing-state additions to
`ClockDial` — no prop changes, no changes to `useSegments`, `DayPlanner`, or
`SegmentArc`.

### Addendum: persisting the preview through the create popup

Manual verification of the above surfaced a gap: `ClockDial` clears its
drag state (and therefore the preview) the instant the pointer is
released, which is also the instant `DayPlanner` opens the label popup for
the new segment — so the one moment the user most wants to see the range
(while typing its label) is exactly when it disappears.

Fix, scoped to the create flow only (editing an existing segment already
shows its bounds via that segment's own saved-color arc, so no change
there): `ClockDialProps` gains an optional `pendingRange: { startHour:
number; endHour: number } | null` prop, controlled by `DayPlanner` from its
existing `pendingCreate` state (routed to whichever dial the range belongs
to, using the same `startHour < 12` convention `DayPlanner` already uses to
split segments between dials). `ClockDial` renders the live drag preview
when a drag is in progress; once the drag ends, if `pendingRange` is set it
renders the same dashed/semi-transparent wedge and label for that fixed
range instead — unchanged in appearance, just no longer tied to transient
drag state. It clears the moment `DayPlanner` clears `pendingCreate`
(submit, cancel, or the popup unmounting), which already happens today.

## Non-goals

- Changing the drag-to-hour rounding/snapping behavior itself — it already
  snaps to whole hours; this design only makes that snapping visible during
  the drag.
- Any change to the post-release `SegmentPopup` flow beyond keeping the
  create-range preview visible while it's open (see addendum above) —
  no change to the edit-popup flow, no new popup content or controls.
- Sub-hour precision or a finer-grained drag mode.

## Open questions

None outstanding — resolved during brainstorming (see `research.md`).
