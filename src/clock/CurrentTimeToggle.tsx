import type { ReactElement } from 'react';

export interface CurrentTimeToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

const TOGGLE_COLOR = '#1f9e9e';
const TOGGLE_TEXT_COLOR = '#e7fbf8';

export function CurrentTimeToggle({ isOn, onToggle }: CurrentTimeToggleProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isOn}
      aria-label="Toggle current time line"
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: isOn ? '2px solid #e7fbf8' : '2px solid transparent',
        backgroundColor: TOGGLE_COLOR,
        color: TOGGLE_TEXT_COLOR,
        fontSize: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        opacity: isOn ? 1 : 0.75,
        boxShadow: isOn ? '0 0 0 3px rgba(31, 158, 158, 0.35)' : 'none',
      }}
    >
      🕐
    </button>
  );
}
