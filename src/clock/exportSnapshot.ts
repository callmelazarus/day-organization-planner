const BACKGROUND_COLOR = '#242424';
const LABEL_COLOR = '#e8e8e8';
const LABEL_FONT = '20px system-ui, sans-serif';
const HEADING_FONT = 'bold 22px system-ui, sans-serif';
const GAP = 40;
const LABEL_GAP = 8;
const LABEL_FONT_SIZE = 20;
const PADDING = 20;
const HEADING_HEIGHT = 36;
const ROW_GAP = 32;

export function formatSnapshotFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `day-planner-${year}-${month}-${day}.png`;
}

export function formatWeekSnapshotFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `week-planner-${year}-${month}-${day}.png`;
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

function drawRow(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  labels: string[],
  originX: number,
  originY: number
): void {
  const dialSize = images[0]?.naturalWidth ?? 0;
  images.forEach((image, index) => {
    const x = originX + index * (dialSize + GAP);
    ctx.drawImage(image, x, originY, dialSize, dialSize);
    ctx.fillText(
      labels[index] ?? '',
      x + dialSize / 2,
      originY + dialSize + LABEL_GAP + LABEL_FONT_SIZE
    );
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

  drawRow(ctx, images, labels, PADDING, PADDING);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Failed to create PNG blob');

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = formatSnapshotFilename(new Date());
  anchor.click();
  URL.revokeObjectURL(url);
}

export interface WeekDaySnapshotRow {
  heading: string;
  svgs: SVGSVGElement[];
  dialLabels: string[];
}

export async function downloadWeekSnapshot(rows: WeekDaySnapshotRow[]): Promise<void> {
  const rowsWithImages = await Promise.all(
    rows.map(async (row) => ({
      heading: row.heading,
      dialLabels: row.dialLabels,
      images: await Promise.all(row.svgs.map(svgToImage)),
    }))
  );

  const dialSize = rowsWithImages[0]?.images[0]?.naturalWidth ?? 0;
  const maxDialsPerRow = Math.max(...rowsWithImages.map((row) => row.images.length), 0);
  const rowWidth = PADDING * 2 + dialSize * maxDialsPerRow + GAP * (maxDialsPerRow - 1);
  const rowHeight = HEADING_HEIGHT + dialSize + LABEL_GAP + LABEL_FONT_SIZE;

  const canvas = document.createElement('canvas');
  canvas.width = rowWidth;
  canvas.height =
    PADDING * 2 + rowHeight * rowsWithImages.length + ROW_GAP * (rowsWithImages.length - 1);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';

  rowsWithImages.forEach((row, index) => {
    const rowOriginY = PADDING + index * (rowHeight + ROW_GAP);

    ctx.fillStyle = LABEL_COLOR;
    ctx.font = HEADING_FONT;
    ctx.fillText(row.heading, canvas.width / 2, rowOriginY + HEADING_HEIGHT - LABEL_GAP);

    ctx.font = LABEL_FONT;
    drawRow(ctx, row.images, row.dialLabels, PADDING, rowOriginY + HEADING_HEIGHT);
  });

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Failed to create PNG blob');

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = formatWeekSnapshotFilename(new Date());
  anchor.click();
  URL.revokeObjectURL(url);
}
