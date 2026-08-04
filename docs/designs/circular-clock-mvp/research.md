# Research: circular-clock-mvp

## Prior art

No existing code in this repo to build on (project was a bare Vite scaffold
going into this design). No external library dependency was pulled in for
the dial itself — plain SVG + hand-rolled trig was judged simple enough for
a single circular dial that this design covers.

## Alternatives considered

**Rendering technology — SVG vs. Canvas vs. CSS conic-gradient/clip-path:**
SVG chosen. Canvas would require hand-rolled hit-testing for "which segment
did the user click," which SVG gets for free from native DOM elements.
CSS conic-gradient/clip-path avoids some trig for background wedges but
doesn't extend cleanly to arbitrary segment start/end angles or click
targets. Neither alternative offered a real advantage for a scene this
simple.

**Dial shape — single 24-hour ring, double-lap 12-hour ring (inner
AM/outer PM), vs. two separate 12-hour-style dials:** Started with a single
24-hour dial (one revolution = 24 hours), then a double-lap ring (inner
ring = AM, outer ring = PM, with segments crossing noon rendered as two
connected pieces across both rings). Settled instead on two separate,
side-by-side dials — Morning (6am–12pm) and Evening/Afternoon (12pm–12am) —
each styled like a normal analog clock. This avoids the double-lap design's
core complications (segments splitting visually at the noon handoff,
ambiguous ring assignment) and reads more intuitively as "two clocks, one
for each half of the day."

**Morning dial hour spacing — even 60°/hour across the full circle vs.
literal standard-clock 30°/hour positions:** Went with literal standard
30°/hour positions (6 at bottom, 12 at top, matching a real clock) after
user feedback that an evenly-spread 60°/hour mapping didn't read as "a
regular clock." The tradeoff: since the Morning dial only spans 6 hours,
half the circle (where 1–5 would normally sit) goes unused. Chose to keep
the full circle outline with that half empty (rather than trimming to a
semicircle) so the Morning and Evening dials match in size/shape when shown
side by side.

**Overlapping segments — radial sub-lanes vs. newest-on-top z-order vs.
disallow overlap entirely:** Chose newest-on-top. Sub-lanes keep every
segment visible but thin out fast with 3+ overlaps and add real rendering
complexity for a case that's likely rare. Disallowing overlap was the
initial recommendation but the user wants it supported. Newest-on-top is
the simplest to implement — and turns out to require no special logic at
all, since SVG's paint order and hit-testing already do the right thing
when segments are rendered in creation order.

## Resolved questions

All open questions from the brainstorming session were resolved inline and
are reflected directly in `design.md`:

- Scope: single day only (no multi-day, no export, no calendar view yet)
- Snap granularity: whole hours
- Midnight–6am: excluded from the planner entirely (not just hidden)
- Edit/delete: click an existing segment reopens the popup pre-filled, with
  a delete option
- Persistence: `localStorage`, survives page reload
