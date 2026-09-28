export function hourLabel(hour: number): string {
  const wholeHour = Math.floor(hour);
  const displayHour = wholeHour === 24 ? 12 : wholeHour > 12 ? wholeHour - 12 : wholeHour;
  const minutesSuffix = hour % 1 === 0.5 ? ':30' : '';
  return `${displayHour}${minutesSuffix}`;
}

function amPmSuffix(hour: number): 'am' | 'pm' {
  if (hour === 24) return 'am';
  if (hour === 12) return 'pm';
  return hour < 12 ? 'am' : 'pm';
}

export function formatHourRangeLabel(startHour: number, endHour: number): string {
  return `${hourLabel(startHour)}${amPmSuffix(startHour)} – ${hourLabel(endHour)}${amPmSuffix(endHour)}`;
}
