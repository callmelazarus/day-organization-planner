const BACKGROUND_COLOR = '#242424';
const LABEL_COLOR = '#e8e8e8';
const LABEL_FONT = '20px system-ui, sans-serif';
const GAP = 40;
const LABEL_GAP = 8;
const LABEL_FONT_SIZE = 20;
const PADDING = 20;

export function formatSnapshotFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `day-planner-${year}-${month}-${day}.png`;
}

function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const serialized = new XMLSerializer().serializeToString(svg);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load dial SVG as an image'));
    image.src = dataUrl;
  });
}

export async function downloadDialsSnapshot(
  svgs: SVGSVGElement[],
  labels: string[]
): Promise<void> {
  const images = await Promise.all(svgs.map(svgToImage));
  const dialSize = images[0]?.naturalWidth ?? 0;

  const canvas = document.createElement('canvas');
  canvas.width = PADDING * 2 + dialSize * images.length + GAP * (images.length - 1);
  canvas.height = PADDING * 2 + dialSize + LABEL_GAP + LABEL_FONT_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = LABEL_COLOR;
  ctx.font = LABEL_FONT;
  ctx.textAlign = 'center';

  images.forEach((image, index) => {
    const x = PADDING + index * (dialSize + GAP);
    ctx.drawImage(image, x, PADDING, dialSize, dialSize);
    ctx.fillText(
      labels[index] ?? '',
      x + dialSize / 2,
      PADDING + dialSize + LABEL_GAP + LABEL_FONT_SIZE
    );
  });

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Failed to create PNG blob');

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = formatSnapshotFilename(new Date());
  anchor.click();
  URL.revokeObjectURL(url);
}
