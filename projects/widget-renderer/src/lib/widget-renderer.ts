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
import { hydrateWidget } from './widget-hydration';
import { WidgetInput } from './widget.model';
import { safeParseWidgetInput, WidgetValidationIssue } from './widget-validation';
import { elementGridStyle, gridTemplate, widgetWidth as getWidgetWidth } from './widget-layout';

@Component({
  selector: 'widget-renderer',
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
  imports: [ChartElementRenderer],
})
export class WidgetRenderer {
  readonly widget = input.required<WidgetInput>();
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
  readonly sensitiveVisible = signal(false);
  private readonly failedImages = signal<Record<string, string>>({});
  private hydratedWidget: Widget | undefined;
  private readonly parsedWidget = computed(() => safeParseWidgetInput(this.widget()));
  readonly validationIssues = computed<WidgetValidationIssue[]>(() => {
    const result = this.parsedWidget();
    return result.success ? [] : result.issues;
  });
  protected readonly renderWidget = computed<Widget>(() => {
    const result = this.parsedWidget();
    if (!result.success) {
      this.hydratedWidget = emptyWidget;
      return emptyWidget;
    }
    this.hydratedWidget = hydrateWidget(result.data as WidgetInput, this.hydratedWidget);
    return this.hydratedWidget;
  });
  readonly hasSensitiveElements = computed(
    () =>
      this.renderWidget().background.sensitive ||
      this.renderWidget().elements.some((element) => element.sensitive),
  );
  readonly backgroundSensitive = computed(
    () => this.renderWidget().background.sensitive && !this.sensitiveVisible(),
  );
  readonly gridRows = computed(() => gridTemplate(this.renderWidget().rows));
  readonly gridColumns = computed(() => gridTemplate(this.renderWidget().columns));
  readonly widgetWidth = computed(() => getWidgetWidth(this.renderWidget().size));
  readonly backgroundImage = computed(() => {
    const image = this.renderWidget().background.image;
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
  protected isElementSensitive(element: WidgetElement): boolean {
    return element.sensitive && !this.sensitiveVisible();
  }
  protected elementAlt(element: ImageElement): string {
    return this.isElementSensitive(element) ? '' : element.alt;
  }
  protected imageFailed(element: ImageElement): boolean {
    return this.failedImages()[element.id] === element.source;
  }
  protected imageLoadFailed(element: ImageElement): void {
    this.failedImages.update((failed) => ({ ...failed, [element.id]: element.source }));
  }
  protected retryImage(element: ImageElement): void {
    this.failedImages.update((failed) => {
      const next = { ...failed };
      delete next[element.id];
      return next;
    });
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

const emptyWidget: Widget = {
  version: 2,
  size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: {
    sensitive: false,
    repeat: false,
    size: 'auto',
    anchor: 'center',
  },
  refresh: { enabled: false, label: 'Refresh widget' },
  elements: [],
};
