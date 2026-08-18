import {
  ButtonElement,
  ChartElement,
  GaugeElement,
  GaugeStyle,
  GraphStyle,
  ImageElement,
  DividerElement,
  PieStyle,
  ProgressElement,
  SeriesElement,
  TextElement,
  WidgetElement,
  WidgetElementBase,
} from 'widget-renderer';
import { chartColors, randomPastelColor } from './colors';

export function createWidgetElement(type: WidgetElement['type'], id: string): WidgetElement {
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
        color: chartColors.legend,
        font: { size: 14, weight: 400, style: 'normal', decoration: 'none' },
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

  return createChartElement(type, base);
}

function createChartElement(
  type: Exclude<WidgetElement['type'], 'text' | 'image' | 'button' | 'divider'>,
  base: Omit<WidgetElementBase, 'type'>,
): ChartElement | ProgressElement {
  const firstColor = randomPastelColor();
  const data = [
    { label: 'Complete', value: 72, color: firstColor },
    { label: 'Remaining', value: 28, color: randomPastelColor([firstColor]) },
  ];

  if (type === 'progress') {
    return {
      ...base,
      type,
      data: { label: 'Progress', value: 72, min: 0, max: 100 },
      style: {
        color: { legend: chartColors.legend, fill: chartColors.fill, track: chartColors.track },
        font: { size: 11 },
      },
      showLegend: true,
      active: false,
    } as ProgressElement;
  }

  if (type === 'gauge') {
    return {
      ...base,
      grid: chartGrid(base),
      type,
      title: 'Performance',
      data: { value: 72, min: 0, max: 100 },
      showLegend: true,
      style: defaultGaugeStyle(),
    } as GaugeElement;
  }

  return {
    ...base,
    grid: chartGrid(base),
    type,
    title: createTitle(type),
    data,
    showLegend: type === 'pie' || type === 'donut',
    style: type === 'pie' || type === 'donut' ? defaultPieStyle() : defaultGraphStyle(),
  } as SeriesElement;
}

function createTitle(type: 'pie' | 'donut' | 'bar' | 'line'): string {
  switch (type) {
    case 'pie':
      return 'Distribution';
    case 'donut':
      return 'Composition';
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

export function defaultGraphStyle(): GraphStyle {
  return {
    color: {
      legend: chartColors.legend,
      title: chartColors.title,
      line: chartColors.line,
    },
    font: { size: 11 },
    axis: { label: chartColors.axisLabel, line: chartColors.axisLine, grid: chartColors.grid },
  };
}

export function defaultPieStyle(): PieStyle {
  return {
    color: { legend: chartColors.legend, title: chartColors.title },
    font: { size: 11 },
  };
}

export function defaultGaugeStyle(): GaugeStyle {
  return {
    color: {
      legend: chartColors.legend,
      title: chartColors.title,
      fill: chartColors.fill,
      track: chartColors.track,
    },
    font: { size: 11 },
  };
}
