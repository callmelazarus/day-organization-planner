export type Ctx = CanvasRenderingContext2D;

export interface AvatarAnimation {
  name: string;
  description: string;
  draw: (ctx: Ctx, t: number) => void;
}

export const GRID_WIDTH = 24;
export const GRID_HEIGHT = 16;

const PALETTE: Record<string, string> = {
  h: '#6b3f1d',
  s: '#f2c9a0',
  k: '#222',
  b: '#3b82f6',
  p: '#334155',
  o: '#111',
  y: '#ffd93b',
  g: '#3fae4a',
  d: '#7a4a21',
  c: '#9ca3af',
  u: '#7dd3fc',
  w: '#fff',
  r: '#ef4444',
  l: '#fff3a0',
  n: '#fb923c',
  v: '#a855f7',
  m: '#555',
};

/** Fills a rectangle on the pixel grid; `col` is a palette key or any CSS color. */
export function rect(ctx: Ctx, x: number, y: number, w: number, h: number, col: string): void {
  ctx.fillStyle = PALETTE[col] ?? col;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

export function withAlpha(ctx: Ctx, alpha: number, draw: () => void): void {
  const previous = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  draw();
  ctx.globalAlpha = previous;
}

export interface PersonOptions {
  hair?: string;
  body?: string;
  pants?: string;
  eye?: string;
  band?: string;
  legs?: 0 | 1 | 2;
  al?: number;
  ar?: number;
  seated?: boolean;
  spikes?: boolean;
  closed?: boolean;
  noarms?: boolean;
}

export function person(ctx: Ctx, x: number, y: number, o: PersonOptions = {}): void {
  const hair = o.hair ?? 'h';
  const body = o.body ?? 'b';
  const pants = o.pants ?? 'p';
  const legs = o.legs ?? 0;
  const al = o.al ?? 0;
  const ar = o.ar ?? 0;

  if (o.spikes) {
    for (const [dx, dy] of [
      [2, -2],
      [4, -3],
      [6, -2],
    ]) {
      rect(ctx, x + dx, y + dy, 2, 3, hair);
    }
  }
  rect(ctx, x + 2, y, 6, 2, hair);
  rect(ctx, x + 2, y + 2, 6, 3, 's');
  rect(ctx, x + 2, y + 2, 1, 2, hair);
  rect(ctx, x + 7, y + 2, 1, 2, hair);
  const eye = o.closed ? '#c99a6e' : (o.eye ?? 'k');
  rect(ctx, x + 3, y + 3, 1, 1, eye);
  rect(ctx, x + 6, y + 3, 1, 1, eye);
  if (o.band) rect(ctx, x + 2, y + 1, 6, 1, o.band);
  rect(ctx, x + 2, y + 5, 6, 4, body);
  if (!o.noarms) {
    rect(ctx, x + 1, y + 5 + al, 1, 3, 's');
    rect(ctx, x + 8, y + 5 + ar, 1, 3, 's');
  }
  if (o.seated) return;
  if (legs === 0) {
    rect(ctx, x + 2, y + 9, 2, 3, pants);
    rect(ctx, x + 6, y + 9, 2, 3, pants);
    rect(ctx, x + 2, y + 12, 2, 1, 'o');
    rect(ctx, x + 6, y + 12, 2, 1, 'o');
  } else if (legs === 1) {
    rect(ctx, x + 3, y + 9, 4, 3, pants);
    rect(ctx, x + 3, y + 12, 4, 1, 'o');
  } else {
    rect(ctx, x + 1, y + 9, 2, 3, pants);
    rect(ctx, x + 7, y + 9, 2, 2, pants);
    rect(ctx, x + 0, y + 12, 2, 1, 'o');
    rect(ctx, x + 8, y + 11, 2, 1, 'o');
  }
}

function drawPixels(ctx: Ctx, x: number, y: number, pixels: number[][], col: string): void {
  for (const [dx, dy] of pixels) rect(ctx, x + dx, y + dy, 1, 1, col);
}

export function drawZ(ctx: Ctx, x: number, y: number): void {
  drawPixels(ctx, x, y, [[0, 0], [1, 0], [2, 0], [1, 1], [0, 2], [1, 2], [2, 2]], 'w');
}

export function drawHeart(ctx: Ctx, x: number, y: number): void {
  drawPixels(ctx, x, y, [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2]], 'r');
}

export function drawNote(ctx: Ctx, x: number, y: number, col: string): void {
  rect(ctx, x, y, 1, 3, col);
  rect(ctx, x - 1, y + 2, 2, 1, col);
  rect(ctx, x + 1, y, 1, 1, col);
}

export function drawDesk(ctx: Ctx, t: number, screen?: string): void {
  rect(ctx, 9, 10, 14, 2, 'd');
  rect(ctx, 10, 12, 2, 3, 'd');
  rect(ctx, 20, 12, 2, 3, 'd');
  rect(ctx, 13, 5, 6, 5, 'c');
  rect(ctx, 14, 6, 4, 3, screen ?? (t % 2 ? 'u' : 'l'));
}

export function drawChair(ctx: Ctx, x: number): void {
  rect(ctx, x, 8, 4, 6, 'm');
}

export function drawPixelsAt(ctx: Ctx, pixels: number[][], col: string): void {
  drawPixels(ctx, 0, 0, pixels, col);
}
