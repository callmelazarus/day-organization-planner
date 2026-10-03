export interface TimezoneOption {
  city: string;
  timeZone: string;
}

export const POPULAR_TIMEZONES: TimezoneOption[] = [
  { city: 'New York', timeZone: 'America/New_York' },
  { city: 'Los Angeles', timeZone: 'America/Los_Angeles' },
  { city: 'London', timeZone: 'Europe/London' },
  { city: 'Paris', timeZone: 'Europe/Paris' },
  { city: 'Tokyo', timeZone: 'Asia/Tokyo' },
  { city: 'Dubai', timeZone: 'Asia/Dubai' },
  { city: 'Sydney', timeZone: 'Australia/Sydney' },
];

export const DEFAULT_TIMEZONE: TimezoneOption = POPULAR_TIMEZONES[0];
