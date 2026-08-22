# Behavior Locks: pm-dial-stop-at-11pm

Invariants that must hold once this design is implemented. A behavior lock
is broken if any future change makes its proof condition false.

## Supersedes: `circular-clock-mvp` Lock 2

`circular-clock-mvp/behavior-locks.md` Lock 2 ("Evening dial hour
mapping") asserted the Evening dial uses the full 360° circle, 12pm
through 12am. This design intentionally breaks that invariant — the
Evening dial now stops at 11pm. Lock 2 there should be read as superseded
by Lock 1 below.

## Lock 1: Evening dial stops at 11pm

- **Invariant:** The Evening dial's last selectable/renderable tick is
  hour 23 (11pm). No tick, drag-created segment, or background wedge
  extends into the 23–24 (11pm–12am) range for new interactions.
- **Proof condition:** `EVENING_HOURS` in `ClockDial.tsx` ends at `23`,
  and `angleToHour('evening', angle)` returns `null` for any angle in
  (330°, 360°) — the sliver corresponding to the removed 23–24 hour.
- **Test pointer:** `src/clock/geometry.test.ts` (evening dead-zone
  case), `src/clock/ClockDial.test.tsx` (evening dial tick labels /
  background shape).

## Lock 2: Evening dial background renders as a partial arc, not a circle

- **Invariant:** With the used range now 330° (not 360°), the Evening
  dial's background wedge renders as a `<path>` arc, the same shape the
  Morning dial already uses — not the full stroked `<circle>` it used
  before this change.
- **Proof condition:** `isFullCircle` in `ClockDial.tsx` is computed from
  `usedEndAngle - usedStartAngle`, which is now `330` for the Evening
  dial, so the existing `isFullCircle` branch naturally selects the path
  render with no new conditional logic.
- **Test pointer:** `src/clock/ClockDial.test.tsx` (dial-background
  shape assertion, updated for the evening dial).

## Lock 3: Pre-existing segments past 11pm still render

- **Invariant:** A segment already persisted with `endHour: 24` (created
  before this change) continues to render correctly after this change —
  no data loss or visual corruption, even though it can no longer be
  created or edited to that range going forward.
- **Proof condition:** `SegmentArc` computes its arc purely from the
  segment's own `startHour`/`endHour` via `hourToAngle`, which is
  unrestricted and unchanged by this design — it never consults
  `EVENING_HOURS` or the dial's tick range.
- **Test pointer:** Structural — `hourToAngle`'s forward mapping is
  untouched; covered by existing `geometry.test.ts` cases for hour 24.
