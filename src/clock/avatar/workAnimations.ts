import { drawChair, drawDesk, drawNote, person, rect, withAlpha } from './pixelArt';
import type { AvatarAnimation, Ctx } from './pixelArt';

function drawLowDesk(ctx: Ctx): void {
  rect(ctx, 9, 10, 14, 2, 'd');
  rect(ctx, 10, 12, 2, 3, 'd');
  rect(ctx, 20, 12, 2, 3, 'd');
}

export const WORK_ANIMATIONS: AvatarAnimation[] = [
  {
    name: 'Type at the desk',
    description: 'Typing away at the desk',
    draw: (ctx, t) => {
      drawChair(ctx, 1);
      person(ctx, 2, 3, { seated: true, al: t % 2, ar: (t + 1) % 2 });
      drawDesk(ctx, t);
      rect(ctx, 7, 8, 4, 1, 's');
    },
  },
  {
    name: 'Write on a notepad',
    description: 'Jotting notes down on a notepad',
    draw: (ctx, t) => {
      drawChair(ctx, 1);
      person(ctx, 2, 3, { seated: true, ar: t % 2 });
      drawLowDesk(ctx);
      rect(ctx, 13, 5, 6, 5, 'w');
      for (let i = 0; i <= t % 4; i += 1) rect(ctx, 14, 6 + i, 4 - (i % 2), 1, '#9ca3af');
      rect(ctx, 7, 8, 4, 1, 's');
      rect(ctx, 11 + (t % 2), 8, 2, 1, 'y');
    },
  },
  {
    name: 'Whiteboard',
    description: 'Sketching out ideas on the whiteboard',
    draw: (ctx, t) => {
      rect(ctx, 11, 0, 13, 10, 'c');
      rect(ctx, 12, 1, 11, 8, 'w');
      person(ctx, 2, 2, { ar: -2 });
      rect(ctx, 10, 5, 2, 1, 's');
      for (let i = 0; i <= t % 6; i += 1) rect(ctx, 13, 2 + i, 3 + ((i * 5) % 6), 1, i % 2 ? '#2563eb' : 'r');
      rect(ctx, 17, 2 + (t % 6), 1, 1, 'k');
    },
  },
  {
    name: 'Study by lamp',
    description: 'Studying a big book by lamplight',
    draw: (ctx, t) => {
      drawChair(ctx, 1);
      person(ctx, 2, 3, { seated: true, al: -1 });
      drawLowDesk(ctx);
      rect(ctx, 11, 8, 8, 2, 'r');
      rect(ctx, 12, 8, 3, 1, t % 3 ? 'w' : '#ddd');
      rect(ctx, 15, 8, 3, 1, 'w');
      rect(ctx, 21, 3, 1, 7, 'c');
      rect(ctx, 19, 2, 4, 2, 'y');
      withAlpha(ctx, 0.25, () => rect(ctx, 16, 4, 8, 8, 'y'));
    },
  },
  {
    name: 'Dual-monitor coding',
    description: 'Coding across two monitors',
    draw: (ctx, t) => {
      drawChair(ctx, 1);
      person(ctx, 2, 3, { seated: true, al: t % 2, ar: (t + 1) % 2 });
      drawLowDesk(ctx);
      rect(ctx, 10, 3, 6, 5, 'c');
      rect(ctx, 16, 3, 6, 5, 'c');
      rect(ctx, 11, 4, 4, 3, 'k');
      rect(ctx, 17, 4, 4, 3, 'k');
      for (let r = 0; r < 3; r += 1) {
        rect(ctx, 11, 4 + r, 1 + ((t + r * 2) % 3), 1, 'g');
        rect(ctx, 17, 4 + r, 1 + ((t + r) % 4), 1, 'u');
      }
      rect(ctx, 7, 8, 4, 1, 's');
    },
  },
  {
    name: 'Mad scientist',
    description: 'Mixing bubbling potions in the lab',
    draw: (ctx, t) => {
      person(ctx, 2, 2, { ar: -1, hair: 'w' });
      rect(ctx, 4, 5, 6, 1, 'u');
      rect(ctx, 10, 10, 13, 2, 'd');
      rect(ctx, 11, 12, 2, 3, 'd');
      rect(ctx, 20, 12, 2, 3, 'd');
      rect(ctx, 14, 6, 3, 4, '#cbd5e1');
      rect(ctx, 14, 8, 3, 2, ['g', 'r', 'u', 'y'][(t >> 1) % 4]);
      rect(ctx, 15, 7 - (t % 3), 1, 1, 'w');
      rect(ctx, 19, 8, 3, 2, '#cbd5e1');
      rect(ctx, 19, 9, 3, 1, 'v');
    },
  },
  {
    name: 'Pull up a chair',
    description: 'Pulling up a chair to get started, then typing away',
    draw: (ctx, t) => {
      const phase = t % 10;
      const chairX = phase <= 3 ? 11 : phase === 4 ? 10 : phase === 5 ? 8 : 7;
      rect(ctx, 13, 10, 10, 2, 'd');
      rect(ctx, 14, 12, 2, 3, 'd');
      rect(ctx, 20, 12, 2, 3, 'd');
      rect(ctx, 16, 6, 5, 4, 'c');
      rect(ctx, 17, 7, 3, 2, phase >= 6 ? 'u' : '#334155');
      drawChair(ctx, chairX);
      if (phase <= 3) {
        person(ctx, -3 + 2 * phase, 2, { legs: t % 2 ? 2 : 0, al: t % 2 ? -1 : 1, ar: t % 2 ? 1 : -1 });
      } else if (phase <= 5) {
        person(ctx, 2, 2, { ar: -1 });
      } else {
        person(ctx, 3, 3, { seated: true, al: t % 2, ar: (t + 1) % 2 });
        rect(ctx, 11, 8, 4, 1, 's');
      }
    },
  },
  {
    name: 'Headphones on',
    description: 'Working with headphones on, music flowing',
    draw: (ctx, t) => {
      drawChair(ctx, 1);
      person(ctx, 2, 3, { seated: true, al: t % 2, ar: (t + 1) % 2 });
      rect(ctx, 4, 2, 6, 1, 'k');
      rect(ctx, 3, 5, 1, 2, 'r');
      rect(ctx, 10, 5, 1, 2, 'r');
      drawDesk(ctx, t);
      rect(ctx, 7, 8, 4, 1, 's');
      drawNote(ctx, 13, 2 - (t % 2), t % 2 ? 'y' : 'u');
      drawNote(ctx, 17, (t + 1) % 2, 'r');
    },
  },
  {
    name: 'Sort the paperwork',
    description: 'Sorting a pile of paperwork, one sheet at a time',
    draw: (ctx, t) => {
      const n = t % 5;
      person(ctx, 8, 2, { al: n % 2 ? -1 : 1, ar: n % 2 ? 1 : -1 });
      rect(ctx, 1, 10, 22, 2, 'd');
      rect(ctx, 2, 12, 2, 3, 'd');
      rect(ctx, 19, 12, 2, 3, 'd');
      if (4 - n > 0) rect(ctx, 3, 10 - (4 - n), 4, 4 - n, 'w');
      rect(ctx, 17, 10 - (n + 1), 4, n + 1, 'w');
      rect(ctx, 10 + n, 6, 2, 1, '#ddd');
    },
  },
  {
    name: 'Paint on an easel',
    description: 'Painting a masterpiece, dab by dab',
    draw: (ctx, t) => {
      rect(ctx, 13, 2, 9, 9, 'w');
      rect(ctx, 13, 2, 9, 1, 'd');
      rect(ctx, 14, 11, 1, 4, 'd');
      rect(ctx, 20, 11, 1, 4, 'd');
      const dabs: Array<[number, number, string]> = [
        [15, 4, 'r'],
        [18, 5, 'u'],
        [16, 7, 'y'],
        [19, 8, 'g'],
        [15, 9, 'v'],
        [17, 3, 'n'],
        [20, 6, 'r'],
        [18, 9, 'u'],
      ];
      for (let i = 0; i <= t % 8; i += 1) rect(ctx, dabs[i][0], dabs[i][1], 2, 2, dabs[i][2]);
      person(ctx, 2, 3, { ar: -2, al: -1 });
      rect(ctx, 10, 5, 3, 1, 'd');
      rect(ctx, 0, 9, 3, 2, 'y');
    },
  },
];
