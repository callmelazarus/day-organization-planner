# Release Verdict: todo-list

## Verdict

PASS

## Evidence

`bash scripts/validate.sh` (2026-08-22):

```
=== Type check ===
=== Lint ===
=== Tests ===
 Test Files  12 passed (12)
      Tests  80 passed (80)
=== Build ===
✓ built in 546ms
=== All checks passed ===
```

All three behavior locks verified by tests: `useTodos.test.ts` covers
single-starred-todo enforcement (Lock 1); `TodoList.test.tsx` covers
starred-first rendering (Lock 2); `useTodos.ts` has no import of
`useSegments`/`Segment`, confirmed by code review (Lock 3).

## Known gaps

No manual/browser verification was performed — automated
type-check/lint/test/build coverage only, per user's request to verify
manually themselves.
