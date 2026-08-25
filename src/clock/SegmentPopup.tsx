import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';

export interface SegmentPopupProps {
  x: number;
  y: number;
  initialLabel?: string;
  onSubmit: (label: string) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function SegmentPopup({
  x,
  y,
  initialLabel = '',
  onSubmit,
  onDelete,
  onCancel,
}: SegmentPopupProps): ReactElement {
  const [label, setLabel] = useState(initialLabel);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent): void {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onCancel();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onCancel]);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#d9d9d9',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        zIndex: 10,
      }}
      data-testid="segment-popup"
    >
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="What's planned?"
        autoFocus
        style={{
          width: 240,
          padding: '10px 14px',
          fontSize: '1.05rem',
          borderRadius: 8,
          border: '1px solid #aaa',
          backgroundColor: '#d9d9d9',
          color: '#1a1a1a',
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={{ backgroundColor: '#4caf6a', color: '#0d1f13' }}>
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ backgroundColor: '#9e9e9e', color: '#1a1a1a' }}
        >
          Cancel
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            style={{ backgroundColor: '#e08585', color: '#3a0d0d' }}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
