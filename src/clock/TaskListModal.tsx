import { useEffect } from 'react';
import type { ReactElement } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { formatHourRangeLabel } from './hourLabel';
import type { Segment } from './types';

export interface TaskListModalProps {
  segments: Segment[];
  onClose: () => void;
}

export function TaskListModal({ segments, onClose }: TaskListModalProps): ReactElement {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sortedSegments = [...segments].sort((a, b) => a.startHour - b.startHour);

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
        aria-label="All tasks"
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
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>All tasks</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ backgroundColor: '#9e9e9e', color: '#1a1a1a' }}
          >
            Close
          </button>
        </div>

        {sortedSegments.length === 0 ? (
          <p style={{ margin: 0 }}>No tasks planned yet</p>
        ) : (
          <table style={{ borderCollapse: 'collapse' }}>
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
      </div>
    </div>
  );
}
