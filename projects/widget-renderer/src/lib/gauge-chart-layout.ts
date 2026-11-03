import { arc } from 'd3-shape';
import { GaugeElement } from './widget.model';

const START_ANGLE = (-110 * Math.PI) / 180;
const END_ANGLE = (110 * Math.PI) / 180;
const SPLITS = 6;
const MINOR_SPLITS = 5;
const BELOW_CENTER = Math.sin((20 * Math.PI) / 180);

export interface GaugeTick {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  major: boolean;
}

export interface GaugeLabel {
  x: number;
  y: number;
  text: string;
}

export interface GaugeChartLayout {
  centerX: number;
  centerY: number;
  radius: number;
  track: string;
  fill: string;
  ticks: GaugeTick[];
  labels: GaugeLabel[];
  pointer: string;
  valueY: number;
}

export function gaugeRatio(element: GaugeElement): number {
  const { value, min, max } = element.data;
  return max === min ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function polar(centerX: number, centerY: number, radius: number, angle: number): [number, number] {
  return [centerX + radius * Math.sin(angle), centerY - radius * Math.cos(angle)];
}

export function gaugeChartLayout(
  element: GaugeElement,
  width: number,
  height: number,
): GaugeChartLayout {
  const fontSize = element.style.font.size;
  const outside = element.showLegend ? 16 + fontSize * 1.2 : 12;
  const radius = Math.max(
    8,
    Math.min(width / 2 - outside, (height - outside - 4) / (1 + BELOW_CENTER)),
  );
  const centerX = width / 2;
  const used = outside + radius * (1 + BELOW_CENTER);
  const centerY = outside + radius + Math.max(0, (height - used) / 2);
  const band = Math.min(16, radius * 0.25);
  const ring = arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(radius - band)
    .outerRadius(radius)
    .cornerRadius(band / 2);
  const valueAngle = START_ANGLE + (END_ANGLE - START_ANGLE) * gaugeRatio(element);
  const ticks: GaugeTick[] = [];
  const labels: GaugeLabel[] = [];
  const { min, max } = element.data;
  for (let step = 0; step <= SPLITS * MINOR_SPLITS; step++) {
    const major = step % MINOR_SPLITS === 0;
    const angle = START_ANGLE + ((END_ANGLE - START_ANGLE) * step) / (SPLITS * MINOR_SPLITS);
    const [x1, y1] = polar(centerX, centerY, radius + 2, angle);
    const [x2, y2] = polar(centerX, centerY, radius + (major ? 10 : 6), angle);
    ticks.push({ x1, y1, x2, y2, major });
    if (major && element.showLegend) {
      const [x, y] = polar(centerX, centerY, radius + 12 + fontSize * 0.8, angle);
      const value = min + ((max - min) * step) / (SPLITS * MINOR_SPLITS);
      labels.push({ x, y, text: `${Math.round(value)}` });
    }
  }
  const length = radius * 0.55;
  const [tipX, tipY] = polar(centerX, centerY, length, valueAngle);
  const [leftX, leftY] = polar(centerX, centerY, 2.5, valueAngle - Math.PI / 2);
  const [rightX, rightY] = polar(centerX, centerY, 2.5, valueAngle + Math.PI / 2);
  return {
    centerX,
    centerY,
    radius,
    track: ring({ startAngle: START_ANGLE, endAngle: END_ANGLE }) ?? '',
    fill:
      valueAngle > START_ANGLE
        ? (ring({ startAngle: START_ANGLE, endAngle: valueAngle }) ?? '')
        : '',
    ticks,
    labels,
    pointer: `${leftX},${leftY} ${tipX},${tipY} ${rightX},${rightY}`,
    valueY: centerY + radius * 0.4,
  };
}
