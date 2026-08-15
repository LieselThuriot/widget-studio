import { Component, computed, input, output, signal } from '@angular/core';
import { ChartElementRenderer } from './chart-element-renderer';
import {
  ButtonElement,
  ChartElement,
  ImageElement,
  ProgressElement,
  TextElement,
  Widget,
  WidgetElement,
} from './widget.model';
import { elementGridStyle, gridTemplate, widgetWidth as getWidgetWidth } from './widget-layout';

@Component({
  selector: 'widget-renderer',
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
  imports: [ChartElementRenderer],
})
export class WidgetRenderer {
  readonly widget = input.required<Widget>();
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
  readonly sensitiveVisible = signal(false);
  readonly hasSensitiveElements = computed(
    () =>
      this.widget().background.sensitive ||
      this.widget().elements.some((element) => element.sensitive),
  );
  readonly backgroundSensitive = computed(
    () => this.widget().background.sensitive && !this.sensitiveVisible(),
  );
  readonly gridRows = computed(() => gridTemplate(this.widget().rows));
  readonly gridColumns = computed(() => gridTemplate(this.widget().columns));
  readonly widgetWidth = computed(() => getWidgetWidth(this.widget().size));
  readonly backgroundImage = computed(() => {
    const image = this.widget().background.image;
    return image ? `url("${image}")` : 'none';
  });

  protected isText(element: WidgetElement): element is TextElement {
    return element.type === 'text';
  }
  protected isImage(element: WidgetElement): element is ImageElement {
    return element.type === 'image';
  }
  protected isButton(element: WidgetElement): element is ButtonElement {
    return element.type === 'button';
  }
  protected isChart(element: WidgetElement): element is ChartElement | ProgressElement {
    return ['pie', 'donut', 'gauge', 'bar', 'line', 'progress'].includes(element.type);
  }
  protected horizontalAnchor(anchor: string): string {
    return anchor.endsWith('left')
      ? 'flex-start'
      : anchor.endsWith('right')
        ? 'flex-end'
        : 'center';
  }
  protected verticalAnchor(anchor: string): string {
    return anchor.startsWith('top')
      ? 'flex-start'
      : anchor.startsWith('bottom')
        ? 'flex-end'
        : 'center';
  }
  protected toggleSensitive(): void {
    this.sensitiveVisible.update((visible) => !visible);
  }
  protected elementStyle(element: WidgetElement): Record<string, string> {
    return elementGridStyle(element);
  }
}
