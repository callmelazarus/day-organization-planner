import type { MouseEvent, ReactElement } from 'react';
import { buildArcPath, hourToAngle } from './geometry';
import type { DialType, Segment } from './types';

export interface SegmentArcProps {
  segment: Segment;
  dial: DialType;
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  onClick: (segment: Segment, event: MouseEvent<SVGElement>) => void;
}

export function SegmentArc({
  segment,
  dial,
  cx,
  cy,
  innerRadius,
  outerRadius,
  onClick,
}: SegmentArcProps): ReactElement {
  const startAngle = hourToAngle(dial, segment.startHour);
  const endAngle = hourToAngle(dial, segment.endHour);
  const isFullCircle = endAngle - startAngle >= 360;

  if (isFullCircle) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={(outerRadius + innerRadius) / 2}
        fill="none"
        stroke={segment.fill}
        strokeWidth={outerRadius - innerRadius}
        opacity={0.9}
        onClick={(event) => onClick(segment, event)}
        role="button"
        aria-label={segment.label}
        style={{ cursor: 'pointer' }}
      />
    );
  }

  const path = buildArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle);

  return (
    <path
      d={path}
      fill={segment.fill}
      opacity={0.9}
      onClick={(event) => onClick(segment, event)}
      role="button"
      aria-label={segment.label}
      style={{ cursor: 'pointer' }}
    />
  );
}
