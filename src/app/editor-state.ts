import {
  FontStyle,
  GaugeElement,
  GridTrack,
  ProgressElement,
  Widget,
  WidgetElement,
} from 'widget-renderer';

const defaultGraphStyle = {
  color: {
    legend: '#f6f7fb',
    title: '#f6f7fb',
    axisLabel: '#d4dbea',
    axisLine: '#94a3b8',
    grid: '#475569',
  },
  font: { size: 11 },
  axis: { label: '#d4dbea', line: '#94a3b8', grid: '#475569' },
};

export function normalizeWidget(widget: Widget): Widget {
  return {
    ...widget,
    elements: widget.elements.map((element) => {
      const legacyLayout = element as WidgetElement & {
        row?: number;
        column?: number;
        rowSpan?: number;
        columnSpan?: number;
        anchor?: WidgetElement['grid']['anchor'];
      };
      const grid = element.grid ?? {
        row: legacyLayout.row ?? 0,
        column: legacyLayout.column ?? 0,
        rowSpan: legacyLayout.rowSpan ?? 1,
        columnSpan: legacyLayout.columnSpan ?? 1,
        ...(legacyLayout.anchor ? { anchor: legacyLayout.anchor } : {}),
      };
      const normalizedGrid =
        element.type === 'pie' ||
        element.type === 'donut' ||
        element.type === 'gauge' ||
        element.type === 'bar' ||
        element.type === 'line'
          ? (({ anchor: _anchor, ...chartGrid }) => chartGrid)(grid)
          : { ...grid, anchor: grid.anchor ?? legacyLayout.anchor ?? 'top left' };
      if (element.type === 'text') {
        const style = element.style as unknown as Record<string, unknown>;
        const legacyFont = style['font'] as Record<string, unknown> | undefined;
        const legacy = style as {
          fontSize?: number;
          fontWeight?: 400 | 500 | 600 | 700;
          italic?: boolean;
          underline?: boolean;
          strikethrough?: boolean;
        };
        return {
          ...element,
          grid: normalizedGrid,
          style: {
            ...element.style,
            font: {
              size:
                (legacyFont?.['size'] as number | undefined) ??
                (style['fontSize'] as number | undefined) ??
                legacy.fontSize ??
                element.style.font?.size,
              weight:
                (legacyFont?.['weight'] as 400 | 500 | 600 | 700 | undefined) ??
                (style['fontWeight'] as 400 | 500 | 600 | 700 | undefined) ??
                legacy.fontWeight ??
                element.style.font?.weight,
              style:
                (legacyFont?.['style'] as 'normal' | 'italic' | undefined) ??
                (legacy.italic ? 'italic' : 'normal'),
              decoration:
                (legacyFont?.['decoration'] as FontStyle['decoration'] | undefined) ??
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
      if (element.type === 'progress') {
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
        const color =
          typeof style['color'] === 'object' && style['color'] !== null
            ? (style['color'] as Record<string, unknown>)
            : {};
        return {
          ...element,
          grid: normalizedGrid,
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
                '#f6f7fb',
              fill:
                (color['fill'] as string | undefined) ??
                (style['fillColor'] as string | undefined) ??
                legacy.color ??
                '#7dd3fc',
              track:
                (color['track'] as string | undefined) ??
                (style['trackColor'] as string | undefined) ??
                legacy.trackColor ??
                '#334155',
            },
            font: { size: (style['fontSize'] as number | undefined) ?? 11 },
          },
          showLegend: element.showLegend ?? true,
          active: element.active ?? false,
        } as ProgressElement;
      }
      if (element.type === 'gauge') {
        const legacy = element as GaugeElement & { min?: number; max?: number };
        const style = legacy.style as unknown as Record<string, unknown>;
        const color =
          typeof style['color'] === 'object' && style['color'] !== null
            ? (style['color'] as Record<string, unknown>)
            : {};
        return {
          ...element,
          grid: normalizedGrid,
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
                '#f6f7fb',
              title:
                (color['title'] as string | undefined) ??
                (style['titleColor'] as string | undefined) ??
                '#f6f7fb',
              fill:
                (color['fill'] as string | undefined) ??
                (style['fillColor'] as string | undefined) ??
                '#7dd3fc',
              track:
                (color['track'] as string | undefined) ??
                (style['trackColor'] as string | undefined) ??
                '#334155',
            },
            font: { size: (style['fontSize'] as number | undefined) ?? 11 },
          },
          showLegend: element.showLegend ?? true,
        } as GaugeElement;
      }
      if (
        element.type === 'pie' ||
        element.type === 'donut' ||
        element.type === 'bar' ||
        element.type === 'line'
      ) {
        const style = element.style as unknown as Record<string, unknown>;
        const color =
          typeof style['color'] === 'object' && style['color'] !== null
            ? (style['color'] as Record<string, unknown>)
            : {};
        return {
          ...element,
          grid: normalizedGrid,
          style: {
            font: {
              ...(typeof style['font'] === 'object' && style['font'] !== null
                ? (style['font'] as Record<string, unknown>)
                : {}),
              size:
                typeof style['font'] === 'object' && style['font'] !== null
                  ? (((style['font'] as Record<string, unknown>)['size'] as number | undefined) ??
                    (style['fontSize'] as number | undefined) ??
                    defaultGraphStyle.font.size)
                  : ((style['fontSize'] as number | undefined) ?? defaultGraphStyle.font.size),
            },
            color: {
              ...defaultGraphStyle.color,
              ...color,
              legend: color['legend'] ?? style['legendColor'],
              title: color['title'] ?? style['titleColor'],
            },
            axis: {
              ...defaultGraphStyle.axis,
              ...(typeof style['axis'] === 'object' && style['axis'] !== null
                ? (style['axis'] as Record<string, unknown>)
                : {}),
              label:
                style['axisLabelColor'] ??
                (typeof style['axis'] === 'object' && style['axis'] !== null
                  ? (style['axis'] as Record<string, unknown>)['label']
                  : undefined),
              line:
                style['axisLineColor'] ??
                (typeof style['axis'] === 'object' && style['axis'] !== null
                  ? (style['axis'] as Record<string, unknown>)['line']
                  : undefined),
              grid:
                style['gridColor'] ??
                (typeof style['axis'] === 'object' && style['axis'] !== null
                  ? (style['axis'] as Record<string, unknown>)['grid']
                  : undefined),
            },
          },
        } as WidgetElement;
      }
      return { ...element, grid: normalizedGrid };
    }),
  };
}

export function patchWidget(widget: Widget, patch: Partial<Widget>): Widget {
  return { ...widget, ...patch };
}

export function patchElement(widget: Widget, id: string, patch: Partial<WidgetElement>): Widget {
  const stylePatch = 'style' in patch ? patch.style : undefined;
  return {
    ...widget,
    elements: widget.elements.map((element) =>
      element.id === id
        ? ({
            ...element,
            ...patch,
            ...(stylePatch &&
            typeof stylePatch === 'object' &&
            'style' in element &&
            typeof element.style === 'object'
              ? { style: { ...element.style, ...stylePatch } }
              : {}),
          } as WidgetElement)
        : element,
    ),
  };
}

export function reorderElements(widget: Widget, sourceId: string, targetId: string): Widget {
  if (sourceId === targetId) return widget;
  const elements = [...widget.elements];
  const sourceIndex = elements.findIndex((element) => element.id === sourceId);
  const targetIndex = elements.findIndex((element) => element.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return widget;
  const [source] = elements.splice(sourceIndex, 1);
  elements.splice(targetIndex, 0, source);
  return { ...widget, elements };
}

export function changeElementStack(
  widget: Widget,
  change: { id: string; action: 'up' | 'down' | 'front' | 'back' },
): Widget {
  const elements = [...widget.elements];
  const index = elements.findIndex((element) => element.id === change.id);
  if (index < 0) return widget;
  const target =
    change.action === 'up'
      ? index + 1
      : change.action === 'down'
        ? index - 1
        : change.action === 'front'
          ? elements.length - 1
          : 0;
  if (target === index || target < 0 || target >= elements.length) return widget;
  const [element] = elements.splice(index, 1);
  elements.splice(target, 0, element);
  return { ...widget, elements };
}

export function updateElementPosition(
  widget: Widget,
  id: string,
  kind: 'row' | 'column',
  value: number,
): Widget {
  const maximum = kind === 'row' ? widget.rows.length - 1 : widget.columns.length - 1;
  const position = Number.isFinite(value)
    ? Math.max(0, Math.min(maximum, Math.round(value) - 1))
    : 0;
  const element = widget.elements.find((candidate) => candidate.id === id);
  return element
    ? patchElement(widget, id, { grid: { ...element.grid, [kind]: position } })
    : widget;
}

export function updateElementSpan(
  widget: Widget,
  element: WidgetElement,
  kind: 'rowSpan' | 'columnSpan',
  value: number,
): Widget {
  const limit =
    kind === 'rowSpan'
      ? widget.rows.length - element.grid.row
      : widget.columns.length - element.grid.column;
  return patchElement(widget, element.id, {
    grid: { ...element.grid, [kind]: Math.max(1, Math.min(limit, Math.round(value) || 1)) },
  });
}

export function updateElementRadius(widget: Widget, id: string, value: number): Widget {
  return patchElement(widget, id, { radius: Math.max(0, Math.round(value) || 0) });
}

export function updateTrack(
  widget: Widget,
  kind: 'rows' | 'columns',
  index: number,
  patch: Partial<GridTrack>,
): Widget {
  return {
    ...widget,
    [kind]: widget[kind].map((track, trackIndex) =>
      trackIndex === index ? { ...track, ...patch } : track,
    ),
  };
}

export function addTrack(widget: Widget, kind: 'rows' | 'columns'): Widget {
  return { ...widget, [kind]: [...widget[kind], { size: 1, unit: 'star' as const }] };
}

export function removeTrack(widget: Widget, kind: 'rows' | 'columns', index: number): Widget {
  if (widget[kind].length <= 1 || index < 0 || index >= widget[kind].length) return widget;
  const positionKey = kind === 'rows' ? 'row' : 'column';
  const spanKey = kind === 'rows' ? 'rowSpan' : 'columnSpan';
  const remainingTracks = widget[kind].length - 1;
  return {
    ...widget,
    [kind]: widget[kind].filter((_, trackIndex) => trackIndex !== index),
    elements: widget.elements.map((element) => {
      const position = element.grid[positionKey];
      const span = element.grid[spanKey];
      const coversRemovedTrack = index >= position && index < position + span;
      const nextPosition = Math.min(
        remainingTracks - 1,
        position > index ? position - 1 : position,
      );
      const nextSpan = Math.max(
        1,
        Math.min(remainingTracks - nextPosition, span - (coversRemovedTrack ? 1 : 0)),
      );
      return {
        ...element,
        grid: { ...element.grid, [positionKey]: nextPosition, [spanKey]: nextSpan },
      };
    }),
  };
}
