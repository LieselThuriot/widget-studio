import { Component, input, output, signal } from '@angular/core';
import { WidgetElement } from '../editor-model';
import { elementIcon, elementLabel } from '../widget-element-metadata';
import {
  ElementActionsMenu,
  ElementStackAction,
} from '../element-actions-menu/element-actions-menu';

@Component({
  selector: 'app-layer-panel',
  imports: [ElementActionsMenu],
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
  protected changeStack(id: string, action: ElementStackAction): void {
    this.stackChanged.emit({ id, action });
    this.openActionsId.set(null);
  }
  protected toggleActions(id: string, event: Event): void {
    event.stopPropagation();
    this.openActionsId.update((openId) => (openId === id ? null : id));
  }
  protected openActionsFromContextMenu(id: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.elementSelected.emit(id);
    this.openActionsId.set(id);
  }
  protected closeActions(): void {
    this.openActionsId.set(null);
  }
  protected closeActionsOnOutside(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.element-actions-menu, .layer-actions-trigger')) {
      this.closeActions();
    }
  }
}
