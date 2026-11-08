import { createPortal } from 'react-dom';
import type { ReactElement } from 'react';

export interface TimerBarProps {
  isRunning: boolean;
}

const BAR_HEIGHT_PX = 5;

const KEYFRAMES = `
@keyframes timer-bar-slide { from { background-position: 0 0; } to { background-position: -200% 0; } }
@keyframes timer-bar-pulse { 0%, 100% { opacity: 0.65; } 50% { opacity: 1; } }
.timer-bar-fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #0ea5e9, #6366f1, #22d3ee, #6366f1, #0ea5e9);
  background-size: 200% 100%;
  animation: timer-bar-slide 5s linear infinite, timer-bar-pulse 3s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .timer-bar-fill { animation: none; }
}
`;

/** A thin animated bar pinned to the top of the window while a timer runs. It overlays the page, never shifts it. */
export function TimerBar({ isRunning }: TimerBarProps): ReactElement {
  // Portaled to <body> and layered above the modals so it stays visible during lock in.
  return createPortal(
    <div
      data-testid="timer-bar"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: BAR_HEIGHT_PX,
        zIndex: 60,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: isRunning ? 1 : 0,
        transition: 'opacity 0.4s',
      }}
    >
      <style>{KEYFRAMES}</style>
      <div className="timer-bar-fill" />
    </div>,
    document.body
  );
}
