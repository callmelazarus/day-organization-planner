import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { usePomodoroTimer } from './usePomodoroTimer';

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function requestNotificationPermissionIfUndecided(): void {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') {
    void Notification.requestPermission();
  }
}

export function PomodoroTimer(): ReactElement {
  const { remainingSeconds, isRunning, isComplete, start, pause, reset, adjustMinutes } =
    usePomodoroTimer();

  useEffect(() => {
    if (!isComplete) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    new Notification('Pomodoro complete', { body: 'Your 20-minute block is up.' });
  }, [isComplete]);

  function handleStartClick(): void {
    requestNotificationPermissionIfUndecided();
    start();
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            type="button"
            onClick={() => adjustMinutes(1)}
            disabled={isRunning}
            aria-label="Add a minute"
            style={{ fontSize: '0.7rem', lineHeight: 1, padding: '2px 6px' }}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(-1)}
            disabled={isRunning || remainingSeconds === 0}
            aria-label="Subtract a minute"
            style={{ fontSize: '0.7rem', lineHeight: 1, padding: '2px 6px' }}
          >
            ▼
          </button>
        </div>
        <span
          style={{
            fontSize: '3.2em',
            color: isComplete ? 'red' : isRunning ? 'green' : '',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          }}
        >
          {formatTime(remainingSeconds)}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {isRunning ? (
          <button type="button" onClick={pause}>
            Pause
          </button>
        ) : (
          <button type="button" onClick={handleStartClick}>
            Start
          </button>
        )}
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
