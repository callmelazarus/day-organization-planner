import { useEffect } from 'react';
import type { ReactElement } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';

export interface ConfirmModalProps {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps): ReactElement {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  function handleBackdropClick(event: ReactMouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) onCancel();
  }

  function handleBackdropKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
      onCancel();
    }
  }

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={message}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          padding: 24,
          borderRadius: 12,
          backgroundColor: '#d9d9d9',
          color: '#1a1a1a',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          minWidth: 280,
        }}
      >
        <p style={{ margin: 0 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ backgroundColor: '#9e9e9e', color: '#1a1a1a' }}
          >
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
