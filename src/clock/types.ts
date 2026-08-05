export type DialType = 'morning' | 'evening';

export interface Segment {
  id: string;
  startHour: number;
  endHour: number;
  label: string;
  fill: string;
  textColor: string;
}
