import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CurrentTimeToggle } from './CurrentTimeToggle';

describe('CurrentTimeToggle', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders a clock emoji', () => {
    render(<CurrentTimeToggle isOn={false} onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('🕐');
  });

  test('reflects the off state via aria-pressed', () => {
    render(<CurrentTimeToggle isOn={false} onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  test('reflects the on state via aria-pressed', () => {
    render(<CurrentTimeToggle isOn={true} onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test('calls onToggle when clicked', () => {
    const handleToggle = vi.fn();
    render(<CurrentTimeToggle isOn={false} onToggle={handleToggle} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleToggle).toHaveBeenCalled();
  });

  test('has an accessible label describing its purpose', () => {
    render(<CurrentTimeToggle isOn={false} onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: /current time/i })).toBeInTheDocument();
  });
});
