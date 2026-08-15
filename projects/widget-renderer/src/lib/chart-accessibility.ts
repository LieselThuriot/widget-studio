import { ChartElement, ProgressElement } from './widget.model';

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

export function chartAriaLabel(element: ChartElement | ProgressElement): string {
  if (element.type === 'progress') {
    return `${element.data.label || 'Progress'}, ${number(element.data.value)} of ${number(element.data.max)}.`;
  }
  if (element.type === 'gauge') {
    return `${element.title || 'Gauge'}, ${number(element.data.value)} of ${number(element.data.max)}.`;
  }
  return `${element.title || element.type} chart, ${element.data.length} data points.`;
}

export function chartAccessibilitySummary(element: ChartElement | ProgressElement): string {
  if (element.type === 'progress') {
    return `${element.data.label || 'Progress'}: value ${number(element.data.value)}, minimum ${number(element.data.min)}, maximum ${number(element.data.max)}.`;
  }
  if (element.type === 'gauge') {
    const range = Math.max(1, element.data.max - element.data.min);
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
