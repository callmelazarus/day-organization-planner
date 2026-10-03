import { useEffect } from 'react';
import type { ReactElement } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { formatHourRangeLabel } from './hourLabel';
import { WEEKDAYS, WEEKDAY_FULL_LABELS } from './weekDays';
import type { WeekDay } from './weekDays';
import type { Segment } from './types';

export interface WeekTaskListModalProps {
  segmentsByDay: Record<WeekDay, Segment[]>;
  onClose: () => void;
}

export function WeekTaskListModal({
  segmentsByDay,
  onClose,
}: WeekTaskListModalProps): ReactElement {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleBackdropClick(event: ReactMouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) onClose();
  }

  function handleBackdropKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
      onClose();
    }
  }

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="All tasks this week"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
          borderRadius: 12,
          backgroundColor: '#d9d9d9',
          color: '#1a1a1a',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          minWidth: 320,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>All tasks this week</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ backgroundColor: '#9e9e9e', color: '#1a1a1a' }}
          >
            Close
          </button>
        </div>

        {WEEKDAYS.map((day) => {
          const sortedSegments = [...segmentsByDay[day]].sort(
            (a, b) => a.startHour - b.startHour
          );
          return (
            <section key={day}>
              <h3 style={{ margin: '0 0 8px', fontSize: '1rem' }}>{WEEKDAY_FULL_LABELS[day]}</h3>
              {sortedSegments.length === 0 ? (
                <p style={{ margin: '0 0 8px' }}>No tasks planned yet</p>
              ) : (
                <table style={{ borderCollapse: 'collapse', marginBottom: 8 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '4px 16px 4px 0' }}>Time</th>
                      <th style={{ textAlign: 'left', padding: '4px 0' }}>Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSegments.map((segment) => (
                      <tr key={segment.id}>
                        <td style={{ padding: '4px 16px 4px 0', whiteSpace: 'nowrap' }}>
                          {formatHourRangeLabel(segment.startHour, segment.endHour)}
                        </td>
                        <td style={{ padding: '4px 0' }}>{segment.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
