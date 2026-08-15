import { Component, input, output, signal } from '@angular/core';
import { WidgetElement } from 'widget-renderer';
import { elementIcon, elementLabel } from '../widget-element-metadata';

@Component({
  selector: 'app-layer-panel',
  host: {
    '(document:keydown.escape)': 'closeActions()',
    '(document:click)': 'closeActionsOnOutside($event)',
  },
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
  protected readonly openActionsId = signal<string | null>(null);

  protected icon(element: WidgetElement): string {
    return elementIcon(element.type);
  }
  protected label(element: WidgetElement): string {
    return elementLabel(element);
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
    this.openActionsId.set(null);
  }
  protected toggleActions(id: string, event: Event): void {
    event.stopPropagation();
    this.openActionsId.update((openId) => (openId === id ? null : id));
  }
  protected closeActions(): void {
    this.openActionsId.set(null);
  }
  protected closeActionsOnOutside(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.layer-actions, .layer-actions-trigger')) {
      this.closeActions();
    }
  }
}
