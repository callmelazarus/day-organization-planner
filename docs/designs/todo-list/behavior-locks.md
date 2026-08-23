# Behavior Locks: todo-list

Invariants that must hold once this design is implemented. A behavior lock
is broken if any future change makes its proof condition false.

## Lock 1: At most one todo is starred at a time

- **Invariant:** After any sequence of `toggleStar` calls, at most one item
  in the `todos` array has `starred === true`.
- **Proof condition:** `toggleStar` always clears `starred` on every other
  todo before (or as part of) setting it on the target.
- **Test pointer:** `src/clock/useTodos.test.ts`

## Lock 2: Starred todo renders first

- **Invariant:** In `TodoList`, if any todo is starred, it is the first row
  rendered, regardless of its position in the underlying `todos` array.
- **Proof condition:** Sorting/rendering logic in `TodoList` always places
  the starred item first.
- **Test pointer:** `src/clock/TodoList.test.tsx`

## Lock 3: Todo list is independent of segments

- **Invariant:** No code path lets a `Todo` become a `Segment` or vice
  versa; `useTodos` and `useSegments` never read or write each other's
  state or storage key.
- **Proof condition:** `useTodos.ts` has no import from `useSegments.ts` or
  `types.ts`'s `Segment`, and vice versa.
- **Test pointer:** Code review of `src/clock/useTodos.ts` imports.
