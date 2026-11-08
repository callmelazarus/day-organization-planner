import { person } from './pixelArt';
import type { AvatarAnimation } from './pixelArt';

export const AVATAR_PREVIEW_ANIMATION: AvatarAnimation = {
  name: 'Wave hello',
  description: 'Waving hello',
  draw: (ctx, t) => {
    person(ctx, 8, 2 + (t % 4 === 3 ? 1 : 0), { ar: t % 2 ? -3 : -2 });
  },
};
