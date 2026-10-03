import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within, act } from '@testing-library/react';
import { DayPlanner } from './DayPlanner';
import * as exportSnapshot from './exportSnapshot';

vi.mock('./exportSnapshot', async () => {
  const actual = await vi.importActual<typeof exportSnapshot>('./exportSnapshot');
  return {
    ...actual,
    downloadDialsSnapshot: vi.fn().mockResolvedValue(undefined),
    downloadWeekSnapshot: vi.fn().mockResolvedValue(undefined),
  };
});

describe('DayPlanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders both the daytime and nighttime dials', () => {
    render(<DayPlanner />);

    // '12' is duplicated: once for noon (daytime dial) and once for
    // midnight (nighttime dial).
    expect(screen.getAllByText('12').length).toBeGreaterThanOrEqual(2);
    // '6' is duplicated: both dials share the 6pm boundary (daytime ends
    // at 6pm, nighttime starts at 6pm).
    expect(screen.getAllByText('6').length).toBeGreaterThanOrEqual(2);
  });

  test('labels the dials with a sun emoji for Day and a moon emoji for Night', () => {
    render(<DayPlanner />);

    expect(screen.getByText('☀️ Day')).toBeInTheDocument();
    expect(screen.getByText('🌙 Night')).toBeInTheDocument();
  });

  test('renders a persisted segment on the correct dial', () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 8,
          endHour: 9,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);

    expect(screen.getByRole('button', { name: 'Gym' })).toBeInTheDocument();
  });

  test("switching between segments without closing the popup shows the newly clicked segment's label", () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 8,
          endHour: 9,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
        {
          id: '2',
          startHour: 10,
          endHour: 11,
          label: 'Breakfast',
          fill: 'hsl(40, 70%, 85%)',
          textColor: 'hsl(40, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));
    expect(screen.getByDisplayValue('Gym')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Breakfast' }));
    expect(screen.getByDisplayValue('Breakfast')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Gym')).not.toBeInTheDocument();
  });

  test('the "View all tasks" button opens and closes the task list modal', () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 8,
          endHour: 9,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);

    expect(screen.queryByRole('dialog', { name: 'All tasks' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View all tasks' }));
    expect(screen.getByRole('dialog', { name: 'All tasks' })).toBeInTheDocument();
    expect(screen.getByText('8am – 9am')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog', { name: 'All tasks' })).not.toBeInTheDocument();
  });

  test('the Clear button opens a confirmation dialog, and confirming removes all segments', () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 8,
          endHour: 9,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);

    expect(screen.getByRole('button', { name: 'Gym' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    const dialog = screen.getByRole('dialog', { name: 'Clear all tasks?' });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Clear' }));

    expect(screen.queryByRole('dialog', { name: 'Clear all tasks?' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Gym' })).not.toBeInTheDocument();
  });

  test('the Clear button does nothing if the confirmation is cancelled', () => {
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        {
          id: '1',
          startHour: 8,
          endHour: 9,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog', { name: 'Clear all tasks?' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gym' })).toBeInTheDocument();
  });

  test('the "Download image" button captures both dial SVGs in order with their labels', () => {
    render(<DayPlanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Download image' }));

    expect(exportSnapshot.downloadDialsSnapshot).toHaveBeenCalledTimes(1);
    const [svgs, labels] = vi.mocked(exportSnapshot.downloadDialsSnapshot).mock.calls[0];
    expect(svgs).toHaveLength(2);
    expect(svgs[0].tagName.toLowerCase()).toBe('svg');
    expect(svgs[1].tagName.toLowerCase()).toBe('svg');
    expect(labels).toEqual(['☀️ Day', '🌙 Night']);
  });

  test('stacks the dials vertically when the viewport is narrower than the mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });

    const { container } = render(<DayPlanner />);

    expect(container.querySelector('[data-testid="dials-row"]')).toHaveStyle({
      flexDirection: 'column',
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
  });

  test('lays the dials out side by side when the viewport is at least the mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });

    const { container } = render(<DayPlanner />);

    expect(container.querySelector('[data-testid="dials-row"]')).toHaveStyle({
      flexDirection: 'row',
    });
  });

  test('restacks the dials when the window is resized below the breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });

    const { container } = render(<DayPlanner />);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });
      window.dispatchEvent(new Event('resize'));
    });

    expect(container.querySelector('[data-testid="dials-row"]')).toHaveStyle({
      flexDirection: 'column',
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
  });

  test('renders the current-time toggle button, on by default with a current-time line shown', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
    vi.setSystemTime(new Date(2026, 0, 1, 10, 0));

    render(<DayPlanner />);

    const toggle = screen.getByRole('button', { name: /current time/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelectorAll('[data-testid="current-time-line"]')).toHaveLength(1);

    vi.useRealTimers();
  });

  test('clicking the current-time toggle hides the current-time line, and clicking again shows it', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
    vi.setSystemTime(new Date(2026, 0, 1, 10, 0));

    render(<DayPlanner />);

    const toggle = screen.getByRole('button', { name: /current time/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelectorAll('[data-testid="current-time-line"]')).toHaveLength(1);

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(document.querySelector('[data-testid="current-time-line"]')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelectorAll('[data-testid="current-time-line"]')).toHaveLength(1);

    vi.useRealTimers();
  });

  test('the todo list is always visible without needing a button to open it', () => {
    render(<DayPlanner />);

    expect(screen.getByText('💪')).toBeInTheDocument();
  });

  test('adding a todo shows it in the always-visible todo list', () => {
    render(<DayPlanner />);

    fireEvent.change(screen.getByPlaceholderText("Keep going!"), {
      target: { value: 'Buy groceries' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  test('defaults to Day mode with no weekday selector shown', () => {
    render(<DayPlanner />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.queryByText('Sun')).not.toBeInTheDocument();
  });

  test('Day mode shows the Pacific time, date, and Eastern time bubbles in the weekday-selector slot', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
    vi.setSystemTime(new Date(2026, 9, 3, 10, 0)); // Oct 3 2026, a Saturday

    render(<DayPlanner />);

    expect(screen.getByText(/PST$/)).toBeInTheDocument();
    expect(screen.getByText('Saturday October 3, 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EDT ▾$/ })).toBeInTheDocument();

    vi.useRealTimers();
  });

  test('switching to Week mode hides the day-info bubbles and shows the weekday selector instead', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday

    render(<DayPlanner />);
    expect(screen.getByText(/Monday January 5, 2026/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText(/January 5, 2026/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Mon/ })).toBeInTheDocument();

    vi.useRealTimers();
  });

  test('toolbar buttons carry mode-appropriate tooltips instead of a visible caption', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday

    render(<DayPlanner />);

    expect(screen.getByRole('button', { name: 'Download image' })).toHaveAttribute(
      'title',
      'Downloads this single day as an image'
    );
    expect(screen.getByRole('button', { name: 'View all tasks' })).toHaveAttribute(
      'title',
      "Shows this single day's tasks"
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveAttribute(
      'title',
      "Clears this single day's tasks"
    );
    expect(screen.queryByText(/act on this single day/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('button', { name: 'Download image' })).toHaveAttribute(
      'title',
      'Downloads all 7 days as one stacked image'
    );
    expect(screen.getByRole('button', { name: 'View all tasks' })).toHaveAttribute(
      'title',
      "Shows all 7 days' tasks grouped by weekday"
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveAttribute(
      'title',
      "Clears only the selected day's tasks"
    );
    expect(screen.queryByText(/aggregate all 7 days/)).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  test('switching modes does not affect the shared to-do list', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday

    render(<DayPlanner />);

    fireEvent.change(screen.getByPlaceholderText('Keep going!'), {
      target: { value: 'Buy groceries' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    vi.useRealTimers();
  });

  test('switching to Week mode shows the weekday selector defaulting to today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday

    render(<DayPlanner />);
    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: /^Mon/ })).toHaveAttribute('aria-pressed', 'true');

    vi.useRealTimers();
  });

  test('a segment saved in week mode for one weekday only shows up when that weekday is selected', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday
    localStorage.setItem(
      'circular-clock-mvp:week:monday',
      JSON.stringify([
        { id: '1', startHour: 8, endHour: 9, label: 'Standup', fill: '', textColor: '' },
      ])
    );

    render(<DayPlanner />);
    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('button', { name: 'Standup' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Tue/ }));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByRole('button', { name: 'Standup' })).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  test('Clear in week mode only clears the selected weekday, leaving single-day mode and other weekdays untouched', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday
    localStorage.setItem(
      'circular-clock-mvp:segments',
      JSON.stringify([
        { id: 's1', startHour: 8, endHour: 9, label: 'SingleDayTask', fill: '', textColor: '' },
      ])
    );
    localStorage.setItem(
      'circular-clock-mvp:week:monday',
      JSON.stringify([
        { id: 'm1', startHour: 8, endHour: 9, label: 'MondayTask', fill: '', textColor: '' },
      ])
    );
    localStorage.setItem(
      'circular-clock-mvp:week:tuesday',
      JSON.stringify([
        { id: 't1', startHour: 8, endHour: 9, label: 'TuesdayTask', fill: '', textColor: '' },
      ])
    );

    render(<DayPlanner />);
    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    const confirmDialog = screen.getByRole('dialog', { name: "Clear Monday's tasks?" });
    fireEvent.click(within(confirmDialog).getByRole('button', { name: 'Clear' }));

    expect(screen.queryByRole('button', { name: 'MondayTask' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Tue/ }));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole('button', { name: 'TuesdayTask' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole('button', { name: 'SingleDayTask' })).toBeInTheDocument();

    vi.useRealTimers();
  });

  test('Download image in week mode exports all 7 weekdays as one stacked image', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday

    render(<DayPlanner />);
    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Download image' }));

    expect(exportSnapshot.downloadWeekSnapshot).toHaveBeenCalledTimes(1);
    const [rows] = vi.mocked(exportSnapshot.downloadWeekSnapshot).mock.calls[0];
    expect(rows).toHaveLength(7);
    expect(rows[0].heading).toBe('SUNDAY');
    expect(rows.every((row) => row.svgs.length === 2)).toBe(true);

    vi.useRealTimers();
  });

  test('clicking the mode toggle twice in rapid succession only applies one effective mode change', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday

    render(<DayPlanner />);

    // First click schedules single -> week.
    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(80); // partway through the 160ms crossfade; still faded
    });

    // Second click lands mid-fade and should be ignored, not computed against
    // the stale pre-click mode.
    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200); // let the first (only) transition finish
    });

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: /^Mon/ })).toHaveAttribute('aria-pressed', 'true');

    vi.useRealTimers();
  });

  test('week-mode segment edit and delete route to the selected weekday bucket, never to single-day storage', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday
    localStorage.setItem(
      'circular-clock-mvp:week:monday',
      JSON.stringify([
        {
          id: 'm1',
          startHour: 8,
          endHour: 9,
          label: 'Gym',
          fill: 'hsl(0, 70%, 85%)',
          textColor: 'hsl(0, 70%, 30%)',
        },
      ])
    );

    render(<DayPlanner />);
    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Edit the Monday segment's label via the popup.
    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));
    fireEvent.change(screen.getByDisplayValue('Gym'), {
      target: { value: 'Gym Updated' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('button', { name: 'Gym Updated' })).toBeInTheDocument();
    expect(localStorage.getItem('circular-clock-mvp:segments')).toBeNull();

    // Switch away to Tuesday and back to Monday — the edit should persist
    // under Monday's own key, not be lost or misrouted.
    fireEvent.click(screen.getByRole('button', { name: /^Tue/ }));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('button', { name: 'Gym Updated' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Mon/ }));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole('button', { name: 'Gym Updated' })).toBeInTheDocument();
    expect(localStorage.getItem('circular-clock-mvp:segments')).toBeNull();

    // Delete the Monday segment via the popup's delete action.
    fireEvent.click(screen.getByRole('button', { name: 'Gym Updated' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.queryByRole('button', { name: 'Gym Updated' })).not.toBeInTheDocument();
    expect(localStorage.getItem('circular-clock-mvp:segments')).toBeNull();

    vi.useRealTimers();
  });

  test('View all tasks in week mode opens the week-grouped task list', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0)); // Jan 5 2026 is a Monday
    localStorage.setItem(
      'circular-clock-mvp:week:monday',
      JSON.stringify([
        { id: 'm1', startHour: 8, endHour: 9, label: 'MondayTask', fill: '', textColor: '' },
      ])
    );

    render(<DayPlanner />);
    fireEvent.click(screen.getByRole('switch'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.click(screen.getByRole('button', { name: 'View all tasks' }));

    const weekDialog = screen.getByRole('dialog', { name: 'All tasks this week' });
    expect(weekDialog).toBeInTheDocument();
    expect(within(weekDialog).getByText('MondayTask')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
