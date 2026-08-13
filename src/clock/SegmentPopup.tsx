import { useState } from 'react';
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

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ position: 'fixed', left: x, top: y }}
      data-testid="segment-popup"
    >
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="What's planned?"
        autoFocus
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      {onDelete && (
        <button type="button" onClick={onDelete}>
          Delete
        </button>
      )}
    </form>
  );
}
