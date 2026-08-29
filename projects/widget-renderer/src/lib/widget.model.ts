export type GridUnit = 'pixel' | 'auto' | 'star';
export type WidgetElementType =
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'pie'
  | 'donut'
  | 'funnel'
  | 'gauge'
  | 'bar'
  | 'line'
  | 'progress';
export type ButtonMethod = 'get' | 'post';
export type WidgetSize = 'mini' | 'square' | 'wide' | 'mega' | 'banner' | 'hero';
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

export type GridTrack = { size: number; unit: 'pixel' | 'star' } | { size?: never; unit: 'auto' };
export interface BackgroundConfig {
  image?: string;
  sensitive: boolean;
  repeat: boolean;
  color?: string;
  size: 'cover' | 'contain' | 'auto';
  anchor: ElementAnchor;
  overlayColor?: string;
}
export interface RefreshConfig {
  enabled: boolean;
  label: string;
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
  type: 'pie' | 'donut' | 'funnel' | 'gauge' | 'bar' | 'line' | 'progress';
  title?: string;
  showLegend: boolean;
}
export interface DataVisualStyle {
  color: {
    legend: string;
  };
  font: ChartFontStyle;
}
export interface ChartStyle extends DataVisualStyle {
  color: DataVisualStyle['color'] & { title: string };
}
export interface AxisChartStyle extends ChartStyle {
  color: ChartStyle['color'] & { line?: string };
  axis: {
    label: string;
    line: string;
    grid: string;
  };
}
export interface FillTrackStyle extends DataVisualStyle {
  color: DataVisualStyle['color'] & {
    fill: string;
    track: string;
  };
}
export interface ProgressSegment {
  kind: 'segment';
  label: string;
  value: number;
  color: string;
  active: boolean;
}
export interface ProgressGap {
  kind: 'gap';
  value: number;
}
export type ProgressItem = ProgressSegment | ProgressGap;
export interface ProgressData {
  min: number;
  max: number;
  items: ProgressItem[];
}
export interface ProgressRadius {
  segment: number;
  track: number;
}
export interface GaugeData {
  value: number;
  min: number;
  max: number;
}
export interface ValueChartStyle extends FillTrackStyle {
  color: FillTrackStyle['color'] & { title: string };
}
export interface ProgressStyle extends DataVisualStyle {
  color: DataVisualStyle['color'] & { title: string; track: string };
  radius: ProgressRadius | null;
}
export interface PieElement extends ChartElementBase {
  type: 'pie' | 'donut';
  data: ChartDataPoint[];
  style: ChartStyle;
}
export interface FunnelElement extends ChartElementBase {
  type: 'funnel';
  data: ChartDataPoint[];
  style: ChartStyle;
}
export interface GaugeElement extends ChartElementBase {
  type: 'gauge';
  data: GaugeData;
  style: ValueChartStyle;
}
export interface SeriesElement extends ChartElementBase {
  type: 'bar' | 'line';
  data: ChartDataPoint[];
  style: AxisChartStyle;
}
export interface ProgressElement extends ChartElementBase {
  type: 'progress';
  data: ProgressData;
  style: ProgressStyle;
}
export type ChartElement = PieElement | FunnelElement | GaugeElement | SeriesElement;
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
  id: string;
  size: WidgetSize;
  rows: GridTrack[];
  columns: GridTrack[];
  background: BackgroundConfig;
  refresh: RefreshConfig;
  elements: WidgetElement[];
}
export type WidgetContract = Omit<Widget, 'refresh' | 'elements'> & {
  refresh?: RefreshConfig | null;
  elements: WidgetElementContract[];
};
export type WidgetInput = WidgetContract;
