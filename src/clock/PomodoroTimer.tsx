import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { AvatarCanvas } from './avatar/AvatarCanvas';
import {
  IDLE_ANIMATIONS,
  LOCK_IN_ANIMATIONS,
  WORK_ANIMATIONS,
  randomIndex,
} from './avatar/avatarAnimations';
import { AvatarPickerModal } from './AvatarPickerModal';
import { LockInModal } from './LockInModal';
import { useAvatarChoice } from './useAvatarChoice';
import { usePomodoroTimer } from './usePomodoroTimer';
import { MOBILE_BREAKPOINT_PX, useIsMobile } from './useIsMobile';

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

export function PomodoroTimer(): ReactElement | null {
  const { remainingSeconds, isRunning, isComplete, start, pause, reset, lockIn, adjustMinutes } =
    usePomodoroTimer();
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { avatarId, setAvatarId } = useAvatarChoice();
  const [idleIndex, setIdleIndex] = useState(() => randomIndex(IDLE_ANIMATIONS.length));
  const [workIndex, setWorkIndex] = useState(() => randomIndex(WORK_ANIMATIONS.length));
  const [lockInIndex, setLockInIndex] = useState(() => randomIndex(LOCK_IN_ANIMATIONS.length));
  const isMobile = useIsMobile(MOBILE_BREAKPOINT_PX);

  useEffect(() => {
    if (!isComplete) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    new Notification('Pomodoro complete', { body: 'Your timer is up.' });
  }, [isComplete]);

  useEffect(() => {
    if (isComplete) setIdleIndex(randomIndex(IDLE_ANIMATIONS.length));
  }, [isComplete]);

  function handleLockInClick(): void {
    requestNotificationPermissionIfUndecided();
    setLockInIndex(randomIndex(LOCK_IN_ANIMATIONS.length));
    lockIn();
    setIsLockedIn(true);
  }

  function handleStartClick(): void {
    requestNotificationPermissionIfUndecided();
    setWorkIndex(randomIndex(WORK_ANIMATIONS.length));
    start();
  }

  if (isMobile) return null;

  const lockInAnimation = LOCK_IN_ANIMATIONS[lockInIndex];
  const cornerAnimation = isRunning
    ? isLockedIn
      ? lockInAnimation
      : WORK_ANIMATIONS[workIndex]
    : IDLE_ANIMATIONS[idleIndex];

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
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          aria-label="Change avatar"
          style={{ padding: 0, border: 'none', background: 'none', lineHeight: 0, cursor: 'pointer' }}
        >
          <AvatarCanvas
            animation={cornerAnimation}
            avatarId={avatarId}
            scale={3}
            title={`${cornerAnimation.description} (click to change avatar)`}
          />
        </button>
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
        <button type="button" onClick={handleLockInClick}>
          Lock in
        </button>
      </div>
      {isPickerOpen && (
        <AvatarPickerModal
          selectedId={avatarId}
          onSelect={(id) => {
            setAvatarId(id);
            setIsPickerOpen(false);
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
      {isLockedIn && (
        <LockInModal
          timeLabel={formatTime(remainingSeconds)}
          isComplete={isComplete}
          animation={lockInAnimation}
          avatarId={avatarId}
          onClose={() => setIsLockedIn(false)}
        />
      )}
    </div>
  );
}
