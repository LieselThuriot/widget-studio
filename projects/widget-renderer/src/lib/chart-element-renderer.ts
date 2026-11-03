import { Component, input } from '@angular/core';
import {
  ChartElement,
  FunnelElement,
  GaugeElement,
  PieElement,
  ProgressElement,
  SeriesElement,
  WidgetElement,
} from './widget.model';
import { GaugeChartRenderer } from './gauge-chart-renderer';
import { PartChartRenderer } from './part-chart-renderer';
import { ProgressElementRenderer } from './progress-element-renderer';
import { SeriesChartRenderer } from './series-chart-renderer';
import { defaultWidgetRendererLocale, WidgetRendererLocale } from './widget-locale';

@Component({
  selector: 'widget-chart-element',
  templateUrl: './chart-element-renderer.html',
  imports: [GaugeChartRenderer, PartChartRenderer, ProgressElementRenderer, SeriesChartRenderer],
})
export class ChartElementRenderer {
  readonly element = input.required<ChartElement | ProgressElement>();
  readonly sensitiveHidden = input(false);
  readonly locale = input<WidgetRendererLocale>(defaultWidgetRendererLocale);

  protected isProgress(element: WidgetElement): element is ProgressElement {
    return element.type === 'progress';
  }

  protected progress(element: ChartElement | ProgressElement): ProgressElement {
    return element as ProgressElement;
  }

  protected gauge(element: ChartElement | ProgressElement): GaugeElement {
    return element as GaugeElement;
  }

  protected isSeries(element: WidgetElement): element is SeriesElement {
    return element.type === 'bar' || element.type === 'line';
  }

  protected series(element: ChartElement | ProgressElement): SeriesElement {
    return element as SeriesElement;
  }

  protected isPart(element: WidgetElement): element is PieElement | FunnelElement {
    return element.type === 'pie' || element.type === 'donut' || element.type === 'funnel';
  }

  protected part(element: ChartElement | ProgressElement): PieElement | FunnelElement {
    return element as PieElement | FunnelElement;
  }
}
