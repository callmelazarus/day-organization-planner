import '@testing-library/jest-dom/vitest';

// jsdom has no canvas implementation; the avatar skips drawing when there is no 2d context.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
