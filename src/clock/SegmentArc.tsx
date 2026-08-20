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

  const midAngle = (startAngle + endAngle) / 2;
  const labelRadius = (outerRadius + innerRadius) / 2;
  const labelRad = ((midAngle - 90) * Math.PI) / 180;
  const labelX = cx + labelRadius * Math.cos(labelRad);
  const labelY = cy + labelRadius * Math.sin(labelRad);

  const label = (
    <text
      x={labelX}
      y={labelY}
      textAnchor="middle"
      fontSize={13}
      fontWeight={600}
      fill={segment.textColor}
      pointerEvents="none"
    >
      {segment.label}
    </text>
  );

  if (isFullCircle) {
    return (
      <>
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
        {label}
      </>
    );
  }

  const path = buildArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle);

  return (
    <>
      <path
        d={path}
        fill={segment.fill}
        opacity={0.9}
        onClick={(event) => onClick(segment, event)}
        role="button"
        aria-label={segment.label}
        style={{ cursor: 'pointer' }}
      />
      {label}
    </>
  );
}
