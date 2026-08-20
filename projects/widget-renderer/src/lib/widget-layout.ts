import { GridTrack, WidgetElement, WidgetSize } from './widget.model';

export const WIDGET_HEIGHT = 245;
export const WIDGET_PADDING = 18;
export const WIDGET_GAP = 8;

export function widgetWidth(size: WidgetSize): number {
  switch (size) {
    case 'mini':
      return 133;
    case 'wide':
    case 'mega':
      return 530;
    case 'hero':
      return 1060;
    default:
      return 265;
  }
}

export function widgetHeight(size: WidgetSize): number {
  return size === 'mini' ? 123 : size === 'mega' || size === 'hero' ? 490 : WIDGET_HEIGHT;
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
