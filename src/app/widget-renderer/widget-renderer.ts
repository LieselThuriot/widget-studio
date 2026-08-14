import { Component, computed, input, output, signal } from '@angular/core';
import { ButtonElement, ImageElement, TextElement, WidgetElement, WidgetV2 } from '../widget-v2.model';

@Component({
  selector: 'app-widget-renderer',
  host: {
    '(document:keydown)': 'onKeyDown($event)',
    '(document:keyup)': 'onKeyUp($event)',
  },
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
})
export class WidgetRenderer {
  readonly widget = input.required<WidgetV2>();
  readonly selectedId = input<string | null>(null);
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
  readonly elementSelected = output<string>();
  readonly elementDeleted = output<string>();
  readonly elementMoved = output<{ id: string; row: number; column: number }>();
  readonly elementResized = output<{ id: string; rowSpan?: number; columnSpan?: number }>();
  readonly widgetSelected = output<void>();
  readonly sensitiveVisible = signal(false);
  readonly ctrlPressed = signal(false);
  readonly draggingId = signal<string | null>(null);
  private dragOffset = { x: 0, y: 0 };
  private activePointerId: number | null = null;
  private resizing: { id: string; axis: 'row' | 'column' } | null = null;

  readonly hasSensitiveElements = computed(() => this.widget().elements.some((element) => element.sensitive));
  readonly gridRows = computed(() => this.widget().rows.map((track) => `${track.size}${track.unit === 'star' ? 'fr' : track.unit === 'pixel' ? 'px' : ' auto'}`).join(' '));
  readonly gridColumns = computed(() => this.widget().columns.map((track) => `${track.size}${track.unit === 'star' ? 'fr' : track.unit === 'pixel' ? 'px' : ' auto'}`).join(' '));

  protected isText(element: WidgetElement): element is TextElement { return element.type === 'text'; }
  protected isImage(element: WidgetElement): element is ImageElement { return element.type === 'image'; }
  protected isButton(element: WidgetElement): element is ButtonElement { return element.type === 'button'; }
  protected toggleSensitive(): void { this.sensitiveVisible.update((visible) => !visible); }
  protected selectElement(id: string, event: Event): void {
    event.stopPropagation();
    this.elementSelected.emit(id);
  }
  protected selectWidget(event: Event): void {
    this.widgetSelected.emit();
  }
  protected deleteElement(id: string, event: Event): void {
    event.stopPropagation();
    this.elementDeleted.emit(id);
  }
  protected startDrag(element: WidgetElement, event: PointerEvent): void {
    if (event.button !== 0 || this.ctrlPressed()) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    this.activePointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.draggingId.set(element.id);
    this.elementSelected.emit(element.id);
  }
  protected startResize(element: WidgetElement, axis: 'row' | 'column', event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizing = { id: element.id, axis };
    this.activePointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.elementSelected.emit(element.id);
  }
  protected moveDrag(event: PointerEvent): void {
    if (this.resizing && event.pointerId === this.activePointerId) {
      const element = this.widget().elements.find((candidate) => candidate.id === this.resizing?.id);
      const widgetRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      if (!element) return;
      if (this.resizing.axis === 'column') {
        const column = this.trackAt(event.clientX - widgetRect.left - 18, this.widget().columns, this.widget().width - 36, 1);
        this.elementResized.emit({ id: element.id, columnSpan: Math.max(1, column - element.column + 1) });
      } else {
        const row = this.trackAt(event.clientY - widgetRect.top - 18, this.widget().rows, this.widget().height - 36, 1);
        this.elementResized.emit({ id: element.id, rowSpan: Math.max(1, row - element.row + 1) });
      }
      return;
    }
    const id = this.draggingId();
    if (!id || event.pointerId !== this.activePointerId) return;
    const element = this.widget().elements.find((candidate) => candidate.id === id);
    const widgetRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (!element) return;
    const pointX = event.clientX - widgetRect.left - this.dragOffset.x - 18;
    const pointY = event.clientY - widgetRect.top - this.dragOffset.y - 18;
    const column = this.trackAt(pointX, this.widget().columns, this.widget().width - 36, element.columnSpan);
    const row = this.trackAt(pointY, this.widget().rows, this.widget().height - 36, element.rowSpan);
    this.elementMoved.emit({ id, row, column });
  }
  protected endDrag(event?: PointerEvent): void {
    if (event && event.pointerId !== this.activePointerId) return;
    this.draggingId.set(null);
    this.resizing = null;
    this.activePointerId = null;
  }
  protected trackAt(position: number, tracks: WidgetV2['columns'], available: number, span: number): number {
    const gap = 8;
    const totalGaps = Math.max(0, tracks.length - 1) * gap;
    const fixed = tracks.filter((track) => track.unit === 'pixel').reduce((sum, track) => sum + track.size, 0);
    const starWeight = tracks.filter((track) => track.unit === 'star').reduce((sum, track) => sum + track.size, 0);
    const flexible = Math.max(0, available - totalGaps - fixed);
    let cursor = 0;
    let index = 0;
    for (const track of tracks) {
      const size = track.unit === 'pixel' ? track.size : track.unit === 'star' ? flexible * track.size / Math.max(1, starWeight) : flexible / Math.max(1, tracks.length);
      if (position < cursor + size / 2) break;
      cursor += size + gap;
      index++;
    }
    return Math.max(0, Math.min(index, tracks.length - span));
  }
  protected onKeyDown(event: KeyboardEvent): void { if (event.key === 'Control') this.ctrlPressed.set(true); }
  protected onKeyUp(event: KeyboardEvent): void { if (event.key === 'Control') this.ctrlPressed.set(false); }
  protected elementStyle(element: WidgetElement): Record<string, string> {
    return {
      'grid-row': `${element.row + 1} / span ${element.rowSpan}`,
      'grid-column': `${element.column + 1} / span ${element.columnSpan}`,
    };
  }
}
