# Verification

## Definition of done

A task is done only when:

1. `scripts/validate.sh` passes with no errors
2. The behavior described in the plan step is actually exercised (not just
   type-checked) — for UI work, this means running the app and using the
   feature, not just reading the diff
3. Any behavior locks touched by the change still hold (see the active
   design's `behavior-locks.md`)

## Three-state verdicts

When reporting the result of a check, use one of three states — don't blur
them into a vague "looks good":

- **PASS** — ran the verification command/steps, output confirms success
- **FAIL** — ran it, output shows a specific failure (quote it)
- **UNVERIFIED** — did not or could not run it (say why: no browser access,
  script missing, etc.) — never presented as PASS

## Verification sequence

1. Run `scripts/validate.sh`
2. For UI-affecting changes, run the app and manually exercise the golden
   path plus any edge case the change touches
3. Re-check the relevant behavior locks
4. Report using the three-state verdict above, with actual command output as
   evidence — not just an assertion that it works

## Post-compact protocol

If context was compacted mid-task, before claiming anything is done: re-read
`CLAUDE.md`, the active design's `session-state.md`, and re-run
`scripts/validate.sh` fresh. Don't trust a pre-compaction memory of "it
passed" without re-running it.
