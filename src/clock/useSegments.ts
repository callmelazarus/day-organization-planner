import { useEffect, useState } from 'react';
import { generatePastelColor } from './pastelColor';
import type { Segment } from './types';

export interface UseSegmentsResult {
  segments: Segment[];
  addSegment: (startHour: number, endHour: number, label: string) => void;
  updateSegment: (id: string, label: string) => void;
  deleteSegment: (id: string) => void;
  clearSegments: () => void;
}

export const SEGMENTS_STORAGE_KEY = 'circular-clock-mvp:segments';

function loadSegments(storageKey: string): Segment[] {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Segment[]) : [];
  } catch {
    return [];
  }
}

function saveSegments(storageKey: string, segments: Segment[]): void {
  localStorage.setItem(storageKey, JSON.stringify(segments));
}

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `segment-${idCounter}-${Date.now()}`;
}

export function useSegments(storageKey: string = SEGMENTS_STORAGE_KEY): UseSegmentsResult {
  const [segments, setSegments] = useState<Segment[]>(() => loadSegments(storageKey));

  useEffect(() => {
    if (segments.length === 0 && !localStorage.getItem(storageKey)) {
      return;
    }
    saveSegments(storageKey, segments);
  }, [storageKey, segments]);

  function addSegment(startHour: number, endHour: number, label: string): void {
    const { fill, textColor } = generatePastelColor();
    setSegments((prev) => [
      ...prev,
      { id: generateId(), startHour, endHour, label, fill, textColor },
    ]);
  }

  function updateSegment(id: string, label: string): void {
    setSegments((prev) => {
      const target = prev.find((segment) => segment.id === id);
      if (!target) return prev;
      return [...prev.filter((segment) => segment.id !== id), { ...target, label }];
    });
  }

  function deleteSegment(id: string): void {
    setSegments((prev) => prev.filter((segment) => segment.id !== id));
  }

  function clearSegments(): void {
    setSegments([]);
  }

  return { segments, addSegment, updateSegment, deleteSegment, clearSegments };
}
