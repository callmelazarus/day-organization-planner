import type { ReactElement } from 'react';

export interface NotesToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const TOGGLE_COLOR = '#1f9e9e';
const TOGGLE_TEXT_COLOR = '#e7fbf8';

export function NotesToggle({ isOpen, onToggle }: NotesToggleProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="notes-panel"
      aria-label="Toggle notes panel"
      title="Toggle notes panel"
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '1px solid #3a3a3a',
        backgroundColor: TOGGLE_COLOR,
        color: TOGGLE_TEXT_COLOR,
        fontSize: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        opacity: isOpen ? 1 : 0.75,
      }}
    >
      📝
    </button>
  );
}
