# Research: task-list-modal

## Prior art

- `formatHourRangeLabel` (`src/clock/hourLabel.ts`) already produces the
  exact "1pm – 2pm" style string needed for the Time column — reused
  as-is, no new formatting logic.
- `SegmentPopup` (`src/clock/SegmentPopup.tsx`) establishes the visual
  language for floating UI in this app: `#d9d9d9` grey card, rounded
  corners, `boxShadow: '0 8px 24px rgba(0,0,0,0.4)'`, inline style objects
  (no CSS modules/classes). The modal follows the same look, extended with
  a backdrop since it's a full overlay rather than an anchored popup.
- `DayPlanner`'s existing `pendingCreate`/`pendingEdit` state pattern
  (local `useState`, cleared via `onCancel`) is the template for the new
  `isTaskListOpen` boolean.

## Alternatives considered

**Component decomposition:**
- Chosen: single `TaskListModal.tsx` file containing backdrop, card, and
  table markup — mirrors `SegmentPopup`'s single-file-component
  convention, and there's only one modal in this app so a generic
  reusable `Modal` wrapper has no second consumer.
- Rejected: separate `Modal` + `TaskList` components — unnecessary
  abstraction (YAGNI) for a single use case.

**Row interactivity:**
- Chosen: read-only. Resolved directly with the user during brainstorming.
- Rejected: click-to-edit (reopen `SegmentPopup` from a row) — adds
  routing complexity (closing the modal, translating a row back to its
  segment's anchor point) for a feature not asked for.

**Empty state:**
- Chosen: a simple text message when there are no segments. Resolved
  directly with the user during brainstorming.
- Rejected: rendering an empty table with just headers — reads as broken
  rather than intentional.

## Resolved questions

- **Should list rows be clickable?** No — read-only view (see above).
- **What renders when there are no segments?** A simple message, not an
  empty table (see above).
