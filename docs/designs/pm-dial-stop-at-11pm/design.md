# Design: pm-dial-stop-at-11pm

## Problem

The Evening dial currently spans the full 12pm–12am range as a complete
360° circle. The user doesn't plan anything in the 11pm–12am hour and
wants that sliver removed from the dial entirely, so the last hour that
can be selected is 11pm.

This directly changes a documented invariant: `circular-clock-mvp`'s
Behavior Lock 2 states the Evening dial uses "the full circle [...] ending
back at 12am/top." This design supersedes that lock (see
`behavior-locks.md`).

## Solution shape

Shrink the Evening dial's used range from `[12, 24]` to `[12, 23]`:

- `ClockDial.tsx`'s `EVENING_HOURS` drops the trailing `24` entry, leaving
  `[12, 13, ..., 23]` (12 ticks, ending at "11").
- `geometry.ts`'s `angleToHour('evening', ...)` gains a dead-zone check
  mirroring the Morning dial's existing pattern: angles in the last 30°
  sliver before the seam (330°–360°, corresponding to the unused 23–24
  hour range) return `null` instead of resolving to an hour, so a drag
  into that empty visual space can't create a segment.
- No other geometry changes. `hourToAngle` (the forward direction) is
  left as-is — it's a pure function and is simply never called with `24`
  for the evening dial anymore from `ClockDial`.

Rendering the now-partial arc falls out for free: `ClockDial`'s existing
`isFullCircle = usedEndAngle - usedStartAngle >= 360` check already
switches between a full stroked circle and a partial arc path — with the
used range now spanning 330° instead of 360°, it automatically takes the
same partial-arc branch the Morning dial already uses. No branching logic
changes.

## Non-goals

- No migration of already-persisted segments that extend into the
  11pm–12am hour (e.g. an old segment with `endHour: 24`) — they continue
  to render exactly as before, since `SegmentArc` computes its own
  per-segment angles independent of the dial's tick range. Only new
  creation/editing is bounded by the new range.
- No change to the Morning dial or to `hourToAngle`'s forward mapping.
- No change to segment data shape (`Segment.endHour` stays a plain
  number).

## Open questions

None outstanding — resolved directly with the user before this design was
written.
