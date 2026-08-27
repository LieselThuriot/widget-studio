import {
  ChartElement,
  GaugeElement,
  ProgressElement,
  WidgetElement,
  WidgetInput,
} from 'widget-renderer';
import { Widget } from './editor-model';

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
  return {
    ...widget,
    refresh: widget.refresh ?? { enabled: false, label: 'Refresh widget' },
    elements: widget.elements.map(normalizeElement) as Widget['elements'],
  };
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
  return { ...element, grid };
}

export function normalizeGaugeElement(
  element: GaugeElement,
  grid: WidgetElement['grid'],
): GaugeElement {
  return { ...element, grid };
}

export function normalizeChartElement(
  element: ChartElement,
  grid: WidgetElement['grid'],
): ChartElement {
  return { ...element, grid };
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
