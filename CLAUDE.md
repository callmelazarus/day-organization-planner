# CLAUDE.md

## What this repo is

A frontend web app that lets a user plan a day using a circular "day planner"
clock: click-and-drag to block out hour segments, label each segment with an
activity, and export the result as an image. Stack: TypeScript + React (no
backend). See `README.md` for the full feature spec.

## Session lifecycle

At the start of a session, read in this order before making changes:

1. `CLAUDE.md` (this file)
2. `docs/designs/<active-design>/behavior-locks.md` (if a design is in progress)
3. `docs/designs/<active-design>/plan.md`
4. `docs/designs/<active-design>/session-state.md`

If no design is in progress yet, check `docs/designs/README.md` for how to
start one. Confirm your understanding of scope before acting on a plan step.

## Verification gate

`scripts/validate.sh` must pass before any work is declared done. Do not
report a task complete on the basis of code review alone — run the script and
show its output.

## Write scope

Stay within the files declared by the current plan step. If a change requires
touching a file outside that declared scope, stop and output:

```
SCOPE QUESTION: <file> is outside the declared scope of this step. Expand scope or proceed differently?
```

## Commit protocol

Never commit without giving the user a chance to review first. Stage the
changes and stop — let the user inspect the diff (they review via their
IDE's Source Control tab) and give explicit go-ahead before running
`git commit`. This overrides any skill or process (including the
brainstorming skill's design-doc step) that would otherwise commit
automatically as part of its flow.

## Hard stops

- Never bypass or skip `scripts/validate.sh` to make a task look done.
- Never modify `docs/designs/_template/` without explicit user approval — it's
  the template every new design is copied from.
- Never commit secrets, API keys, or credentials.

## References

- `docs/agent-rules/conventions.md` — naming, structure, commit style
- `docs/agent-rules/safety-boundaries.md` — locked paths, scope discipline
- `docs/agent-rules/verification.md` — definition of done, verdict states
