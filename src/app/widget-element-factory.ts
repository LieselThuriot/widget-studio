import {
  ButtonElement,
  ChartElement,
  GaugeElement,
  GaugeStyle,
  GraphStyle,
  ImageElement,
  ProgressElement,
  SeriesElement,
  TextElement,
  WidgetElement,
  WidgetElementBase,
} from 'widget-renderer';

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
        color: '#f6f7fb',
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
      style: 'solid',
    } as ButtonElement;
  }

  return createChartElement(type, base);
}

function createChartElement(
  type: Exclude<WidgetElement['type'], 'text' | 'image' | 'button'>,
  base: Omit<WidgetElementBase, 'type'>,
): ChartElement | ProgressElement {
  const data = [
    { label: 'Complete', value: 72, color: '#7dd3fc' },
    { label: 'Remaining', value: 28, color: '#334155' },
  ];

  if (type === 'progress') {
    return {
      ...base,
      type,
      data: { label: 'Progress', value: 72, min: 0, max: 100 },
      style: {
        color: { legend: '#f6f7fb', fill: '#7dd3fc', track: '#334155' },
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
    style: defaultGraphStyle(),
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
      legend: '#f6f7fb',
      title: '#f6f7fb',
    },
    font: { size: 11 },
    axis: { label: '#d4dbea', line: '#94a3b8', grid: '#475569' },
  };
}

export function defaultGaugeStyle(): GaugeStyle {
  return {
    color: {
      legend: '#f6f7fb',
      title: '#f6f7fb',
      fill: '#7dd3fc',
      track: '#334155',
    },
    font: { size: 11 },
  };
}
