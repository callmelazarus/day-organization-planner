# Designs

Each significant feature or change gets its own directory here, copied from
`docs/designs/_template/`.

## Naming

`docs/designs/<short-kebab-case-name>/` — name after the feature, not the
date or ticket number (e.g. `circular-clock-mvp`, `jpeg-export`).

## Files per design

| File | Purpose |
|---|---|
| `design.md` | What we're building and why; the shape of the solution |
| `research.md` | Prior art, alternatives considered, open questions resolved |
| `plan.md` | Ordered implementation steps, each with a declared file scope |
| `behavior-locks.md` | Invariants that must not break, with proof/test pointers |
| `session-state.md` | Where an in-progress session left off |
| `progress.md` | Running log of what's been completed |
| `release-verdict.md` | Final PASS/FAIL/UNVERIFIED call before merge |

## Session start protocol

At the start of any session working on a design: read `design.md`,
`behavior-locks.md`, `plan.md`, and `session-state.md`, in that order, before
making changes.

## Don't delete after merge

Once a design's work is merged, leave the directory in place as a historical
record — it's the "why" behind the code. Don't delete it as cleanup.
