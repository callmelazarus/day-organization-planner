import { describe, expect, test, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TimerBar } from './TimerBar';

describe('TimerBar', () => {
  afterEach(() => {
    cleanup();
  });

  test('is visible while the timer is running', () => {
    render(<TimerBar isRunning={true} />);
    expect(screen.getByTestId('timer-bar')).toHaveStyle({ opacity: '1' });
  });

  test('is hidden while the timer is not running', () => {
    render(<TimerBar isRunning={false} />);
    expect(screen.getByTestId('timer-bar')).toHaveStyle({ opacity: '0' });
  });

  test('is a 5px overlay that does not take part in page layout', () => {
    render(<TimerBar isRunning={true} />);
    expect(screen.getByTestId('timer-bar')).toHaveStyle({ position: 'fixed', top: '0px', height: '5px' });
  });

  test('is decorative and ignores pointer events', () => {
    render(<TimerBar isRunning={true} />);
    const bar = screen.getByTestId('timer-bar');
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(bar).toHaveStyle({ pointerEvents: 'none' });
  });
});
