import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ConfirmModal } from './ConfirmModal';

describe('ConfirmModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows the message and default button labels', () => {
    render(<ConfirmModal message="Clear all tasks?" onConfirm={() => {}} onCancel={() => {}} />);

    expect(screen.getByRole('dialog', { name: 'Clear all tasks?' })).toBeInTheDocument();
    expect(screen.getByText('Clear all tasks?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('supports custom confirm/cancel labels', () => {
    render(
      <ConfirmModal
        message="Delete this segment?"
        confirmLabel="Delete"
        cancelLabel="Keep it"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
  });

  test('calls onConfirm when the confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmModal message="Clear all tasks?" onConfirm={handleConfirm} onCancel={() => {}} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(handleConfirm).toHaveBeenCalled();
  });

  test('calls onCancel when the cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal message="Clear all tasks?" onConfirm={() => {}} onCancel={handleCancel} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(handleCancel).toHaveBeenCalled();
  });

  test('calls onCancel when the backdrop is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal message="Clear all tasks?" onConfirm={() => {}} onCancel={handleCancel} />
    );

    fireEvent.click(screen.getByRole('presentation'));

    expect(handleCancel).toHaveBeenCalled();
  });

  test('does not call onCancel when the dialog card itself is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal message="Clear all tasks?" onConfirm={() => {}} onCancel={handleCancel} />
    );

    fireEvent.click(screen.getByRole('dialog'));

    expect(handleCancel).not.toHaveBeenCalled();
  });

  test('calls onCancel when Escape is pressed', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal message="Clear all tasks?" onConfirm={() => {}} onCancel={handleCancel} />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleCancel).toHaveBeenCalled();
  });
});
