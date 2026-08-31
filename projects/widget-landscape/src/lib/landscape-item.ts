import { Component, input, output } from '@angular/core';
import { ButtonElement, WidgetRenderer } from 'widget-renderer';
import { LandscapeWidget } from './landscape.model';
import { footprintFor } from './landscape-layout';

@Component({
  selector: 'widget-landscape-item',
  imports: [WidgetRenderer],
  templateUrl: './landscape-item.html',
  styleUrl: './landscape-item.css',
  host: { style: 'display: contents' },
})
export class LandscapeItem {
  readonly item = input.required<LandscapeWidget>();
  readonly editing = input(false);
  readonly selected = input(false);
  readonly dragSource = input(false);
  readonly alternate = input(false);
  readonly darkMode = input(false);
  readonly widgetSelected = output<string>();
  readonly deleted = output<string>();
  readonly dragStarted = output<{ event: DragEvent; id: string }>();
  readonly dragEnded = output<void>();
  readonly refreshRequested = output<string>();
  readonly actionRequested = output<{ id: string; element: ButtonElement; event: Event }>();
  readonly moved = output<{ id: string; row: number; column: number }>();

  protected footprint(): string {
    const size = footprintFor(this.item()) ?? { columnSpan: 1, rowSpan: 1 };
    return `span ${size.rowSpan} / span ${size.columnSpan}`;
  }

  protected gridArea(): string {
    const item = this.item();
    const size = footprintFor(item);
    return `${item.row + 1} / ${item.column + 1} / ${item.row + size.rowSpan + 1} / ${item.column + size.columnSpan + 1}`;
  }

  protected keyDown(event: KeyboardEvent): void {
    if (['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName))
      return;
    const id = this.item().id;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.widgetSelected.emit(id);
      return;
    }
    if (!this.editing()) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.deleted.emit(id);
      return;
    }
    const direction = {
      ArrowUp: { row: -1, column: 0 },
      ArrowDown: { row: 1, column: 0 },
      ArrowLeft: { row: 0, column: -1 },
      ArrowRight: { row: 0, column: 1 },
    }[event.key];
    if (!direction) return;
    event.preventDefault();
    this.moved.emit({ id, ...direction });
  }
}
