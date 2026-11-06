import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NotesPanel } from './NotesPanel';

describe('NotesPanel', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows the current notes in the textarea', () => {
    render(<NotesPanel isOpen={true} notes="hello" onChange={() => {}} onOpen={() => {}} />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('hello');
  });

  test('calls onChange as the user types', () => {
    const handleChange = vi.fn();
    render(<NotesPanel isOpen={true} notes="" onChange={handleChange} onOpen={() => {}} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Notes' }), {
      target: { value: 'new thought' },
    });

    expect(handleChange).toHaveBeenCalledWith('new thought');
  });

  test('has no peek tab while open', () => {
    render(<NotesPanel isOpen={true} notes="" onChange={() => {}} onOpen={() => {}} />);
    expect(screen.queryByRole('button', { name: /open notes panel/i })).not.toBeInTheDocument();
  });

  test('shows a peek tab while closed that opens the panel when clicked', () => {
    const handleOpen = vi.fn();
    render(<NotesPanel isOpen={false} notes="" onChange={() => {}} onOpen={handleOpen} />);

    fireEvent.click(screen.getByRole('button', { name: /open notes panel/i }));

    expect(handleOpen).toHaveBeenCalled();
  });
});
