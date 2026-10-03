import { useRef, useState } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import { ClockDial } from './ClockDial';
import { ConfirmModal } from './ConfirmModal';
import { CurrentTimeToggle } from './CurrentTimeToggle';
import { ModeToggle } from './ModeToggle';
import { SegmentPopup } from './SegmentPopup';
import { TaskListModal } from './TaskListModal';
import { TodoList } from './TodoList';
import { WeekDaySelector } from './WeekDaySelector';
import { WeekTaskListModal } from './WeekTaskListModal';
import { getFractionalHour } from './currentTime';
import { downloadDialsSnapshot, downloadWeekSnapshot } from './exportSnapshot';
import { useCrossfadeTransition } from './useCrossfadeTransition';
import { useCurrentTime } from './useCurrentTime';
import { useSegments } from './useSegments';
import { useTodos } from './useTodos';
import { useWeekSegments } from './useWeekSegments';
import { MOBILE_BREAKPOINT_PX, useIsMobile } from './useIsMobile';
import { WEEKDAYS, WEEKDAY_FULL_LABELS, getTodayWeekday } from './weekDays';
import type { WeekDay } from './weekDays';
import type { Mode, Segment } from './types';

const CURRENT_TIME_REFRESH_MS = 30000;

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

function noopSegmentClick(): void {}
function noopCreateSegment(): void {}

function filterDaytime(segments: Segment[]): Segment[] {
  return segments.filter((segment) => segment.startHour >= 7 && segment.startHour < 18);
}

function filterNighttime(segments: Segment[]): Segment[] {
  return segments.filter((segment) => segment.startHour >= 18);
}

export function DayPlanner(): ReactElement {
  const singleDay = useSegments();
  const week = useWeekSegments();
  const { todos, addTodo, deleteTodo, toggleStar, toggleDone, moveTodoUp, clearTodos } =
    useTodos();

  const [mode, setMode] = useState<Mode>('single');
  const [selectedDay, setSelectedDay] = useState<WeekDay>(() => getTodayWeekday());
  const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isCurrentTimeOn, setIsCurrentTimeOn] = useState(true);
  const dialsRowRef = useRef<HTMLDivElement>(null);
  const weekExportRefs = useRef<Record<WeekDay, HTMLDivElement | null>>({
    sunday: null,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  });
  const isMobile = useIsMobile(MOBILE_BREAKPOINT_PX);
  const now = useCurrentTime(CURRENT_TIME_REFRESH_MS);
  const currentHour = isCurrentTimeOn ? getFractionalHour(now) : null;
  const { isFaded, run } = useCrossfadeTransition();

  const activeSegments = mode === 'single' ? singleDay.segments : week.byDay[selectedDay];
  const daytimeSegments = filterDaytime(activeSegments);
  const nighttimeSegments = filterNighttime(activeSegments);

  const daytimePendingRange =
    pendingCreate && pendingCreate.startHour >= 7 && pendingCreate.startHour < 18
      ? { startHour: pendingCreate.startHour, endHour: pendingCreate.endHour }
      : null;
  const nighttimePendingRange =
    pendingCreate && pendingCreate.startHour >= 18
      ? { startHour: pendingCreate.startHour, endHour: pendingCreate.endHour }
      : null;

  function addActiveSegment(startHour: number, endHour: number, label: string): void {
    if (mode === 'single') singleDay.addSegment(startHour, endHour, label);
    else week.addSegment(selectedDay, startHour, endHour, label);
  }

  function updateActiveSegment(id: string, label: string): void {
    if (mode === 'single') singleDay.updateSegment(id, label);
    else week.updateSegment(selectedDay, id, label);
  }

  function deleteActiveSegment(id: string): void {
    if (mode === 'single') singleDay.deleteSegment(id);
    else week.deleteSegment(selectedDay, id);
  }

  function clearActiveSegments(): void {
    if (mode === 'single') singleDay.clearSegments();
    else week.clearDay(selectedDay);
  }

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

  function handleToggleMode(): void {
    if (isFaded) return;
    const nextMode: Mode = mode === 'single' ? 'week' : 'single';
    run(() => {
      setMode(nextMode);
      if (nextMode === 'week') setSelectedDay(getTodayWeekday());
    });
  }

  function handleSelectDay(day: WeekDay): void {
    if (isFaded) return;
    if (day === selectedDay) return;
    run(() => setSelectedDay(day));
  }

  function handleDownload(): void {
    if (mode === 'single') {
      const svgs = dialsRowRef.current?.querySelectorAll('svg');
      if (!svgs || svgs.length < 2) return;
      downloadDialsSnapshot(Array.from(svgs), [DAYTIME_LABEL, NIGHTTIME_LABEL]).catch((error) => {
        console.error('Failed to export image', error);
      });
      return;
    }

    const rows = WEEKDAYS.map((day) => {
      const container = weekExportRefs.current[day];
      const svgs = container?.querySelectorAll('svg');
      return {
        heading: WEEKDAY_FULL_LABELS[day].toUpperCase(),
        svgs: svgs ? Array.from(svgs) : [],
        dialLabels: [DAYTIME_LABEL, NIGHTTIME_LABEL],
      };
    }).filter((row) => row.svgs.length === 2);

    if (rows.length === 0) return;

    downloadWeekSnapshot(rows).catch((error) => {
      console.error('Failed to export image', error);
    });
  }

  const clearConfirmMessage =
    mode === 'single' ? 'Clear all tasks?' : `Clear ${WEEKDAY_FULL_LABELS[selectedDay]}'s tasks?`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <CurrentTimeToggle
        isOn={isCurrentTimeOn}
        onToggle={() => setIsCurrentTimeOn((prev) => !prev)}
      />
      <ModeToggle mode={mode} onToggle={handleToggleMode} />

      {mode === 'week' && (
        <WeekDaySelector
          selectedDay={selectedDay}
          todayDay={getTodayWeekday()}
          onSelect={handleSelectDay}
        />
      )}

      <div
        ref={dialsRowRef}
        data-testid="dials-row"
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          gap: isMobile ? 24 : 40,
          justifyContent: 'center',
          opacity: isFaded ? 0 : 1,
          transition: 'opacity 160ms ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <ClockDial
            dial="daytime"
            segments={daytimeSegments}
            onSegmentClick={handleSegmentClick}
            onCreateSegment={handleCreateSegment}
            pendingRange={daytimePendingRange}
            currentHour={currentHour}
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
            currentHour={currentHour}
          />
          <span style={{ fontSize: 20 }}>{NIGHTTIME_LABEL}</span>
        </div>
      </div>

      {mode === 'week' && (
        <div style={{ position: 'fixed', left: -10000, top: -10000 }} aria-hidden="true">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              ref={(el) => {
                weekExportRefs.current[day] = el;
              }}
            >
              <ClockDial
                dial="daytime"
                segments={filterDaytime(week.byDay[day])}
                onSegmentClick={noopSegmentClick}
                onCreateSegment={noopCreateSegment}
                currentHour={currentHour}
              />
              <ClockDial
                dial="nighttime"
                segments={filterNighttime(week.byDay[day])}
                onSegmentClick={noopSegmentClick}
                onCreateSegment={noopCreateSegment}
                currentHour={currentHour}
              />
            </div>
          ))}
        </div>
      )}

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
      <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>
        {mode === 'single'
          ? 'Download & View all tasks act on this single day.'
          : 'Download & View all tasks aggregate all 7 days. Clear only wipes the selected day.'}
      </p>

      <TodoList
        todos={todos}
        onAdd={addTodo}
        onDelete={deleteTodo}
        onToggleStar={toggleStar}
        onToggleDone={toggleDone}
        onMoveUp={moveTodoUp}
        onClearAll={clearTodos}
      />

      {isTaskListOpen && mode === 'single' && (
        <TaskListModal segments={singleDay.segments} onClose={() => setIsTaskListOpen(false)} />
      )}
      {isTaskListOpen && mode === 'week' && (
        <WeekTaskListModal segmentsByDay={week.byDay} onClose={() => setIsTaskListOpen(false)} />
      )}

      {isClearConfirmOpen && (
        <ConfirmModal
          message={clearConfirmMessage}
          confirmLabel="Clear"
          onConfirm={() => {
            clearActiveSegments();
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
            addActiveSegment(pendingCreate.startHour, pendingCreate.endHour, label);
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
            updateActiveSegment(pendingEdit.segment.id, label);
            setPendingEdit(null);
          }}
          onDelete={() => {
            deleteActiveSegment(pendingEdit.segment.id);
            setPendingEdit(null);
          }}
          onCancel={() => setPendingEdit(null)}
        />
      )}
    </div>
  );
}
