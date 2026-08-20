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
