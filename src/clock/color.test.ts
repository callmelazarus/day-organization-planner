import { describe, expect, test } from 'vitest';
import { darkenHex } from './color';

describe('darkenHex', () => {
  test('halving lightness on pure red gives maroon', () => {
    expect(darkenHex('#ff0000', 0.5)).toBe('#800000');
  });

  test('halving lightness on pure green gives the CSS "green" shade', () => {
    expect(darkenHex('#00ff00', 0.5)).toBe('#008000');
  });

  test('halving lightness on pure blue gives navy', () => {
    expect(darkenHex('#0000ff', 0.5)).toBe('#000080');
  });

  test('halving lightness on white gives mid grey', () => {
    expect(darkenHex('#ffffff', 0.5)).toBe('#808080');
  });

  test('a factor of 1 leaves the color unchanged', () => {
    expect(darkenHex('#f5b942', 1)).toBe('#f5b942');
  });
});
