import { useEffect, useState } from 'react';

export interface UseNotesResult {
  notes: string;
  setNotes: (notes: string) => void;
}

const STORAGE_KEY = 'circular-clock-mvp:notes';

function loadNotes(): string {
  return localStorage.getItem(STORAGE_KEY) ?? '';
}

export function useNotes(): UseNotesResult {
  const [notes, setNotes] = useState<string>(() => loadNotes());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, notes);
  }, [notes]);

  return { notes, setNotes };
}
