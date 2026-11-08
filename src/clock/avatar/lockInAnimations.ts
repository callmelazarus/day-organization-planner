import { drawChair, drawDesk, person, rect, withAlpha } from './pixelArt';
import type { AvatarAnimation } from './pixelArt';

export const LOCK_IN_ANIMATIONS: AvatarAnimation[] = [
  {
    name: 'Super saiyan',
    draw: (ctx, t) => {
      withAlpha(ctx, t % 2 ? 0.45 : 0.3, () => rect(ctx, 2, 0, 18, 15, 'y'));
      person(ctx, 7 + (t % 2), 3, { spikes: true, hair: 'y', al: -1, ar: -1, legs: 2 });
      if (t % 3 === 0) {
        rect(ctx, 1, 3, 1, 2, 'w');
        rect(ctx, 2, 5, 1, 2, 'w');
        rect(ctx, 21, 6, 1, 2, 'w');
        rect(ctx, 20, 8, 1, 2, 'w');
      }
    },
  },
  {
    name: 'Ninja focus',
    draw: (ctx, t) => {
      const y = 3 + (t % 2 ? -1 : 0);
      person(ctx, 8, y, { hair: 'k', body: 'k', pants: 'k', noarms: true, band: 'r' });
      rect(ctx, 10, y + 2, 2, 3, 'k');
      rect(ctx, 8, y + 8, 8, 2, '#222');
      rect(ctx, 9, y + 5, 8, 1, '#222');
      rect(ctx, 10, y + 3, 1, 1, 'w');
      rect(ctx, 13, y + 3, 1, 1, 'w');
      for (let i = 0; i < 3; i += 1) {
        const a = t * 0.8 + i * 2.09;
        rect(ctx, 12 + Math.cos(a) * 9, 8 + Math.sin(a) * 4, 2, 2, ['u', 'w', 'y'][i]);
      }
    },
  },
  {
    name: 'Laser eyes',
    draw: (ctx, t) => {
      person(ctx, 3, 2, { eye: 'r' });
      rect(ctx, 10, 5, 12, t % 2 ? 2 : 1, 'r');
      rect(ctx, 10, 5, 12, 1, 'w');
      rect(ctx, 21, 3, 2, 11, 'd');
      [[20, 4], [22, 6 + (t % 3)], [19, 8 - (t % 2)], [21, 2]].forEach(([x, y], i) => {
        if ((t + i) % 2) rect(ctx, x, y, 1, 1, 'y');
      });
    },
  },
  {
    name: 'On fire',
    draw: (ctx, t) => {
      person(ctx, 8, 2, { band: 'r', al: -1, ar: -1, legs: 2 });
      rect(ctx, 18, 3 + (t % 2), 3, 1, 'r');
      [[6, 6], [7, 9], [10, 12], [13, 12], [16, 9], [17, 6], [8, 12], [15, 12]].forEach(([x, y], i) => {
        const h = 2 + ((t + i) % 3);
        rect(ctx, x, y + 2 - h, 1 + (i % 2), h, ['r', 'n', 'y'][(t + i) % 3]);
      });
    },
  },
  {
    name: 'Lightning storm',
    draw: (ctx, t) => {
      const flash = t % 3 === 0;
      if (flash) withAlpha(ctx, 0.18, () => rect(ctx, 0, 0, 24, 16, 'w'));
      person(ctx, 8, 3, { hair: 'u', spikes: true, al: -1, ar: -1 });
      if (flash) {
        [[12, 0], [11, 1], [12, 2], [11, 3], [12, 4]].forEach(([x, y]) => rect(ctx, x, y, 1, 1, 'w'));
        [[4, 6], [5, 7], [4, 8], [5, 9], [19, 5], [18, 6], [19, 7], [18, 8]].forEach(([x, y]) =>
          rect(ctx, x, y, 1, 1, 'u')
        );
      }
    },
  },
  {
    name: 'Hyper typing',
    draw: (ctx, t) => {
      drawChair(ctx, 1);
      withAlpha(ctx, 0.3, () => {
        rect(ctx, 5, 7, 6, 2, 's');
        rect(ctx, 5, 9, 6, 1, 's');
      });
      person(ctx, 2, 3, { seated: true, al: t % 2 ? 0 : 1, ar: t % 2 ? 1 : 0, eye: 'y' });
      drawDesk(ctx, t, t % 2 ? 'w' : 'y');
      rect(ctx, 7, 8, 5, 1, 's');
      for (let i = 0; i < 4; i += 1) rect(ctx, 13 + i * 2 + ((t + i) % 2), 3 - ((t * 2 + i * 3) % 4), 1, 1, 'y');
      rect(ctx, 0, 4, 3, 1, 'u');
      rect(ctx, 0, 7, 2, 1, 'u');
    },
  },
  {
    name: 'Power up the ground',
    draw: (ctx, t) => {
      person(ctx, 8, 2, { al: -1, ar: -1, legs: 2 });
      rect(ctx, 2, 15, 20, 1, '#555');
      [5, 9, 14, 18].forEach((x) => rect(ctx, x, 15, 1, 1, 'k'));
      [4, 6, 16, 19].forEach((x, i) => rect(ctx, x, 13 - ((t * 2 + i * 4) % 12), 2, 2, 'c'));
      [6, 8, 15, 17].forEach((x, i) => withAlpha(ctx, 0.5, () => rect(ctx, x, 2 + ((t * 3 + i * 2) % 8), 1, 5, 'y')));
    },
  },
  {
    name: 'Sword slash',
    draw: (ctx, t) => {
      const f = t % 4;
      person(ctx, 3, 2, { ar: [-3, -2, 0, 2][f] });
      const blades = [
        [[11, 0], [11, 1], [11, 2], [11, 3], [11, 4]],
        [[12, 1], [13, 2], [14, 3], [15, 4], [16, 5]],
        [[13, 8], [14, 8], [15, 8], [16, 8], [17, 8], [18, 8]],
        [[11, 10], [11, 11], [11, 12], [11, 13], [11, 14]],
      ];
      blades[f].forEach(([x, y]) => rect(ctx, x, y, 1, 1, 'c'));
      if (f === 1 || f === 2) {
        withAlpha(ctx, 0.8, () =>
          [[15, 3], [17, 4], [19, 6], [20, 8], [19, 10]].forEach(([x, y]) => rect(ctx, x, y, 1, 2, 'w'))
        );
      }
    },
  },
  {
    name: 'Rocket hero',
    draw: (ctx, t) => {
      const y = 2 + (t % 2 ? -1 : 0);
      for (let i = 0; i < 6; i += 1) withAlpha(ctx, 0.7, () => rect(ctx, (i * 5 + 2) % 24, (t * 3 + i * 5) % 16, 1, 2, 'w'));
      rect(ctx, 6, y + 5, 2, 5, 'r');
      rect(ctx, 5, y + 6 + (t % 2), 1, 4, 'r');
      person(ctx, 8, y, { al: -3, ar: -3, legs: 1 });
      rect(ctx, 10, y + 13, 2, 2 + (t % 2), 'n');
      rect(ctx, 10, y + 13, 1, 1, 'y');
      rect(ctx, 13, y + 13, 2, 1 + (t % 2), 'r');
    },
  },
  {
    name: 'Cosmic enlightenment',
    draw: (ctx, t) => {
      const y = 3 + (t % 2 ? -1 : 0);
      withAlpha(ctx, 0.25, () => rect(ctx, 3, 0, 18, 16, 'v'));
      person(ctx, 8, y, { closed: true, noarms: true });
      rect(ctx, 10, y + 2, 2, 1, t % 2 ? 'y' : 'v');
      rect(ctx, 6, y + 6, 2, 3, 's');
      rect(ctx, 16, y + 6, 2, 3, 's');
      rect(ctx, 9, y + 9, 6, 2, 'p');
      for (let i = 0; i < 14; i += 1) {
        const a = t * 0.5 + i * 0.45;
        rect(ctx, 12 + Math.cos(a) * 10, 9 + Math.sin(a) * 3, 1, 1, i % 4 === 0 ? 'y' : 'w');
      }
      [[2, 2], [20, 3], [4, 13], [21, 12]].forEach(([x, yy], i) => {
        if ((t + i) % 2) rect(ctx, x, yy, 1, 1, 'w');
      });
    },
  },
];
