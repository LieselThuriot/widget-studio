import {
  LandscapeFootprint,
  LandscapeState,
  LandscapeWidget,
  landscapeFootprintForSize,
} from './landscape.model';

export function footprintFor(widget: LandscapeWidget): LandscapeFootprint {
  return landscapeFootprintForSize(widget.size);
}

export function canFitWidget(widget: LandscapeWidget, columns: number): boolean {
  return footprintFor(widget).columnSpan <= Math.max(1, Math.floor(columns));
}

export function firstAvailablePosition(
  widgets: readonly LandscapeWidget[],
  candidate: LandscapeWidget,
  columns: number,
): { row: number; column: number } | null {
  if (!canFitWidget(candidate, columns)) return null;
  const candidateFootprint = footprintFor(candidate);
  for (let row = 0; row < 10000; row++) {
    for (let column = 0; column <= columns - candidateFootprint.columnSpan; column++) {
      if (!widgets.some((widget) => overlaps(widget, { ...candidate, row, column }))) {
        return { row, column };
      }
    }
  }
  return null;
}

export function placeWithPushDown(
  state: LandscapeState,
  widgetId: string,
  row: number,
  column: number,
): LandscapeState {
  const columns = Math.max(1, Math.floor(state.columns));
  const moving = state.widgets.find((widget) => widget.id === widgetId);
  if (!moving || !canFitWidget(moving, columns)) return state;
  const movingFootprint = footprintFor(moving);
  const placed: LandscapeWidget[] = [];
  const requested = {
    ...moving,
    row: Math.max(0, Math.floor(row)),
    column: Math.max(0, Math.min(column, columns - movingFootprint.columnSpan)),
  };
  const queue = [requested, ...state.widgets.filter((widget) => widget.id !== widgetId)];
  for (const item of queue) {
    const position = firstAvailablePosition(placed, item, columns);
    if (!position) continue;
    placed.push({ ...item, ...position });
  }
  return { ...state, columns, widgets: placed };
}

export function previewPlacement(
  state: LandscapeState,
  widget: LandscapeWidget,
  row: number,
  column: number,
): LandscapeState | null {
  if (!canFitWidget(widget, state.columns)) return null;
  const columns = Math.max(1, Math.floor(state.columns));
  const widgetFootprint = footprintFor(widget);
  const target = {
    ...widget,
    row: Math.max(0, Math.floor(row)),
    column: Math.max(0, Math.min(Math.floor(column), columns - widgetFootprint.columnSpan)),
  };
  const displaced = state.widgets.filter(
    (candidate) => candidate.id !== widget.id && overlaps(candidate, target),
  );
  const reserved = [
    target,
    ...state.widgets.filter(
      (candidate) => candidate.id !== widget.id && !overlaps(candidate, target),
    ),
  ];
  for (const candidate of displaced) {
    const position = firstAvailablePosition(reserved, candidate, columns);
    if (!position) return null;
    reserved.push({ ...candidate, ...position });
  }
  return { ...state, columns, widgets: reserved };
}

export function moveWidget(
  state: LandscapeState,
  widgetId: string,
  rowDelta: number,
  columnDelta: number,
): LandscapeState {
  const widget = state.widgets.find((item) => item.id === widgetId);
  if (!widget) return state;
  const preview = previewPlacement(
    state,
    widget,
    widget.row + rowDelta,
    widget.column + columnDelta,
  );
  if (!preview) return state;
  const positions = new Map(preview.widgets.map((item) => [item.id, item]));
  return { ...preview, widgets: state.widgets.map((item) => positions.get(item.id) ?? item) };
}

export function hasCollisionAt(
  widgets: readonly LandscapeWidget[],
  widget: LandscapeWidget,
  row: number,
  column: number,
): boolean {
  const candidate = { ...widget, row, column };
  return widgets.some((current) => current.id !== widget.id && overlaps(current, candidate));
}

export function addWidget(state: LandscapeState, widget: LandscapeWidget): LandscapeState {
  const position = firstAvailablePosition(state.widgets, widget, state.columns);
  return position ? { ...state, widgets: [...state.widgets, { ...widget, ...position }] } : state;
}

export function normalizeLandscapeState(state: LandscapeState): LandscapeState {
  const columns = Math.max(1, Math.floor(state.columns || 1));
  let result: LandscapeState = {
    ...state,
    version: 1,
    columns,
    responsive: state.responsive ?? false,
    widgets: [],
  };
  for (const widget of state.widgets) {
    if (!canFitWidget(widget, columns)) continue;
    const footprint = footprintFor(widget);
    const requested = {
      ...widget,
      row: Math.max(0, Math.floor(widget.row)),
      column: Math.max(0, Math.min(Math.floor(widget.column), columns - footprint.columnSpan)),
    };
    const position = firstAvailablePositionFrom(result.widgets, requested, columns, requested.row);
    if (position)
      result = { ...result, widgets: [...result.widgets, { ...requested, ...position }] };
  }
  return result;
}

function firstAvailablePositionFrom(
  widgets: readonly LandscapeWidget[],
  candidate: LandscapeWidget,
  columns: number,
  startRow: number,
): { row: number; column: number } | null {
  const candidateFootprint = footprintFor(candidate);
  if (!widgets.some((widget) => overlaps(widget, candidate))) {
    return { row: candidate.row, column: candidate.column };
  }
  for (let row = Math.max(0, startRow); row < 10000; row++) {
    for (let column = 0; column <= columns - candidateFootprint.columnSpan; column++) {
      if (!widgets.some((widget) => overlaps(widget, { ...candidate, row, column }))) {
        return { row, column };
      }
    }
  }
  return null;
}

function overlaps(a: LandscapeWidget, b: LandscapeWidget): boolean {
  const first = footprintFor(a);
  const second = footprintFor(b);
  return (
    a.column < b.column + second.columnSpan &&
    a.column + first.columnSpan > b.column &&
    a.row < b.row + second.rowSpan &&
    a.row + first.rowSpan > b.row
  );
}
