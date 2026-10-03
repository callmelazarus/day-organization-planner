export type WeekDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export const WEEKDAYS: WeekDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export const WEEKDAY_LABELS: Record<WeekDay, string> = {
  sunday: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
};

export const WEEKDAY_FULL_LABELS: Record<WeekDay, string> = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

export function getTodayWeekday(now: Date = new Date()): WeekDay {
  return WEEKDAYS[now.getDay()];
}

export function weekdayStorageKey(day: WeekDay): string {
  return `circular-clock-mvp:week:${day}`;
}
