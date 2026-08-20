export function hourLabel(hour: number): string {
  const displayHour = hour === 24 ? 12 : hour > 12 ? hour - 12 : hour;
  return String(displayHour);
}

function amPmSuffix(hour: number): 'am' | 'pm' {
  if (hour === 24) return 'am';
  if (hour === 12) return 'pm';
  return hour < 12 ? 'am' : 'pm';
}

export function formatHourRangeLabel(startHour: number, endHour: number): string {
  return `${hourLabel(startHour)}${amPmSuffix(startHour)} – ${hourLabel(endHour)}${amPmSuffix(endHour)}`;
}
