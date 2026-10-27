import {
  Component,
  computed,
  effect,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  ButtonElement,
  gridTemplate,
  WIDGET_PADDING,
  WidgetRenderer,
  widgetHeight as getWidgetHeight,
  widgetWidth as getWidgetWidth,
} from '@lieselthuriot/widget-renderer';
import { Widget, WidgetElement } from '../editor-model';
import {
  ElementActionsMenu,
  ElementStackAction,
} from '../element-actions-menu/element-actions-menu';
import { CanvasElementOverlay } from './canvas-element-overlay';
import { elementForEvent, resolvedTrackSizes, trackAt } from './editor-canvas-interaction';

@Component({
  selector: 'app-editor-canvas',
  imports: [WidgetRenderer, CanvasElementOverlay, ElementActionsMenu],
  templateUrl: './editor-canvas.html',
  styleUrl: './editor-canvas.css',
  host: {
    '(document:keydown)': 'onKeyDown($event)',
    '(document:keyup)': 'onKeyUp($event)',
    '(document:visibilitychange)': 'resetTransientState()',
    '(window:blur)': 'resetTransientState()',
    '(document:pointerdown)': 'closeContextMenu()',
    '(document:pointermove)': 'moveDragDocument($event)',
    '(document:pointerup)': 'endDrag($event)',
    '(document:pointercancel)': 'endDrag($event)',
  },
})
export class EditorCanvas implements AfterViewInit, OnDestroy {
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  readonly widget = input.required<Widget>();
  readonly darkMode = input(false);
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
  readonly widgetHeight = computed(() => getWidgetHeight(this.widget().size));
  private dragOffset = { x: 0, y: 0 };
  private activePointerId: number | null = null;
  private resizing: { id: string; axis: 'row' | 'column' } | null = null;
  private pointerDownElementId: string | null = null;
  private readonly resolvedRows = signal<string | null>(null);
  private readonly resolvedColumns = signal<string | null>(null);
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private measurementFrame: number | null = null;
  private followUpMeasurementFrame: number | null = null;

  protected readonly overlayRows = computed(() => this.resolvedRows() ?? this.gridRows());
  protected readonly overlayColumns = computed(() => this.resolvedColumns() ?? this.gridColumns());

  constructor() {
    effect(() => {
      const id = this.selectedId();
      if (id && !document.activeElement?.closest('.event-alert, .preview-window')) {
        queueMicrotask(() => {
          if (!document.querySelector('.event-alert, .preview-window')) this.focusElement(id);
        });
      }
    });
    effect(() => {
      this.widget();
      this.scheduleOverlayGridSync();
    });
  }

  ngAfterViewInit(): void {
    const grid = this.hostElement.nativeElement.querySelector(
      'widget-renderer .widget-grid',
    ) as HTMLElement | null;
    if (!grid) return;
    this.scheduleOverlayGridSync();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.scheduleOverlayGridSync());
      this.resizeObserver.observe(grid);
      this.observeGridChildren(grid);
    }
    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => {
        this.observeGridChildren(grid);
        this.scheduleOverlayGridSync();
      });
      this.mutationObserver.observe(grid, { childList: true });
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    if (this.measurementFrame !== null) cancelAnimationFrame(this.measurementFrame);
    if (this.followUpMeasurementFrame !== null) cancelAnimationFrame(this.followUpMeasurementFrame);
  }

  private scheduleOverlayGridSync(): void {
    if (this.measurementFrame !== null || this.followUpMeasurementFrame !== null) return;
    this.measurementFrame = requestAnimationFrame(() => {
      this.measurementFrame = null;
      this.followUpMeasurementFrame = requestAnimationFrame(() => {
        this.followUpMeasurementFrame = null;
        this.syncOverlayGrid();
      });
    });
  }

  private observeGridChildren(grid: HTMLElement): void {
    if (!this.resizeObserver) return;
    for (const child of grid.children) this.resizeObserver.observe(child);
  }

  private syncOverlayGrid(): void {
    const grid = this.hostElement.nativeElement.querySelector(
      'widget-renderer .widget-grid',
    ) as HTMLElement | null;
    if (!grid) return;
    const style = getComputedStyle(grid);
    this.resolvedRows.set(style.gridTemplateRows);
    this.resolvedColumns.set(style.gridTemplateColumns);
  }

  protected pointerClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.icon-button')) return;
    const element = this.pointerDownElementId
      ? this.widget().elements.find((candidate) => candidate.id === this.pointerDownElementId)
      : elementForEvent(event, this.hostElement.nativeElement, this.widget().elements);
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
    const element = elementForEvent(event, this.hostElement.nativeElement, this.widget().elements);
    if (!element || event.button !== 0 || this.ctrlPressed()) return;
    this.pointerDownElementId = element.id;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.startDrag(element, event);
  }
  protected pointerContextMenu(event: MouseEvent): void {
    const element = elementForEvent(event, this.hostElement.nativeElement, this.widget().elements);
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
  protected changeStack(action: ElementStackAction): void {
    const menu = this.contextMenu();
    if (menu) this.elementStackChanged.emit({ id: menu.id, action });
    this.closeContextMenu();
  }
  protected contextMenuIndex(): number {
    const id = this.contextMenu()?.id;
    return this.widget().elements.findIndex((element) => element.id === id);
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
              resolvedTrackSizes(this.hostElement.nativeElement, 'columns'),
            )
          : trackAt(
              event.clientY - canvas.top - WIDGET_PADDING,
              this.widget().rows,
              this.widgetHeight() - WIDGET_PADDING * 2,
              1,
              resolvedTrackSizes(this.hostElement.nativeElement, 'rows'),
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
      resolvedTrackSizes(this.hostElement.nativeElement, 'columns'),
    );
    const row = trackAt(
      event.clientY - canvas.top - this.dragOffset.y - WIDGET_PADDING,
      this.widget().rows,
      this.widgetHeight() - WIDGET_PADDING * 2,
      element.grid.rowSpan,
      resolvedTrackSizes(this.hostElement.nativeElement, 'rows'),
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

  protected resetTransientState(): void {
    this.ctrlPressed.set(false);
    this.endDrag();
  }
}
