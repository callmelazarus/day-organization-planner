import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NotesToggle } from './NotesToggle';

describe('NotesToggle', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders a notepad emoji', () => {
    render(<NotesToggle isOpen={false} onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('📝');
  });

  test('reflects the open state via aria-expanded', () => {
    const { rerender } = render(<NotesToggle isOpen={false} onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    rerender(<NotesToggle isOpen={true} onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  test('calls onToggle when clicked', () => {
    const handleToggle = vi.fn();
    render(<NotesToggle isOpen={false} onToggle={handleToggle} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleToggle).toHaveBeenCalled();
  });

  test('has an accessible label describing its purpose', () => {
    render(<NotesToggle isOpen={false} onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: /notes/i })).toBeInTheDocument();
  });
});
