# Design: dial-snapshot-export

## Problem

There's no way to save a day's plan as an image. The README already lists
"exporting a day's diagram as a JPEG/PNG" as a known gap. Users want a plain
image file of just the two dials as currently drawn — not the buttons or
todo list around them.

## Solution shape

A new "Download image" button, placed to the left of "View all tasks" in
`DayPlanner`, that captures a snapshot of just the two `ClockDial` SVGs
(with their "☀️ AM" / "🌙 PM" labels) and downloads it as a PNG.

- New module `src/clock/exportSnapshot.ts`, split into a pure/testable part
  and a DOM-facing part:
  - `formatSnapshotFilename(date: Date): string` — pure. Returns
    `"day-planner-YYYY-MM-DD.png"` using the given date's local year/month/day.
  - `downloadDialsSnapshot(svgs: SVGSVGElement[], labels: string[]): Promise<void>`
    — the orchestrator:
    1. Serialize each `svg` via `XMLSerializer`.
    2. Load each serialized SVG as an `Image` (via a `data:image/svg+xml`
       URL), waiting for `onload`.
    3. Draw onto an offscreen `<canvas>`: fill the background `#242424`
       (matching the app's page background), draw both dial images side by
       side with the same 40px gap used on screen, then `fillText` each
       label centered underneath its dial (matching the on-screen 8px gap
       and 20px font size).
    4. `canvas.toBlob('image/png')` to get a PNG blob.
    5. Trigger a download: create an object URL for the blob, assign it to
       a temporary `<a download="...">` element, click it, then revoke the
       URL.
- In `DayPlanner.tsx`: wrap the row containing the two `ClockDial`s in a
  `<div ref={dialsRowRef}>`. No changes to `ClockDial.tsx` — the two
  rendered `<svg>` nodes are read directly via
  `dialsRowRef.current.querySelectorAll('svg')` (morning first, evening
  second, matching render order). The new button's click handler collects
  those two SVG elements and the two label strings (`"☀️ AM"`, `"🌙 PM"`,
  kept as constants next to where they're rendered) and calls
  `downloadDialsSnapshot`.

## Non-goals

- No per-dial export (AM only / PM only).
- No format choice in the UI — PNG only.
- No capturing the buttons or todo list — dials only.
- No custom filename prompt — filename is always
  `day-planner-YYYY-MM-DD.png`.
- No changes to `ClockDial.tsx`'s public interface.

## Open questions

None outstanding — resolved during brainstorming.
