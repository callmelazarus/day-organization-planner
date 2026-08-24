import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { downloadDialsSnapshot, formatSnapshotFilename } from './exportSnapshot';

describe('formatSnapshotFilename', () => {
  test('formats a date as day-planner-YYYY-MM-DD.png', () => {
    const date = new Date(2026, 7, 22); // August 22, 2026 (month is 0-indexed)
    expect(formatSnapshotFilename(date)).toBe('day-planner-2026-08-22.png');
  });

  test('zero-pads single-digit month and day', () => {
    const date = new Date(2026, 0, 5); // January 5, 2026
    expect(formatSnapshotFilename(date)).toBe('day-planner-2026-01-05.png');
  });
});

function makeFakeSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '400');
  svg.setAttribute('height', '400');
  return svg;
}

class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 400;
  naturalHeight = 400;
  private _src = '';

  set src(value: string) {
    this._src = value;
    queueMicrotask(() => this.onload?.());
  }

  get src(): string {
    return this._src;
  }
}

describe('downloadDialsSnapshot', () => {
  let fillRect: ReturnType<typeof vi.fn>;
  let drawImage: ReturnType<typeof vi.fn>;
  let fillText: ReturnType<typeof vi.fn>;
  let clickedAnchor: HTMLAnchorElement | undefined;

  beforeEach(() => {
    vi.stubGlobal('Image', FakeImage);

    fillRect = vi.fn();
    drawImage = vi.fn();
    fillText = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect,
      drawImage,
      fillText,
      set fillStyle(_value: string) {},
      set font(_value: string) {},
      set textAlign(_value: string) {},
    } as unknown as CanvasRenderingContext2D);

    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
      callback: BlobCallback
    ) {
      callback(new Blob(['fake'], { type: 'image/png' }));
    });

    URL.createObjectURL = vi.fn(() => 'blob:fake-url');
    URL.revokeObjectURL = vi.fn();

    clickedAnchor = undefined;
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        clickedAnchor = element as HTMLAnchorElement;
        vi.spyOn(element, 'click').mockImplementation(() => {});
      }
      return element;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('draws the background, both dial images, and both labels onto the canvas', async () => {
    const svgs = [makeFakeSvg(), makeFakeSvg()];

    await downloadDialsSnapshot(svgs, ['☀️ AM', '🌙 PM']);

    expect(fillRect).toHaveBeenCalled();
    expect(drawImage).toHaveBeenCalledTimes(2);
    expect(fillText).toHaveBeenCalledTimes(2);
    expect(fillText).toHaveBeenCalledWith('☀️ AM', expect.any(Number), expect.any(Number));
    expect(fillText).toHaveBeenCalledWith('🌙 PM', expect.any(Number), expect.any(Number));
  });

  test('exports a PNG and triggers a download with the dated filename', async () => {
    const svgs = [makeFakeSvg(), makeFakeSvg()];

    await downloadDialsSnapshot(svgs, ['☀️ AM', '🌙 PM']);

    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png'
    );
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickedAnchor?.download).toBe(formatSnapshotFilename(new Date()));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });
});
