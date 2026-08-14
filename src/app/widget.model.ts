export type GridUnit = 'pixel' | 'auto' | 'star';
export type WidgetElementType = 'text' | 'image' | 'button';
export type ButtonMethod = 'get' | 'post';
export type WidgetSize = 'square' | 'wide';
export type ImageAnchor =
  | 'top left'
  | 'top center'
  | 'top right'
  | 'center left'
  | 'center'
  | 'center right'
  | 'bottom left'
  | 'bottom center'
  | 'bottom right';

export interface GridTrack {
  size: number;
  unit: GridUnit;
}

export interface BackgroundConfig {
  image?: string;
  repeat: boolean;
  color?: string;
  size: 'cover' | 'contain' | 'auto';
  anchor: ImageAnchor;
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
  anchor: ImageAnchor;
}

export interface TextElement extends WidgetElementBase {
  type: 'text';
  text: string;
  style: TextStyle;
}

export interface ImageElement extends WidgetElementBase {
  type: 'image';
  source: string;
  alt: string;
  fit: 'cover' | 'contain' | 'fill';
  anchor: ImageAnchor;
  overlayColor?: string;
  radius: number;
}

export interface ButtonElement extends WidgetElementBase {
  type: 'button';
  label: string;
  method: ButtonMethod;
  url: string;
  body?: string;
  style: 'solid' | 'outline';
}

export type WidgetElement = TextElement | ImageElement | ButtonElement;

export interface Widget {
  version: 2;
  size: WidgetSize;
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
  wrap: true,
  ...overrides,
});

export const sampleWidget: Widget = {
  version: 2,
  size: 'square',
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
    color: '#101827',
    repeat: false,
    size: 'cover',
    anchor: 'center',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900',
    overlayColor: '#10182799',
  },
  refresh: { enabled: true, label: 'Refresh widget' },
  elements: [
    {
      id: 'headline',
      type: 'text',
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 3,
      sensitive: false,
      anchor: 'top left',
      text: 'Make space for what matters',
      style: textStyle({ fontSize: 19, fontWeight: 700 }),
    },
    {
      id: 'message',
      type: 'text',
      row: 1,
      column: 0,
      rowSpan: 1,
      columnSpan: 2,
      sensitive: false,
      anchor: 'top left',
      text: 'Your next chapter starts here.',
      style: textStyle({ fontSize: 14, fontWeight: 600 }),
    },
    {
      id: 'caption',
      type: 'text',
      row: 2,
      column: 0,
      rowSpan: 1,
      columnSpan: 2,
      sensitive: true,
      anchor: 'top left',
      text: 'Personalized for your profile',
      style: textStyle({ fontSize: 11, color: '#d4dbea' }),
    },
    {
      id: 'details',
      type: 'button',
      row: 2,
      column: 2,
      rowSpan: 1,
      columnSpan: 1,
      sensitive: false,
      anchor: 'top left',
      label: 'Explore',
      method: 'get',
      url: '/overview',
      style: 'solid',
    },
  ],
};
