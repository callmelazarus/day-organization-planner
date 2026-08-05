# Behavior Locks: circular-clock-mvp

Invariants that must hold once this design is implemented. A behavior lock
is broken if any future change makes its proof condition false.

## Lock 1: Morning dial hour mapping

- **Invariant:** On the Morning dial, 6am renders at the bottom (180°) and
  12pm renders at the top (0°/360°), with 7–11am positioned at the standard
  30°/hour clock positions between them (up through 9am at the left/270°).
  The right half of the dial (where 1–5 would sit on a normal clock) renders
  no ticks, labels, or segments.
- **Proof condition:** `angleToHour` for the Morning dial maps 180°→6,
  210°→7, 270°→9, 360°/0°→12; angles between 0° and 180° (exclusive) have no
  valid hour and must not produce a segment.
- **Test pointer:** `src/clock/geometry.test.ts` (Morning dial mapping cases)

## Lock 2: Evening dial hour mapping

- **Invariant:** On the Evening dial, 12pm renders at the top (0°/360°) and
  the full circle is used at standard 30°/hour spacing, ending back at
  12am/top.
- **Proof condition:** `angleToHour` for the Evening dial maps every 30°
  increment to the correct hour, 0°→12(pm), 180°→6(pm); the exact seam angle
  (0°, equivalently 360°) is an inherent single-point ambiguity for any
  full-circle 12-hour dial — the same ambiguity a real analog clock has at
  12 (start of the cycle or end of it?) — and `angleToHour` resolves it to
  12(pm), not 24(am). This is acceptable because `angleToHour` is never
  called with this literal input from a real pointer interaction:
  `ClockDial`'s `pointerAngle` always normalizes its output into `[0, 360)`
  before calling `angleToHour`, so the exact value `360` is unreachable
  through drag, and `0` legitimately means noon (the start of the dial).
  `hourToAngle` (the forward direction, used for rendering) has no such
  ambiguity: hour 24 always renders at angle 360 unambiguously.
- **Test pointer:** `src/clock/geometry.test.ts` (Evening dial mapping
  cases, including an explicit assertion that the seam resolves to 12)

## Lock 3: Overlap resolution is render-order, not special-cased

- **Invariant:** When segments overlap in time, the one created or edited
  most recently must render on top and receive clicks on the shared hours.
  This must be achieved purely through DOM/array order (later segment =
  later in the array = later in the DOM), not through explicit z-index or
  hit-test override logic.
- **Proof condition:** Given two overlapping segments A (older) and B
  (newer), B appears after A in the `segments` array, and a click on their
  shared hour range resolves to B.
- **Test pointer:** `src/clock/useSegments.test.ts` (overlap ordering case)

## Lock 4: Segments persist across reload

- **Invariant:** The full `segments` array survives a page reload via
  `localStorage` — no segment is silently lost on refresh.
- **Proof condition:** After creating/editing/deleting segments, a
  simulated reload (re-mounting `useSegments`) reproduces the exact same
  array.
- **Test pointer:** `src/clock/useSegments.test.ts` (persistence case)
