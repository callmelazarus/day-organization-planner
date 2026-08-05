import { describe, expect, test } from 'vitest';
import { generatePastelColor } from './pastelColor';

describe('generatePastelColor', () => {
  test('derives fill and text color from the same hue', () => {
    const color = generatePastelColor(() => 0.5);
    expect(color.fill).toBe('hsl(180, 70%, 85%)');
    expect(color.textColor).toBe('hsl(180, 70%, 30%)');
  });

  test('spans the full hue range based on the random input', () => {
    expect(generatePastelColor(() => 0).fill).toBe('hsl(0, 70%, 85%)');
    expect(generatePastelColor(() => 0.9999).fill).toBe('hsl(359, 70%, 85%)');
  });

  test('text color is a darker lightness than the fill at the same hue', () => {
    const color = generatePastelColor(() => 0.2);
    expect(color.fill).toContain('85%');
    expect(color.textColor).toContain('30%');
  });
});
