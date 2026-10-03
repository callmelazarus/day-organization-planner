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
      title="Toggle Time display on clock face"
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
        opacity: isOn ? 1 : 0.75,
      }}
    >
      🕐
    </button>
  );
}
