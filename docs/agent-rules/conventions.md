# Conventions

Stack: TypeScript + React.

## Naming

- Variables and functions: `camelCase`
- Types, interfaces, and React components: `PascalCase`
- Files containing a single component: match the component name (`DayClock.tsx`)
- Non-component files (hooks, utils): `camelCase.ts` (`useSegmentDrag.ts`)

## Types

- Explicit return types on all exported functions and components
- No `any` — use `unknown` and narrow, or define a proper type
- Prefer `interface` for object shapes that may be extended, `type` for unions
  and aliases

## Imports

- Absolute imports from `src/` root over deep relative chains (`../../../`)
- Group imports: external packages, then internal modules, then relative
  imports — no auto-sorted mixing between groups

## Error handling

- Don't swallow errors silently; surface them in the UI or console with
  enough context to debug (what operation failed, on what input)
- Validate only at real boundaries (user input, file export) — don't add
  defensive checks for states the type system already rules out

## File structure

- Co-locate tests with source: `DayClock.tsx` + `DayClock.test.tsx` in the
  same directory
- No catch-all `utils/` or `common/` dumping ground — name directories after
  the domain concept they hold (`src/clock/`, `src/export/`)

## Commit style

- Present-tense, imperative subject line (`add segment drag handler`, not
  `added` or `adds`)
- Subject under ~70 characters; body explains why, not what, when non-obvious
