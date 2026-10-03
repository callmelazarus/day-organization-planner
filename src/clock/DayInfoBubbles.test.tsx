import { describe, expect, test, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayInfoBubbles, EASTERN_BUBBLE_TIMEZONE_STORAGE_KEY } from './DayInfoBubbles';

describe('DayInfoBubbles', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test('shows the Pacific time, the full date, and the Eastern time in that order', () => {
    const now = new Date(Date.UTC(2026, 9, 3, 22, 30)); // Oct 3 2026, 22:30 UTC (EDT)

    render(<DayInfoBubbles now={now} />);

    expect(screen.getByText('3:30 PM PST')).toBeInTheDocument();
    expect(screen.getByText('Saturday October 3, 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '6:30 PM EDT ▾' })).toBeInTheDocument();

    const container = screen.getByText('3:30 PM PST').closest('div');
    const texts = Array.from(container?.children ?? []).map((el) => el.textContent);
    expect(texts).toEqual(['3:30 PM PST', 'Saturday October 3, 2026', '6:30 PM EDT ▾']);
  });

  test('clicking the Eastern bubble opens a dropdown of popular cities', async () => {
    const user = userEvent.setup();
    const now = new Date(Date.UTC(2026, 9, 3, 22, 30));
    render(<DayInfoBubbles now={now} />);

    await user.click(screen.getByRole('button', { name: /EDT/ }));

    expect(screen.getByRole('button', { name: 'Tokyo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'London' })).toBeInTheDocument();
  });

  test('selecting a city updates the Eastern bubble to that city\'s time and closes the dropdown', async () => {
    const user = userEvent.setup();
    const now = new Date(Date.UTC(2026, 9, 3, 22, 30)); // Oct 3 2026, 22:30 UTC
    render(<DayInfoBubbles now={now} />);

    await user.click(screen.getByRole('button', { name: /EDT/ }));
    await user.click(screen.getByRole('button', { name: 'Tokyo' }));

    expect(screen.getByText('7:30 AM GMT+9 ▾')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'London' })).not.toBeInTheDocument();
  });

  test('the selected city persists across remounts', async () => {
    const user = userEvent.setup();
    const now = new Date(Date.UTC(2026, 9, 3, 22, 30));
    const { unmount } = render(<DayInfoBubbles now={now} />);

    await user.click(screen.getByRole('button', { name: /EDT/ }));
    await user.click(screen.getByRole('button', { name: 'Tokyo' }));
    unmount();

    render(<DayInfoBubbles now={now} />);
    expect(screen.getByText('7:30 AM GMT+9 ▾')).toBeInTheDocument();
    expect(localStorage.getItem(EASTERN_BUBBLE_TIMEZONE_STORAGE_KEY)).toBe('Asia/Tokyo');
  });

  test('clicking outside the dropdown closes it without changing the selection', async () => {
    const user = userEvent.setup();
    const now = new Date(Date.UTC(2026, 9, 3, 22, 30));
    render(
      <div>
        <DayInfoBubbles now={now} />
        <div data-testid="outside">Rest of the page</div>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /EDT/ }));
    expect(screen.getByRole('button', { name: 'Tokyo' })).toBeInTheDocument();

    await user.click(screen.getByTestId('outside'));

    expect(screen.queryByRole('button', { name: 'Tokyo' })).not.toBeInTheDocument();
    expect(screen.getByText('6:30 PM EDT ▾')).toBeInTheDocument();
  });
});
