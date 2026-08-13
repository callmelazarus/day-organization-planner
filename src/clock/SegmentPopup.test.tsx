import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentPopup } from './SegmentPopup';

describe('SegmentPopup', () => {
  afterEach(() => {
    cleanup();
  });

  test('submits the trimmed label on save', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<SegmentPopup x={0} y={0} onSubmit={handleSubmit} onCancel={() => {}} />);

    await user.type(screen.getByPlaceholderText("What's planned?"), '  Gym  ');
    await user.click(screen.getByText('Save'));

    expect(handleSubmit).toHaveBeenCalledWith('Gym');
  });

  test('does not submit an empty label', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<SegmentPopup x={0} y={0} onSubmit={handleSubmit} onCancel={() => {}} />);

    await user.click(screen.getByText('Save'));

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    render(<SegmentPopup x={0} y={0} onSubmit={() => {}} onCancel={handleCancel} />);

    await user.click(screen.getByText('Cancel'));

    expect(handleCancel).toHaveBeenCalled();
  });

  test('pre-fills the label in edit mode and shows delete', () => {
    render(
      <SegmentPopup
        x={0}
        y={0}
        initialLabel="Gym"
        onSubmit={() => {}}
        onCancel={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByDisplayValue('Gym')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('does not show delete in create mode', () => {
    render(<SegmentPopup x={0} y={0} onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  test('calls onDelete when delete is clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();
    render(
      <SegmentPopup
        x={0}
        y={0}
        initialLabel="Gym"
        onSubmit={() => {}}
        onCancel={() => {}}
        onDelete={handleDelete}
      />
    );

    await user.click(screen.getByText('Delete'));
    expect(handleDelete).toHaveBeenCalled();
  });
});
