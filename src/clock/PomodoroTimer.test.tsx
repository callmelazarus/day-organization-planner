import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';
import { PomodoroTimer } from './PomodoroTimer';
import {
  IDLE_ANIMATIONS,
  LOCK_IN_ANIMATIONS,
  WORK_ANIMATIONS,
} from './avatar/avatarAnimations';

class MockNotification {
  static permission: NotificationPermission = 'default';
  static requestPermission = vi.fn(() => Promise.resolve('granted' as NotificationPermission));
  static instances: Array<{ title: string; options?: NotificationOptions }> = [];

  constructor(title: string, options?: NotificationOptions) {
    MockNotification.instances.push({ title, options });
  }
}

function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function setWindowWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
}

describe('PomodoroTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    });
    MockNotification.permission = 'default';
    MockNotification.requestPermission.mockClear();
    MockNotification.instances = [];
    vi.stubGlobal('Notification', MockNotification);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    setWindowWidth(1024);
  });

  test('renders 20:00 initially', () => {
    render(<PomodoroTimer />);
    expect(screen.getByText('20:00')).toBeInTheDocument();
  });

  test('renders nothing on a mobile-sized viewport', () => {
    setWindowWidth(400);
    render(<PomodoroTimer />);
    expect(screen.queryByText('20:00')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();
  });

  test('renders normally on a desktop-sized viewport', () => {
    setWindowWidth(1024);
    render(<PomodoroTimer />);
    expect(screen.getByText('20:00')).toBeInTheDocument();
  });

  test('clicking Start counts the display down', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(1000);

    expect(screen.getByText('19:59')).toBeInTheDocument();
  });

  test('the Start button becomes Pause while running, and pausing stops the countdown', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

    advance(2000);
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByText('19:58')).toBeInTheDocument();

    advance(5000);
    expect(screen.getByText('19:58')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  test('clicking Reset returns the display to 20:00', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(3000);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByText('20:00')).toBeInTheDocument();
  });

  test('the display turns red once the countdown completes', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(20 * 60 * 1000);

    expect(screen.getByText('00:00')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  test('the display is not red before completion', () => {
    render(<PomodoroTimer />);
    expect(screen.getByText('20:00')).not.toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  test('the display turns green while the timer is running', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getByText('20:00')).toHaveStyle({ color: 'rgb(0, 128, 0)' });
  });

  test('the display is not green before starting', () => {
    render(<PomodoroTimer />);
    expect(screen.getByText('20:00')).not.toHaveStyle({ color: 'rgb(0, 128, 0)' });
  });

  test('the display returns to the default color after pausing', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

    expect(screen.getByText('20:00')).not.toHaveStyle({ color: 'rgb(0, 128, 0)' });
  });

  test('the first Start click requests notification permission when not yet decided', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(MockNotification.requestPermission).toHaveBeenCalled();
  });

  test('a notification fires on completion when permission is granted', () => {
    MockNotification.permission = 'granted';
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(20 * 60 * 1000);

    expect(MockNotification.instances).toHaveLength(1);
  });

  test('clicking the up button adds a minute to the display', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Add a minute' }));

    expect(screen.getByText('21:00')).toBeInTheDocument();
  });

  test('clicking the down button subtracts a minute from the display', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Subtract a minute' }));

    expect(screen.getByText('19:00')).toBeInTheDocument();
  });

  test('the up and down buttons are disabled while the timer is running', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getByRole('button', { name: 'Add a minute' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Subtract a minute' })).toBeDisabled();
  });

  test('the up and down buttons are enabled again once paused', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

    expect(screen.getByRole('button', { name: 'Add a minute' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Subtract a minute' })).toBeEnabled();
  });

  test('the down button is disabled once the countdown reaches 0', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(20 * 60 * 1000);

    expect(screen.getByRole('button', { name: 'Subtract a minute' })).toBeDisabled();
  });

  test('no notification fires on completion when permission is denied', () => {
    MockNotification.permission = 'denied';
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(20 * 60 * 1000);

    expect(MockNotification.instances).toHaveLength(0);
    expect(screen.getByText('00:00')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  test('Lock in starts a 7 minute countdown and shows the lock in modal', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Lock in' }));

    const dialog = screen.getByRole('dialog', { name: 'Lock in' });
    expect(dialog).toHaveTextContent('07:00');
    advance(1000);
    expect(screen.getByRole('dialog', { name: 'Lock in' })).toHaveTextContent('06:59');
  });

  test('when the countdown ends the modal stays open with a well done message', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Lock in' }));
    advance(7 * 60 * 1000);

    expect(screen.getByRole('heading', { name: 'Well done. Keep going.' })).toBeInTheDocument();
  });

  test('the well done modal can be closed', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Lock in' }));
    advance(7 * 60 * 1000);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  test('no lock in modal appears for a normal Start', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('avatar', () => {
    function avatarName(): string {
      return screen.getByRole('img').getAttribute('aria-label') ?? '';
    }
    const names = (list: { name: string }[]): string[] => list.map((a) => `${a.name} animation`);

    test('shows an idle animation when the timer is stopped', () => {
      render(<PomodoroTimer />);
      expect(names(IDLE_ANIMATIONS)).toContain(avatarName());
    });

    test('shows a working animation while the timer runs', () => {
      render(<PomodoroTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      expect(names(WORK_ANIMATIONS)).toContain(avatarName());
    });

    test('shows a lock in animation in the corner and the modal while locked in', () => {
      render(<PomodoroTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Lock in' }));
      const labels = screen.getAllByRole('img').map((el) => el.getAttribute('aria-label') ?? '');
      expect(labels).toHaveLength(2);
      labels.forEach((label) => expect(names(LOCK_IN_ANIMATIONS)).toContain(label));
    });

    test('Reset picks a new random idle animation', () => {
      const random = vi.spyOn(Math, 'random').mockReturnValue(0);
      render(<PomodoroTimer />);
      expect(avatarName()).toBe(`${IDLE_ANIMATIONS[0].name} animation`);

      random.mockReturnValue(0.99);
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

      expect(avatarName()).toBe(`${IDLE_ANIMATIONS[IDLE_ANIMATIONS.length - 1].name} animation`);
      random.mockRestore();
    });

    test('goes back to an idle animation after the timer is paused', () => {
      render(<PomodoroTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
      expect(names(IDLE_ANIMATIONS)).toContain(avatarName());
    });
  });

  describe('avatar picker', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('clicking the avatar opens the picker', () => {
      render(<PomodoroTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Change avatar' }));
      expect(screen.getByRole('dialog', { name: 'Choose your avatar' })).toBeInTheDocument();
    });

    test('choosing an avatar closes the picker and remembers the choice', () => {
      render(<PomodoroTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Change avatar' }));

      fireEvent.click(screen.getByRole('radio', { name: 'Ninja' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(localStorage.getItem('circular-clock-mvp:avatar')).toBe('ninja');
    });

    test('reopening the picker shows the saved avatar as selected', () => {
      localStorage.setItem('circular-clock-mvp:avatar', 'gal');
      render(<PomodoroTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Change avatar' }));
      expect(screen.getByRole('radio', { name: 'Gal' })).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('timer bar', () => {
    test('is hidden until the timer starts, and hides again when paused', () => {
      render(<PomodoroTimer />);
      expect(screen.getByTestId('timer-bar')).toHaveStyle({ opacity: '0' });

      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      expect(screen.getByTestId('timer-bar')).toHaveStyle({ opacity: '1' });

      fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
      expect(screen.getByTestId('timer-bar')).toHaveStyle({ opacity: '0' });
    });

    test('is visible during lock in', () => {
      render(<PomodoroTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Lock in' }));
      expect(screen.getByTestId('timer-bar')).toHaveStyle({ opacity: '1' });
    });
  });
});
