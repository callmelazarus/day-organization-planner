import { describe, expect, test, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { LockInModal } from './LockInModal';

describe('LockInModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows the lock in heading and the countdown', () => {
    render(<LockInModal timeLabel="06:59" />);
    expect(screen.getByRole('dialog', { name: 'Lock in' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lock in' })).toBeInTheDocument();
    expect(screen.getByText('06:59')).toBeInTheDocument();
  });

  test('has no way to dismiss it', () => {
    render(<LockInModal timeLabel="07:00" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
