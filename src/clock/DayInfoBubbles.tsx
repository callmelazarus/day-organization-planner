import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { formatFullDate, formatTimeInZone, formatZoneAbbreviation } from './dayInfo';
import { DEFAULT_TIMEZONE, POPULAR_TIMEZONES } from './timezones';

export interface DayInfoBubblesProps {
  now: Date;
}

export const EASTERN_BUBBLE_TIMEZONE_STORAGE_KEY = 'circular-clock-mvp:eastern-bubble-timezone';

const BUBBLE_STYLE = {
  border: '1px solid #3a3a3a',
  borderRadius: 999,
  padding: '6px 14px',
  fontSize: '0.85rem',
  fontWeight: 500,
  fontFamily: 'inherit',
  backgroundColor: '#1a1a1a',
  color: '#fff',
};

const BUBBLE_BUTTON_STYLE = {
  ...BUBBLE_STYLE,
  appearance: 'none' as const,
  cursor: 'pointer',
};

function loadEasternBubbleTimezone(): string {
  return localStorage.getItem(EASTERN_BUBBLE_TIMEZONE_STORAGE_KEY) ?? DEFAULT_TIMEZONE.timeZone;
}

export function DayInfoBubbles({ now }: DayInfoBubblesProps): ReactElement {
  const [timeZone, setTimeZone] = useState(loadEasternBubbleTimezone);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  function handleSelect(selectedTimeZone: string): void {
    setTimeZone(selectedTimeZone);
    localStorage.setItem(EASTERN_BUBBLE_TIMEZONE_STORAGE_KEY, selectedTimeZone);
    setIsOpen(false);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={BUBBLE_STYLE}>{formatTimeInZone(now, 'America/Los_Angeles')} PST</span>
      <span style={BUBBLE_STYLE}>{formatFullDate(now)}</span>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <button type="button" style={BUBBLE_BUTTON_STYLE} onClick={() => setIsOpen((open) => !open)}>
          {formatTimeInZone(now, timeZone)} {formatZoneAbbreviation(now, timeZone)} ▾
        </button>
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: 6,
              borderRadius: 10,
              border: '1px solid #3a3a3a',
              backgroundColor: '#1a1a1a',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              zIndex: 10,
            }}
          >
            {POPULAR_TIMEZONES.map((option) => (
              <button
                key={option.timeZone}
                type="button"
                onClick={() => handleSelect(option.timeZone)}
                style={{
                  appearance: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  fontWeight: option.timeZone === timeZone ? 700 : 500,
                  fontFamily: 'inherit',
                  backgroundColor: option.timeZone === timeZone ? '#3a3a3a' : 'transparent',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}
              >
                {option.city}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
