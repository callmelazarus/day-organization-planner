import { drawHeart, drawNote, drawPixelsAt, drawZ, person, rect } from './pixelArt';
import type { AvatarAnimation } from './pixelArt';

export const IDLE_ANIMATIONS: AvatarAnimation[] = [
  {
    name: 'Water the plant',
    description: 'Watering a little plant, because breaks are for growing things',
    draw: (ctx, t) => {
      const f = t % 4;
      person(ctx, 2, 2, { ar: -1 });
      rect(ctx, 11, 5, 3, 2, 'c');
      rect(ctx, 14, 4, 2, 1, 'c');
      rect(ctx, 10, 4, 1, 3, 'c');
      for (let i = 0; i < f; i += 1) rect(ctx, 16 + (i % 2), 6 + i * 2, 1, 1, 'u');
      rect(ctx, 17, 12, 5, 3, 'd');
      rect(ctx, 19, 12 - f, 1, f, 'g');
      rect(ctx, 18, 11 - f, 3, 1, 'g');
    },
  },
  {
    name: 'Stroll along',
    description: 'Taking a leisurely stroll while the timer is stopped',
    draw: (ctx, t) => {
      const x = ((t * 2) % 24) - 3;
      person(ctx, x, 2, { legs: t % 2 ? 2 : 0, al: t % 2 ? -1 : 1, ar: t % 2 ? 1 : -1 });
      rect(ctx, 0, 15, 24, 1, '#444');
    },
  },
  {
    name: 'Big stretch',
    description: 'Stretching it out with a big yawn-and-reach',
    draw: (ctx, t) => {
      const up = t % 4 < 2;
      person(ctx, 8, 3, { al: up ? -3 : 0, ar: up ? -3 : 0, closed: up });
      if (up) {
        rect(ctx, 5, 2, 1, 1, 'w');
        rect(ctx, 18, 3, 1, 1, 'w');
      }
    },
  },
  {
    name: 'Standing nap',
    description: 'Snoozing on his feet. Zzz',
    draw: (ctx, t) => {
      person(ctx, 6, 3 + (t % 2), { closed: true });
      for (let i = 0; i < 3; i += 1) {
        if (i <= t % 4) drawZ(ctx, 15 + i * 3, 8 - i * 2 - (t % 2));
      }
    },
  },
  {
    name: 'Read a book',
    description: 'Catching up on some reading',
    draw: (ctx, t) => {
      person(ctx, 6, 2, { al: -1, ar: -1 });
      rect(ctx, 8, 8, 8, 4, 'r');
      rect(ctx, 9, 9, 6, 2, t % 3 ? 'w' : '#ddd');
      rect(ctx, 12, 8, 1, 4, '#7f1d1d');
    },
  },
  {
    name: 'Juggle',
    description: 'Juggling three balls just to stay sharp',
    draw: (ctx, t) => {
      person(ctx, 6, 3, { al: -1, ar: -1 });
      const path = [[7, 7], [8, 3], [10, 1], [12, 3], [14, 7]];
      ['r', 'y', 'u'].forEach((col, i) => {
        const [x, y] = path[(t + i * 2) % 5];
        rect(ctx, x, y, 2, 2, col);
      });
    },
  },
  {
    name: 'Go fishing',
    description: 'Fishing off the dock, waiting for a bite',
    draw: (ctx, t) => {
      rect(ctx, 0, 12, 24, 4, '#2563eb');
      rect(ctx, 0, 11, 10, 1, 'd');
      person(ctx, 2, 0, { seated: true, ar: -1 });
      rect(ctx, 4, 9, 6, 2, 'p');
      rect(ctx, 10, 10, 1, 1, 'o');
      drawPixelsAt(ctx, [[11, 4], [12, 3], [13, 2], [14, 1], [15, 0]], 'd');
      rect(ctx, 16, 0, 1, 12 + (t % 2), 'w');
      rect(ctx, 15, 12 + (t % 2), 3, 1, 'r');
    },
  },
  {
    name: 'Dance break',
    description: 'Taking a quick dance break',
    draw: (ctx, t) => {
      const a = t % 2;
      person(ctx, 8, 2 + (a ? 0 : 1), { legs: a ? 2 : 0, al: a ? -3 : 1, ar: a ? 1 : -3 });
      drawNote(ctx, 4, 4 + (t % 3), a ? 'y' : 'u');
      drawNote(ctx, 19, 3 + ((t + 1) % 3), a ? 'u' : 'r');
    },
  },
  {
    name: 'Coffee sip',
    description: 'Sipping a hot coffee',
    draw: (ctx, t) => {
      const up = t % 4 < 2;
      const ar = up ? -2 : 0;
      person(ctx, 6, 2, { ar });
      rect(ctx, 15, 7 + ar, 2, 2, 'w');
      rect(ctx, 17, 7 + ar, 1, 1, 'w');
      if (up) {
        rect(ctx, 15, 4, 1, 1, '#bbb');
        rect(ctx, 16, 3 - (t % 2), 1, 1, '#bbb');
      }
    },
  },
  {
    name: 'Pet the cat',
    description: 'Petting a very good cat',
    draw: (ctx, t) => {
      person(ctx, 2, 2, { ar: t % 2 ? 1 : 0 });
      rect(ctx, 13, 11, 6, 3, 'n');
      rect(ctx, 17, 9, 3, 3, 'n');
      rect(ctx, 17, 8, 1, 1, 'n');
      rect(ctx, 19, 8, 1, 1, 'n');
      rect(ctx, 12, t % 2 ? 9 : 10, 1, 4, 'n');
      rect(ctx, 18, 10, 1, 1, 'k');
      const f = t % 4;
      drawHeart(ctx, 13 + f, 6 - f);
    },
  },
];
