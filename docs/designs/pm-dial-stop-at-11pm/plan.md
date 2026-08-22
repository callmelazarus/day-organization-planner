# Plan: pm-dial-stop-at-11pm

Ordered implementation steps. Each step declares its file scope up front —
the agent should not touch files outside that scope without stopping to ask.

## Step 1: Shrink the Evening dial's valid hour range

- **Scope:** `src/clock/geometry.ts`, `src/clock/geometry.test.ts`
- **Do:** In `angleToHour`, add a dead-zone check for the `evening`
  branch: return `null` when the normalized angle is greater than 330
  (the sliver corresponding to the removed 23–24 hour). Update/add tests:
  the dead-zone case returns `null`; hour 23 at 330° still resolves;
  existing full-range assertions at 0/180/270 still hold. Remove or
  reframe the old "seam resolves to 12" full-circle-ambiguity test if it
  no longer applies now that 360°/0° isn't the closing seam of a full
  circle (0° is simply the dial's start, same as before — the assertion
  itself doesn't change, only its justification does).
- **Verify:** `npx vitest run src/clock/geometry.test.ts`

## Step 2: Update the Evening dial's tick range in `ClockDial`

- **Scope:** `src/clock/ClockDial.tsx`, `src/clock/ClockDial.test.tsx`
- **Do:** Change `EVENING_HOURS` to end at `23` instead of `24`. Update
  the existing "full-circle evening dial" background-shape test to
  expect a `path` (partial arc), matching the Morning dial's assertion,
  since the dial no longer spans 360°.
- **Verify:** `npx vitest run src/clock/ClockDial.test.tsx`

## Step 3: Full validation and manual check

- **Scope:** none (verification only)
- **Do:** Run the full suite and manually confirm in the browser that
  the Evening dial's last tick is 11, the dial no longer closes into a
  full circle, and dragging into the empty 11pm–12am sliver does nothing.
- **Verify:** `bash scripts/validate.sh` passes in full; manual browser
  check via the `run` skill.
