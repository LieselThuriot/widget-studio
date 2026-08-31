import { ChartElement, ProgressElement, ProgressSegment } from './widget.model';

const MAX_POINTS = 20;

function number(value: number): string {
  return Number.isInteger(value)
    ? `${value}`
    : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function points(data: { label: string; value: number }[]): string {
  const visible = data
    .slice(0, MAX_POINTS)
    .map((point) => `${point.label}: ${number(point.value)}`);
  const remaining = data.length - visible.length;
  return remaining > 0 ? `${visible.join('; ')}; ${remaining} more points.` : visible.join('; ');
}

function progressSegments(
  element: ProgressElement,
): { segment: ProgressSegment; start: number; end: number }[] {
  let position = element.data.min;
  return element.data.items.flatMap((item) => {
    const start = position;
    position += item.value;
    return item.kind === 'segment' ? [{ segment: item, start, end: position }] : [];
  });
}

function progressValue(element: ProgressElement): number {
  return element.data.items.reduce(
    (total, item) => total + (item.kind === 'segment' ? item.value : 0),
    0,
  );
}

export function chartAriaLabel(element: ChartElement | ProgressElement): string {
  if (element.type === 'progress') {
    return `${element.title || 'Progress'}, ${number(progressValue(element))} of ${number(element.data.max - element.data.min)}.`;
  }
  if (element.type === 'gauge') {
    return `${element.title || 'Gauge'}, ${number(element.data.value)} of ${number(element.data.max)}.`;
  }
  return `${element.title || element.type} chart, ${element.data.length} data points.`;
}

export function chartAccessibilitySummary(element: ChartElement | ProgressElement): string {
  if (element.type === 'progress') {
    const segments = progressSegments(element);
    const breakdown = segments.length
      ? ` ${segments.map(({ segment, start, end }) => `${segment.label}: ${number(start)} to ${number(end)}`).join('; ')}.`
      : ' No segments.';
    return `${element.title || 'Progress'}: ${number(progressValue(element))} of ${number(element.data.max - element.data.min)}; range ${number(element.data.min)} to ${number(element.data.max)}.${breakdown}`;
  }
  if (element.type === 'gauge') {
    const range = element.data.max - element.data.min;
    const percentage = Math.max(
      0,
      Math.min(100, ((element.data.value - element.data.min) / range) * 100),
    );
    return `${element.title || 'Gauge'}: value ${number(element.data.value)} of ${number(element.data.max)}, ${number(percentage)} percent.`;
  }
  const title = element.title ? `${element.title}: ` : '';
  if (!element.data.length) return `${title}no data.`;
  return `${title}${points(element.data)}.`;
}
