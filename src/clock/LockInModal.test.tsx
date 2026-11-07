import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { LockInModal } from './LockInModal';

describe('LockInModal', () => {
  afterEach(() => {
    cleanup();
  });

  describe('while counting down', () => {
    test('shows the lock in heading and the countdown', () => {
      render(<LockInModal timeLabel="06:59" isComplete={false} onClose={() => {}} />);
      expect(screen.getByRole('dialog', { name: 'Lock in' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Lock in' })).toBeInTheDocument();
      expect(screen.getByText('06:59')).toBeInTheDocument();
    });

    test('has no way to dismiss it', () => {
      const handleClose = vi.fn();
      render(<LockInModal timeLabel="07:00" isComplete={false} onClose={handleClose} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('dialog'));

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('when complete', () => {
    test('shows the well done message instead of the countdown', () => {
      render(<LockInModal timeLabel="00:00" isComplete={true} onClose={() => {}} />);
      expect(screen.getByRole('heading', { name: 'Well done. Keep going.' })).toBeInTheDocument();
      expect(screen.queryByText('00:00')).not.toBeInTheDocument();
    });

    test('closes via the Close button', () => {
      const handleClose = vi.fn();
      render(<LockInModal timeLabel="00:00" isComplete={true} onClose={handleClose} />);

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('closes when clicking outside the modal card', () => {
      const handleClose = vi.fn();
      render(<LockInModal timeLabel="00:00" isComplete={true} onClose={handleClose} />);

      fireEvent.click(screen.getByRole('dialog'));

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('does not close when clicking inside the modal card', () => {
      const handleClose = vi.fn();
      render(<LockInModal timeLabel="00:00" isComplete={true} onClose={handleClose} />);

      fireEvent.click(screen.getByRole('heading', { name: 'Well done. Keep going.' }));

      expect(handleClose).not.toHaveBeenCalled();
    });
  });
});
