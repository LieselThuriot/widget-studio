import { Component, input, output } from '@angular/core';
import { WidgetElement } from 'widget-renderer';

@Component({
  selector: 'app-layer-panel',
  templateUrl: './layer-panel.html',
  styleUrl: './layer-panel.css',
})
export class LayerPanel {
  readonly elements = input.required<WidgetElement[]>();
  readonly selectedId = input<string | null>(null);
  readonly elementSelected = output<string>();
  readonly elementDeleted = output<string>();
  readonly layersCleared = output<void>();
  readonly dragStarted = output<{ event: DragEvent; id: string }>();
  readonly layerDropped = output<{ event: DragEvent; id: string }>();

  protected icon(element: WidgetElement): string {
    return element.type === 'text' ? 'T' : element.type === 'image' ? '▧' : '↗';
  }
  protected label(element: WidgetElement): string {
    return element.type === 'text'
      ? element.text
      : element.type === 'image'
        ? element.alt
        : element.label;
  }
}
