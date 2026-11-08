import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { GRID_HEIGHT, GRID_WIDTH } from './pixelArt';
import type { AvatarAnimation } from './pixelArt';

export interface AvatarCanvasProps {
  animation: AvatarAnimation;
  scale: number;
}

const FRAME_MS = 280;

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function AvatarCanvas({ animation, scale }: AvatarCanvasProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    function render(): void {
      if (!ctx) return;
      ctx.clearRect(0, 0, GRID_WIDTH, GRID_HEIGHT);
      ctx.globalAlpha = 1;
      animation.draw(ctx, frame);
    }

    render();
    if (prefersReducedMotion()) return;
    const intervalId = setInterval(() => {
      frame += 1;
      render();
    }, FRAME_MS);
    return () => clearInterval(intervalId);
  }, [animation]);

  return (
    <canvas
      ref={canvasRef}
      width={GRID_WIDTH}
      height={GRID_HEIGHT}
      role="img"
      aria-label={`${animation.name} animation`}
      style={{
        width: GRID_WIDTH * scale,
        height: GRID_HEIGHT * scale,
        imageRendering: 'pixelated',
        display: 'block',
      }}
    />
  );
}
