export interface PastelColor {
  fill: string;
  textColor: string;
}

export function generatePastelColor(randomFn: () => number = Math.random): PastelColor {
  const hue = Math.floor(randomFn() * 360);
  return {
    fill: `hsl(${hue}, 70%, 85%)`,
    textColor: `hsl(${hue}, 70%, 30%)`,
  };
}
