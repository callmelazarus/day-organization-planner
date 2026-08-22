import { useRef, useState } from 'react';
import type { MouseEvent, PointerEvent as ReactPointerEvent, ReactElement } from 'react';
import { angleToHour, buildArcPath, hourToAngle } from './geometry';
import { computeDragPreview } from './dragPreview';
import { hourLabel } from './hourLabel';
import { SegmentArc } from './SegmentArc';
import type { DialType, Segment } from './types';

const SIZE = 400;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 150;
const INNER_RADIUS = 60;
const PREVIEW_COLOR = '#7aa2e3';

const MORNING_HOURS = [6, 7, 8, 9, 10, 11, 12];
const EVENING_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

function pointerAngle(cx: number, cy: number, x: number, y: number): number {
  const angleRad = Math.atan2(y - cy, x - cx);
  const angleDeg = (angleRad * 180) / Math.PI + 90;
  return ((angleDeg % 360) + 360) % 360;
}

export interface ClockDialProps {
  dial: DialType;
  segments: Segment[];
  onSegmentClick: (segment: Segment, event: MouseEvent<SVGElement>) => void;
  onCreateSegment: (startHour: number, endHour: number, anchor: { x: number; y: number }) => void;
  pendingRange?: { startHour: number; endHour: number } | null;
}

export function ClockDial({
  dial,
  segments,
  onSegmentClick,
  onCreateSegment,
  pendingRange,
}: ClockDialProps): ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragStartHour, setDragStartHour] = useState<number | null>(null);
  const [dragCurrentHour, setDragCurrentHour] = useState<number | null>(null);

  const hours = dial === 'morning' ? MORNING_HOURS : EVENING_HOURS;
  const usedStartAngle = hourToAngle(dial, hours[0]);
  const usedEndAngle = hourToAngle(dial, hours[hours.length - 1]);
  const isFullCircle = usedEndAngle - usedStartAngle >= 360;
  const activePreview = computeDragPreview(dial, dragStartHour, dragCurrentHour, CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS);
  const preview =
    activePreview ??
    (pendingRange
      ? computeDragPreview(dial, pendingRange.startHour, pendingRange.endHour, CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS)
      : null);

  function hourFromPointer(event: ReactPointerEvent<SVGSVGElement>): number | null {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const scale = SIZE / rect.width;
    const x = (event.clientX - rect.left) * scale;
    const y = (event.clientY - rect.top) * scale;
    const angle = pointerAngle(CENTER, CENTER, x, y);
    const hour = angleToHour(dial, angle);
    return hour === null ? null : Math.round(hour);
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>): void {
    const hour = hourFromPointer(event);
    if (hour === null) return;
    setDragStartHour(hour);
    setDragCurrentHour(hour);
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>): void {
    if (dragStartHour === null) return;
    const hour = hourFromPointer(event);
    if (hour === null) return;
    setDragCurrentHour(hour);
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>): void {
    if (dragStartHour === null || dragCurrentHour === null) {
      setDragStartHour(null);
      setDragCurrentHour(null);
      return;
    }

    const startHour = Math.min(dragStartHour, dragCurrentHour);
    const endHour = Math.max(dragStartHour, dragCurrentHour);

    if (endHour > startHour) {
      onCreateSegment(startHour, endHour, { x: event.clientX, y: event.clientY });
    }

    setDragStartHour(null);
    setDragCurrentHour(null);
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {isFullCircle ? (
        <circle
          data-testid="dial-background"
          cx={CENTER}
          cy={CENTER}
          r={(OUTER_RADIUS + INNER_RADIUS) / 2}
          fill="none"
          stroke="#555"
          strokeWidth={OUTER_RADIUS - INNER_RADIUS}
          opacity={0.12}
        />
      ) : (
        <path
          data-testid="dial-background"
          d={buildArcPath(CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS, usedStartAngle, usedEndAngle)}
          fill="#555"
          opacity={0.12}
        />
      )}
      {hours.map((hour) => {
        const angle = hourToAngle(dial, hour);
        const rad = ((angle - 90) * Math.PI) / 180;
        const labelRadius = OUTER_RADIUS + 20;
        const x = CENTER + labelRadius * Math.cos(rad);
        const y = CENTER + labelRadius * Math.sin(rad);
        return (
          <text key={hour} x={x} y={y} textAnchor="middle" fontSize={13} fill="#aaa">
            {hourLabel(hour)}
          </text>
        );
      })}
      {segments.map((segment) => (
        <SegmentArc
          key={segment.id}
          segment={segment}
          dial={dial}
          cx={CENTER}
          cy={CENTER}
          innerRadius={INNER_RADIUS}
          outerRadius={OUTER_RADIUS}
          onClick={onSegmentClick}
        />
      ))}
      {preview &&
        (preview.isFullCircle ? (
          <circle
            data-testid="drag-preview"
            cx={CENTER}
            cy={CENTER}
            r={(OUTER_RADIUS + INNER_RADIUS) / 2}
            fill="none"
            stroke={PREVIEW_COLOR}
            strokeOpacity={0.5}
            strokeWidth={OUTER_RADIUS - INNER_RADIUS}
            strokeDasharray="10 6"
            pointerEvents="none"
          />
        ) : (
          <path
            data-testid="drag-preview"
            d={preview.arcPath}
            fill={PREVIEW_COLOR}
            fillOpacity={0.25}
            stroke={PREVIEW_COLOR}
            strokeWidth={2}
            strokeDasharray="6 4"
            pointerEvents="none"
          />
        ))}
      {preview &&
        (() => {
          const labelRadius = (OUTER_RADIUS + INNER_RADIUS) / 2;
          const rad = ((preview.midAngle - 90) * Math.PI) / 180;
          const x = CENTER + labelRadius * Math.cos(rad);
          const y = CENTER + labelRadius * Math.sin(rad);
          return (
            <text
              data-testid="drag-preview-label"
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill="#e8e8e8"
              pointerEvents="none"
            >
              {preview.labelText}
            </text>
          );
        })()}
    </svg>
  );
}
