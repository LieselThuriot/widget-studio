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
  gridTemplate,
  WIDGET_HEIGHT,
  WIDGET_PADDING,
  Widget,
  WidgetElement,
  WidgetRenderer,
  widgetWidth as getWidgetWidth,
} from 'widget-renderer';
import { CanvasContextMenu, CanvasContextMenuState } from './canvas-context-menu';
import { CanvasElementOverlay } from './canvas-element-overlay';
import { elementAtPoint, elementFromEvent, trackAt } from './editor-canvas-interaction';

@Component({
  selector: 'app-editor-canvas',
  imports: [WidgetRenderer, CanvasElementOverlay, CanvasContextMenu],
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
  readonly contextMenu = signal<CanvasContextMenuState | null>(null);
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

  protected pointerClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.icon-button')) return;
    const element = this.pointerDownElementId
      ? this.widget().elements.find((candidate) => candidate.id === this.pointerDownElementId)
      : (elementFromEvent(event, this.widget().elements) ??
        elementAtPoint(event, this.hostElement.nativeElement, this.widget().elements));
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
    const element =
      elementFromEvent(event, this.widget().elements) ??
      elementAtPoint(event, this.hostElement.nativeElement, this.widget().elements);
    if (!element || event.button !== 0 || this.ctrlPressed()) return;
    this.pointerDownElementId = element.id;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.startDrag(element, event);
  }
  protected pointerContextMenu(event: MouseEvent): void {
    const element =
      elementFromEvent(event, this.widget().elements) ??
      elementAtPoint(event, this.hostElement.nativeElement, this.widget().elements);
    if (element) this.openContextMenu(element, event);
  }
  protected selectElement(id: string, event: Event): void {
    event.stopPropagation();
    this.elementSelected.emit(id);
  }
  protected selectWidget(): void {
    this.widgetSelected.emit();
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
  protected changeStack(action: 'up' | 'down' | 'front' | 'back'): void {
    const menu = this.contextMenu();
    if (menu) this.elementStackChanged.emit({ id: menu.id, action });
    this.closeContextMenu();
  }
  protected deleteElement(id: string, event?: Event): void {
    event?.stopPropagation();
    this.elementDeleted.emit(id);
    this.closeContextMenu();
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
          ? trackAt(
              event.clientX - canvas.left - WIDGET_PADDING,
              this.widget().columns,
              this.widgetWidth() - WIDGET_PADDING * 2,
              1,
            )
          : trackAt(
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
    const column = trackAt(
      event.clientX - canvas.left - this.dragOffset.x - WIDGET_PADDING,
      this.widget().columns,
      this.widgetWidth() - WIDGET_PADDING * 2,
      element.grid.columnSpan,
    );
    const row = trackAt(
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
}
