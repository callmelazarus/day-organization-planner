# Day Organization Planner

**Live site:** https://day-organization-planner.vercel.app/

A frontend-only web app for visually planning a day on a circular clock face.
Drag out time segments, label each one with what's planned, and see the whole
day at a glance. Built with React + TypeScript (Vite), no backend.

Most useful for weekends, but works for any day.

## How it works

The day is split into two clock dials:

- **Day dial** — 7:00 AM to 6:00 PM
- **Night dial** — 6:00 PM to 12:00 AM

To plan a segment, click and drag across the dial between the start and end
hour you want; the dial snaps to whole hours and shows a live preview of the
range as you drag. On release, a small popup opens next to where you let go
asking what's planned for that block.

Each segment is filled with a random pastel color, with its label rendered in
a darker shade of the same hue so it stays readable against the fill. Segment
labels are shown directly on the dial.

Click an existing segment to reopen its popup, where you can edit the label
or delete the segment entirely.

A **"View all tasks"** button opens a modal listing every segment for the day
in chronological order, independent of which dial it's on.

A **"Download image"** button exports a snapshot of just the two dials as a
PNG file, named `day-planner-YYYY-MM-DD.png`. A **"Clear"** button (with a
confirmation prompt) removes every segment from both dials.

## To-do list

Below the dials, an always-visible to-do list holds tasks that aren't tied
to a specific hour. Type into the input and hit Enter or **Add** to add a
task.

- **Star** (☆/★) pins one task to the top of the list; starring a new task
  un-stars whichever one was starred before, so at most one is ever pinned.
- **Move up** (↑) reorders a task earlier within its own group (starred
  tasks only reorder among starred, unstarred among unstarred).
- **Done** marks a task complete: its text gets a strikethrough and it
  drops to the bottom of the list, below every active task.
- **Delete** removes a single task.
- **Clear all** (🗑️, with a confirmation prompt) removes every task at once.

The list persists in `localStorage`, so it survives a page reload.

## Pomodoro timer

A 20-minute countdown timer sits fixed in the top-right corner, sized to
match the "Day Planner" title. **Start** begins the countdown (or restarts
it at 20:00 if it had already finished); the button becomes **Pause** while
running, and the display turns green while it's counting down. **Reset**
returns it to 20:00 at any time.

Small ▲/▼ buttons to the left of the countdown adjust it by one minute;
they're disabled while the timer is running so the duration can't drift
mid-block. When the countdown reaches 0:00, the display turns red and a
browser notification fires if notification permission was granted
(requested the first time you click Start).

The timer resets to 20:00 on page reload — it isn't persisted.

## Stack

- React 19 + TypeScript
- Vite (dev server / build)
- Vitest + Testing Library (unit/component tests)

## Getting started

```bash
npm install
npm run dev
```

## Project docs

Design history for each feature lives under `docs/designs/<feature-name>/`
(design rationale, plan, and behavior locks). See `docs/designs/README.md`
for how designs are structured, and `CLAUDE.md` for the working agreement
used when developing this repo with an AI agent.

## Not yet built

These were part of the original concept but aren't implemented yet:

- Multiple days shown side by side
- A calendar view for picking a date to plan

![Rough example of the circular day planner concept](image.png)

---
init: 7/18/2026
