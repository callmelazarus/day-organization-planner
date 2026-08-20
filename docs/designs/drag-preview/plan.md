# Drag Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a live hour-range preview (dashed wedge + "1pm – 2pm"-style label) on a `ClockDial` while the user is dragging, instead of only after they release and save.

**Architecture:** Two new pure, unit-tested modules in `src/clock/` — `hourLabel.ts` (12-hour label + am/pm range formatting, extracted from `ClockDial`'s existing private helper) and `dragPreview.ts` (given a dial and a start/current drag hour, computes the arc geometry and label for what would be created) — then a small rendering addition to `ClockDial.tsx` that calls `computeDragPreview` with its existing `dragStartHour`/`dragCurrentHour` state and renders the result (Tasks 1–3). Task 4 adds one small controlled prop, `ClockDialProps.pendingRange`, so `DayPlanner` can keep that same preview visible while its create-segment label popup is open, instead of it disappearing the instant the drag ends. No changes to `useSegments`, `SegmentArc`, or the edit-segment flow.

**Tech Stack:** TypeScript, React 19, Vite 6, Vitest + @testing-library/react.

## Global Constraints

- Follow `docs/agent-rules/conventions.md`: camelCase vars/functions, PascalCase types/components, explicit return types on all exported functions and components, no `any`, tests co-located with source.
- `scripts/validate.sh` (type check, lint, test, build) must pass before any task is considered done — per `CLAUDE.md`'s verification gate.
- Respect `docs/designs/drag-preview/behavior-locks.md` — Locks 1–4 (preview edges land on ticks, no flash on a plain click, full-circle preview doesn't degenerate, create-range preview persists through the label popup) are non-negotiable invariants this plan's tests and manual verification cover.
- Commit protocol (`CLAUDE.md`): stage each task's changes and get the user's explicit go-ahead — reviewed via their IDE's Source Control diff — before running `git commit`. Do not commit automatically just because a step says "Commit."
- All application code changes stay under `src/clock/`; design-tracking doc updates stay under `docs/designs/drag-preview/`. No new dependencies, no network calls.

---

### Task 1: Extract `hourLabel` and add range formatting

**Files:**
- Create: `src/clock/hourLabel.ts`
- Test: `src/clock/hourLabel.test.ts`
- Modify: `src/clock/ClockDial.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: `hourLabel(hour: number): string` (moved, same behavior as today's private `ClockDial` helper) and `formatHourRangeLabel(startHour: number, endHour: number): string` (`src/clock/hourLabel.ts`) — consumed by `dragPreview.ts` in Task 2.

- [ ] **Step 1: Write the failing tests**

Create `src/clock/hourLabel.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { formatHourRangeLabel, hourLabel } from './hourLabel';

describe('hourLabel', () => {
  test('converts 24-hour values to 12-hour clock numbers', () => {
    expect(hourLabel(6)).toBe('6');
    expect(hourLabel(12)).toBe('12');
    expect(hourLabel(13)).toBe('1');
    expect(hourLabel(23)).toBe('11');
    expect(hourLabel(24)).toBe('12');
  });
});

describe('formatHourRangeLabel', () => {
  test('formats a morning range with am suffixes', () => {
    expect(formatHourRangeLabel(6, 7)).toBe('6am – 7am');
  });

  test('formats a range crossing from am to noon', () => {
    expect(formatHourRangeLabel(11, 12)).toBe('11am – 12pm');
  });

  test('formats an afternoon range with pm suffixes', () => {
    expect(formatHourRangeLabel(13, 14)).toBe('1pm – 2pm');
  });

  test('formats a range crossing midnight as 12am', () => {
    expect(formatHourRangeLabel(23, 24)).toBe('11pm – 12am');
  });

  test('formats the full evening dial span', () => {
    expect(formatHourRangeLabel(12, 24)).toBe('12pm – 12am');
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npx vitest run src/clock/hourLabel.test.ts`
Expected: FAIL with "Cannot find module './hourLabel'"

- [ ] **Step 3: Implement `hourLabel.ts`**

Create `src/clock/hourLabel.ts`:

```ts
export function hourLabel(hour: number): string {
  const displayHour = hour === 24 ? 12 : hour > 12 ? hour - 12 : hour;
  return String(displayHour);
}

function amPmSuffix(hour: number): 'am' | 'pm' {
  if (hour === 24) return 'am';
  if (hour === 12) return 'pm';
  return hour < 12 ? 'am' : 'pm';
}

export function formatHourRangeLabel(startHour: number, endHour: number): string {
  return `${hourLabel(startHour)}${amPmSuffix(startHour)} – ${hourLabel(endHour)}${amPmSuffix(endHour)}`;
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npx vitest run src/clock/hourLabel.test.ts`
Expected: PASS, all 6 assertions across the 2 describe blocks green.

- [ ] **Step 5: Point `ClockDial.tsx` at the extracted helper**

In `src/clock/ClockDial.tsx`, delete the local `hourLabel` function (currently defined right after the `EVENING_HOURS` constant):

```ts
function hourLabel(hour: number): string {
  const displayHour = hour === 24 ? 12 : hour > 12 ? hour - 12 : hour;
  return String(displayHour);
}
```

and add an import for it alongside the other relative imports at the top of the file:

```ts
import { hourLabel } from './hourLabel';
```

- [ ] **Step 6: Run the full test suite and verify no regressions**

Run: `npx vitest run src/clock/ClockDial.test.tsx src/clock/hourLabel.test.ts`
Expected: PASS, all existing `ClockDial` tests still green (tick label rendering is unchanged, only where `hourLabel` is defined has moved).

- [ ] **Step 7: Stage for review**

```bash
git add src/clock/hourLabel.ts src/clock/hourLabel.test.ts src/clock/ClockDial.tsx
```

Show the diff to the user (Source Control tab) and wait for explicit go-ahead before running `git commit`.

---

### Task 2: `computeDragPreview` — pure drag-preview geometry

**Files:**
- Create: `src/clock/dragPreview.ts`
- Test: `src/clock/dragPreview.test.ts`

**Interfaces:**
- Consumes: `buildArcPath`, `hourToAngle` (`src/clock/geometry.ts`); `formatHourRangeLabel` (`src/clock/hourLabel.ts`); `DialType` (`src/clock/types.ts`)
- Produces: `DragPreview` type and `computeDragPreview(dial: DialType, startHour: number | null, endHour: number | null, cx: number, cy: number, innerRadius: number, outerRadius: number): DragPreview | null` where `DragPreview = { isFullCircle: boolean, arcPath: string, midAngle: number, labelText: string }` — consumed by `ClockDial` in Task 3.

- [ ] **Step 1: Write the failing tests**

Create `src/clock/dragPreview.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { computeDragPreview } from './dragPreview';
import { buildArcPath, hourToAngle } from './geometry';

describe('computeDragPreview', () => {
  test('returns null when either hour is missing (no drag in progress)', () => {
    expect(computeDragPreview('morning', null, 7, 200, 200, 60, 150)).toBeNull();
    expect(computeDragPreview('morning', 6, null, 200, 200, 60, 150)).toBeNull();
  });

  test('returns null when start and current hour are the same (no movement yet)', () => {
    expect(computeDragPreview('morning', 8, 8, 200, 200, 60, 150)).toBeNull();
  });

  test('normalizes direction so dragging backward produces the same preview as dragging forward', () => {
    const forward = computeDragPreview('morning', 6, 7, 200, 200, 60, 150);
    const backward = computeDragPreview('morning', 7, 6, 200, 200, 60, 150);
    expect(backward).toEqual(forward);
  });

  test('builds an arc path and label for a partial morning range', () => {
    const preview = computeDragPreview('morning', 6, 7, 200, 200, 60, 150);
    const expectedPath = buildArcPath(
      200,
      200,
      60,
      150,
      hourToAngle('morning', 6),
      hourToAngle('morning', 7)
    );

    expect(preview?.isFullCircle).toBe(false);
    expect(preview?.arcPath).toBe(expectedPath);
    expect(preview?.labelText).toBe('6am – 7am');
  });

  test('flags a full-circle preview for the entire evening dial and formats midnight', () => {
    const preview = computeDragPreview('evening', 12, 24, 200, 200, 60, 150);

    expect(preview?.isFullCircle).toBe(true);
    expect(preview?.arcPath).toBe('');
    expect(preview?.labelText).toBe('12pm – 12am');
  });

  test('computes the angular midpoint of the range', () => {
    const preview = computeDragPreview('morning', 6, 8, 200, 200, 60, 150);
    // hourToAngle('morning', 6) = 180, hourToAngle('morning', 8) = 240
    expect(preview?.midAngle).toBe(210);
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npx vitest run src/clock/dragPreview.test.ts`
Expected: FAIL with "Cannot find module './dragPreview'"

- [ ] **Step 3: Implement `dragPreview.ts`**

Create `src/clock/dragPreview.ts`:

```ts
import { buildArcPath, hourToAngle } from './geometry';
import { formatHourRangeLabel } from './hourLabel';
import type { DialType } from './types';

export interface DragPreview {
  isFullCircle: boolean;
  arcPath: string;
  midAngle: number;
  labelText: string;
}

export function computeDragPreview(
  dial: DialType,
  startHour: number | null,
  endHour: number | null,
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number
): DragPreview | null {
  if (startHour === null || endHour === null) return null;

  const lo = Math.min(startHour, endHour);
  const hi = Math.max(startHour, endHour);
  if (hi <= lo) return null;

  const startAngle = hourToAngle(dial, lo);
  const endAngle = hourToAngle(dial, hi);
  const isFullCircle = endAngle - startAngle >= 360;

  return {
    isFullCircle,
    arcPath: isFullCircle ? '' : buildArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle),
    midAngle: (startAngle + endAngle) / 2,
    labelText: formatHourRangeLabel(lo, hi),
  };
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npx vitest run src/clock/dragPreview.test.ts`
Expected: PASS, all 6 tests green.

- [ ] **Step 5: Stage for review**

```bash
git add src/clock/dragPreview.ts src/clock/dragPreview.test.ts
```

Show the diff and wait for explicit go-ahead before committing.

---

### Task 3: Render the preview in `ClockDial`

**Files:**
- Modify: `src/clock/ClockDial.tsx`
- Modify: `src/clock/ClockDial.test.tsx`

**Interfaces:**
- Consumes: `computeDragPreview`, `DragPreview` (`src/clock/dragPreview.ts`)
- Produces: nothing new externally — purely a rendering addition inside the existing `ClockDial` component.

**Note:** Per `docs/designs/drag-preview/design.md`, the pointer-drag interaction itself is not meaningfully unit-testable in jsdom (`hourFromPointer` short-circuits on `rect.width === 0`, which is what jsdom's `getBoundingClientRect` always returns) — this is the same limitation already documented for drag-to-create in `docs/designs/circular-clock-mvp/`. `computeDragPreview`'s logic is fully covered by Task 2's unit tests; this task adds one static regression test (no preview renders before any interaction) and is otherwise verified manually in Step 4.

- [ ] **Step 1: Add a static regression test**

In `src/clock/ClockDial.test.tsx`, add a new test inside the existing `describe('ClockDial', ...)` block:

```tsx
  test('renders no drag preview before any pointer interaction', () => {
    const { container } = render(
      <ClockDial dial="morning" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    expect(container.querySelector('[data-testid="drag-preview"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="drag-preview-label"]')).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the test and verify it passes (baseline, before wiring anything up)**

Run: `npx vitest run src/clock/ClockDial.test.tsx`
Expected: PASS — no preview elements exist yet, so this is a true baseline, not a red step. It guards against future regressions (e.g. a preview accidentally rendering unconditionally).

- [ ] **Step 3: Wire `computeDragPreview` into `ClockDial.tsx`**

Replace the full contents of `src/clock/ClockDial.tsx`:

```tsx
import { useRef, useState } from 'react';
import type { MouseEvent, PointerEvent as ReactPointerEvent, ReactElement } from 'react';
import { angleToHour, buildArcPath, hourToAngle } from './geometry';
import { computeDragPreview } from './dragPreview';
import { hourLabel } from './hourLabel';
import { SegmentArc } from './SegmentArc';
import type { DialType, Segment } from './types';

const SIZE = 400;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 150;
const INNER_RADIUS = 60;
const PREVIEW_COLOR = '#7aa2e3';

const MORNING_HOURS = [6, 7, 8, 9, 10, 11, 12];
const EVENING_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

function pointerAngle(cx: number, cy: number, x: number, y: number): number {
  const angleRad = Math.atan2(y - cy, x - cx);
  const angleDeg = (angleRad * 180) / Math.PI + 90;
  return ((angleDeg % 360) + 360) % 360;
}

export interface ClockDialProps {
  dial: DialType;
  segments: Segment[];
  onSegmentClick: (segment: Segment, event: MouseEvent<SVGElement>) => void;
  onCreateSegment: (startHour: number, endHour: number, anchor: { x: number; y: number }) => void;
}

export function ClockDial({
  dial,
  segments,
  onSegmentClick,
  onCreateSegment,
}: ClockDialProps): ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragStartHour, setDragStartHour] = useState<number | null>(null);
  const [dragCurrentHour, setDragCurrentHour] = useState<number | null>(null);

  const hours = dial === 'morning' ? MORNING_HOURS : EVENING_HOURS;
  const usedStartAngle = hourToAngle(dial, hours[0]);
  const usedEndAngle = hourToAngle(dial, hours[hours.length - 1]);
  const isFullCircle = usedEndAngle - usedStartAngle >= 360;
  const preview = computeDragPreview(dial, dragStartHour, dragCurrentHour, CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS);

  function hourFromPointer(event: ReactPointerEvent<SVGSVGElement>): number | null {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const scale = SIZE / rect.width;
    const x = (event.clientX - rect.left) * scale;
    const y = (event.clientY - rect.top) * scale;
    const angle = pointerAngle(CENTER, CENTER, x, y);
    const hour = angleToHour(dial, angle);
    return hour === null ? null : Math.round(hour);
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>): void {
    const hour = hourFromPointer(event);
    if (hour === null) return;
    setDragStartHour(hour);
    setDragCurrentHour(hour);
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>): void {
    if (dragStartHour === null) return;
    const hour = hourFromPointer(event);
    if (hour === null) return;
    setDragCurrentHour(hour);
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>): void {
    if (dragStartHour === null || dragCurrentHour === null) {
      setDragStartHour(null);
      setDragCurrentHour(null);
      return;
    }

    const startHour = Math.min(dragStartHour, dragCurrentHour);
    const endHour = Math.max(dragStartHour, dragCurrentHour);

    if (endHour > startHour) {
      onCreateSegment(startHour, endHour, { x: event.clientX, y: event.clientY });
    }

    setDragStartHour(null);
    setDragCurrentHour(null);
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {isFullCircle ? (
        <circle
          data-testid="dial-background"
          cx={CENTER}
          cy={CENTER}
          r={(OUTER_RADIUS + INNER_RADIUS) / 2}
          fill="none"
          stroke="#555"
          strokeWidth={OUTER_RADIUS - INNER_RADIUS}
          opacity={0.12}
        />
      ) : (
        <path
          data-testid="dial-background"
          d={buildArcPath(CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS, usedStartAngle, usedEndAngle)}
          fill="#555"
          opacity={0.12}
        />
      )}
      {hours.map((hour) => {
        const angle = hourToAngle(dial, hour);
        const rad = ((angle - 90) * Math.PI) / 180;
        const labelRadius = OUTER_RADIUS + 20;
        const x = CENTER + labelRadius * Math.cos(rad);
        const y = CENTER + labelRadius * Math.sin(rad);
        return (
          <text key={hour} x={x} y={y} textAnchor="middle" fontSize={13} fill="#aaa">
            {hourLabel(hour)}
          </text>
        );
      })}
      {segments.map((segment) => (
        <SegmentArc
          key={segment.id}
          segment={segment}
          dial={dial}
          cx={CENTER}
          cy={CENTER}
          innerRadius={INNER_RADIUS}
          outerRadius={OUTER_RADIUS}
          onClick={onSegmentClick}
        />
      ))}
      {preview &&
        (preview.isFullCircle ? (
          <circle
            data-testid="drag-preview"
            cx={CENTER}
            cy={CENTER}
            r={(OUTER_RADIUS + INNER_RADIUS) / 2}
            fill="none"
            stroke={PREVIEW_COLOR}
            strokeOpacity={0.5}
            strokeWidth={OUTER_RADIUS - INNER_RADIUS}
            strokeDasharray="10 6"
            pointerEvents="none"
          />
        ) : (
          <path
            data-testid="drag-preview"
            d={preview.arcPath}
            fill={PREVIEW_COLOR}
            fillOpacity={0.25}
            stroke={PREVIEW_COLOR}
            strokeWidth={2}
            strokeDasharray="6 4"
            pointerEvents="none"
          />
        ))}
      {preview &&
        (() => {
          const labelRadius = (OUTER_RADIUS + INNER_RADIUS) / 2;
          const rad = ((preview.midAngle - 90) * Math.PI) / 180;
          const x = CENTER + labelRadius * Math.cos(rad);
          const y = CENTER + labelRadius * Math.sin(rad);
          return (
            <text
              data-testid="drag-preview-label"
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill="#e8e8e8"
              pointerEvents="none"
            >
              {preview.labelText}
            </text>
          );
        })()}
    </svg>
  );
}
```

- [ ] **Step 4: Run the full test suite**

Run: `npx vitest run src/clock/ClockDial.test.tsx`
Expected: PASS, all tests green including the new baseline test from Step 1.

- [ ] **Step 5: Stage for review**

```bash
git add src/clock/ClockDial.tsx src/clock/ClockDial.test.tsx
```

Show the diff and wait for explicit go-ahead before committing.

---

### Task 4: Persist the create-range preview through the label popup

**Files:**
- Modify: `src/clock/ClockDial.tsx`
- Modify: `src/clock/ClockDial.test.tsx`
- Modify: `src/clock/DayPlanner.tsx`

**Interfaces:**
- Consumes: `computeDragPreview` (`src/clock/dragPreview.ts`, Task 2, unchanged)
- Produces: `ClockDialProps` gains an optional `pendingRange: { startHour: number; endHour: number } | null` field. `DayPlanner` derives this from its existing `pendingCreate` state — no other component consumes it.

**Context:** manual verification of Task 3 (see `docs/designs/drag-preview/research.md`'s "Follow-up" section) found that `ClockDial` clears its drag state — and therefore the preview — the instant the pointer is released, which is also the instant `DayPlanner` opens the label popup. This task keeps the same dashed wedge/label visible for the pending range while that popup is open, scoped to the create flow only (see Lock 4 in `behavior-locks.md`). Editing an existing segment is unaffected — its bounds are already visible via its own saved-color arc.

- [ ] **Step 1: Add a test for the frozen (non-drag) preview**

In `src/clock/ClockDial.test.tsx`, add a new test inside the existing `describe('ClockDial', ...)` block:

```tsx
  test('renders a frozen preview from pendingRange when no drag is in progress', () => {
    const { container } = render(
      <ClockDial
        dial="morning"
        segments={[]}
        onSegmentClick={() => {}}
        onCreateSegment={() => {}}
        pendingRange={{ startHour: 6, endHour: 7 }}
      />
    );

    expect(container.querySelector('[data-testid="drag-preview"]')).toBeInTheDocument();
    expect(screen.getByText('6am – 7am')).toBeInTheDocument();
  });
```

This requires `screen` — confirm the existing `import { render, screen, fireEvent } from '@testing-library/react';` at the top of the file already covers it (it does, `screen` is already imported for other tests in this file).

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/clock/ClockDial.test.tsx`
Expected: FAIL — `ClockDialProps` has no `pendingRange` field yet, so TypeScript/the test will fail (no preview renders because the prop is ignored).

- [ ] **Step 3: Add `pendingRange` to `ClockDial`**

In `src/clock/ClockDial.tsx`, add the field to the props interface:

```tsx
export interface ClockDialProps {
  dial: DialType;
  segments: Segment[];
  onSegmentClick: (segment: Segment, event: MouseEvent<SVGElement>) => void;
  onCreateSegment: (startHour: number, endHour: number, anchor: { x: number; y: number }) => void;
  pendingRange?: { startHour: number; endHour: number } | null;
}
```

Destructure it in the component signature:

```tsx
export function ClockDial({
  dial,
  segments,
  onSegmentClick,
  onCreateSegment,
  pendingRange,
}: ClockDialProps): ReactElement {
```

Replace the existing single `preview` computation:

```tsx
  const preview = computeDragPreview(dial, dragStartHour, dragCurrentHour, CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS);
```

with a version that falls back to `pendingRange` once the live drag has ended:

```tsx
  const activePreview = computeDragPreview(dial, dragStartHour, dragCurrentHour, CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS);
  const preview =
    activePreview ??
    (pendingRange
      ? computeDragPreview(dial, pendingRange.startHour, pendingRange.endHour, CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS)
      : null);
```

Nothing else in the file changes — the JSX that renders `preview` (the dashed shape and the label) already works off this `preview` variable, so it doesn't need to change.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npx vitest run src/clock/ClockDial.test.tsx`
Expected: PASS, all 6 tests green (5 existing + the new one from Step 1).

- [ ] **Step 5: Wire `pendingRange` from `DayPlanner`**

Replace the full contents of `src/clock/DayPlanner.tsx`:

```tsx
import { useState } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import { ClockDial } from './ClockDial';
import { SegmentPopup } from './SegmentPopup';
import { useSegments } from './useSegments';
import type { Segment } from './types';

interface Anchor {
  x: number;
  y: number;
}

interface PendingCreate {
  startHour: number;
  endHour: number;
  anchor: Anchor;
}

interface PendingEdit {
  segment: Segment;
  anchor: Anchor;
}

export function DayPlanner(): ReactElement {
  const { segments, addSegment, updateSegment, deleteSegment } = useSegments();
  const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);

  const morningSegments = segments.filter((segment) => segment.startHour < 12);
  const eveningSegments = segments.filter((segment) => segment.startHour >= 12);

  const morningPendingRange =
    pendingCreate && pendingCreate.startHour < 12
      ? { startHour: pendingCreate.startHour, endHour: pendingCreate.endHour }
      : null;
  const eveningPendingRange =
    pendingCreate && pendingCreate.startHour >= 12
      ? { startHour: pendingCreate.startHour, endHour: pendingCreate.endHour }
      : null;

  function handleCreateSegment(startHour: number, endHour: number, anchor: Anchor): void {
    setPendingEdit(null);
    setPendingCreate({ startHour, endHour, anchor });
  }

  function handleSegmentClick(segment: Segment, event: MouseEvent<SVGElement>): void {
    setPendingCreate(null);
    setPendingEdit({ segment, anchor: { x: event.clientX, y: event.clientY } });
  }

  return (
    <div style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
      <ClockDial
        dial="morning"
        segments={morningSegments}
        onSegmentClick={handleSegmentClick}
        onCreateSegment={handleCreateSegment}
        pendingRange={morningPendingRange}
      />
      <ClockDial
        dial="evening"
        segments={eveningSegments}
        onSegmentClick={handleSegmentClick}
        onCreateSegment={handleCreateSegment}
        pendingRange={eveningPendingRange}
      />

      {pendingCreate && (
        <SegmentPopup
          key={`${pendingCreate.startHour}-${pendingCreate.endHour}`}
          x={pendingCreate.anchor.x}
          y={pendingCreate.anchor.y}
          onSubmit={(label) => {
            addSegment(pendingCreate.startHour, pendingCreate.endHour, label);
            setPendingCreate(null);
          }}
          onCancel={() => setPendingCreate(null)}
        />
      )}

      {pendingEdit && (
        <SegmentPopup
          key={pendingEdit.segment.id}
          x={pendingEdit.anchor.x}
          y={pendingEdit.anchor.y}
          initialLabel={pendingEdit.segment.label}
          onSubmit={(label) => {
            updateSegment(pendingEdit.segment.id, label);
            setPendingEdit(null);
          }}
          onDelete={() => {
            deleteSegment(pendingEdit.segment.id);
            setPendingEdit(null);
          }}
          onCancel={() => setPendingEdit(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Run the full test suite**

Run: `npx vitest run`
Expected: PASS, all tests green (no `DayPlanner` test needs a new case — `pendingRange` is exercised indirectly through existing create-flow behavior, and directly through `ClockDial.test.tsx`'s new Step 1 test).

- [ ] **Step 7: Stage for review**

```bash
git add src/clock/ClockDial.tsx src/clock/ClockDial.test.tsx src/clock/DayPlanner.tsx
```

Show the diff and wait for explicit go-ahead before committing.

---

### Task 5: Manual verification + design tracking docs

**Files:**
- Modify: `docs/designs/drag-preview/progress.md`
- Modify: `docs/designs/drag-preview/release-verdict.md`
- Modify: `docs/designs/drag-preview/session-state.md`

**Interfaces:** none — this task is verification and record-keeping only, no source changes.

- [ ] **Step 1: Run the full validation suite**

Run: `bash scripts/validate.sh`
Expected: type check, lint, all tests (across every file from Tasks 1–4, plus the pre-existing suite), and build all pass.

- [ ] **Step 2: Manual browser verification**

Per `docs/agent-rules/verification.md`, drag interactions are not meaningfully unit-testable and must be exercised in a real browser:

```bash
npm run dev
```

Open the dev server URL and confirm, on both dials:

1. Dragging from one hour tick to another shows a dashed light-blue wedge that visibly starts and ends exactly at hour ticks, growing/shrinking live as the pointer moves (Lock 1).
2. A floating label showing the range (e.g. "1pm – 2pm") tracks the wedge and updates live as you drag.
3. Clicking without dragging (pointer down and up on the same hour) shows no wedge and no label at any point (Lock 2).
4. Dragging across the entire evening dial (12pm all the way around back to 12am) shows a dashed ring rather than a collapsed/invisible shape, labeled "12pm – 12am" (Lock 3).
5. Releasing a valid drag keeps the same wedge and label visible while the label popup is open, and both disappear only when you submit, cancel, or delete — not at the moment of release (Lock 4).
6. Dragging backward (e.g. from 3pm to 1pm) still produces a correct, non-inverted preview.
7. Clicking an existing saved segment to edit it behaves exactly as before — no frozen wedge preview appears for it (only its own saved-color arc, unchanged).

Report each check as PASS/FAIL/UNVERIFIED per `docs/agent-rules/verification.md` — do not report this task done on the basis of the automated tests alone.

- [ ] **Step 3: Update design tracking docs**

Update `docs/designs/drag-preview/progress.md`, `docs/designs/drag-preview/session-state.md`, and `docs/designs/drag-preview/release-verdict.md` with the outcome of Step 1 and Step 2 (PASS/FAIL/UNVERIFIED per check, per `docs/agent-rules/verification.md`'s three-state verdict format).

- [ ] **Step 4: Stage for review**

```bash
git add docs/designs/drag-preview/progress.md docs/designs/drag-preview/release-verdict.md docs/designs/drag-preview/session-state.md
```

Show the diff and wait for explicit go-ahead before committing.
