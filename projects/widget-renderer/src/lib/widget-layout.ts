import { GridTrack, WidgetElement, WidgetSize } from './widget.model';

export const WIDGET_HEIGHT = 245;
export const WIDGET_PADDING = 18;
export const WIDGET_GAP = 8;

export function widgetWidth(size: WidgetSize): number {
  return size === 'wide' ? 530 : 265;
}

export function gridTemplate(tracks: GridTrack[]): string {
  return tracks
    .map(
      (track) =>
        `${track.size}${track.unit === 'star' ? 'fr' : track.unit === 'pixel' ? 'px' : ' auto'}`,
    )
    .join(' ');
}

export function elementGridStyle(element: WidgetElement): Record<string, string> {
  return {
    'grid-row': `${element.grid.row + 1} / span ${element.grid.rowSpan}`,
    'grid-column': `${element.grid.column + 1} / span ${element.grid.columnSpan}`,
  };
}
