import { Component, input } from '@angular/core';
import { ChartElement, ProgressElement, WidgetElement } from './widget.model';
import { EchartsElementRenderer } from './echarts-element-renderer';
import { ProgressElementRenderer } from './progress-element-renderer';

@Component({
  selector: 'widget-chart-element',
  templateUrl: './chart-element-renderer.html',
  styleUrl: './chart-element-renderer.css',
  imports: [EchartsElementRenderer, ProgressElementRenderer],
})
export class ChartElementRenderer {
  readonly element = input.required<ChartElement | ProgressElement>();

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
