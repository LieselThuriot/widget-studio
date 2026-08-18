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
  font: FontStyle;
  align: 'left' | 'center' | 'right';
  wrap: boolean;
}
export interface ElementGrid {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  anchor?: ElementAnchor;
}
export interface FontStyle {
  size: number;
  weight?: 400 | 500 | 600 | 700;
  style?: 'normal' | 'italic';
  decoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
}
export interface WidgetElementBase {
  id: string;
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
  color?: string;
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
  font: FontStyle;
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
export type TextElementContract = Omit<TextElement, 'id'>;
export type ImageElementContract = Omit<ImageElement, 'id'> & OptionalElementId;
export type ButtonElementContract = Omit<
  ButtonElement,
  'id' | 'requestRefresh' | 'showOnlyOnHover'
> &
  OptionalElementId & {
    requestRefresh?: boolean;
    showOnlyOnHover?: boolean;
  };
export type DividerElementContract = Omit<DividerElement, 'id' | 'sensitive'> & OptionalElementId;
export type ChartElementContract = Omit<ChartElement, 'id'> & OptionalElementId;
export type ProgressElementContract = Omit<ProgressElement, 'id'> & OptionalElementId;
export type WidgetElementContract =
  | (TextElementContract & OptionalElementId)
  | ImageElementContract
  | ButtonElementContract
  | DividerElementContract
  | ChartElementContract
  | ProgressElementContract;
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
export type WidgetInput = Widget | WidgetContract;

export interface OptionalElementId {
  id?: string | null;
}
