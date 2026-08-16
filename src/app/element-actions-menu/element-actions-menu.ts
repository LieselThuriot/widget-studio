import { Component, computed, input, output } from '@angular/core';

export type ElementStackAction = 'up' | 'down' | 'front' | 'back';

@Component({
  selector: 'app-element-actions-menu',
  templateUrl: './element-actions-menu.html',
  styleUrl: './element-actions-menu.css',
})
export class ElementActionsMenu {
  readonly placement = input<'canvas' | 'layer'>('layer');
  readonly x = input<number>();
  readonly y = input<number>();
  readonly index = input.required<number>();
  readonly count = input.required<number>();
  readonly stackChanged = output<ElementStackAction>();
  readonly deleteRequested = output<void>();
  readonly closed = output<void>();

  protected readonly canMove = computed(() => {
    const index = this.index();
    const last = this.count() - 1;
    return {
      up: index < last,
      down: index > 0,
      front: index < last,
      back: index > 0,
    };
  });

  protected choose(action: ElementStackAction): void {
    this.stackChanged.emit(action);
    this.closed.emit();
  }

  protected delete(): void {
    this.deleteRequested.emit();
    this.closed.emit();
  }
}
