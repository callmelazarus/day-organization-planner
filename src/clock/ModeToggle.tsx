import type { ReactElement } from 'react';
import type { Mode } from './types';

export interface ModeToggleProps {
  mode: Mode;
  onToggle: () => void;
}

const ACTIVE_BG = '#1f9e9e';
const ACTIVE_TEXT = '#e7fbf8';
const INACTIVE_TEXT = '#999';

export function ModeToggle({ mode, onToggle }: ModeToggleProps): ReactElement {
  const isWeek = mode === 'week';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isWeek}
      aria-label="Toggle between single-day and week planning mode"
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        border: '1px solid #3a3a3a',
        borderRadius: 999,
        backgroundColor: '#1a1a1a',
        padding: 3,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span
        style={{
          padding: '7px 14px',
          borderRadius: 999,
          fontSize: '0.85rem',
          fontWeight: 500,
          backgroundColor: isWeek ? 'transparent' : ACTIVE_BG,
          color: isWeek ? INACTIVE_TEXT : ACTIVE_TEXT,
        }}
      >
        Day
      </span>
      <span
        style={{
          padding: '7px 14px',
          borderRadius: 999,
          fontSize: '0.85rem',
          fontWeight: 500,
          backgroundColor: isWeek ? ACTIVE_BG : 'transparent',
          color: isWeek ? ACTIVE_TEXT : INACTIVE_TEXT,
        }}
      >
        Week
      </span>
    </button>
  );
}
