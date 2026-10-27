import {
  ButtonElement,
  ChartElement,
  GaugeElement,
  AxisChartStyle,
  ChartStyle,
  ValueChartStyle,
  ImageElement,
  DividerElement,
  ProgressElement,
  SeriesElement,
  TextElement,
  WidgetElement,
} from './editor-model';
import { WidgetElementBase } from '@lieselthuriot/widget-renderer';
import { chartColors, randomPastelColor, readableTextColor } from './colors';

export function createWidgetElement(
  type: WidgetElement['type'],
  id: string,
  backgroundColor?: string,
): WidgetElement {
  const textColor = readableTextColor(backgroundColor);
  const base = {
    id,
    type,
    grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1, anchor: 'top left' as const },
    sensitive: false,
  };

  if (type === 'text') {
    return {
      ...base,
      type,
      text: 'New text',
      style: {
        color: textColor,
        font: { size: 14, bold: false, italic: false, underline: false, strikethrough: false },
        align: 'left',
        wrap: true,
      },
    } as TextElement;
  }

  if (type === 'image') {
    return {
      ...base,
      type,
      source: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400',
      alt: 'Widget image',
      fit: 'cover',
      grid: { ...base.grid, anchor: 'center' as const },
      overlayColor: undefined,
      radius: 8,
    } as ImageElement;
  }

  if (type === 'button') {
    return {
      ...base,
      type,
      label: 'New action',
      method: 'get',
      url: '/',
      requestRefresh: false,
      showOnlyOnHover: false,
      style: 'solid',
    } as ButtonElement;
  }

  if (type === 'divider') {
    return {
      ...base,
      type,
      orientation: 'horizontal',
      grid: { ...base.grid, anchor: 'center' as const },
      style: { color: chartColors.divider },
    } as DividerElement;
  }

  return createChartElement(type, base, backgroundColor);
}

function createChartElement(
  type: Exclude<WidgetElement['type'], 'text' | 'image' | 'button' | 'divider'>,
  base: Omit<WidgetElementBase, 'type'>,
  backgroundColor?: string,
): ChartElement | ProgressElement {
  const firstColor = randomPastelColor();
  const data = [
    { label: 'Complete', value: 72, color: firstColor },
    { label: 'Remaining', value: 28, color: randomPastelColor([firstColor]) },
  ];

  if (type === 'progress') {
    const textColor = readableTextColor(backgroundColor);
    return {
      ...base,
      type,
      title: 'Completion',
      data: {
        min: 0,
        max: 100,
        items: [
          { kind: 'segment', label: 'Complete', value: 72, color: firstColor, active: false },
        ],
      },
      style: {
        color: {
          legend: textColor,
          title: textColor,
          track: chartColors.track,
        },
        font: { size: 11 },
        radius: { segment: 0, track: 999 },
      },
      showLegend: true,
    } as ProgressElement;
  }

  if (type === 'gauge') {
    const valueStyle = defaultValueChartStyle(backgroundColor);
    return {
      ...base,
      grid: chartGrid(base),
      type,
      title: 'Performance',
      data: { value: 72, min: 0, max: 100 },
      showLegend: true,
      style: {
        ...valueStyle,
        color: { ...valueStyle.color, fill: firstColor },
      },
    } as GaugeElement;
  }

  return {
    ...base,
    grid: chartGrid(base),
    type,
    title: createTitle(type),
    data,
    showLegend: type === 'pie' || type === 'donut' || type === 'funnel',
    style:
      type === 'pie' || type === 'donut' || type === 'funnel'
        ? defaultChartStyle(backgroundColor)
        : defaultAxisChartStyle(backgroundColor),
  } as SeriesElement;
}

function createTitle(type: 'pie' | 'donut' | 'funnel' | 'bar' | 'line'): string {
  switch (type) {
    case 'pie':
      return 'Distribution';
    case 'donut':
      return 'Composition';
    case 'funnel':
      return 'Conversion';
    case 'bar':
      return 'Comparison';
    case 'line':
      return 'Trend';
    default:
      return 'Chart';
  }
}

function chartGrid(
  base: Omit<WidgetElementBase, 'type'>,
): Omit<WidgetElementBase['grid'], 'anchor'> {
  const { anchor: _anchor, ...grid } = base.grid;
  return grid;
}

export function defaultAxisChartStyle(backgroundColor?: string): AxisChartStyle {
  const textColor = readableTextColor(backgroundColor);
  return {
    color: {
      legend: textColor,
      title: textColor,
      line: chartColors.line,
    },
    font: { size: 11 },
    axis: { label: textColor, line: chartColors.axisLine, grid: chartColors.grid },
  };
}

export function defaultChartStyle(backgroundColor?: string): ChartStyle {
  const textColor = readableTextColor(backgroundColor);
  return {
    color: { legend: textColor, title: textColor },
    font: { size: 11 },
  };
}

export function defaultValueChartStyle(backgroundColor?: string): ValueChartStyle {
  const textColor = readableTextColor(backgroundColor);
  return {
    color: {
      legend: textColor,
      title: textColor,
      fill: chartColors.fill,
      track: chartColors.track,
    },
    font: { size: 11 },
  };
}
