# Research: todo-list

## Prior art

- `useSegments.ts` already establishes the local-persistence pattern this
  feature reuses: a `STORAGE_KEY` constant, a `loadX`/`saveX` pair around
  `localStorage`, state seeded via `useState(() => loadX())`, and a
  `useEffect` that saves on every change.
- `TaskListModal.tsx` establishes the empty-state message pattern ("No
  tasks planned yet") and the grey-card visual style (`#d9d9d9` background,
  rounded corners, box-shadow) reused here.
- `SegmentPopup.tsx` establishes the trim-and-ignore-empty guard on text
  submission, reused for the todo input.

## Alternatives considered

- **Modal overlay** (same pattern as `TaskListModal`) — rejected in favor of
  an always-visible panel; the user wants the todo scratchpad visible
  alongside the dials at all times, not tucked behind a button.
- **Collapsible/toggleable panel** — considered as a middle ground, but
  rejected for simplicity; nothing in the current layout requires reclaiming
  the space.
- **Starred item marked in place vs. pinned to top** — pinning to top was
  chosen so the most important item is always the first thing visible,
  rather than requiring a scan of the full list.
- **Manual-unstar-first vs. auto-unstar-on-select** — auto-unstar (clicking
  a new star silently clears the old one) was chosen as lower friction;
  matches "exactly one starred item" as a derived invariant rather than a
  user-enforced rule.

## Resolved questions

All open questions from the initial ask were resolved during brainstorming:

- UI shape: always-visible sidebar-style panel below the dials, not a modal.
- No collapse/toggle control.
- Add flow: always-visible input row + Enter/Add button, no popup.
- Star behavior: click-to-set with automatic unstar of the previous item.
- Star ordering: starred item pinned to top of the list.
- Persistence: yes, via `localStorage`, same pattern as segments.
