# Research: dial-snapshot-export

## Prior art

- The app already renders each dial as a self-contained `<svg>`
  (`ClockDial.tsx`), with explicit `width`/`height` attributes (`SIZE =
  400`), which is what makes serialize-then-rasterize via
  `XMLSerializer` + `Image` + `<canvas>` viable without any layout
  measurement guesswork.
- No existing module in this repo touches `canvas`, `Image`, or file
  downloads — this is the first feature to do so.

## Alternatives considered

- **`html2canvas`** — a library that screenshots arbitrary DOM nodes,
  handling fonts/nested layout/etc. automatically. Rejected: it would be
  the app's first runtime dependency beyond React, for a repo that has
  deliberately stayed dependency-free. The hand-rolled approach is
  sufficient because the capture target is exactly two `<svg>` elements
  with known, fixed dimensions — none of html2canvas's generality (image
  loading across origins, iframe content, arbitrary CSS layout) is needed.
- **Reading dial SVGs via a `ClockDial` ref/forwardRef** — considered so
  `DayPlanner` wouldn't need to query the DOM by tag name. Rejected in
  favor of `querySelectorAll('svg')` on a wrapping container ref: it needs
  zero changes to `ClockDial.tsx`'s public interface, and the render order
  (morning first, evening second) is already guaranteed by
  `DayPlanner.tsx`'s JSX.
- **JPEG output** — rejected in favor of PNG: lossless, supports the flat
  colors in the dials/text without compression artifacts, and needs no
  extra step to paint a background color to avoid JPEG's transparency
  issue (a background is being painted anyway, for visual consistency
  with the app).

## Resolved questions

All open questions from the initial ask were resolved during brainstorming:

- Capture scope: both dials plus their AM/PM labels, no buttons or todo
  list.
- Format: PNG.
- Implementation approach: hand-rolled canvas + serialized SVG, zero new
  dependencies.
- Filename: `day-planner-YYYY-MM-DD.png`, dated to the day of download.
- Button label: "Download image", placed to the left of "View all tasks".
- Background: solid `#242424`, matching the app's own background, so the
  exported image looks like a screenshot of the app rather than a bare
  transparent or white canvas.
