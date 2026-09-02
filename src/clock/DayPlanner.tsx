import { useRef, useState } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import { ClockDial } from './ClockDial';
import { ConfirmModal } from './ConfirmModal';
import { SegmentPopup } from './SegmentPopup';
import { TaskListModal } from './TaskListModal';
import { TodoList } from './TodoList';
import { downloadDialsSnapshot } from './exportSnapshot';
import { useSegments } from './useSegments';
import { useTodos } from './useTodos';
import type { Segment } from './types';

const DAYTIME_LABEL = '☀️ Day';
const NIGHTTIME_LABEL = '🌙 Night';

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
  const { segments, addSegment, updateSegment, deleteSegment, clearSegments } = useSegments();
  const { todos, addTodo, deleteTodo, toggleStar } = useTodos();
  const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const dialsRowRef = useRef<HTMLDivElement>(null);

  const daytimeSegments = segments.filter(
    (segment) => segment.startHour >= 7 && segment.startHour < 18
  );
  const nighttimeSegments = segments.filter((segment) => segment.startHour >= 18);

  const daytimePendingRange =
    pendingCreate && pendingCreate.startHour >= 7 && pendingCreate.startHour < 18
      ? { startHour: pendingCreate.startHour, endHour: pendingCreate.endHour }
      : null;
  const nighttimePendingRange =
    pendingCreate && pendingCreate.startHour >= 18
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

  function handleClear(): void {
    setIsClearConfirmOpen(true);
  }

  function handleDownload(): void {
    const svgs = dialsRowRef.current?.querySelectorAll('svg');
    if (!svgs || svgs.length < 2) return;
    downloadDialsSnapshot(Array.from(svgs), [DAYTIME_LABEL, NIGHTTIME_LABEL]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div ref={dialsRowRef} style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <ClockDial
            dial="daytime"
            segments={daytimeSegments}
            onSegmentClick={handleSegmentClick}
            onCreateSegment={handleCreateSegment}
            pendingRange={daytimePendingRange}
          />
          <span style={{ fontSize: 20 }}>{DAYTIME_LABEL}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <ClockDial
            dial="nighttime"
            segments={nighttimeSegments}
            onSegmentClick={handleSegmentClick}
            onCreateSegment={handleCreateSegment}
            pendingRange={nighttimePendingRange}
          />
          <span style={{ fontSize: 20 }}>{NIGHTTIME_LABEL}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={handleDownload}>
          Download image
        </button>
        <button type="button" onClick={() => setIsTaskListOpen(true)}>
          View all tasks
        </button>
        <button type="button" onClick={handleClear}>
          Clear
        </button>
      </div>

      <TodoList todos={todos} onAdd={addTodo} onDelete={deleteTodo} onToggleStar={toggleStar} />

      {isTaskListOpen && (
        <TaskListModal segments={segments} onClose={() => setIsTaskListOpen(false)} />
      )}

      {isClearConfirmOpen && (
        <ConfirmModal
          message="Clear all tasks?"
          confirmLabel="Clear"
          onConfirm={() => {
            clearSegments();
            setIsClearConfirmOpen(false);
          }}
          onCancel={() => setIsClearConfirmOpen(false)}
        />
      )}

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
