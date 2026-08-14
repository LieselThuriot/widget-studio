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
