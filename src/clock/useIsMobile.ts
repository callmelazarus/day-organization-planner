import { useEffect, useState } from 'react';

export const MOBILE_BREAKPOINT_PX = 480;

export function useIsMobile(breakpointPx: number): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpointPx);

  useEffect(() => {
    function handleResize(): void {
      setIsMobile(window.innerWidth <= breakpointPx);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpointPx]);

  return isMobile;
}
