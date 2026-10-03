import { useEffect, useRef, useState } from 'react';

export const CROSSFADE_DURATION_MS = 160;

export interface UseCrossfadeTransitionResult {
  isFaded: boolean;
  run: (update: () => void) => void;
}

export function useCrossfadeTransition(
  durationMs: number = CROSSFADE_DURATION_MS
): UseCrossfadeTransitionResult {
  const [isFaded, setIsFaded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  function run(update: () => void): void {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    setIsFaded(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      update();
      setIsFaded(false);
    }, durationMs);
  }

  return { isFaded, run };
}
