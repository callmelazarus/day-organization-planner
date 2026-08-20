import { buildArcPath, hourToAngle } from './geometry';
import { formatHourRangeLabel } from './hourLabel';
import type { DialType } from './types';

export interface DragPreview {
  isFullCircle: boolean;
  arcPath: string;
  midAngle: number;
  labelText: string;
}

export function computeDragPreview(
  dial: DialType,
  startHour: number | null,
  endHour: number | null,
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number
): DragPreview | null {
  if (startHour === null || endHour === null) return null;

  const lo = Math.min(startHour, endHour);
  const hi = Math.max(startHour, endHour);
  if (hi <= lo) return null;

  const startAngle = hourToAngle(dial, lo);
  const endAngle = hourToAngle(dial, hi);
  const isFullCircle = endAngle - startAngle >= 360;

  return {
    isFullCircle,
    arcPath: isFullCircle ? '' : buildArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle),
    midAngle: (startAngle + endAngle) / 2,
    labelText: formatHourRangeLabel(lo, hi),
  };
}
