export interface TimezoneOption {
  city: string;
  timeZone: string;
}

export const POPULAR_TIMEZONES: TimezoneOption[] = [
  { city: 'Los Angeles', timeZone: 'America/Los_Angeles' },
  { city: 'New York', timeZone: 'America/New_York' },
  { city: 'London', timeZone: 'Europe/London' },
  { city: 'Paris', timeZone: 'Europe/Paris' },
  { city: 'Brussels', timeZone: 'Europe/Brussels' },
  { city: 'Dubai', timeZone: 'Asia/Dubai' },
  { city: 'Manila', timeZone: 'Asia/Manila' },
  { city: 'Tokyo', timeZone: 'Asia/Tokyo' },
];

export const DEFAULT_TIMEZONE: TimezoneOption =
  POPULAR_TIMEZONES.find((option) => option.city === 'New York') ?? POPULAR_TIMEZONES[0];
