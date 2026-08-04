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
- **Test pointer:** `src/geometry.test.ts` (Morning dial mapping cases)

## Lock 2: Evening dial hour mapping

- **Invariant:** On the Evening dial, 12pm renders at the top (0°/360°) and
  the full circle is used at standard 30°/hour spacing, ending back at
  12am/top.
- **Proof condition:** `angleToHour` for the Evening dial maps every 30°
  increment to the correct hour, 0°→12(pm), 180°→6(pm), 360°→12(am), with
  no unused arc.
- **Test pointer:** `src/geometry.test.ts` (Evening dial mapping cases)

## Lock 3: Overlap resolution is render-order, not special-cased

- **Invariant:** When segments overlap in time, the one created or edited
  most recently must render on top and receive clicks on the shared hours.
  This must be achieved purely through DOM/array order (later segment =
  later in the array = later in the DOM), not through explicit z-index or
  hit-test override logic.
- **Proof condition:** Given two overlapping segments A (older) and B
  (newer), B appears after A in the `segments` array, and a click on their
  shared hour range resolves to B.
- **Test pointer:** `src/useSegments.test.ts` (overlap ordering case)

## Lock 4: Segments persist across reload

- **Invariant:** The full `segments` array survives a page reload via
  `localStorage` — no segment is silently lost on refresh.
- **Proof condition:** After creating/editing/deleting segments, a
  simulated reload (re-mounting `useSegments`) reproduces the exact same
  array.
- **Test pointer:** `src/useSegments.test.ts` (persistence case)
