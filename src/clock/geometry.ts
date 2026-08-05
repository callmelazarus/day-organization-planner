import type { DialType } from './types';

export function angleToHour(dial: DialType, angleDeg: number): number | null {
  const normalized = ((angleDeg % 360) + 360) % 360;

  if (dial === 'morning') {
    const effective = normalized === 0 ? 360 : normalized;
    if (effective < 180) return null;
    return 6 + (effective - 180) / 30;
  }

  return 12 + normalized / 30;
}

export function hourToAngle(dial: DialType, hour: number): number {
  if (dial === 'morning') {
    return 180 + (hour - 6) * 30;
  }
  return (hour - 12) * 30;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: round(cx + radius * Math.cos(angleRad)),
    y: round(cy + radius * Math.sin(angleRad)),
  };
}

export function buildArcPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngleDeg);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngleDeg);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngleDeg);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngleDeg);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}
