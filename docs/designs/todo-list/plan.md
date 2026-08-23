# Plan: todo-list

Ordered implementation steps. Each step declares its file scope up front —
the agent should not touch files outside that scope without stopping to ask.

## Step 1: Add the `Todo` type

- **Scope:** `src/clock/types.ts`
- **Do:** Add `export interface Todo { id: string; text: string; starred: boolean }`.
- **Verify:** `tsc -b` (via `npm run build` or `scripts/validate.sh`) passes with the new type present but unused-checked once consumers exist.

## Step 2: `useTodos` hook

- **Scope:** `src/clock/useTodos.ts`, `src/clock/useTodos.test.ts`
- **Do:** Implement `useTodos()` mirroring `useSegments.ts`'s structure:
  `loadTodos`/`saveTodos` against `localStorage` key
  `circular-clock-mvp:todos`, a local `generateId` counter, and
  `{ todos, addTodo, deleteTodo, toggleStar }`. `addTodo(text)` trims and
  ignores empty input, creates `{ id, text, starred: false }`.
  `toggleStar(id)` clears `starred` on any other todo before setting it on
  the target, and unstars the target if it was already starred.
- **Verify:** Write tests first (TDD) covering: add appends with
  `starred:false`; delete removes by id; toggleStar sets the target starred
  and clears any previously-starred todo; toggling an already-starred todo
  unstars it with none left starred; state round-trips through
  localStorage across a hook remount. Run via `npm run test` /
  `scripts/validate.sh`.

## Step 3: `TodoList` component

- **Scope:** `src/clock/TodoList.tsx`, `src/clock/TodoList.test.tsx`
- **Do:** Render an input + "Add" button (Enter submits, trims, ignores
  empty), followed by the todo list sorted with the starred item first and
  the rest in given order. Each row renders text, a star toggle button, and
  a delete button. Render "No todos yet" when the list is empty. Style
  consistent with the existing grey-card look (reuse the same color
  tokens/shadow as `SegmentPopup`/`TaskListModal`).
- **Verify:** Component tests (TDD, written first) covering: renders empty
  state; adding via Enter and via the Add button both call through;
  empty/whitespace input is a no-op; clicking a row's star calls
  `toggleStar` with that row's id; clicking delete calls `deleteTodo` with
  that row's id; starred row renders first regardless of list order passed
  in. Run via `npm run test`.

## Step 4: Wire into `DayPlanner`

- **Scope:** `src/clock/DayPlanner.tsx`, `src/clock/DayPlanner.test.tsx`
- **Do:** Call `useTodos()` in `DayPlanner` and render `<TodoList ... />`
  always-visible, below the "View all tasks" button.
- **Verify:** Existing `DayPlanner` tests still pass; add/adjust a test
  confirming the todo list renders on the page without any button needed to
  reveal it. Run full `scripts/validate.sh`.
