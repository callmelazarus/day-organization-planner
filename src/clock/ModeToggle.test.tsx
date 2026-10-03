import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ModeToggle } from './ModeToggle';

describe('ModeToggle', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders Day and Week labels', () => {
    render(<ModeToggle mode="single" onToggle={() => {}} />);
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
  });

  test('reflects single mode via aria-checked=false', () => {
    render(<ModeToggle mode="single" onToggle={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  test('reflects week mode via aria-checked=true', () => {
    render(<ModeToggle mode="week" onToggle={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  test('calls onToggle when clicked', () => {
    const handleToggle = vi.fn();
    render(<ModeToggle mode="single" onToggle={handleToggle} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(handleToggle).toHaveBeenCalled();
  });
});
