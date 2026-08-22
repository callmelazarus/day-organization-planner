# Research: pm-dial-stop-at-11pm

## Prior art

- The Morning dial already solves "a dial that doesn't use the full
  circle": `angleToHour('morning', ...)` returns `null` for its unused
  half (angle < 180°), and `ClockDial`'s `isFullCircle` check already
  branches between a full-circle background/segment render and a partial
  arc path. This design reuses both mechanisms for the Evening dial's
  new unused sliver instead of inventing new branching logic.

## Alternatives considered

**Where to draw the boundary:**
- Chosen: hour 23 (11pm) is the last valid tick; the dead zone is the
  30° sliver from 330° to 360° (hour 23–24).
- Rejected: keep hour 24 as a selectable tick but visually shorten the
  arc — inconsistent, since `hourToAngle`/`angleToHour` are the single
  source of truth for what's selectable; hiding a tick without changing
  the underlying valid range would leave a dead click target.

**Existing persisted data extending past 11pm:**
- Chosen: leave it alone — `SegmentArc` renders any segment from its own
  stored `startHour`/`endHour`, independent of the dial's current tick
  range, so old data isn't affected and needs no migration.
- Rejected: strip or clamp old segments that extend into the removed
  range — not requested, and the user confirmed they don't expect any
  segments there anyway.

## Resolved questions

- **Does this override `circular-clock-mvp` Lock 2?** Yes — confirmed
  directly with the user. Lock 2 is amended (see `behavior-locks.md`)
  rather than silently left contradicting the code.
