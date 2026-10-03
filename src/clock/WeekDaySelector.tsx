import type { ReactElement } from 'react';
import { WEEKDAYS, WEEKDAY_LABELS } from './weekDays';
import type { WeekDay } from './weekDays';

export interface WeekDaySelectorProps {
  selectedDay: WeekDay;
  todayDay: WeekDay;
  onSelect: (day: WeekDay) => void;
}

export function WeekDaySelector({
  selectedDay,
  todayDay,
  onSelect,
}: WeekDaySelectorProps): ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
      {WEEKDAYS.map((day) => {
        const isSelected = day === selectedDay;
        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
            aria-pressed={isSelected}
            style={{
              border: '1px solid #3a3a3a',
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              backgroundColor: isSelected ? '#1f9e9e' : '#1a1a1a',
              color: isSelected ? '#e7fbf8' : '#999',
            }}
          >
            {WEEKDAY_LABELS[day]}
            {day === todayDay ? <span aria-hidden="true"> •</span> : null}
          </button>
        );
      })}
    </div>
  );
}
