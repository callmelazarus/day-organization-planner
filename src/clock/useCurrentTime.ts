import { useEffect, useState } from 'react';

export function useCurrentTime(refreshIntervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), refreshIntervalMs);
    return () => clearInterval(intervalId);
  }, [refreshIntervalMs]);

  return now;
}
