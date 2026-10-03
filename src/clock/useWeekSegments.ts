import { useSegments } from './useSegments';
import type { UseSegmentsResult } from './useSegments';
import type { Segment } from './types';
import { weekdayStorageKey } from './weekDays';
import type { WeekDay } from './weekDays';

export interface UseWeekSegmentsResult {
  byDay: Record<WeekDay, Segment[]>;
  addSegment: (day: WeekDay, startHour: number, endHour: number, label: string) => void;
  updateSegment: (day: WeekDay, id: string, label: string) => void;
  deleteSegment: (day: WeekDay, id: string) => void;
  clearDay: (day: WeekDay) => void;
}

export function useWeekSegments(): UseWeekSegmentsResult {
  const sunday = useSegments(weekdayStorageKey('sunday'));
  const monday = useSegments(weekdayStorageKey('monday'));
  const tuesday = useSegments(weekdayStorageKey('tuesday'));
  const wednesday = useSegments(weekdayStorageKey('wednesday'));
  const thursday = useSegments(weekdayStorageKey('thursday'));
  const friday = useSegments(weekdayStorageKey('friday'));
  const saturday = useSegments(weekdayStorageKey('saturday'));

  const perDay: Record<WeekDay, UseSegmentsResult> = {
    sunday,
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
  };

  const byDay: Record<WeekDay, Segment[]> = {
    sunday: sunday.segments,
    monday: monday.segments,
    tuesday: tuesday.segments,
    wednesday: wednesday.segments,
    thursday: thursday.segments,
    friday: friday.segments,
    saturday: saturday.segments,
  };

  function addSegment(day: WeekDay, startHour: number, endHour: number, label: string): void {
    perDay[day].addSegment(startHour, endHour, label);
  }

  function updateSegment(day: WeekDay, id: string, label: string): void {
    perDay[day].updateSegment(id, label);
  }

  function deleteSegment(day: WeekDay, id: string): void {
    perDay[day].deleteSegment(id);
  }

  function clearDay(day: WeekDay): void {
    perDay[day].clearSegments();
  }

  return { byDay, addSegment, updateSegment, deleteSegment, clearDay };
}
