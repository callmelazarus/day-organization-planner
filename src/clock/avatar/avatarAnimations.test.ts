import { describe, expect, test, vi } from 'vitest';
import { IDLE_ANIMATIONS, LOCK_IN_ANIMATIONS, WORK_ANIMATIONS, randomIndex } from './avatarAnimations';
import type { Ctx } from './pixelArt';

function makeRecordingContext(): { ctx: Ctx; fillRect: ReturnType<typeof vi.fn> } {
  const fillRect = vi.fn();
  const ctx = { fillRect, fillStyle: '', globalAlpha: 1 } as unknown as Ctx;
  return { ctx, fillRect };
}

const GROUPS = [
  ['idle', IDLE_ANIMATIONS],
  ['work', WORK_ANIMATIONS],
  ['lock in', LOCK_IN_ANIMATIONS],
] as const;

describe('avatar animations', () => {
  test.each(GROUPS)('there are 10 %s animations with unique names', (_label, animations) => {
    expect(animations).toHaveLength(10);
    expect(new Set(animations.map((a) => a.name)).size).toBe(10);
  });

  describe.each(GROUPS)('%s', (_label, animations) => {
    test.each(animations.map((a) => [a.name, a] as const))('%s draws every frame without throwing', (_name, animation) => {
      for (let t = 0; t < 40; t += 1) {
        const { ctx, fillRect } = makeRecordingContext();
        expect(() => animation.draw(ctx, t)).not.toThrow();
        expect(fillRect).toHaveBeenCalled();
      }
    });

    test.each(animations.map((a) => [a.name, a] as const))('%s keeps restoring globalAlpha', (_name, animation) => {
      for (let t = 0; t < 12; t += 1) {
        const { ctx } = makeRecordingContext();
        animation.draw(ctx, t);
        expect(ctx.globalAlpha).toBe(1);
      }
    });
  });
});

describe('randomIndex', () => {
  test('stays within range', () => {
    for (let i = 0; i < 200; i += 1) {
      const index = randomIndex(10);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(10);
    }
  });
});
