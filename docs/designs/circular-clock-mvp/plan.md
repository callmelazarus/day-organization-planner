# Circular Clock MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the single-day circular day planner — two SVG clock dials (Morning 6am–12pm, Evening 12pm–12am) where the user drags to create hour segments, labels them via a popup, and sees them persist across reloads.

**Architecture:** Two side-by-side SVG dials rendered by a shared `ClockDial` component (configured by `dial: 'morning' | 'evening'`), a `useSegments` hook owning a single `Segment[]` persisted to `localStorage`, and a `SegmentPopup` for create/edit/delete. All geometry (angle↔hour conversion, SVG arc paths) lives in pure, unit-tested functions.

**Tech Stack:** TypeScript, React 19, Vite 6, Vitest + @testing-library/react + jsdom for tests.

## Global Constraints

- Follow `docs/agent-rules/conventions.md`: camelCase vars/functions, PascalCase types/components, explicit return types on all exported functions and components, no `any`, tests co-located with source.
- `scripts/validate.sh` (type check, lint, test, build) must pass before any task is considered done — per `CLAUDE.md`'s verification gate.
- Respect `docs/designs/circular-clock-mvp/behavior-locks.md` — Locks 1–4 (Morning/Evening hour mapping, render-order overlap resolution, localStorage persistence) are non-negotiable invariants covered by this plan's tests.
- Commit protocol (`CLAUDE.md`): stage each task's changes and get the user's explicit go-ahead — reviewed via their IDE's Source Control diff — before running `git commit`. Do not commit automatically just because a step says "Commit."
- All new application code lives under `src/clock/` (domain-named directory, per conventions — no `utils/`/`common/` dumping ground).
- Directory does not have network calls or a backend; do not add any.

---

### Task 1: Test infrastructure + geometry math

**Files:**
- Modify: `package.json` (add devDependencies)
- Modify: `vite.config.ts`
- Create: `src/test-setup.ts`
- Create: `src/clock/types.ts`
- Create: `src/clock/geometry.ts`
- Test: `src/clock/geometry.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `Segment` and `DialType` types (`src/clock/types.ts`); `angleToHour(dial: DialType, angleDeg: number): number | null`, `hourToAngle(dial: DialType, hour: number): number`, `buildArcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngleDeg: number, endAngleDeg: number): string` (`src/clock/geometry.ts`) — all later tasks import these.

- [ ] **Step 1: Install test dependencies**

Run:
```bash
npm install -D jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Configure Vitest for jsdom**

Replace the contents of `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Create `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Create the shared types**

Create `src/clock/types.ts`:

```ts
export type DialType = 'morning' | 'evening';

export interface Segment {
  id: string;
  startHour: number;
  endHour: number;
  label: string;
  fill: string;
  textColor: string;
}
```

- [ ] **Step 4: Write the failing geometry tests**

Create `src/clock/geometry.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { angleToHour, hourToAngle, buildArcPath } from './geometry';

describe('angleToHour', () => {
  test('morning dial maps the used half correctly', () => {
    expect(angleToHour('morning', 180)).toBe(6);
    expect(angleToHour('morning', 270)).toBe(9);
    expect(angleToHour('morning', 360)).toBe(12);
    expect(angleToHour('morning', 0)).toBe(12);
  });

  test('morning dial returns null for the unused half', () => {
    expect(angleToHour('morning', 90)).toBeNull();
    expect(angleToHour('morning', 179)).toBeNull();
  });

  test('evening dial maps the full circle', () => {
    expect(angleToHour('evening', 0)).toBe(12);
    expect(angleToHour('evening', 180)).toBe(18);
    expect(angleToHour('evening', 270)).toBe(21);
  });
});

describe('hourToAngle', () => {
  test('morning dial', () => {
    expect(hourToAngle('morning', 6)).toBe(180);
    expect(hourToAngle('morning', 9)).toBe(270);
    expect(hourToAngle('morning', 12)).toBe(360);
  });

  test('evening dial', () => {
    expect(hourToAngle('evening', 12)).toBe(0);
    expect(hourToAngle('evening', 18)).toBe(180);
    expect(hourToAngle('evening', 24)).toBe(360);
  });
});

describe('buildArcPath', () => {
  test('builds a quarter-circle donut slice', () => {
    const path = buildArcPath(200, 200, 50, 100, 0, 90);
    expect(path).toBe('M 200 100 A 100 100 0 0 1 300 200 L 250 200 A 50 50 0 0 0 200 150 Z');
  });

  test('uses the large-arc flag for spans over 180deg', () => {
    const path = buildArcPath(200, 200, 50, 100, 0, 200);
    expect(path).toContain('A 100 100 0 1 1');
  });

  test('uses the small-arc flag for spans under 180deg', () => {
    const path = buildArcPath(200, 200, 50, 100, 0, 90);
    expect(path).toContain('A 100 100 0 0 1');
  });
});
```

- [ ] **Step 5: Run the tests and verify they fail**

Run: `npx vitest run src/clock/geometry.test.ts`
Expected: FAIL with "Cannot find module './geometry'" (or similar — the module doesn't exist yet).

- [ ] **Step 6: Implement the geometry module**

Create `src/clock/geometry.ts`:

```ts
import type { DialType } from './types';

export function angleToHour(dial: DialType, angleDeg: number): number | null {
  const normalized = ((angleDeg % 360) + 360) % 360;

  if (dial === 'morning') {
    const effective = normalized === 0 ? 360 : normalized;
    if (effective < 180) return null;
    return 6 + (effective - 180) / 30;
  }

  return 12 + normalized / 30;
}

export function hourToAngle(dial: DialType, hour: number): number {
  if (dial === 'morning') {
    return 180 + (hour - 6) * 30;
  }
  return (hour - 12) * 30;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: round(cx + radius * Math.cos(angleRad)),
    y: round(cy + radius * Math.sin(angleRad)),
  };
}

export function buildArcPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngleDeg);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngleDeg);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngleDeg);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngleDeg);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}
```

- [ ] **Step 7: Run the tests and verify they pass**

Run: `npx vitest run src/clock/geometry.test.ts`
Expected: PASS, all 8 assertions across the 3 describe blocks green.

- [ ] **Step 8: Stage for review**

```bash
git add package.json package-lock.json vite.config.ts src/test-setup.ts src/clock/types.ts src/clock/geometry.ts src/clock/geometry.test.ts
```

Show the diff to the user (Source Control tab) and wait for explicit go-ahead before running `git commit`.

---

### Task 2: Pastel color generation

**Files:**
- Create: `src/clock/pastelColor.ts`
- Test: `src/clock/pastelColor.test.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `PastelColor` type and `generatePastelColor(randomFn?: () => number): PastelColor` (`src/clock/pastelColor.ts`) — consumed by `useSegments` in Task 3.

- [ ] **Step 1: Write the failing test**

Create `src/clock/pastelColor.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { generatePastelColor } from './pastelColor';

describe('generatePastelColor', () => {
  test('derives fill and text color from the same hue', () => {
    const color = generatePastelColor(() => 0.5);
    expect(color.fill).toBe('hsl(180, 70%, 85%)');
    expect(color.textColor).toBe('hsl(180, 70%, 30%)');
  });

  test('spans the full hue range based on the random input', () => {
    expect(generatePastelColor(() => 0).fill).toBe('hsl(0, 70%, 85%)');
    expect(generatePastelColor(() => 0.9999).fill).toBe('hsl(359, 70%, 85%)');
  });

  test('text color is a darker lightness than the fill at the same hue', () => {
    const color = generatePastelColor(() => 0.2);
    expect(color.fill).toContain('85%');
    expect(color.textColor).toContain('30%');
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/clock/pastelColor.test.ts`
Expected: FAIL with "Cannot find module './pastelColor'"

- [ ] **Step 3: Implement pastelColor.ts**

Create `src/clock/pastelColor.ts`:

```ts
export interface PastelColor {
  fill: string;
  textColor: string;
}

export function generatePastelColor(randomFn: () => number = Math.random): PastelColor {
  const hue = Math.floor(randomFn() * 360);
  return {
    fill: `hsl(${hue}, 70%, 85%)`,
    textColor: `hsl(${hue}, 70%, 30%)`,
  };
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npx vitest run src/clock/pastelColor.test.ts`
Expected: PASS, all 3 tests green.

- [ ] **Step 5: Stage for review**

```bash
git add src/clock/pastelColor.ts src/clock/pastelColor.test.ts
```

Show the diff and wait for explicit go-ahead before committing.

---

### Task 3: useSegments hook (state + localStorage)

**Files:**
- Create: `src/clock/useSegments.ts`
- Test: `src/clock/useSegments.test.ts`

**Interfaces:**
- Consumes: `Segment` (`src/clock/types.ts`), `generatePastelColor` (`src/clock/pastelColor.ts`)
- Produces: `UseSegmentsResult` type and `useSegments(): UseSegmentsResult` where `UseSegmentsResult = { segments: Segment[], addSegment: (startHour: number, endHour: number, label: string) => void, updateSegment: (id: string, label: string) => void, deleteSegment: (id: string) => void }` — consumed by `DayPlanner` in Task 7.

- [ ] **Step 1: Write the failing tests**

Create `src/clock/useSegments.test.ts`:

```ts
import { describe, expect, test, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSegments } from './useSegments';

describe('useSegments', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('starts empty when nothing is persisted', () => {
    const { result } = renderHook(() => useSegments());
    expect(result.current.segments).toEqual([]);
  });

  test('addSegment appends a new segment with a pastel color', () => {
    const { result } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 7, 'Gym');
    });

    expect(result.current.segments).toHaveLength(1);
    expect(result.current.segments[0]).toMatchObject({
      startHour: 6,
      endHour: 7,
      label: 'Gym',
    });
    expect(result.current.segments[0].fill).toMatch(/^hsl\(/);
  });

  test('newer segments are appended after older ones (renders on top)', () => {
    const { result } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 8, 'Gym');
      result.current.addSegment(7, 9, 'Podcast');
    });

    expect(result.current.segments.map((segment) => segment.label)).toEqual(['Gym', 'Podcast']);
  });

  test('updateSegment changes the label of an existing segment', () => {
    const { result } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 7, 'Gym');
    });
    const id = result.current.segments[0].id;

    act(() => {
      result.current.updateSegment(id, 'Workout');
    });

    expect(result.current.segments[0].label).toBe('Workout');
  });

  test('deleteSegment removes a segment', () => {
    const { result } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 7, 'Gym');
    });
    const id = result.current.segments[0].id;

    act(() => {
      result.current.deleteSegment(id);
    });

    expect(result.current.segments).toEqual([]);
  });

  test('persists segments to localStorage and reloads them', () => {
    const { result, unmount } = renderHook(() => useSegments());

    act(() => {
      result.current.addSegment(6, 7, 'Gym');
    });
    unmount();

    const { result: reloaded } = renderHook(() => useSegments());
    expect(reloaded.current.segments).toHaveLength(1);
    expect(reloaded.current.segments[0].label).toBe('Gym');
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npx vitest run src/clock/useSegments.test.ts`
Expected: FAIL with "Cannot find module './useSegments'"

- [ ] **Step 3: Implement useSegments.ts**

Create `src/clock/useSegments.ts`:

```ts
import { useEffect, useState } from 'react';
import { generatePastelColor } from './pastelColor';
import type { Segment } from './types';

export interface UseSegmentsResult {
  segments: Segment[];
  addSegment: (startHour: number, endHour: number, label: string) => void;
  updateSegment: (id: string, label: string) => void;
  deleteSegment: (id: string) => void;
}

const STORAGE_KEY = 'circular-clock-mvp:segments';

function loadSegments(): Segment[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Segment[];
  } catch {
    return [];
  }
}

function saveSegments(segments: Segment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
}

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `segment-${idCounter}-${Date.now()}`;
}

export function useSegments(): UseSegmentsResult {
  const [segments, setSegments] = useState<Segment[]>(() => loadSegments());

  useEffect(() => {
    saveSegments(segments);
  }, [segments]);

  function addSegment(startHour: number, endHour: number, label: string): void {
    const { fill, textColor } = generatePastelColor();
    setSegments((prev) => [
      ...prev,
      { id: generateId(), startHour, endHour, label, fill, textColor },
    ]);
  }

  function updateSegment(id: string, label: string): void {
    setSegments((prev) =>
      prev.map((segment) => (segment.id === id ? { ...segment, label } : segment))
    );
  }

  function deleteSegment(id: string): void {
    setSegments((prev) => prev.filter((segment) => segment.id !== id));
  }

  return { segments, addSegment, updateSegment, deleteSegment };
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npx vitest run src/clock/useSegments.test.ts`
Expected: PASS, all 6 tests green.

- [ ] **Step 5: Stage for review**

```bash
git add src/clock/useSegments.ts src/clock/useSegments.test.ts
```

Show the diff and wait for explicit go-ahead before committing.

---

### Task 4: SegmentArc component

**Files:**
- Create: `src/clock/SegmentArc.tsx`
- Test: `src/clock/SegmentArc.test.tsx`

**Interfaces:**
- Consumes: `Segment`, `DialType` (`src/clock/types.ts`); `buildArcPath`, `hourToAngle` (`src/clock/geometry.ts`)
- Produces: `SegmentArcProps` type and `SegmentArc(props: SegmentArcProps): ReactElement` where `SegmentArcProps = { segment: Segment, dial: DialType, cx: number, cy: number, innerRadius: number, outerRadius: number, onClick: (segment: Segment, event: MouseEvent<SVGPathElement>) => void }` — consumed by `ClockDial` in Task 6.

- [ ] **Step 1: Write the failing tests**

Create `src/clock/SegmentArc.test.tsx`:

```tsx
import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SegmentArc } from './SegmentArc';
import type { Segment } from './types';

const segment: Segment = {
  id: '1',
  startHour: 6,
  endHour: 7,
  label: 'Gym',
  fill: 'hsl(180, 70%, 85%)',
  textColor: 'hsl(180, 70%, 30%)',
};

describe('SegmentArc', () => {
  test('renders a clickable path with the segment fill color', () => {
    render(
      <svg>
        <SegmentArc
          segment={segment}
          dial="morning"
          cx={200}
          cy={200}
          innerRadius={60}
          outerRadius={150}
          onClick={() => {}}
        />
      </svg>
    );

    const path = screen.getByRole('button', { name: 'Gym' });
    expect(path).toHaveAttribute('fill', 'hsl(180, 70%, 85%)');
  });

  test('calls onClick with the segment when clicked', () => {
    const handleClick = vi.fn();
    render(
      <svg>
        <SegmentArc
          segment={segment}
          dial="morning"
          cx={200}
          cy={200}
          innerRadius={60}
          outerRadius={150}
          onClick={handleClick}
        />
      </svg>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));
    expect(handleClick).toHaveBeenCalledWith(segment, expect.anything());
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npx vitest run src/clock/SegmentArc.test.tsx`
Expected: FAIL with "Cannot find module './SegmentArc'"

- [ ] **Step 3: Implement SegmentArc.tsx**

Create `src/clock/SegmentArc.tsx`:

```tsx
import type { MouseEvent, ReactElement } from 'react';
import { buildArcPath, hourToAngle } from './geometry';
import type { DialType, Segment } from './types';

export interface SegmentArcProps {
  segment: Segment;
  dial: DialType;
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  onClick: (segment: Segment, event: MouseEvent<SVGPathElement>) => void;
}

export function SegmentArc({
  segment,
  dial,
  cx,
  cy,
  innerRadius,
  outerRadius,
  onClick,
}: SegmentArcProps): ReactElement {
  const startAngle = hourToAngle(dial, segment.startHour);
  const endAngle = hourToAngle(dial, segment.endHour);
  const path = buildArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle);

  return (
    <path
      d={path}
      fill={segment.fill}
      opacity={0.9}
      onClick={(event) => onClick(segment, event)}
      role="button"
      aria-label={segment.label}
      style={{ cursor: 'pointer' }}
    />
  );
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npx vitest run src/clock/SegmentArc.test.tsx`
Expected: PASS, both tests green.

- [ ] **Step 5: Stage for review**

```bash
git add src/clock/SegmentArc.tsx src/clock/SegmentArc.test.tsx
```

Show the diff and wait for explicit go-ahead before committing.

---

### Task 5: SegmentPopup component

**Files:**
- Create: `src/clock/SegmentPopup.tsx`
- Test: `src/clock/SegmentPopup.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure UI component)
- Produces: `SegmentPopupProps` type and `SegmentPopup(props: SegmentPopupProps): ReactElement` where `SegmentPopupProps = { x: number, y: number, initialLabel?: string, onSubmit: (label: string) => void, onDelete?: () => void, onCancel: () => void }` — consumed by `DayPlanner` in Task 7.

- [ ] **Step 1: Write the failing tests**

Create `src/clock/SegmentPopup.test.tsx`:

```tsx
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentPopup } from './SegmentPopup';

describe('SegmentPopup', () => {
  test('submits the trimmed label on save', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<SegmentPopup x={0} y={0} onSubmit={handleSubmit} onCancel={() => {}} />);

    await user.type(screen.getByPlaceholderText("What's planned?"), '  Gym  ');
    await user.click(screen.getByText('Save'));

    expect(handleSubmit).toHaveBeenCalledWith('Gym');
  });

  test('does not submit an empty label', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<SegmentPopup x={0} y={0} onSubmit={handleSubmit} onCancel={() => {}} />);

    await user.click(screen.getByText('Save'));

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    render(<SegmentPopup x={0} y={0} onSubmit={() => {}} onCancel={handleCancel} />);

    await user.click(screen.getByText('Cancel'));

    expect(handleCancel).toHaveBeenCalled();
  });

  test('pre-fills the label in edit mode and shows delete', () => {
    render(
      <SegmentPopup
        x={0}
        y={0}
        initialLabel="Gym"
        onSubmit={() => {}}
        onCancel={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByDisplayValue('Gym')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('does not show delete in create mode', () => {
    render(<SegmentPopup x={0} y={0} onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  test('calls onDelete when delete is clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();
    render(
      <SegmentPopup
        x={0}
        y={0}
        initialLabel="Gym"
        onSubmit={() => {}}
        onCancel={() => {}}
        onDelete={handleDelete}
      />
    );

    await user.click(screen.getByText('Delete'));
    expect(handleDelete).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npx vitest run src/clock/SegmentPopup.test.tsx`
Expected: FAIL with "Cannot find module './SegmentPopup'"

- [ ] **Step 3: Implement SegmentPopup.tsx**

Create `src/clock/SegmentPopup.tsx`:

```tsx
import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';

export interface SegmentPopupProps {
  x: number;
  y: number;
  initialLabel?: string;
  onSubmit: (label: string) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function SegmentPopup({
  x,
  y,
  initialLabel = '',
  onSubmit,
  onDelete,
  onCancel,
}: SegmentPopupProps): ReactElement {
  const [label, setLabel] = useState(initialLabel);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ position: 'fixed', left: x, top: y }}
      data-testid="segment-popup"
    >
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="What's planned?"
        autoFocus
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      {onDelete && (
        <button type="button" onClick={onDelete}>
          Delete
        </button>
      )}
    </form>
  );
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npx vitest run src/clock/SegmentPopup.test.tsx`
Expected: PASS, all 6 tests green.

- [ ] **Step 5: Stage for review**

```bash
git add src/clock/SegmentPopup.tsx src/clock/SegmentPopup.test.tsx
```

Show the diff and wait for explicit go-ahead before committing.

---

### Task 6: ClockDial component

**Files:**
- Create: `src/clock/ClockDial.tsx`
- Test: `src/clock/ClockDial.test.tsx`

**Interfaces:**
- Consumes: `Segment`, `DialType` (`src/clock/types.ts`); `angleToHour`, `hourToAngle`, `buildArcPath` (`src/clock/geometry.ts`); `SegmentArc` (`src/clock/SegmentArc.tsx`)
- Produces: `ClockDialProps` type and `ClockDial(props: ClockDialProps): ReactElement` where `ClockDialProps = { dial: DialType, segments: Segment[], onSegmentClick: (segment: Segment, event: MouseEvent<SVGPathElement>) => void, onCreateSegment: (startHour: number, endHour: number, anchor: { x: number; y: number }) => void }` — consumed by `DayPlanner` in Task 7.

**Note:** Per `design.md`'s Testing section, the pointer-drag interaction itself is not meaningfully unit-testable in jsdom (no real pointer capture / layout). This task's automated tests cover static rendering (tick labels, segment rendering, click forwarding) only. The drag-to-create flow is verified manually in Task 7's final step.

- [ ] **Step 1: Write the failing tests**

Create `src/clock/ClockDial.test.tsx`:

```tsx
import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClockDial } from './ClockDial';
import type { Segment } from './types';

describe('ClockDial', () => {
  test('renders standard clock hour labels for the morning dial', () => {
    render(
      <ClockDial dial="morning" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    ['6', '7', '8', '9', '10', '11', '12'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('renders all 12 hour labels for the evening dial', () => {
    render(
      <ClockDial dial="evening" segments={[]} onSegmentClick={() => {}} onCreateSegment={() => {}} />
    );

    ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  test('renders a clickable arc for each segment and forwards clicks', () => {
    const segment: Segment = {
      id: '1',
      startHour: 6,
      endHour: 7,
      label: 'Gym',
      fill: 'hsl(0, 70%, 85%)',
      textColor: 'hsl(0, 70%, 30%)',
    };
    const handleClick = vi.fn();

    render(
      <ClockDial
        dial="morning"
        segments={[segment]}
        onSegmentClick={handleClick}
        onCreateSegment={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));
    expect(handleClick).toHaveBeenCalledWith(segment, expect.anything());
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npx vitest run src/clock/ClockDial.test.tsx`
Expected: FAIL with "Cannot find module './ClockDial'"

- [ ] **Step 3: Implement ClockDial.tsx**

Create `src/clock/ClockDial.tsx`:

```tsx
import { useRef, useState } from 'react';
import type { MouseEvent, PointerEvent as ReactPointerEvent, ReactElement } from 'react';
import { angleToHour, buildArcPath, hourToAngle } from './geometry';
import { SegmentArc } from './SegmentArc';
import type { DialType, Segment } from './types';

const SIZE = 400;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 150;
const INNER_RADIUS = 60;

const MORNING_HOURS = [6, 7, 8, 9, 10, 11, 12];
const EVENING_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

function hourLabel(hour: number): string {
  const displayHour = hour === 24 ? 12 : hour > 12 ? hour - 12 : hour;
  return String(displayHour);
}

function pointerAngle(cx: number, cy: number, x: number, y: number): number {
  const angleRad = Math.atan2(y - cy, x - cx);
  const angleDeg = (angleRad * 180) / Math.PI + 90;
  return ((angleDeg % 360) + 360) % 360;
}

export interface ClockDialProps {
  dial: DialType;
  segments: Segment[];
  onSegmentClick: (segment: Segment, event: MouseEvent<SVGPathElement>) => void;
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
      <path
        d={buildArcPath(CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS, usedStartAngle, usedEndAngle)}
        fill="#555"
        opacity={0.12}
      />
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
    </svg>
  );
}
```

`onSegmentClick`'s signature matches `SegmentArc`'s `onClick` prop exactly, so it passes straight through to `<SegmentArc onClick={onSegmentClick} />` with no wrapper needed.

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npx vitest run src/clock/ClockDial.test.tsx`
Expected: PASS, all 3 tests green.

- [ ] **Step 5: Stage for review**

```bash
git add src/clock/ClockDial.tsx src/clock/ClockDial.test.tsx
```

Show the diff and wait for explicit go-ahead before committing.

---

### Task 7: DayPlanner wiring + App integration + manual verification

**Files:**
- Create: `src/clock/DayPlanner.tsx`
- Test: `src/clock/DayPlanner.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `useSegments` (`src/clock/useSegments.ts`), `ClockDial` (`src/clock/ClockDial.tsx`), `SegmentPopup` (`src/clock/SegmentPopup.tsx`), `Segment` (`src/clock/types.ts`)
- Produces: `DayPlanner(): ReactElement` — the top-level feature component, consumed by `App.tsx`.

- [ ] **Step 1: Write the failing tests**

Create `src/clock/DayPlanner.test.tsx`:

```tsx
import { describe, expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DayPlanner } from './DayPlanner';

describe('DayPlanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders both the morning and evening dials', () => {
    render(<DayPlanner />);

    expect(screen.getAllByText('12').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  test('renders a persisted segment on the correct dial', () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 6,
          endHour: 7,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);

    expect(screen.getByRole('button', { name: 'Gym' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npx vitest run src/clock/DayPlanner.test.tsx`
Expected: FAIL with "Cannot find module './DayPlanner'"

- [ ] **Step 3: Implement DayPlanner.tsx**

Create `src/clock/DayPlanner.tsx`:

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

  function handleCreateSegment(startHour: number, endHour: number, anchor: Anchor): void {
    setPendingEdit(null);
    setPendingCreate({ startHour, endHour, anchor });
  }

  function handleSegmentClick(segment: Segment, event: MouseEvent<SVGPathElement>): void {
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
      />
      <ClockDial
        dial="evening"
        segments={eveningSegments}
        onSegmentClick={handleSegmentClick}
        onCreateSegment={handleCreateSegment}
      />

      {pendingCreate && (
        <SegmentPopup
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

- [ ] **Step 4: Wire up App.tsx**

Replace the contents of `src/App.tsx`:

```tsx
import { DayPlanner } from './clock/DayPlanner';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Day Planner</h1>
      <DayPlanner />
    </div>
  );
}

export default App;
```

Replace the contents of `src/App.css` (the default Vite demo styles — logo spin, card, etc. — no longer apply to anything):

```css
.app {
  text-align: center;
  padding: 40px 20px;
}

.app h1 {
  margin-bottom: 32px;
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `npx vitest run src/clock/DayPlanner.test.tsx`
Expected: PASS, both tests green.

- [ ] **Step 6: Run the full validation suite**

Run: `bash scripts/validate.sh`
Expected: type check, lint, all tests (across every file from Tasks 1–7), and build all pass.

- [ ] **Step 7: Manual browser verification**

Per `docs/agent-rules/verification.md`, drag-to-create is not meaningfully unit-testable and must be exercised in a real browser before this task is considered done:

```bash
npm run dev
```

Open the dev server URL and confirm, on both dials:
1. Dragging across hour ticks creates a segment and opens the label popup near the release point.
2. Submitting a label colors the segment pastel and closes the popup.
3. Clicking an existing segment reopens the popup pre-filled, with a working Delete button.
4. Creating two overlapping segments shows the newer one on top, and it's the one that responds to clicks on the shared hours.
5. Reloading the page keeps all segments in place.

Report each check as PASS/FAIL/UNVERIFIED per `docs/agent-rules/verification.md` — do not report this task done on the basis of the automated tests alone.

- [ ] **Step 8: Stage for review**

```bash
git add src/clock/DayPlanner.tsx src/clock/DayPlanner.test.tsx src/App.tsx src/App.css
```

Show the diff and wait for explicit go-ahead before committing.

- [ ] **Step 9: Update design tracking docs**

Update `docs/designs/circular-clock-mvp/progress.md` and `docs/designs/circular-clock-mvp/release-verdict.md` with the outcome of Step 7's manual verification (PASS/FAIL/UNVERIFIED per check). Stage those too and wait for go-ahead before committing.
