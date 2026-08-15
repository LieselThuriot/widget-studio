import { GridTrack, Widget, WidgetElement } from 'widget-renderer';

export function patchWidget(widget: Widget, patch: Partial<Widget>): Widget {
  return { ...widget, ...patch };
}

export function patchElement(widget: Widget, id: string, patch: Partial<WidgetElement>): Widget {
  return {
    ...widget,
    elements: widget.elements.map((element) =>
      element.id === id ? ({ ...element, ...patch } as WidgetElement) : element,
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
  return patchElement(widget, id, { [kind]: position });
}

export function updateElementSpan(
  widget: Widget,
  element: WidgetElement,
  kind: 'rowSpan' | 'columnSpan',
  value: number,
): Widget {
  const limit =
    kind === 'rowSpan' ? widget.rows.length - element.row : widget.columns.length - element.column;
  return patchElement(widget, element.id, {
    [kind]: Math.max(1, Math.min(limit, Math.round(value) || 1)),
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
  if (widget[kind].length <= 1) return widget;
  return {
    ...widget,
    [kind]: widget[kind].filter((_, trackIndex) => trackIndex !== index),
    elements: widget.elements.map((element) => ({
      ...element,
      [kind === 'rows' ? 'row' : 'column']: Math.min(
        element[kind === 'rows' ? 'row' : 'column'],
        widget[kind].length - 2,
      ),
    })),
  };
}
