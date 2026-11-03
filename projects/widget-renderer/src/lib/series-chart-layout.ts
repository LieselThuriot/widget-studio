import { tickIncrement, ticks as arrayTicks } from 'd3-array';
import { curveMonotoneX, line } from 'd3-shape';
import { SeriesElement } from './widget.model';

export const DEFAULT_SERIES_COLOR = '#5470c6';
const CHAR_WIDTH = 0.6;
const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

function niceDomain(start: number, stop: number, count: number): [number, number] {
  let previous: number | undefined;
  for (let attempt = 0; attempt < 10; attempt++) {
    const step = tickIncrement(start, stop, count);
    if (step === previous || step === 0 || !Number.isFinite(step)) break;
    if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
    } else {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
    }
    previous = step;
  }
  return [start, stop];
}

export interface SeriesChartTick {
  value: number;
  y: number;
  label: string;
}

export interface SeriesChartCategory {
  index: number;
  label: string;
  value: number;
  color: string;
  x: number;
  center: number;
  width: number;
  barY: number;
  barHeight: number;
  pointY: number;
  showLabel: boolean;
}

export interface SeriesChartLayout {
  width: number;
  height: number;
  plot: { left: number; top: number; right: number; bottom: number };
  title: { x: number; y: number } | null;
  ticks: SeriesChartTick[];
  zeroY: number;
  categories: SeriesChartCategory[];
  linePath: string | null;
  bandWidth: number;
  barWidth: number;
}

export function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * CHAR_WIDTH;
}

export function formatAxisValue(value: number): string {
  return numberFormat.format(value);
}

export function seriesChartLayout(
  element: SeriesElement,
  width: number,
  height: number,
): SeriesChartLayout {
  const fontSize = element.style.font.size;
  const values = element.data.map(({ value }) => value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const top = element.title ? Math.max(30, fontSize + 18) : 12;
  const bottom = Math.max(top + 1, height - fontSize - (element.showLegend ? 38 : 34));
  const plotHeight = Math.max(1, bottom - top);
  const tickCount = Math.min(5, Math.max(2, Math.round(plotHeight / 45)));
  const [domainMin, domainMax] = niceDomain(
    minValue,
    minValue === maxValue ? 1 : maxValue,
    tickCount,
  );
  const y = (value: number) =>
    bottom - ((value - domainMin) / (domainMax - domainMin)) * (bottom - top);
  const ticks = arrayTicks(domainMin, domainMax, tickCount).map((value) => ({
    value,
    y: y(value),
    label: formatAxisValue(value),
  }));
  const labelWidth = Math.max(0, ...ticks.map(({ label }) => estimateTextWidth(label, fontSize)));
  const left = Math.min(width / 2, labelWidth + 34);
  const right = Math.max(left + 1, width - 12);
  const bandWidth = (right - left) / Math.max(1, element.data.length);
  const barWidth = Math.max(1, Math.min(bandWidth * 0.6, 48));
  const labelSlot = Math.max(
    1,
    ...element.data.map(({ label }) => estimateTextWidth(label, fontSize) + 8),
  );
  const labelInterval = Math.max(1, Math.ceil(labelSlot / Math.max(bandWidth, 1)));
  const zeroY = y(0);
  const lineColor = element.style.color.line ?? DEFAULT_SERIES_COLOR;
  const categories = element.data.map(({ label, value, color }, index) => {
    const bandX = left + index * bandWidth;
    const valueY = y(value);
    return {
      index,
      label,
      value,
      color: color ?? (element.type === 'line' ? lineColor : DEFAULT_SERIES_COLOR),
      x: bandX,
      center: bandX + bandWidth / 2,
      width: bandWidth,
      barY: Math.min(valueY, zeroY),
      barHeight: Math.abs(zeroY - valueY),
      pointY: valueY,
      showLabel: index % labelInterval === 0,
    };
  });
  const linePath =
    element.type === 'line' && categories.length
      ? line<SeriesChartCategory>()
          .x(({ center }) => center)
          .y(({ pointY }) => pointY)
          .curve(curveMonotoneX)(categories)
      : null;
  return {
    width,
    height,
    plot: { left, top, right, bottom },
    title: element.title ? { x: width / 2, y: 5 + fontSize } : null,
    ticks,
    zeroY,
    categories,
    linePath,
    bandWidth,
    barWidth,
  };
}
