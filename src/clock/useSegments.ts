import { useEffect, useState } from 'react';
import { generatePastelColor } from './pastelColor';
import type { Segment } from './types';

export interface UseSegmentsResult {
  segments: Segment[];
  addSegment: (startHour: number, endHour: number, label: string) => void;
  updateSegment: (id: string, label: string) => void;
  deleteSegment: (id: string) => void;
}

const STORAGE_KEY = 'circular-clock-mvp:segments';

function loadSegments(): Segment[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Segment[]) : [];
  } catch {
    return [];
  }
}

function saveSegments(segments: Segment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
}

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `segment-${idCounter}-${Date.now()}`;
}

export function useSegments(): UseSegmentsResult {
  const [segments, setSegments] = useState<Segment[]>(() => loadSegments());

  useEffect(() => {
    saveSegments(segments);
  }, [segments]);

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

  return { segments, addSegment, updateSegment, deleteSegment };
}
