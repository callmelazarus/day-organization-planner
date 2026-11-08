import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AvatarPickerModal } from './AvatarPickerModal';

describe('AvatarPickerModal', () => {
  afterEach(() => {
    cleanup();
  });

  function setup(selectedId: 'guy' | 'gal' | 'ninja' = 'guy') {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<AvatarPickerModal selectedId={selectedId} onSelect={onSelect} onClose={onClose} />);
    return { onSelect, onClose };
  }

  test('offers the three avatars', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'Choose your avatar' })).toBeInTheDocument();
    ['Guy', 'Gal', 'Ninja'].forEach((label) => {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument();
    });
  });

  test('marks the current avatar as checked', () => {
    setup('gal');
    expect(screen.getByRole('radio', { name: 'Gal' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Guy' })).toHaveAttribute('aria-checked', 'false');
  });

  test('selecting an avatar calls onSelect with its id', () => {
    const { onSelect } = setup();
    fireEvent.click(screen.getByRole('radio', { name: 'Ninja' }));
    expect(onSelect).toHaveBeenCalledWith('ninja');
  });

  test('closes via the Close button', () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('closes when clicking outside the card', () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not close when clicking inside the card', () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole('heading', { name: 'Choose your avatar' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  test('closes on Escape', () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
