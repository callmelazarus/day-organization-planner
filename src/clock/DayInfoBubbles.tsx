import type { ReactElement } from 'react';
import { formatFullDate, formatTimeInZone } from './dayInfo';

export interface DayInfoBubblesProps {
  now: Date;
}

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

export function DayInfoBubbles({ now }: DayInfoBubblesProps): ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={BUBBLE_STYLE}>{formatTimeInZone(now, 'America/Los_Angeles')} PST</span>
      <span style={BUBBLE_STYLE}>{formatFullDate(now)}</span>
      <span style={BUBBLE_STYLE}>{formatTimeInZone(now, 'America/New_York')} EST</span>
    </div>
  );
}
