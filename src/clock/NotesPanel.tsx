import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import { buildResearchPrompt } from './notesPrompt';

export interface NotesPanelProps {
  isOpen: boolean;
  notes: string;
  onChange: (notes: string) => void;
  onOpen: () => void;
  onClose: () => void;
}

const PEEK_WIDTH_PX = 44;
const PANEL_VERTICAL_GAP_PX = 84;
const PANEL_BG = '#1a1a1a';
const BORDER = '#3a3a3a';
const ACCENT = '#1f9e9e';
const COPIED_FEEDBACK_MS = 1500;
const TOGGLE_SELECTOR = '[aria-controls="notes-panel"]';

type CopyKind = 'plain' | 'research';

const COPY_BUTTON_BASE: CSSProperties = {
  height: 36,
  border: `1px solid ${BORDER}`,
  borderRadius: 999,
  backgroundColor: PANEL_BG,
  color: '#ccc',
  cursor: 'pointer',
  padding: 0,
  fontFamily: 'inherit',
};

export function NotesPanel({ isOpen, notes, onChange, onOpen, onClose }: NotesPanelProps): ReactElement {
  const [copied, setCopied] = useState<CopyKind | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent): void {
      const target = event.target as Element | null;
      if (panelRef.current?.contains(target)) return;
      // The toggle button handles its own click; closing here too would reopen it.
      if (target?.closest(TOGGLE_SELECTOR)) return;
      onClose();
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onClose]);

  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    []
  );

  function copyToClipboard(kind: CopyKind): void {
    const text = kind === 'research' ? buildResearchPrompt(notes) : notes;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(kind);
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => setCopied(null), COPIED_FEEDBACK_MS);
      })
      .catch((error: unknown) => {
        console.error('Failed to copy notes', error);
      });
  }

  return (
    <aside
      ref={panelRef}
      id="notes-panel"
      aria-label="Notes"
      style={{
        position: 'fixed',
        top: PANEL_VERTICAL_GAP_PX,
        bottom: PANEL_VERTICAL_GAP_PX,
        left: 0,
        zIndex: 5,
        width: '25vw',
        minWidth: 280,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
        backgroundColor: PANEL_BG,
        border: `1px solid ${BORDER}`,
        borderLeft: 'none',
        borderRadius: '0 14px 14px 0',
        boxShadow: '4px 4px 24px rgba(0, 0, 0, 0.4)',
        transform: isOpen ? 'translateX(0)' : `translateX(calc(-100% + ${PEEK_WIDTH_PX}px))`,
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: isOpen ? 'none' : 'visibility 0s 0.35s',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 600, color: ACCENT }}>
          Notes
        </h2>
        <textarea
          aria-label="Notes"
          value={notes}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Whatever's on your mind…"
          tabIndex={isOpen ? 0 : -1}
          style={{
            flex: 1,
            resize: 'none',
            backgroundColor: '#111',
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            color: 'inherit',
            font: 'inherit',
            fontSize: '0.9rem',
            padding: 12,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <button
            type="button"
            onClick={() => copyToClipboard('plain')}
            aria-label="Copy notes"
            title="Copy notes"
            tabIndex={isOpen ? 0 : -1}
            style={{ ...COPY_BUTTON_BASE, width: 36, borderRadius: '50%', fontSize: '1rem' }}
          >
            {copied === 'plain' ? '✅' : '📋'}
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard('research')}
            title="Copy notes with a research prompt for Claude"
            tabIndex={isOpen ? 0 : -1}
            style={{ ...COPY_BUTTON_BASE, padding: '0 14px', fontSize: '0.8rem' }}
          >
            {copied === 'research' ? 'copied ✓' : 'copy-research'}
          </button>
        </div>
      </div>
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open notes panel"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: PEEK_WIDTH_PX,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            border: 'none',
            borderRadius: '0 14px 14px 0',
            background: 'linear-gradient(90deg, transparent, rgba(31, 158, 158, 0.12))',
            color: '#777',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Notes
          </span>
        </button>
      )}
    </aside>
  );
}
