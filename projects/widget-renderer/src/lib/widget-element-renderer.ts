import { Component, input, output, signal } from '@angular/core';
import { ChartElementRenderer } from './chart-element-renderer';
import {
  ButtonElement,
  ChartElement,
  ImageElement,
  ProgressElement,
  TextElement,
  WidgetElement,
} from './widget.model';

@Component({
  selector: 'widget-element-renderer',
  templateUrl: './widget-element-renderer.html',
  styleUrl: './widget-element-renderer.css',
  imports: [ChartElementRenderer],
  host: {
    class: 'widget-element',
    '[style.grid-row]': 'gridRow()',
    '[style.grid-column]': 'gridColumn()',
  },
})
export class WidgetElementRenderer {
  readonly element = input.required<WidgetElement>();
  readonly sensitiveVisible = input(false);
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
  private readonly failedImageSource = signal<string | null>(null);

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
    return ['pie', 'donut', 'funnel', 'gauge', 'bar', 'line', 'progress'].includes(element.type);
  }
  protected isSensitive(element: WidgetElement): boolean {
    return ('sensitive' in element ? element.sensitive : false) && !this.sensitiveVisible();
  }
  protected sensitiveBlur(element: WidgetElement): string | null {
    if (!element.sensitive) return null;
    if (element.type !== 'text') return '2px';
    return `${Math.min(Math.max(element.style.font.size * 0.25, 2), 10)}px`;
  }
  protected elementAlt(element: ImageElement): string {
    return this.isSensitive(element) ? '' : element.alt;
  }
  protected imageFailed(element: ImageElement): boolean {
    return this.failedImageSource() === element.source;
  }
  protected imageLoadFailed(element: ImageElement): void {
    this.failedImageSource.set(element.source);
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
  protected textFontWeight(element: TextElement): number {
    return element.style.font.bold ? 700 : 400;
  }
  protected textFontStyle(element: TextElement): 'normal' | 'italic' {
    return element.style.font.italic ? 'italic' : 'normal';
  }
  protected textFontDecoration(element: TextElement): string {
    return (
      [
        element.style.font.underline && 'underline',
        element.style.font.strikethrough && 'line-through',
      ]
        .filter(Boolean)
        .join(' ') || 'none'
    );
  }
  protected elementId(element: WidgetElement): string | null {
    return 'id' in element ? (element as WidgetElement & { id: string }).id : null;
  }
  protected gridRow(): string {
    return `${this.element().grid.row + 1} / span ${this.element().grid.rowSpan}`;
  }
  protected gridColumn(): string {
    return `${this.element().grid.column + 1} / span ${this.element().grid.columnSpan}`;
  }
}
