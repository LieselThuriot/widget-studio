export const chartColors = {
  legend: '#f6f7fb',
  title: '#f6f7fb',
  line: '#7dd3fc',
  fill: '#7dd3fc',
  track: '#334155',
  axisLabel: '#d4dbea',
  axisLine: '#94a3b8',
  grid: '#475569',
  divider: '#64748b',
} as const;

export function readableTextColor(backgroundColor?: string): string {
  const luminance = colorLuminance(backgroundColor);
  return luminance === null || luminance < 0.5 ? chartColors.legend : '#172033';
}

export function randomPastelColor(existingColors: readonly string[] = []): string {
  const existingHues = existingColors.map(colorHue).filter((hue): hue is number => hue !== null);
  const hue = selectDistinctHue(existingHues);
  const saturation = 65 + Math.random() * 20;
  const lightness = 75 + Math.random() * 10;
  const chroma = ((1 - Math.abs((2 * lightness) / 100 - 1)) * saturation) / 100;
  const hueSegment = hue / 60;
  const secondComponent = chroma * (1 - Math.abs((hueSegment % 2) - 1));
  const [red, green, blue] =
    hueSegment < 1
      ? [chroma, secondComponent, 0]
      : hueSegment < 2
        ? [secondComponent, chroma, 0]
        : hueSegment < 3
          ? [0, chroma, secondComponent]
          : hueSegment < 4
            ? [0, secondComponent, chroma]
            : hueSegment < 5
              ? [secondComponent, 0, chroma]
              : [chroma, 0, secondComponent];
  const lightnessAdjustment = lightness / 100 - chroma / 2;
  const toHex = (channel: number) =>
    Math.round((channel + lightnessAdjustment) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function selectDistinctHue(existingHues: readonly number[]): number {
  if (existingHues.length === 0) return Math.floor(Math.random() * 360);

  const candidates = Array.from({ length: 12 }, () => Math.random() * 360);
  return candidates.reduce((best, candidate) =>
    hueDistance(candidate, existingHues) > hueDistance(best, existingHues) ? candidate : best,
  );
}

function hueDistance(hue: number, existingHues: readonly number[]): number {
  return Math.min(...existingHues.map((existingHue) => circularDistance(hue, existingHue)));
}

function circularDistance(first: number, second: number): number {
  const distance = Math.abs(first - second) % 360;
  return Math.min(distance, 360 - distance);
}

function colorHue(color: string): number | null {
  const value = color.trim().match(/^#([\da-f]{6})$/i)?.[1];
  if (!value) return null;

  const red = parseInt(value.slice(0, 2), 16) / 255;
  const green = parseInt(value.slice(2, 4), 16) / 255;
  const blue = parseInt(value.slice(4, 6), 16) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;
  if (delta === 0) return null;

  let hue =
    maximum === red
      ? ((green - blue) / delta) % 6
      : maximum === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;
  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

function colorLuminance(color: string | undefined): number | null {
  const value = color?.trim().match(/^#([\da-f]{3,8})$/i)?.[1];
  if (!value || (value.length !== 3 && value.length !== 6 && value.length !== 8)) return null;

  const channels =
    value.length === 3
      ? [value[0] + value[0], value[1] + value[1], value[2] + value[2]]
      : [value.slice(0, 2), value.slice(2, 4), value.slice(4, 6)];
  const [red, green, blue] = channels.map((channel) => parseInt(channel, 16) / 255);
  const linear = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}
