import { WidgetElement, WidgetElementType } from 'widget-renderer';

export interface PaletteItem {
  type: WidgetElementType;
  label: string;
  icon: string;
  description: string;
}

export const widgetElementPalette: PaletteItem[] = [
  { type: 'text', label: 'Text', icon: 'T', description: 'Formatted content' },
  { type: 'image', label: 'Image', icon: '▧', description: 'Remote image' },
  { type: 'button', label: 'Action', icon: '↗', description: 'GET or POST' },
  { type: 'divider', label: 'Divider', icon: '—', description: 'Visual separator' },
  { type: 'pie', label: 'Pie', icon: '◔', description: 'Part-to-whole' },
  { type: 'donut', label: 'Donut', icon: '◉', description: 'Part-to-whole' },
  { type: 'gauge', label: 'Gauge', icon: '◌', description: 'Single value' },
  { type: 'bar', label: 'Bar', icon: '▥', description: 'Compare values' },
  { type: 'line', label: 'Line', icon: '⌁', description: 'Show a trend' },
  { type: 'progress', label: 'Progress', icon: '▰', description: 'Completion value' },
];

export function elementIcon(type: WidgetElementType): string {
  return widgetElementPalette.find((item) => item.type === type)?.icon ?? '◌';
}

export function elementLabel(element: WidgetElement): string {
  return element.type === 'text'
    ? element.text
    : element.type === 'image'
      ? element.alt
      : element.type === 'button'
        ? element.label
        : element.type === 'divider'
          ? 'Divider'
          : element.type === 'progress'
            ? element.data.label
            : element.title;
}
