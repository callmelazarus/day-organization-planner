import { describe, expect, test, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { NotesPanel } from './NotesPanel';

describe('NotesPanel', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows the current notes in the textarea', () => {
    render(<NotesPanel isOpen={true} notes="hello" onChange={() => {}} onOpen={() => {}} onClose={() => {}} />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('hello');
  });

  test('calls onChange as the user types', () => {
    const handleChange = vi.fn();
    render(<NotesPanel isOpen={true} notes="" onChange={handleChange} onOpen={() => {}} onClose={() => {}} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Notes' }), {
      target: { value: 'new thought' },
    });

    expect(handleChange).toHaveBeenCalledWith('new thought');
  });

  test('has no peek tab while open', () => {
    render(<NotesPanel isOpen={true} notes="" onChange={() => {}} onOpen={() => {}} onClose={() => {}} />);
    expect(screen.queryByRole('button', { name: /open notes panel/i })).not.toBeInTheDocument();
  });

  test('shows a peek tab while closed that opens the panel when clicked', () => {
    const handleOpen = vi.fn();
    render(<NotesPanel isOpen={false} notes="" onChange={() => {}} onOpen={handleOpen} onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /open notes panel/i }));

    expect(handleOpen).toHaveBeenCalled();
  });

  describe('click outside', () => {
    test('calls onClose when pressing outside the open panel', () => {
      const handleClose = vi.fn();
      render(<NotesPanel isOpen={true} notes="" onChange={() => {}} onOpen={() => {}} onClose={handleClose} />);

      fireEvent.pointerDown(document.body);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('does not call onClose when pressing inside the panel', () => {
      const handleClose = vi.fn();
      render(<NotesPanel isOpen={true} notes="" onChange={() => {}} onOpen={() => {}} onClose={handleClose} />);

      fireEvent.pointerDown(screen.getByRole('textbox', { name: 'Notes' }));

      expect(handleClose).not.toHaveBeenCalled();
    });

    test('does not call onClose when pressing the notes toggle', () => {
      const handleClose = vi.fn();
      render(
        <>
          <button aria-controls="notes-panel">toggle</button>
          <NotesPanel isOpen={true} notes="" onChange={() => {}} onOpen={() => {}} onClose={handleClose} />
        </>
      );

      fireEvent.pointerDown(screen.getByRole('button', { name: 'toggle' }));

      expect(handleClose).not.toHaveBeenCalled();
    });

    test('does not call onClose when the panel is already closed', () => {
      const handleClose = vi.fn();
      render(<NotesPanel isOpen={false} notes="" onChange={() => {}} onOpen={() => {}} onClose={handleClose} />);

      fireEvent.pointerDown(document.body);

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('copy buttons', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      writeText.mockClear();
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    });

    test('copy button copies just the notes', async () => {
      render(<NotesPanel isOpen={true} notes="my notes" onChange={() => {}} onOpen={() => {}} onClose={() => {}} />);

      fireEvent.click(screen.getByRole('button', { name: 'Copy notes' }));

      await waitFor(() => expect(writeText).toHaveBeenCalledWith('my notes'));
    });

    test('copy-research prepends the research prompt to the notes', async () => {
      render(<NotesPanel isOpen={true} notes="my notes" onChange={() => {}} onOpen={() => {}} onClose={() => {}} />);

      fireEvent.click(screen.getByRole('button', { name: 'copy-research' }));

      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
      const copied = writeText.mock.calls[0][0] as string;
      expect(copied).toMatch(/scratch notes/i);
      expect(copied.endsWith('my notes')).toBe(true);
    });

    test('confirms a research copy briefly', async () => {
      render(<NotesPanel isOpen={true} notes="n" onChange={() => {}} onOpen={() => {}} onClose={() => {}} />);

      fireEvent.click(screen.getByRole('button', { name: 'copy-research' }));

      expect(await screen.findByRole('button', { name: 'copied ✓' })).toBeInTheDocument();
    });
  });
});
