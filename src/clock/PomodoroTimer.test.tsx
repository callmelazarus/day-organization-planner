import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';
import { PomodoroTimer } from './PomodoroTimer';

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
  });

  test('renders 20:00 initially', () => {
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

  test('no notification fires on completion when permission is denied', () => {
    MockNotification.permission = 'denied';
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(20 * 60 * 1000);

    expect(MockNotification.instances).toHaveLength(0);
    expect(screen.getByText('00:00')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
