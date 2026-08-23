# Plan: dial-snapshot-export

Ordered implementation steps. Each step declares its file scope up front —
the agent should not touch files outside that scope without stopping to ask.

## Step 1: `formatSnapshotFilename`

- **Scope:** `src/clock/exportSnapshot.ts`, `src/clock/exportSnapshot.test.ts`
- **Do:** Implement `formatSnapshotFilename(date: Date): string`, returning
  `"day-planner-YYYY-MM-DD.png"` from the date's local year/month/day
  (zero-padded month/day).
- **Verify:** Tests first (TDD): a known date formats correctly; single-digit
  month/day are zero-padded. Run via `npm run test`.

## Step 2: `downloadDialsSnapshot`

- **Scope:** `src/clock/exportSnapshot.ts`, `src/clock/exportSnapshot.test.ts`
- **Do:** Implement `downloadDialsSnapshot(svgs: SVGSVGElement[], labels: string[]): Promise<void>`
  per `design.md`'s step list (serialize → load as `Image` → draw on
  `<canvas>` with `#242424` background, 40px gap, labels centered
  underneath → `toBlob('image/png')` → trigger download via a temporary
  `<a download>`).
- **Verify:** Tests first (TDD), with `Image`, `HTMLCanvasElement`'s
  `getContext`/`toBlob`, and the anchor-click download path mocked (jsdom
  can't actually rasterize SVG/canvas). Assert: `XMLSerializer` output is
  fed into the `Image` sources; the canvas context receives a `fillRect`
  for the background, a `drawImage` per dial, and a `fillText` per label;
  `toBlob` is called with `'image/png'`; the resulting anchor's `download`
  attribute matches `formatSnapshotFilename(new Date())` and it is
  `click()`-ed. Run via `npm run test`.

## Step 3: Wire into `DayPlanner`

- **Scope:** `src/clock/DayPlanner.tsx`, `src/clock/DayPlanner.test.tsx`
- **Do:** Wrap the two-dial row in a `<div ref={dialsRowRef}>`. Add a
  "Download image" button to the left of "View all tasks" whose click
  handler reads `dialsRowRef.current.querySelectorAll('svg')` (in DOM
  order: morning, evening) and the two label constants (`"☀️ AM"`,
  `"🌙 PM"`), then calls `downloadDialsSnapshot`.
- **Verify:** Existing `DayPlanner` tests still pass. Add a test that
  clicking "Download image" calls `downloadDialsSnapshot` (mocked from
  `exportSnapshot`) with the two dial SVG elements in the right order and
  the two label strings. Run full `scripts/validate.sh`.
