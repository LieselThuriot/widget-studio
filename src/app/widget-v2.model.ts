export type GridUnit = 'pixel' | 'auto' | 'star';
export type WidgetElementType = 'text' | 'image' | 'button';
export type ButtonMethod = 'get' | 'post';

export interface GridTrack {
  size: number;
  unit: GridUnit;
}

export interface BackgroundConfig {
  imageUrl?: string;
  color: string;
  size: 'cover' | 'contain' | 'auto';
  position: string;
  overlayColor?: string;
}

export interface TextStyle {
  color: string;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'center' | 'bottom';
  wrap: boolean;
}

export interface WidgetElementBase {
  id: string;
  type: WidgetElementType;
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  sensitive: boolean;
}

export interface TextElement extends WidgetElementBase {
  type: 'text';
  text: string;
  style: TextStyle;
}

export interface ImageElement extends WidgetElementBase {
  type: 'image';
  imageUrl: string;
  alt: string;
  fit: 'cover' | 'contain' | 'fill';
  radius: number;
}

export interface ButtonElement extends WidgetElementBase {
  type: 'button';
  label: string;
  method: ButtonMethod;
  url: string;
  body?: string;
  style: 'solid' | 'outline' | 'ghost';
}

export type WidgetElement = TextElement | ImageElement | ButtonElement;

export interface WidgetV2 {
  version: 2;
  width: 265;
  height: 245;
  rows: GridTrack[];
  columns: GridTrack[];
  background: BackgroundConfig;
  refresh: { enabled: boolean; label: string };
  elements: WidgetElement[];
}

const textStyle = (overrides: Partial<TextStyle> = {}): TextStyle => ({
  color: '#f6f7fb',
  fontSize: 14,
  fontWeight: 400,
  italic: false,
  underline: false,
  strikethrough: false,
  align: 'left',
  verticalAlign: 'center',
  wrap: true,
  ...overrides,
});

export const sampleWidget: WidgetV2 = {
  version: 2,
  width: 265,
  height: 245,
  rows: [
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
  ],
  columns: [
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
  ],
  background: {
    color: '#17233c',
    size: 'cover',
    position: 'center',
  },
  refresh: { enabled: true, label: 'Refresh widget' },
  elements: [
    {
      id: 'headline', type: 'text', row: 0, column: 0, rowSpan: 1, columnSpan: 2, sensitive: false,
      text: 'Your week at a glance', style: textStyle({ fontSize: 20, fontWeight: 700 }),
    },
    {
      id: 'balance', type: 'text', row: 1, column: 0, rowSpan: 1, columnSpan: 1, sensitive: true,
      text: '€ 2,451.00', style: textStyle({ fontSize: 24, fontWeight: 700 }),
    },
    {
      id: 'caption', type: 'text', row: 2, column: 0, rowSpan: 1, columnSpan: 2, sensitive: false,
      text: 'Available balance', style: textStyle({ fontSize: 12, color: '#b8c5db' }),
    },
    {
      id: 'details', type: 'button', row: 2, column: 2, rowSpan: 1, columnSpan: 1, sensitive: false,
      label: 'Details', method: 'get', url: '/wallet', style: 'outline',
    },
  ],
};
