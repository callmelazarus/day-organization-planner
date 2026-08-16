# Research: drag-preview

## Prior art

- The existing `isFullCircle` branch in `ClockDial`'s background wedge
  (`src/clock/ClockDial.tsx`) and in `SegmentArc` — both already solved the
  "full 360° `buildArcPath` degenerates" problem for the evening dial. The
  preview arc reuses the same branch rather than re-solving it.
- `hourFromPointer`'s existing `Math.round(hour)` is what already makes
  drag-to-create snap to whole hours; the preview just visualizes state that
  was already being computed.

## Alternatives considered

**Preview color:**
- Chosen: neutral dashed outline (gray/blue, semi-transparent) — reads
  clearly as "not yet saved," distinct from committed pastel segments.
- Rejected: previewing the eventual pastel segment color — would require
  picking a color at drag-start instead of at save time, adding complexity
  for no clear benefit since the color is cosmetic and assigned randomly
  anyway.

**Label position:**
- Chosen: centered over the arc's angular midpoint, radiating out from the
  dial center — stays readable, doesn't get covered by the cursor/finger,
  and reads naturally on a circular layout.
- Rejected: label follows the pointer directly (tooltip-style) — more
  precedent from web UI generally, but doesn't suit a circular clock as well
  and would bury the label under the finger on touch devices.

## Resolved questions

- **Does the preview align exactly with the hour ticks?** Yes — confirmed
  during brainstorming. The preview arc's edges are built from the same
  rounded-to-whole-hour values (`dragStartHour`/`dragCurrentHour`) and the
  same `hourToAngle` function used to place the tick labels, so the arc
  boundary always lands exactly on a tick, never partway between two hours.
