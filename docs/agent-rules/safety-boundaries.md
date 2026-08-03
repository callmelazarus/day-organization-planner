# Safety Boundaries

## Locked paths

- `docs/designs/_template/` — the template every new design is copied from.
  Never edit in place; changes here silently change every future design.
  Requires explicit user approval.
- `.github/workflows/` — CI configuration. Changes here affect what gets
  verified on every push; treat as high-blast-radius.
- Anything matching `*.env`, `*secret*`, `*credential*`, or similar — never
  read into a commit, never print contents to logs or chat.

## Scope discipline

- Every plan step declares which files it touches. Do not edit files outside
  that declared scope without stopping to ask first (see write-scope rule in
  `CLAUDE.md`).
- If a fix reveals a second, unrelated bug, don't fix it inline — note it and
  ask whether to expand scope or file it separately.

## Risky operations

- Never force-push, `git reset --hard`, or delete branches without explicit
  user confirmation for that specific action.
- Never bypass `scripts/validate.sh` (no `--no-verify`, no skipped CI steps)
  to make a task appear complete faster.
