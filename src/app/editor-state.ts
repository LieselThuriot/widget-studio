import { GridTrack, Widget, WidgetElement } from 'widget-renderer';

export { normalizeWidget } from './widget-normalization';

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
              ? { style: mergeElementStyle(element, stylePatch) }
              : {}),
          } as WidgetElement)
        : element,
    ),
  };
}

export function moveElement(
  widget: Widget,
  position: { id: string; row: number; column: number },
): Widget {
  const element = widget.elements.find((candidate) => candidate.id === position.id);
  if (!element) return widget;

  return patchElement(widget, position.id, {
    grid: {
      ...element.grid,
      row: Math.max(0, Math.min(widget.rows.length - element.grid.rowSpan, position.row)),
      column: Math.max(
        0,
        Math.min(widget.columns.length - element.grid.columnSpan, position.column),
      ),
    },
  });
}

export function resizeElement(
  widget: Widget,
  size: { id: string; rowSpan?: number; columnSpan?: number },
): Widget {
  const element = widget.elements.find((candidate) => candidate.id === size.id);
  if (!element) return widget;

  return patchElement(widget, size.id, {
    grid: {
      ...element.grid,
      ...(size.rowSpan === undefined
        ? {}
        : { rowSpan: clampElementSpan(widget, element, 'rowSpan', size.rowSpan) }),
      ...(size.columnSpan === undefined
        ? {}
        : {
            columnSpan: clampElementSpan(widget, element, 'columnSpan', size.columnSpan),
          }),
    },
  });
}

function mergeElementStyle(element: WidgetElement, patch: object): object {
  const currentStyle =
    'style' in element && isRecord(element.style) ? element.style : ({} as Record<string, unknown>);
  const merged = { ...currentStyle, ...patch } as Record<string, unknown>;
  const patchRecord = patch as Record<string, unknown>;
  if (isRecord(currentStyle['font']) && isRecord(patchRecord['font'])) {
    merged['font'] = {
      ...currentStyle['font'],
      ...patchRecord['font'],
    };
  }
  if (isRecord(currentStyle['color']) && isRecord(patchRecord['color'])) {
    merged['color'] = {
      ...currentStyle['color'],
      ...patchRecord['color'],
    };
  }
  if (isRecord(currentStyle['axis']) && isRecord(patchRecord['axis'])) {
    merged['axis'] = {
      ...currentStyle['axis'],
      ...patchRecord['axis'],
    };
  }
  return merged;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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
  let target: number;
  switch (change.action) {
    case 'up':
      target = index + 1;
      break;
    case 'down':
      target = index - 1;
      break;
    case 'front':
      target = elements.length - 1;
      break;
    case 'back':
      target = 0;
      break;
  }
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
  return patchElement(widget, element.id, {
    grid: { ...element.grid, [kind]: clampElementSpan(widget, element, kind, value) },
  });
}

function clampElementSpan(
  widget: Widget,
  element: WidgetElement,
  kind: 'rowSpan' | 'columnSpan',
  value: number,
): number {
  const limit =
    kind === 'rowSpan'
      ? widget.rows.length - element.grid.row
      : widget.columns.length - element.grid.column;
  return Math.max(1, Math.min(limit, Math.round(value) || 1));
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
