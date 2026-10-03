import { describe, expect, test, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DayInfoBubbles } from './DayInfoBubbles';

describe('DayInfoBubbles', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows the Pacific time, the full date, and the Eastern time in that order', () => {
    const now = new Date(Date.UTC(2026, 9, 3, 22, 30)); // Oct 3 2026, 22:30 UTC

    render(<DayInfoBubbles now={now} />);

    const bubbles = screen.getAllByText(/PST|PM|AM|October/);
    expect(screen.getByText('3:30 PM PST')).toBeInTheDocument();
    expect(screen.getByText('Saturday October 3, 2026')).toBeInTheDocument();
    expect(screen.getByText('6:30 PM EST')).toBeInTheDocument();

    const container = bubbles[0].closest('div');
    const texts = Array.from(container?.children ?? []).map((el) => el.textContent);
    expect(texts).toEqual(['3:30 PM PST', 'Saturday October 3, 2026', '6:30 PM EST']);
  });
});
