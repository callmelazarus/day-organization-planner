# Design: todo-list

## Problem

The app only lets you capture plans that are pinned to a specific hour range
via segments. There's no place to jot down unscheduled things that need to
get done at some point today, and no way to flag which one of those matters
most. Users need a lightweight scratchpad that's separate from the
hour-based dials.

## Solution shape

A new `TodoList` component, rendered always-visible in `DayPlanner`, below
the two dials and below the existing "View all tasks" button. No open/close
button — it's a permanent part of the page layout, not a modal.

- New `useTodos` hook, mirroring the shape and persistence pattern of
  `useSegments`:
  - `interface Todo { id: string; text: string; starred: boolean }`
  - `{ todos, addTodo, deleteTodo, toggleStar }`
  - Persisted to `localStorage` under `circular-clock-mvp:todos`, loaded on
    init and saved on every change (same `loadX`/`saveX` pattern as
    `useSegments.ts`).
  - `toggleStar(id)` enforces the "at most one starred todo" invariant: it
    clears `starred` on whatever todo currently has it (if any) before
    setting it on the target. Calling it on the already-starred todo unstars
    it (no starred todo afterward).
- `TodoList` UI:
  - An always-visible text input + "Add" button pinned at the top of the
    panel. Enter key also submits. Submitting trims the text and ignores
    empty/whitespace-only input (same guard as `SegmentPopup`'s label
    submit).
  - Below the input, the list of todos: the starred todo (if any) is sorted
    to the top; the rest keep insertion order.
  - Each row shows: the todo text, a star toggle icon/button, and a delete
    button.
  - Empty state: a plain message, e.g. "No todos yet" (mirrors
    `TaskListModal`'s empty-state pattern).
  - Styled consistently with the app's existing grey-card look used by
    `SegmentPopup`/`TaskListModal`.

`TodoList` and `useTodos` are fully independent of `Segment`/`useSegments` —
no shared state, no cross-linking, no way to convert a todo into a segment
or vice versa.

## Non-goals

- No "mark complete" / checkbox state for todos.
- No in-place editing of todo text (delete and re-add instead).
- No drag-to-reorder.
- No relationship to hour segments (no promoting a todo to a segment, no
  segments feeding into the todo list).
- No collapse/hide control for the panel — it's always visible.

## Open questions

None outstanding — resolved during brainstorming.
