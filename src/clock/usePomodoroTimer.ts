import { useEffect, useRef, useState } from 'react';

export interface UsePomodoroTimerResult {
  remainingSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  adjustMinutes: (deltaMinutes: number) => void;
}

const DURATION_SECONDS = 20 * 60;

export function usePomodoroTimer(): UsePomodoroTimerResult {
  const [remainingSeconds, setRemainingSeconds] = useState(DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      const msLeft = (endTimeRef.current ?? Date.now()) - Date.now();
      const secondsLeft = Math.max(0, Math.ceil(msLeft / 1000));
      setRemainingSeconds(secondsLeft);
      if (secondsLeft === 0) {
        setIsRunning(false);
        setIsComplete(true);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  function start(): void {
    const base = remainingSeconds === 0 ? DURATION_SECONDS : remainingSeconds;
    endTimeRef.current = Date.now() + base * 1000;
    setRemainingSeconds(base);
    setIsComplete(false);
    setIsRunning(true);
  }

  function pause(): void {
    setIsRunning(false);
  }

  function reset(): void {
    setIsRunning(false);
    setIsComplete(false);
    endTimeRef.current = null;
    setRemainingSeconds(DURATION_SECONDS);
  }

  function adjustMinutes(deltaMinutes: number): void {
    setRemainingSeconds((prev) => {
      const next = Math.max(0, prev + deltaMinutes * 60);
      if (next > 0) setIsComplete(false);
      return next;
    });
  }

  return { remainingSeconds, isRunning, isComplete, start, pause, reset, adjustMinutes };
}
