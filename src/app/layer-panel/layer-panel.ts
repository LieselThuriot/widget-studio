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
  readonly stackChanged = output<{ id: string; action: 'up' | 'down' | 'front' | 'back' }>();

  protected icon(element: WidgetElement): string {
    return element.type === 'text'
      ? 'T'
      : element.type === 'image'
        ? '▧'
        : element.type === 'button'
          ? '↗'
          : '◌';
  }
  protected label(element: WidgetElement): string {
    return element.type === 'text'
      ? element.text
      : element.type === 'image'
        ? element.alt
        : element.type === 'button'
          ? element.label
          : element.type === 'progress'
            ? element.data.label
            : element.title;
  }
  protected canMove(index: number, action: 'up' | 'down' | 'front' | 'back'): boolean {
    const last = this.elements().length - 1;
    return action === 'up'
      ? index < last
      : action === 'down'
        ? index > 0
        : action === 'front'
          ? index < last
          : index > 0;
  }
  protected changeStack(id: string, action: 'up' | 'down' | 'front' | 'back'): void {
    this.stackChanged.emit({ id, action });
  }
}
