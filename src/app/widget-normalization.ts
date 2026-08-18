import {
  ChartElement,
  FontStyle,
  GaugeElement,
  ProgressElement,
  Widget,
  WidgetElement,
} from 'widget-renderer';
import { chartColors } from './colors';

const defaultGraphStyle = {
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
const chartTypes = ['pie', 'donut', 'gauge', 'bar', 'line'] as const;
const seriesTypes = ['pie', 'donut', 'bar', 'line'] as const;

type LegacyLayout = WidgetElement & {
  row?: number;
  column?: number;
  rowSpan?: number;
  columnSpan?: number;
  anchor?: WidgetElement['grid']['anchor'];
};

export function normalizeWidget(widget: Widget): Widget {
  return { ...widget, elements: widget.elements.map(normalizeElement) };
}

export function normalizeElement(element: WidgetElement): WidgetElement {
  const legacyLayout = element as LegacyLayout;
  const grid = normalizeGrid(element, legacyLayout);

  if (element.type === 'text') return normalizeTextElement(element, grid);
  if (element.type === 'progress') return normalizeProgressElement(element, grid);
  if (element.type === 'gauge') return normalizeGaugeElement(element, grid);
  if (isSeriesElement(element)) return normalizeChartElement(element, grid);
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
        weight:
          (legacyFont['weight'] as 400 | 500 | 600 | 700 | undefined) ??
          (style['fontWeight'] as 400 | 500 | 600 | 700 | undefined) ??
          legacy.fontWeight ??
          element.style.font?.weight,
        style:
          (legacyFont['style'] as 'normal' | 'italic' | undefined) ??
          (legacy.italic ? 'italic' : 'normal'),
        decoration:
          (legacyFont['decoration'] as FontStyle['decoration'] | undefined) ??
          (legacy.underline && legacy.strikethrough
            ? 'underline line-through'
            : legacy.underline
              ? 'underline'
              : legacy.strikethrough
                ? 'line-through'
                : 'none'),
      },
    },
  };
}

export function normalizeProgressElement(
  element: ProgressElement,
  grid: WidgetElement['grid'],
): ProgressElement {
  const legacy = element as ProgressElement & {
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
      label: element.data?.label ?? legacy.label ?? 'Progress',
      value: element.data?.value ?? legacy.value ?? 0,
      min: element.data?.min ?? legacy.min ?? 0,
      max: element.data?.max ?? legacy.max ?? 100,
    },
    style: {
      color: {
        legend:
          (color['legend'] as string | undefined) ??
          (style['legendColor'] as string | undefined) ??
          chartColors.legend,
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
        defaultGraphStyle.font.size,
    },
    color: {
      ...color,
      legend: color['legend'] ?? style['legendColor'] ?? defaultGraphStyle.color.legend,
      title: color['title'] ?? style['titleColor'] ?? defaultGraphStyle.color.title,
    },
  };
  if (element.type === 'pie' || element.type === 'donut') {
    return { ...element, grid, style: sharedStyle } as ChartElement;
  }
  return {
    ...element,
    grid,
    style: {
      ...sharedStyle,
      color: {
        ...sharedStyle.color,
        line: color['line'] ?? style['lineColor'] ?? defaultGraphStyle.color.line,
      },
      axis: {
        ...defaultGraphStyle.axis,
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

function isChartElement(element: WidgetElement): element is ChartElement {
  return chartTypes.includes(element.type as (typeof chartTypes)[number]);
}

function isSeriesElement(
  element: WidgetElement,
): element is Extract<ChartElement, { type: 'pie' | 'donut' | 'bar' | 'line' }> {
  return seriesTypes.includes(element.type as (typeof seriesTypes)[number]);
}

function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}
