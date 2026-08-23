# Behavior Locks: dial-snapshot-export

Invariants that must hold once this design is implemented. A behavior lock
is broken if any future change makes its proof condition false.

## Lock 1: Export captures exactly the two dials, nothing else

- **Invariant:** `downloadDialsSnapshot` draws only the SVG elements and
  labels explicitly passed to it — it never queries or captures buttons,
  the todo list, or any other page content.
- **Proof condition:** The function's only DOM reads are its `svgs`/`labels`
  parameters; it does not call `document.querySelector`/`getElementById`
  itself.
- **Test pointer:** `src/clock/exportSnapshot.test.ts`

## Lock 2: Filename is always dated PNG

- **Invariant:** The downloaded file's name always matches
  `day-planner-YYYY-MM-DD.png` for the date the download happened.
- **Proof condition:** `formatSnapshotFilename` zero-pads month/day and is
  the sole source of the anchor's `download` attribute in
  `downloadDialsSnapshot`.
- **Test pointer:** `src/clock/exportSnapshot.test.ts`

## Lock 3: No new runtime dependency

- **Invariant:** The export feature is implemented using only native
  browser APIs (`XMLSerializer`, `Image`, `HTMLCanvasElement`, `Blob`,
  `URL.createObjectURL`) — no new package is added to `package.json`
  `dependencies`.
- **Proof condition:** `package.json`'s `dependencies` remain unchanged
  (`react`, `react-dom` only).
- **Test pointer:** Code review of `package.json` diff.
