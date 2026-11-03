import { arc, pie } from 'd3-shape';
import { defaultChartColor } from './interactive-chart';
import { ChartDataPoint, FunnelElement, PieElement } from './widget.model';

const HOVER_GROWTH = 6;

export interface PieSlice {
  index: number;
  label: string;
  value: number;
  color: string;
  path: string;
  activePath: string;
  centroid: [number, number];
}

export interface PieChartLayout {
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  slices: PieSlice[];
}

export interface FunnelSegment {
  index: number;
  label: string;
  value: number;
  color: string;
  points: string;
  centerX: number;
  centerY: number;
}

export function chartColor(point: ChartDataPoint, index: number): string {
  return point.color || defaultChartColor(index);
}

export function pieChartLayout(element: PieElement, width: number, height: number): PieChartLayout {
  const outerRadius = Math.max(0, (Math.min(width, height) / 2) * 0.86 - HOVER_GROWTH);
  const innerRadius = element.type === 'donut' ? outerRadius * 0.62 : 0;
  const shape = arc<{ startAngle: number; endAngle: number }>().innerRadius(innerRadius);
  const arcs = pie<ChartDataPoint>()
    .sort(null)
    .value(({ value }) => Math.max(0, value))(element.data);
  return {
    centerX: width / 2,
    centerY: height / 2,
    innerRadius,
    outerRadius,
    slices: arcs.map((slice, index) => {
      const point = element.data[index];
      const angles = { startAngle: slice.startAngle, endAngle: slice.endAngle };
      const centroid = shape.outerRadius(outerRadius).centroid(angles);
      return {
        index,
        label: point.label,
        value: point.value,
        color: chartColor(point, index),
        path: shape.outerRadius(outerRadius)(angles) ?? '',
        activePath: shape.outerRadius(outerRadius + HOVER_GROWTH)(angles) ?? '',
        centroid: [centroid[0] + width / 2, centroid[1] + height / 2],
      };
    }),
  };
}

export function funnelChartLayout(
  element: FunnelElement,
  width: number,
  height: number,
): FunnelSegment[] {
  const gap = 3;
  const count = element.data.length;
  if (!count) return [];
  const boxLeft = width * 0.08;
  const boxWidth = width * 0.84;
  const top = 4;
  const itemHeight = Math.max(1, (height - top * 2 - gap * (count - 1)) / count);
  const max = Math.max(1, ...element.data.map(({ value }) => value));
  const size = (value: number) => boxWidth * (0.1 + 0.78 * Math.min(1, Math.max(0, value / max)));
  const order = element.data
    .map((point, index) => ({ point, index }))
    .sort((a, b) => b.point.value - a.point.value);
  const centerX = boxLeft + boxWidth / 2;
  const segments = order.map(({ point, index }, position) => {
    const y = top + position * (itemHeight + gap);
    const topWidth = size(point.value);
    const bottomWidth = size(order[position + 1]?.point.value ?? 0);
    return {
      index,
      label: point.label,
      value: point.value,
      color: chartColor(point, index),
      points: [
        [centerX - topWidth / 2, y],
        [centerX + topWidth / 2, y],
        [centerX + bottomWidth / 2, y + itemHeight],
        [centerX - bottomWidth / 2, y + itemHeight],
      ]
        .map(([x, pointY]) => `${x},${pointY}`)
        .join(' '),
      centerX,
      centerY: y + itemHeight / 2,
    };
  });
  return segments.sort((a, b) => a.index - b.index);
}
