export function getFractionalHour(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}
