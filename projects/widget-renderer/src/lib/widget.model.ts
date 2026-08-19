export type GridUnit = 'pixel' | 'auto' | 'star';
export type WidgetElementType =
  'text' | 'image' | 'button' | 'divider' | 'pie' | 'donut' | 'gauge' | 'bar' | 'line' | 'progress';
export type ButtonMethod = 'get' | 'post';
export type WidgetSize = 'square' | 'wide';
export type ElementAnchor =
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
  sensitive: boolean;
  repeat: boolean;
  color?: string;
  size: 'cover' | 'contain' | 'auto';
  anchor: ElementAnchor;
  overlayColor?: string;
}
export interface TextStyle {
  color: string;
  font: TextFontStyle;
  align: 'left' | 'center' | 'right';
  wrap: boolean;
  background?: string;
  radius?: number;
  padding?: TextPadding | null;
}
export interface TextPadding {
  vertical: number;
  horizontal: number;
}
export interface ElementGrid {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  anchor?: ElementAnchor;
}
export interface TextFontStyle {
  size: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}
export interface ChartFontStyle {
  size: number;
}
export interface WidgetElementBase {
  type: WidgetElementType;
  grid: ElementGrid;
  sensitive: boolean;
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
  overlayColor?: string;
  radius: number;
}
export interface ButtonElement extends WidgetElementBase {
  type: 'button';
  label: string;
  method: ButtonMethod;
  url: string;
  body?: string | null;
  requestRefresh: boolean;
  showOnlyOnHover: boolean;
  style: 'solid' | 'outline';
}
export interface DividerElement extends WidgetElementBase {
  type: 'divider';
  orientation: 'horizontal' | 'vertical';
  style: { color: string };
}
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string | null;
}
export interface ChartElementBase extends WidgetElementBase {
  type: 'pie' | 'donut' | 'gauge' | 'bar' | 'line';
  title: string;
  showLegend: boolean;
}
export interface DataVisualStyle {
  color: {
    legend: string;
  };
  font: ChartFontStyle;
}
export interface PieStyle extends DataVisualStyle {
  color: DataVisualStyle['color'] & { title: string };
}
export interface GraphStyle extends PieStyle {
  color: PieStyle['color'] & { line?: string };
  axis: {
    label: string;
    line: string;
    grid: string;
  };
}
export interface ProgressStyle extends DataVisualStyle {
  color: DataVisualStyle['color'] & {
    fill: string;
    track: string;
  };
}
export interface ProgressData {
  label: string;
  value: number;
  min: number;
  max: number;
  separator?: string | null;
  suffix?: string | null;
}
export interface GaugeData {
  value: number;
  min: number;
  max: number;
}
export interface GaugeStyle extends DataVisualStyle {
  color: DataVisualStyle['color'] & {
    title: string;
    fill: string;
    track: string;
  };
}
export interface PieElement extends ChartElementBase {
  type: 'pie' | 'donut';
  data: ChartDataPoint[];
  style: PieStyle;
}
export interface GaugeElement extends ChartElementBase {
  type: 'gauge';
  data: GaugeData;
  style: GaugeStyle;
}
export interface SeriesElement extends ChartElementBase {
  type: 'bar' | 'line';
  data: ChartDataPoint[];
  style: GraphStyle;
}
export interface ProgressElement extends WidgetElementBase {
  type: 'progress';
  data: ProgressData;
  style: ProgressStyle;
  showLegend: boolean;
  active: boolean;
}
export type ChartElement = PieElement | GaugeElement | SeriesElement;
export type WidgetElement =
  TextElement | ImageElement | ButtonElement | DividerElement | ChartElement | ProgressElement;
export type ButtonElementContract = Omit<ButtonElement, 'requestRefresh' | 'showOnlyOnHover'> & {
  requestRefresh?: boolean;
  showOnlyOnHover?: boolean;
};
export type WidgetElementContract =
  | TextElement
  | ImageElement
  | ButtonElementContract
  | Omit<DividerElement, 'sensitive'>
  | ChartElement
  | ProgressElement;
export interface Widget {
  version: 2;
  size: WidgetSize;
  rows: GridTrack[];
  columns: GridTrack[];
  background: BackgroundConfig;
  refresh: { enabled: boolean; label: string };
  elements: WidgetElement[];
}
export type WidgetContract = Omit<Widget, 'elements'> & {
  elements: WidgetElementContract[];
};
export type WidgetInput = WidgetContract;
