# Design: circular-clock-mvp

## Problem

The app's core feature — the circular day planner clock described in the
README — doesn't exist yet. The project is currently just a scaffolded Vite +
React + TypeScript app with no application code. We need a first, focused
build of the clock itself: a single day, no multi-day support, no image
export yet.

## Solution shape

Two side-by-side SVG dials, styled like a normal analog clock:

- **Morning dial** — 6am to 12pm. Standard 30°/hour clock spacing means this
  6-hour range only occupies the bottom-left-to-top half of the circle (6 at
  bottom, 12 at top, going up through 9 on the left). The right half of the
  circle is empty — deliberately, so the dial reads as "a real clock, just
  showing fewer hours" rather than a custom remapped scale.
- **Evening dial** — 12pm to 12am. A full 12-hour range maps exactly onto a
  standard clock's 12 positions with no leftover space.

Both dials render segments the user creates by clicking and dragging on the
dial face; drag snaps to whole-hour boundaries. Releasing the drag opens a
text popup near the segment to label it. Segments are pastel-colored at
random (same hue for fill and a darker-lightness version of that hue for the
label text). Clicking an existing segment reopens the popup, pre-filled, with
a delete option.

Segments can overlap in time. The dial doesn't try to visually reconcile
overlaps with sub-lanes — the newest segment simply renders on top and wins
both visually and for click targeting on the shared hours. This falls out
for free from SVG's natural paint/hit-test order (later elements in the DOM
draw on top and receive clicks first), so no special z-order logic is
needed.

All segment data lives in a single `Segment[]` array, persisted to
`localStorage` so a page reload doesn't wipe the day.

### Components

- `DayPlanner` — top-level container; owns segment state via a `useSegments`
  hook (state + localStorage load/save); renders both dials and the popup.
- `ClockDial` — reusable, configured by props (`startHour`, `endHour`,
  `usedArcDegrees`) so one component renders both the Morning (180° used)
  and Evening (360° used) dials. Renders tick marks, the background wedge,
  its segments, and drag-to-create pointer handling.
- `SegmentArc` — renders one segment as an SVG `<path>` computed from its
  start/end hour; click opens the popup in edit mode.
- `SegmentPopup` — text-input popup for create/edit, positioned near the
  segment; shows a delete button in edit mode.
- `geometry.ts` — pure functions: `angleToHour` (pointer position → snapped
  hour, dial-aware since Morning only uses 180°), `hourToAngle`,
  `buildArcPath` (the SVG `d` string for a segment or background wedge).
- `pastelColor.ts` — generates `{ fill, textColor }` as an HSL pair (shared
  hue; fill at high lightness, text at low lightness).

### Data flow

1. On mount, `useSegments` loads persisted segments from `localStorage`
   (empty array if none exist).
2. Pointer down on a dial → convert position to angle → angle to hour →
   track drag. Pointer up with a non-zero hour span → open `SegmentPopup` in
   create mode at that position. A drag with zero span (click without
   moving) is a no-op — no popup opens.
3. Popup submit with non-empty text → generate a pastel color, append the
   new segment to the array, close the popup, persist to `localStorage`.
4. Popup cancel, or submit with empty text → discard, no segment created.
5. Click an existing `SegmentArc` → open the popup in edit mode, pre-filled.
   Submit updates that segment's label in place; delete removes it from the
   array. Either action persists to `localStorage`.

### Error handling

Entirely client-side, no network calls, so there isn't much failure surface.
The two real edge cases are: empty-label submissions (blocked at the popup,
segment not created/updated) and zero-span drags (no-op, handled in step 2
above).

### Testing

- Unit tests for `geometry.ts` (angle↔hour conversion for both the
  180°-only Morning mapping and the full-360° Evening mapping) and
  `pastelColor.ts`.
- Component tests for `SegmentPopup` (create/edit/delete/cancel) and
  `useSegments` (localStorage persistence, overlap ordering).
- Drag interaction itself isn't meaningfully unit-testable — verified
  manually in the browser per the `run` skill once built.

## Non-goals

- Multiple days / adding additional day clocks
- JPEG/PNG export
- Calendar view (stretch goal from the README)
- Any backend or account system — `localStorage` only

## Open questions

None outstanding — all resolved during brainstorming (see `research.md`).
