import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  ButtonElement,
  elementGridStyle,
  gridTemplate,
  GridTrack,
  WIDGET_GAP,
  WIDGET_HEIGHT,
  WIDGET_PADDING,
  Widget,
  WidgetElement,
  WidgetRenderer,
  widgetWidth as getWidgetWidth,
} from 'widget-renderer';

@Component({
  selector: 'app-editor-canvas',
  imports: [WidgetRenderer],
  templateUrl: './editor-canvas.html',
  styleUrl: './editor-canvas.css',
  host: {
    '(document:keydown)': 'onKeyDown($event)',
    '(document:keyup)': 'onKeyUp($event)',
    '(document:pointerdown)': 'closeContextMenu()',
    '(document:pointermove)': 'moveDragDocument($event)',
    '(document:pointerup)': 'endDrag($event)',
    '(document:pointercancel)': 'endDrag($event)',
  },
})
export class EditorCanvas {
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  readonly widget = input.required<Widget>();
  readonly selectedId = input<string | null>(null);
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
  readonly elementSelected = output<string>();
  readonly elementDeleted = output<string>();
  readonly elementMoved = output<{ id: string; row: number; column: number }>();
  readonly elementResized = output<{ id: string; rowSpan?: number; columnSpan?: number }>();
  readonly elementStackChanged = output<{ id: string; action: 'up' | 'down' | 'front' | 'back' }>();
  readonly widgetSelected = output<void>();
  readonly ctrlPressed = signal(false);
  readonly draggingId = signal<string | null>(null);
  readonly contextMenu = signal<{ id: string; x: number; y: number } | null>(null);
  readonly gridRows = computed(() => gridTemplate(this.widget().rows));
  readonly gridColumns = computed(() => gridTemplate(this.widget().columns));
  readonly widgetWidth = computed(() => getWidgetWidth(this.widget().size));
  private dragOffset = { x: 0, y: 0 };
  private activePointerId: number | null = null;
  private resizing: { id: string; axis: 'row' | 'column' } | null = null;
  private pointerDownElementId: string | null = null;

  constructor() {
    effect(() => {
      const id = this.selectedId();
      if (id && !document.activeElement?.closest('.event-alert, .preview-window')) {
        queueMicrotask(() => {
          if (!document.querySelector('.event-alert, .preview-window')) this.focusElement(id);
        });
      }
    });
  }

  protected elementStyle(element: WidgetElement): Record<string, string> {
    return elementGridStyle(element);
  }
  protected pointerClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.icon-button')) return;
    const element = this.pointerDownElementId
      ? this.widget().elements.find((candidate) => candidate.id === this.pointerDownElementId)
      : (this.elementFromEvent(event) ?? this.elementAtPoint(event));
    this.pointerDownElementId = null;
    if (element) {
      event.stopPropagation();
      this.selectElement(element.id, event);
    } else {
      this.closeContextMenu();
      this.selectWidget();
    }
  }
  protected pointerDown(event: PointerEvent): void {
    this.pointerDownElementId = null;
    if ((event.target as HTMLElement).closest('.icon-button')) return;
    const element = this.elementFromEvent(event) ?? this.elementAtPoint(event);
    if (!element || event.button !== 0 || this.ctrlPressed()) return;
    this.pointerDownElementId = element.id;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.startDrag(element, event);
  }
  protected pointerContextMenu(event: MouseEvent): void {
    const element = this.elementFromEvent(event) ?? this.elementAtPoint(event);
    if (element) this.openContextMenu(element, event);
  }
  protected selectElement(id: string, event: Event): void {
    event.stopPropagation();
    this.elementSelected.emit(id);
  }
  protected selectWidget(): void {
    this.widgetSelected.emit();
  }
  protected elementLabel(element: WidgetElement): string {
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
  protected onCanvasKeyDown(event: KeyboardEvent): void {
    const target = (event.target as HTMLElement).closest('.editor-element') as HTMLElement | null;
    const id = target?.dataset['widgetElementId'];
    if (
      !id ||
      ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes((event.target as HTMLElement).tagName)
    ) {
      return;
    }
    const element = this.widget().elements.find((candidate) => candidate.id === id);
    if (!element) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.elementDeleted.emit(id);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.elementSelected.emit(id);
      return;
    }
    const action =
      event.key === '['
        ? event.shiftKey
          ? 'back'
          : 'down'
        : event.key === ']'
          ? event.shiftKey
            ? 'front'
            : 'up'
          : null;
    if (action) {
      event.preventDefault();
      this.elementStackChanged.emit({ id, action });
      return;
    }
    const axis =
      event.key === 'ArrowUp' || event.key === 'ArrowDown'
        ? 'row'
        : event.key === 'ArrowLeft' || event.key === 'ArrowRight'
          ? 'column'
          : null;
    if (!axis) return;
    event.preventDefault();
    const direction = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1;
    if (event.shiftKey) {
      this.elementResized.emit(
        axis === 'row'
          ? { id, rowSpan: element.grid.rowSpan + direction }
          : { id, columnSpan: element.grid.columnSpan + direction },
      );
    } else {
      this.elementMoved.emit(
        axis === 'row'
          ? { id, row: element.grid.row + direction, column: element.grid.column }
          : { id, row: element.grid.row, column: element.grid.column + direction },
      );
    }
  }
  private focusElement(id: string): void {
    const element = Array.from(this.hostElement.nativeElement.querySelectorAll('.editor-element'))
      .map((candidate) => candidate as HTMLElement)
      .find((candidate) => candidate.dataset['widgetElementId'] === id);
    element?.focus();
  }
  protected openContextMenu(element: WidgetElement, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const bounds = (event.currentTarget as HTMLElement)
      .closest('.editor-canvas')
      ?.getBoundingClientRect();
    if (!bounds) return;
    this.elementSelected.emit(element.id);
    this.contextMenu.set({
      id: element.id,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  }
  protected closeContextMenu(): void {
    this.contextMenu.set(null);
  }
  protected changeStack(action: 'up' | 'down' | 'front' | 'back', event: Event): void {
    event.stopPropagation();
    const menu = this.contextMenu();
    if (menu) this.elementStackChanged.emit({ id: menu.id, action });
    this.closeContextMenu();
  }
  protected deleteElement(id: string, event: Event): void {
    event.stopPropagation();
    this.elementDeleted.emit(id);
  }
  protected startDrag(element: WidgetElement, event: PointerEvent): void {
    if (event.button !== 0 || this.ctrlPressed()) return;
    event.preventDefault();
    event.stopPropagation();
    const elementNode = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
        '[data-widget-element-id]',
      ),
    ).find((node) => node.dataset['widgetElementId'] === element.id);
    const rect =
      elementNode?.getBoundingClientRect() ??
      (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    this.activePointerId = event.pointerId;
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
    if (event.pointerId !== this.activePointerId) return;
    const canvas = this.hostElement.nativeElement.getBoundingClientRect();
    const state = this.resizing;
    const id = state?.id ?? this.draggingId();
    if (!id) return;
    const element = this.widget().elements.find((candidate) => candidate.id === id);
    if (!element) return;
    if (state) {
      const track =
        state.axis === 'column'
          ? this.trackAt(
              event.clientX - canvas.left - WIDGET_PADDING,
              this.widget().columns,
              this.widgetWidth() - WIDGET_PADDING * 2,
              1,
            )
          : this.trackAt(
              event.clientY - canvas.top - WIDGET_PADDING,
              this.widget().rows,
              WIDGET_HEIGHT - WIDGET_PADDING * 2,
              1,
            );
      this.elementResized.emit(
        state.axis === 'column'
          ? { id, columnSpan: Math.max(1, track - element.grid.column + 1) }
          : { id, rowSpan: Math.max(1, track - element.grid.row + 1) },
      );
      return;
    }
    const column = this.trackAt(
      event.clientX - canvas.left - this.dragOffset.x - WIDGET_PADDING,
      this.widget().columns,
      this.widgetWidth() - WIDGET_PADDING * 2,
      element.grid.columnSpan,
    );
    const row = this.trackAt(
      event.clientY - canvas.top - this.dragOffset.y - WIDGET_PADDING,
      this.widget().rows,
      WIDGET_HEIGHT - WIDGET_PADDING * 2,
      element.grid.rowSpan,
    );
    this.elementMoved.emit({ id, row, column });
  }
  protected moveDragDocument(event: PointerEvent): void {
    if (this.activePointerId !== null) this.moveDrag(event);
  }
  protected endDrag(event?: PointerEvent): void {
    if (event && this.activePointerId !== null && event.pointerId !== this.activePointerId) return;
    this.draggingId.set(null);
    this.resizing = null;
    this.activePointerId = null;
  }
  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Control') this.ctrlPressed.set(true);
  }
  protected onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Control') this.ctrlPressed.set(false);
  }
  private elementFromEvent(event: Event): WidgetElement | undefined {
    const id = (event.target as HTMLElement)
      .closest('[data-widget-element-id]')
      ?.getAttribute('data-widget-element-id');
    return id ? this.widget().elements.find((element) => element.id === id) : undefined;
  }
  private elementAtPoint(event: MouseEvent): WidgetElement | undefined {
    const elementNodes = Array.from(
      (this.hostElement.nativeElement as HTMLElement).querySelectorAll('[data-widget-element-id]'),
    );
    const element = [...this.widget().elements].reverse().find((candidate) => {
      const node = elementNodes.find(
        (elementNode) => (elementNode as HTMLElement).dataset['widgetElementId'] === candidate.id,
      ) as HTMLElement | undefined;
      if (!node) return false;
      const bounds = node.getBoundingClientRect();
      return (
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      );
    });
    return element;
  }
  private trackAt(position: number, tracks: GridTrack[], available: number, span: number): number {
    const gap = WIDGET_GAP;
    const fixed = tracks
      .filter((track) => track.unit === 'pixel')
      .reduce((sum, track) => sum + track.size, 0);
    const stars = tracks
      .filter((track) => track.unit === 'star')
      .reduce((sum, track) => sum + track.size, 0);
    const flexible = Math.max(0, available - Math.max(0, tracks.length - 1) * gap - fixed);
    let cursor = 0;
    let index = 0;
    for (const track of tracks) {
      const size =
        track.unit === 'pixel'
          ? track.size
          : track.unit === 'star'
            ? (flexible * track.size) / Math.max(1, stars)
            : flexible / Math.max(1, tracks.length);
      if (position < cursor + size / 2) break;
      cursor += size + gap;
      index++;
    }
    return Math.max(0, Math.min(index, tracks.length - span));
  }
}
