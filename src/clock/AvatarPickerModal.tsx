import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { MouseEvent, ReactElement } from 'react';
import { AvatarCanvas } from './avatar/AvatarCanvas';
import { AVATAR_PREVIEW_ANIMATION } from './avatar/avatarPreview';
import { AVATAR_STYLES } from './avatar/avatarStyles';
import type { AvatarId } from './avatar/avatarStyles';

export interface AvatarPickerModalProps {
  selectedId: AvatarId;
  onSelect: (id: AvatarId) => void;
  onClose: () => void;
}

const ACCENT = '#1f9e9e';
const BORDER = '#3a3a3a';

export function AvatarPickerModal({ selectedId, onSelect, onClose }: AvatarPickerModalProps): ReactElement {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) onClose();
  }

  // Portaled to <body> so its z-index isn't trapped inside the timer's stacking context.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose your avatar"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      }}
    >
      <div
        style={{
          width: 'min(520px, 92vw)',
          boxSizing: 'border-box',
          padding: '24px 24px 20px',
          textAlign: 'center',
          backgroundColor: '#1a1a1a',
          border: `1px solid ${BORDER}`,
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: '1.4rem', color: ACCENT }}>Choose your avatar</h2>
        <div role="radiogroup" aria-label="Avatar" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {AVATAR_STYLES.map((style) => {
            const isSelected = style.id === selectedId;
            return (
              <button
                key={style.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={style.label}
                onClick={() => onSelect(style.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: 10,
                  backgroundColor: '#111',
                  border: `2px solid ${isSelected ? ACCENT : BORDER}`,
                  borderRadius: 12,
                  color: isSelected ? ACCENT : '#ccc',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <AvatarCanvas
                  animation={AVATAR_PREVIEW_ANIMATION}
                  avatarId={style.id}
                  scale={5}
                  title={style.label}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{style.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 18,
            padding: '8px 22px',
            border: `1px solid ${BORDER}`,
            borderRadius: 999,
            backgroundColor: 'transparent',
            color: '#bbb',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}
