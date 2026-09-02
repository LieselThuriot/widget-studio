import { Component, input } from '@angular/core';
import { ChartElement, ProgressElement, WidgetElement } from './widget.model';
import { EchartsElementRenderer } from './echarts-element-renderer';
import { ProgressElementRenderer } from './progress-element-renderer';
import { defaultWidgetRendererLocale, WidgetRendererLocale } from './widget-locale';

@Component({
  selector: 'widget-chart-element',
  templateUrl: './chart-element-renderer.html',
  imports: [EchartsElementRenderer, ProgressElementRenderer],
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

  protected chart(element: ChartElement | ProgressElement): ChartElement {
    return element as ChartElement;
  }
}
