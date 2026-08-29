import { GridTrack, WidgetElement, WidgetSize } from './widget.model';

export const WIDGET_HEIGHT = 245;
export const WIDGET_PADDING = 18;
export const WIDGET_GAP = 8;
export const WIDGET_CELL_WIDTH = 133;
export const WIDGET_CELL_HEIGHT = 123;

const footprintBySize: Record<WidgetSize, { columns: number; rows: number }> = {
  mini: { columns: 1, rows: 1 },
  square: { columns: 2, rows: 2 },
  wide: { columns: 4, rows: 2 },
  mega: { columns: 4, rows: 4 },
  banner: { columns: 2, rows: 4 },
  hero: { columns: 8, rows: 4 },
};

export function widgetFootprint(size: WidgetSize | unknown): { columns: number; rows: number } {
  return typeof size === 'string' && size in footprintBySize
    ? footprintBySize[size as WidgetSize]
    : footprintBySize.square;
}

export function gridSpanSize(span: number, cellSize: number): number {
  return span * cellSize + Math.max(0, span - 1) * WIDGET_GAP;
}

export function widgetWidth(size: WidgetSize | unknown): number {
  return gridSpanSize(widgetFootprint(size).columns, WIDGET_CELL_WIDTH);
}

export function widgetHeight(size: WidgetSize | unknown): number {
  return gridSpanSize(widgetFootprint(size).rows, WIDGET_CELL_HEIGHT);
}

export function gridTemplate(tracks: GridTrack[]): string {
  return tracks
    .map((track) =>
      track.unit === 'auto' ? 'auto' : `${track.size}${track.unit === 'star' ? 'fr' : 'px'}`,
    )
    .join(' ');
}

export function elementGridStyle(element: WidgetElement): Record<string, string> {
  return {
    'grid-row': `${element.grid.row + 1} / span ${element.grid.rowSpan}`,
    'grid-column': `${element.grid.column + 1} / span ${element.grid.columnSpan}`,
  };
}
