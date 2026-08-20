import {
  ChartElement,
  GaugeElement,
  ProgressElement,
  WidgetElement,
  WidgetInput,
} from 'widget-renderer';
import { chartColors } from './colors';
import { Widget } from './editor-model';

const defaultAxisChartStyle = {
  color: {
    legend: chartColors.legend,
    title: chartColors.title,
    line: chartColors.line,
    axisLabel: chartColors.axisLabel,
    axisLine: chartColors.axisLine,
    grid: chartColors.grid,
  },
  font: { size: 11 },
  axis: { label: chartColors.axisLabel, line: chartColors.axisLine, grid: chartColors.grid },
};
const chartTypes = ['pie', 'donut', 'funnel', 'gauge', 'bar', 'line'] as const;
const seriesTypes = ['pie', 'donut', 'funnel', 'bar', 'line'] as const;

type LegacyLayout = WidgetElement & {
  row?: number;
  column?: number;
  rowSpan?: number;
  columnSpan?: number;
  anchor?: WidgetElement['grid']['anchor'];
};

export function normalizeWidget(widget: Widget): Widget {
  return { ...widget, elements: widget.elements.map(normalizeElement) as Widget['elements'] };
}

export function assignEditorIds(widget: WidgetInput): Widget {
  return {
    ...widget,
    elements: widget.elements.map((element, index) => ({
      ...element,
      id:
        'id' in element && typeof element.id === 'string'
          ? element.id
          : `${element.type}-${index}-${crypto.randomUUID()}`,
    })),
  } as Widget;
}

export function normalizeElement(element: WidgetElement): WidgetElement {
  const legacyLayout = element as LegacyLayout;
  const grid = normalizeGrid(element, legacyLayout);

  if (element.type === 'text') return normalizeTextElement(element, grid);
  if (element.type === 'progress') return normalizeProgressElement(element, grid);
  if (element.type === 'gauge') return normalizeGaugeElement(element, grid);
  if (isSeriesElement(element))
    return normalizeChartElement(element as ChartElement, grid) as WidgetElement;
  return { ...element, grid };
}

export function normalizeTextElement(
  element: Extract<WidgetElement, { type: 'text' }>,
  grid: WidgetElement['grid'],
): Extract<WidgetElement, { type: 'text' }> {
  const style = element.style as unknown as Record<string, unknown>;
  const legacyFont = recordValue(style['font']);
  const legacy = style as {
    fontSize?: number;
    fontWeight?: 400 | 500 | 600 | 700;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
  return {
    ...element,
    grid,
    style: {
      ...element.style,
      font: {
        size:
          (legacyFont['size'] as number | undefined) ??
          (style['fontSize'] as number | undefined) ??
          legacy.fontSize ??
          element.style.font?.size,
        bold:
          (legacyFont['bold'] as boolean | undefined) ??
          ((legacyFont['weight'] as number | undefined) ??
            (style['fontWeight'] as number | undefined) ??
            legacy.fontWeight ??
            400) >= 600,
        italic:
          (legacyFont['italic'] as boolean | undefined) ??
          ((legacyFont['style'] as string | undefined) === 'italic' || legacy.italic === true),
        underline:
          (legacyFont['underline'] as boolean | undefined) ??
          (legacyFont['decoration'] as string | undefined)?.includes('underline') ??
          legacy.underline === true,
        strikethrough:
          (legacyFont['strikethrough'] as boolean | undefined) ??
          (legacyFont['decoration'] as string | undefined)?.includes('line-through') ??
          legacy.strikethrough === true,
      },
    },
  };
}

export function normalizeProgressElement(
  element: ProgressElement,
  grid: WidgetElement['grid'],
): ProgressElement {
  const legacy = element as ProgressElement & {
    title?: string;
    titleColor?: string;
    color?: string;
    trackColor?: string;
    label?: string;
    value?: number;
    min?: number;
    max?: number;
    style?: Record<string, unknown>;
  };
  const style = legacy.style ?? {};
  const color = recordValue(style['color']);
  return {
    ...element,
    grid,
    data: {
      label: element.data?.label ?? legacy.label ?? 'Complete',
      value: element.data?.value ?? legacy.value ?? 0,
      min: element.data?.min ?? legacy.min ?? 0,
      max: element.data?.max ?? legacy.max ?? 100,
      separator: element.data?.separator ?? ' of ',
      suffix: element.data?.suffix ?? '',
    },
    style: {
      color: {
        legend:
          (color['legend'] as string | undefined) ??
          (style['legendColor'] as string | undefined) ??
          chartColors.legend,
        title:
          (color['title'] as string | undefined) ??
          (style['titleColor'] as string | undefined) ??
          legacy.titleColor ??
          chartColors.title,
        fill:
          (color['fill'] as string | undefined) ??
          (style['fillColor'] as string | undefined) ??
          legacy.color ??
          chartColors.fill,
        track:
          (color['track'] as string | undefined) ??
          (style['trackColor'] as string | undefined) ??
          legacy.trackColor ??
          chartColors.track,
      },
      font: { size: (style['fontSize'] as number | undefined) ?? 11 },
    },
    title: element.title ?? legacy.title ?? element.data?.label ?? 'Completion',
    showLegend: element.showLegend ?? true,
    active: element.active ?? false,
  };
}

export function normalizeGaugeElement(
  element: GaugeElement,
  grid: WidgetElement['grid'],
): GaugeElement {
  const legacy = element as GaugeElement & { min?: number; max?: number };
  const style = element.style as unknown as Record<string, unknown>;
  const color = recordValue(style['color']);
  return {
    ...element,
    grid,
    data: {
      value: element.data?.value ?? 0,
      min: element.data?.min ?? legacy.min ?? 0,
      max: element.data?.max ?? legacy.max ?? 100,
    },
    style: {
      color: {
        legend:
          (color['legend'] as string | undefined) ??
          (style['legendColor'] as string | undefined) ??
          chartColors.legend,
        title:
          (color['title'] as string | undefined) ??
          (style['titleColor'] as string | undefined) ??
          chartColors.title,
        fill:
          (color['fill'] as string | undefined) ??
          (style['fillColor'] as string | undefined) ??
          chartColors.fill,
        track:
          (color['track'] as string | undefined) ??
          (style['trackColor'] as string | undefined) ??
          chartColors.track,
      },
      font: { size: (style['fontSize'] as number | undefined) ?? 11 },
    },
    showLegend: element.showLegend ?? true,
  };
}

export function normalizeChartElement(
  element: ChartElement,
  grid: WidgetElement['grid'],
): ChartElement {
  const style = element.style as unknown as Record<string, unknown>;
  const color = recordValue(style['color']);
  const font = recordValue(style['font']);
  const axis = recordValue(style['axis']);
  const sharedStyle = {
    font: {
      ...font,
      size:
        (font['size'] as number | undefined) ??
        (style['fontSize'] as number | undefined) ??
        defaultAxisChartStyle.font.size,
    },
    color: {
      ...color,
      legend: color['legend'] ?? style['legendColor'] ?? defaultAxisChartStyle.color.legend,
      title: color['title'] ?? style['titleColor'] ?? defaultAxisChartStyle.color.title,
    },
  };
  if (element.type === 'pie' || element.type === 'donut' || element.type === 'funnel') {
    return { ...element, grid, style: sharedStyle } as ChartElement;
  }
  return {
    ...element,
    grid,
    style: {
      ...sharedStyle,
      color: {
        ...sharedStyle.color,
        line: color['line'] ?? style['lineColor'] ?? defaultAxisChartStyle.color.line,
      },
      axis: {
        ...defaultAxisChartStyle.axis,
        ...axis,
        label: style['axisLabelColor'] ?? axis['label'],
        line: style['axisLineColor'] ?? axis['line'],
        grid: style['gridColor'] ?? axis['grid'],
      },
    },
  } as ChartElement;
}

function normalizeGrid(element: WidgetElement, legacyLayout: LegacyLayout) {
  const grid = element.grid ?? {
    row: legacyLayout.row ?? 0,
    column: legacyLayout.column ?? 0,
    rowSpan: legacyLayout.rowSpan ?? 1,
    columnSpan: legacyLayout.columnSpan ?? 1,
    ...(legacyLayout.anchor ? { anchor: legacyLayout.anchor } : {}),
  };
  return isChartElement(element)
    ? (({ anchor: _anchor, ...chartGrid }) => chartGrid)(grid)
    : { ...grid, anchor: grid.anchor ?? legacyLayout.anchor ?? 'top left' };
}

function isChartElement(element: WidgetElement): boolean {
  return chartTypes.includes(element.type as (typeof chartTypes)[number]);
}

function isSeriesElement(element: WidgetElement): boolean {
  return seriesTypes.includes(element.type as (typeof seriesTypes)[number]);
}

function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}
