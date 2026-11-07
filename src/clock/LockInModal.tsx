import type { ReactElement } from 'react';

export interface LockInModalProps {
  timeLabel: string;
}

const ACCENT = '#1f9e9e';
const COUNTDOWN_COLOR = '#2fd06f';

export function LockInModal({ timeLabel }: LockInModalProps): ReactElement {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lock in"
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
          Lock in
        </h1>
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
      </div>
    </div>
  );
}
