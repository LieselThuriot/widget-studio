import { ChartElement, ProgressElement, ProgressSegment } from './widget.model';
import { defaultWidgetRendererLocale, WidgetRendererChartLocale } from './widget-locale';

const MAX_POINTS = 20;

function number(value: number): string {
  return Number.isInteger(value)
    ? `${value}`
    : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function points(
  data: { label: string; value: number }[],
  locale: WidgetRendererChartLocale,
): string {
  const visible = data
    .slice(0, MAX_POINTS)
    .map((point) => `${point.label}: ${number(point.value)}`);
  const remaining = data.length - visible.length;
  return remaining > 0
    ? `${visible.join('; ')}; ${locale.morePoints(remaining)}`
    : visible.join('; ');
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

export function chartAriaLabel(
  element: ChartElement | ProgressElement,
  locale = defaultWidgetRendererLocale.aria.chart,
): string {
  if (element.type === 'progress') {
    return locale.progressAriaLabel(
      element.title,
      number(progressValue(element)),
      number(element.data.max - element.data.min),
    );
  }
  if (element.type === 'gauge') {
    return locale.gaugeAriaLabel(
      element.title,
      number(element.data.value),
      number(element.data.max),
    );
  }
  return locale.chartAriaLabel(element.title, element.type, element.data.length);
}

export function chartAccessibilitySummary(
  element: ChartElement | ProgressElement,
  locale = defaultWidgetRendererLocale.aria.chart,
): string {
  if (element.type === 'progress') {
    const segments = progressSegments(element);
    const breakdown = segments.length
      ? ` ${segments.map(({ segment, start, end }) => locale.progressBreakdown(segment.label, number(start), number(end))).join('; ')}.`
      : locale.noSegmentsSummary;
    return locale.progressSummary(
      element.title,
      number(progressValue(element)),
      number(element.data.min),
      number(element.data.max),
      breakdown,
    );
  }
  if (element.type === 'gauge') {
    const range = element.data.max - element.data.min;
    const percentage = Math.max(
      0,
      Math.min(100, ((element.data.value - element.data.min) / range) * 100),
    );
    return locale.gaugeSummary(
      element.title,
      number(element.data.value),
      number(element.data.max),
      number(percentage),
    );
  }
  if (!element.data.length) return locale.noDataSummary(element.title);
  return locale.dataSummary(element.title, points(element.data, locale));
}
