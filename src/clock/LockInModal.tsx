import { createPortal } from 'react-dom';
import type { MouseEvent, ReactElement } from 'react';
import { AvatarCanvas } from './avatar/AvatarCanvas';
import type { AvatarAnimation } from './avatar/pixelArt';

export interface LockInModalProps {
  timeLabel: string;
  isComplete: boolean;
  animation: AvatarAnimation;
  onClose: () => void;
}

const ACCENT = '#1f9e9e';
const COUNTDOWN_COLOR = '#2fd06f';

export function LockInModal({ timeLabel, isComplete, animation, onClose }: LockInModalProps): ReactElement {
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>): void {
    if (isComplete && event.target === event.currentTarget) onClose();
  }

  // Portaled to <body> so its z-index isn't trapped inside the timer's stacking context.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lock in"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      }}
    >
      <div
        style={{
          width: 'min(520px, 92vw)',
          boxSizing: 'border-box',
          padding: '28px 28px 32px',
          textAlign: 'center',
          backgroundColor: '#1a1a1a',
          border: '1px solid #3a3a3a',
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        }}
      >
        <h1
          style={{
            margin: '0 0 20px',
            fontSize: '4rem',
            lineHeight: 1,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: ACCENT,
          }}
        >
          {isComplete ? 'Well done. Keep going.' : 'Lock in'}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <AvatarCanvas animation={animation} scale={8} />
        </div>
        {isComplete ? (
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 22px',
              border: '1px solid #3a3a3a',
              borderRadius: 999,
              backgroundColor: 'transparent',
              color: '#bbb',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        ) : (
          <div
            style={{
              fontSize: '6rem',
              lineHeight: 1,
              fontWeight: 600,
              color: COUNTDOWN_COLOR,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            }}
          >
            {timeLabel}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
