import { Component, computed, input, output, signal } from '@angular/core';
import { ButtonElement, ImageElement, TextElement, Widget, WidgetElement } from './widget.model';

@Component({
  selector: 'widget-renderer',
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
})
export class WidgetRenderer {
  readonly widget = input.required<Widget>();
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
  readonly sensitiveVisible = signal(false);
  readonly hasSensitiveElements = computed(() =>
    this.widget().elements.some((element) => element.sensitive),
  );
  readonly gridRows = computed(() => this.gridTemplate(this.widget().rows));
  readonly gridColumns = computed(() => this.gridTemplate(this.widget().columns));
  readonly widgetWidth = computed(() => (this.widget().size === 'wide' ? 530 : 265));
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
    return {
      'grid-row': `${element.row + 1} / span ${element.rowSpan}`,
      'grid-column': `${element.column + 1} / span ${element.columnSpan}`,
    };
  }
  private gridTemplate(tracks: Widget['rows']): string {
    return tracks
      .map(
        (track) =>
          `${track.size}${track.unit === 'star' ? 'fr' : track.unit === 'pixel' ? 'px' : ' auto'}`,
      )
      .join(' ');
  }
}
