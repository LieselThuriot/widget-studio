import {
  ButtonElement as RendererButtonElement,
  ChartElement as RendererChartElement,
  DividerElement as RendererDividerElement,
  FunnelElement as RendererFunnelElement,
  GaugeElement as RendererGaugeElement,
  ImageElement as RendererImageElement,
  PieElement as RendererPieElement,
  ProgressElement as RendererProgressElement,
  SeriesElement as RendererSeriesElement,
  TextElement as RendererTextElement,
  Widget as RendererWidget,
  AxisChartStyle,
  ChartStyle,
  FillTrackStyle,
  ValueChartStyle,
  WidgetElementBase,
} from 'widget-renderer';

export interface EditorElementBase {
  id: string;
}

export type EditorWidgetElement =
  ButtonElement | ChartElement | DividerElement | ImageElement | ProgressElement | TextElement;
export type EditorWidget = Omit<RendererWidget, 'elements'> & {
  elements: EditorWidgetElement[];
};
export type Widget = EditorWidget;
export type WidgetElement = EditorWidgetElement;
export type ButtonElement = RendererButtonElement & EditorElementBase;
export type ChartElement = RendererChartElement & EditorElementBase;
export type DividerElement = RendererDividerElement & EditorElementBase;
export type GaugeElement = RendererGaugeElement & EditorElementBase;
export type FunnelElement = RendererFunnelElement & EditorElementBase;
export type ImageElement = RendererImageElement & EditorElementBase;
export type PieElement = RendererPieElement & EditorElementBase;
export type ProgressElement = RendererProgressElement & EditorElementBase;
export type SeriesElement = RendererSeriesElement & EditorElementBase;
export type TextElement = RendererTextElement & EditorElementBase;
export type { AxisChartStyle, ChartStyle, FillTrackStyle, ValueChartStyle, WidgetElementBase };
