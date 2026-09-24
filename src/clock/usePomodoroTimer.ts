import { useEffect, useState } from 'react';

export interface UsePomodoroTimerResult {
  remainingSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

const DURATION_SECONDS = 20 * 60;

export function usePomodoroTimer(): UsePomodoroTimerResult {
  const [remainingSeconds, setRemainingSeconds] = useState(DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  function start(): void {
    if (remainingSeconds === 0) {
      setRemainingSeconds(DURATION_SECONDS);
      setIsComplete(false);
    }
    setIsRunning(true);
  }

  function pause(): void {
    setIsRunning(false);
  }

  function reset(): void {
    setIsRunning(false);
    setIsComplete(false);
    setRemainingSeconds(DURATION_SECONDS);
  }

  return { remainingSeconds, isRunning, isComplete, start, pause, reset };
}
