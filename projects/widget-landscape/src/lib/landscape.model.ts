import { ButtonElement, WidgetInput, WidgetSize } from 'widget-renderer';

export interface LandscapeWidget {
  id: string;
  size: WidgetSize;
  widget: WidgetInput | null;
  row: number;
  column: number;
}

export interface LandscapeWidgetPlacement {
  id: string;
  size: WidgetSize;
  row: number;
  column: number;
}

export interface LandscapeStateChange {
  version: 1;
  columns: number;
  responsive: boolean;
  widgets: LandscapeWidgetPlacement[];
}

export interface LandscapeState {
  version: 1;
  columns: number;
  responsive: boolean;
  widgets: LandscapeWidget[];
}

export interface LandscapePaletteItem {
  id: string;
  label: string;
  description?: string;
  size?: WidgetSize | null;
  createWidget: () => WidgetInput;
}

export interface LandscapeActionEvent {
  id: string;
  element: ButtonElement;
  event: Event;
}

export interface LandscapeRefreshEvent {
  id: string;
  label: string;
}

export interface LandscapeFootprint {
  columnSpan: number;
  rowSpan: number;
}

export const landscapeFootprints: Record<WidgetSize, LandscapeFootprint> = {
  mini: { columnSpan: 1, rowSpan: 1 },
  compact: { columnSpan: 2, rowSpan: 1 },
  tall: { columnSpan: 1, rowSpan: 2 },
  square: { columnSpan: 2, rowSpan: 2 },
  wide: { columnSpan: 4, rowSpan: 2 },
  mega: { columnSpan: 4, rowSpan: 4 },
  banner: { columnSpan: 2, rowSpan: 4 },
  hero: { columnSpan: 8, rowSpan: 4 },
};

export function landscapeFootprintForSize(size: unknown): LandscapeFootprint {
  return typeof size === 'string' && size in landscapeFootprints
    ? landscapeFootprints[size as WidgetSize]
    : landscapeFootprints.square;
}
