import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ButtonElement } from 'widget-renderer';
import { LandscapeToolbar } from './landscape-toolbar';
import { LandscapeItem } from './landscape-item';
import { LandscapePalette } from './landscape-palette';
import {
  addWidget,
  canFitWidget,
  effectiveSizeFor,
  footprintFor,
  hasCollisionAt,
  hasHorizontalOverflow,
  moveWidget,
  normalizeLandscapeState,
  previewPlacement,
  reflowLandscapeState,
} from './landscape-layout';
import {
  LandscapeActionEvent,
  LandscapePaletteItem,
  LandscapeStateChange,
  LandscapeState,
  LandscapeWidget,
  LandscapeRefreshEvent,
} from './landscape.model';

@Component({
  selector: 'widget-landscape',
  imports: [LandscapeToolbar, LandscapeItem, LandscapePalette],
  templateUrl: './widget-landscape.html',
  styleUrl: './widget-landscape.css',
  host: {
    '(document:keydown.escape)': 'cancelEdit()',
    '[class.is-dark]': 'darkMode()',
  },
})
export class WidgetLandscape implements OnDestroy {
  private static readonly gridPadding = 18;
  private static readonly gridGap = 8;
  private static readonly columnWidth = 133;
  private static readonly rowHeight = 123;
  private static readonly paletteSwitchDistance = 280;

  readonly state = input.required<LandscapeState>();
  readonly palette = input<readonly LandscapePaletteItem[] | null>([]);
  readonly editMode = input(false);
  readonly columnsLocked = input(false);
  readonly darkMode = input(false);
  readonly responsive = input<boolean | undefined>();
  readonly stateChange = output<LandscapeStateChange>();
  readonly editModeChange = output<boolean>();
  readonly widgetSelected = output<{ id: string }>();
  readonly widgetDeleted = output<{ id: string }>();
  readonly refreshRequested = output<LandscapeRefreshEvent>();
  readonly actionRequested = output<LandscapeActionEvent>();

  protected readonly draft = signal<LandscapeState | null>(null);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly dragId = signal<string | null>(null);
  protected readonly dragPaletteItem = signal<LandscapePaletteItem | null>(null);
  protected readonly dragPreview = signal<LandscapeState | null>(null);
  protected readonly dragTarget = signal<{ row: number; column: number } | null>(null);
  protected readonly paletteSide = signal<'left' | 'right'>('right');
  private readonly responsiveColumns = signal<number | null>(null);
  private readonly gridElement = viewChild<ElementRef<HTMLElement>>('landscapeGrid');
  private readonly paletteComponent = viewChild(LandscapePalette);
  private dragOrigin: LandscapeState | null = null;
  private wasInControlledEditMode = false;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  private hoverKey: string | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private observedGrid: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const editMode = this.editMode();
      if (editMode && !this.wasInControlledEditMode && !untracked(() => this.draft())) {
        this.draft.set(normalizeLandscapeState(structuredClone(this.state())));
      } else if (!editMode && this.wasInControlledEditMode) {
        this.clearEditState();
      }
      this.wasInControlledEditMode = editMode;
    });
    effect(() => {
      const grid = this.gridElement()?.nativeElement ?? null;
      this.isResponsive();
      this.activeState();
      if (
        grid === this.observedGrid &&
        ((this.isResponsive() && this.resizeObserver) ||
          (!this.isResponsive() && !this.resizeObserver))
      ) {
        if (grid && this.isResponsive()) this.updateResponsiveColumns(grid);
        return;
      }
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
      this.observedGrid = grid;
      this.responsiveColumns.set(null);
      if (!grid || !this.isResponsive() || typeof ResizeObserver === 'undefined') return;
      this.resizeObserver = new ResizeObserver(() => this.updateResponsiveColumns(grid));
      this.resizeObserver.observe(grid);
      this.updateResponsiveColumns(grid);
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  protected readonly activeState = computed(
    () => this.dragPreview() ?? this.draft() ?? this.state(),
  );
  protected readonly renderedState = computed(() => {
    const state = this.activeState();
    const columns = this.displayedColumns();
    if (!this.isResponsive() || columns === state.columns) return state;
    return hasHorizontalOverflow(state.widgets, columns)
      ? reflowLandscapeState(state, columns)
      : { ...state, columns };
  });
  protected readonly isEditing = computed(() => this.editMode() || this.draft() !== null);
  protected readonly paletteItems = computed(() => this.palette() ?? []);
  protected readonly invalidPaletteIds = computed(() =>
    this.paletteItems()
      .filter((item) => {
        const widget = item.createWidget();
        return (
          this.activeState().widgets.some(({ id }) => id === widget.id) ||
          !canFitWidget(
            { id: item.id, size: widget.size, widget, row: 0, column: 0 },
            this.activeState().columns,
          )
        );
      })
      .map((item) => item.id),
  );
  protected readonly minimumColumns = computed(() =>
    this.activeState().widgets.reduce(
      (minimum, widget) => Math.max(minimum, footprintFor(widget).columnSpan),
      1,
    ),
  );

  protected readonly isResponsive = computed(
    () => this.responsive() ?? this.activeState().responsive,
  );

  protected columnBoundaryOffset(): number {
    const columns = (this.draft() ?? this.state()).columns;
    return (
      WidgetLandscape.gridPadding +
      columns * WidgetLandscape.columnWidth +
      Math.max(0, columns - 1) * WidgetLandscape.gridGap
    );
  }

  private displayedColumns(): number {
    return this.isResponsive() && this.responsiveColumns() !== null
      ? this.responsiveColumns()!
      : this.activeState().columns;
  }

  private updateResponsiveColumns(grid: HTMLElement): void {
    if (!this.isResponsive()) return;
    const availableWidth = grid.getBoundingClientRect().width - WidgetLandscape.gridPadding * 2;
    const fittingColumns = Math.floor(
      (availableWidth + WidgetLandscape.gridGap) /
        (WidgetLandscape.columnWidth + WidgetLandscape.gridGap),
    );
    const largestWidget = this.activeState().widgets.reduce(
      (maximum, widget) => Math.max(maximum, footprintFor(widget).columnSpan),
      1,
    );
    this.responsiveColumns.set(Math.max(largestWidget, fittingColumns, 1));
  }

  protected enterEdit(): void {
    if (this.isEditing()) return;
    this.draft.set(normalizeLandscapeState(structuredClone(this.state())));
    this.editModeChange.emit(true);
  }

  protected confirmEdit(): void {
    const state = this.draft();
    if (!state) return;
    const normalizedState = normalizeLandscapeState(state);
    this.stateChange.emit({
      version: 1,
      columns: normalizedState.columns,
      responsive: this.isResponsive(),
      widgets: normalizedState.widgets.map((widget) => ({
        id: widget.id,
        size: effectiveSizeFor(widget),
        row: widget.row,
        column: widget.column,
      })),
    });
    this.clearEditState();
    this.editModeChange.emit(false);
  }

  protected updateResponsive(event: Event): void {
    const responsive = (event.target as HTMLInputElement).checked;
    this.draft.update((state) => (state ? { ...state, responsive } : state));
  }

  protected updateColumns(event: Event): void {
    const columns = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(columns)) return;
    this.draft.update((state) =>
      state
        ? normalizeLandscapeState({
            ...state,
            columns: Math.max(this.minimumColumns(), Math.floor(columns)),
          })
        : state,
    );
  }

  protected cancelEdit(): void {
    if (!this.isEditing()) return;
    this.clearEditState();
    this.editModeChange.emit(false);
  }

  private clearEditState(): void {
    this.draft.set(null);
    this.selectedId.set(null);
    this.paletteSide.set('right');
    this.endDrag();
  }

  protected addFromPalette(item: LandscapePaletteItem): void {
    if (this.invalidPaletteIds().includes(item.id)) return;
    const widgetInput = item.createWidget();
    const widget: LandscapeWidget = {
      id: widgetInput.id,
      size: widgetInput.size,
      widget: structuredClone(widgetInput),
      row: 0,
      column: 0,
    };
    this.draft.update((state) => (state ? addWidget(state, widget) : state));
  }

  protected clearWidgets(): void {
    this.draft.update((state) => (state ? { ...state, widgets: [] } : state));
    this.selectedId.set(null);
  }

  protected startPaletteDrag(event: DragEvent, item: LandscapePaletteItem): void {
    if (this.invalidPaletteIds().includes(item.id)) return;
    event.dataTransfer?.setData('widget-landscape-palette-id', item.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
    this.setTransparentDragImage(event);
    this.beginDrag(null, item);
  }

  protected startDrag(event: DragEvent, id: string): void {
    event.dataTransfer?.setData('widget-landscape-id', id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    this.setTransparentDragImage(event);
    this.beginDrag(id, null);
  }

  private beginDrag(id: string | null, item: LandscapePaletteItem | null): void {
    this.clearDragTimer();
    this.dragId.set(id);
    this.dragPaletteItem.set(item);
    this.dragOrigin = {
      ...structuredClone(this.renderedState()),
      columns: this.configuredColumns(),
    };
    this.dragPreview.set(null);
    this.dragTarget.set(null);
  }

  private setTransparentDragImage(event: DragEvent): void {
    const image = document.createElement('canvas');
    image.width = 1;
    image.height = 1;
    event.dataTransfer?.setDragImage(image, 0, 0);
  }

  protected dragOverWidget(event: DragEvent): void {
    event.preventDefault();
    const host = event.currentTarget as HTMLElement;
    if (this.dragId() || this.dragPaletteItem()) this.updatePaletteSide(event, host);
    const moving = this.draggedWidget();
    const target = this.targetForEvent(event, host, moving);
    if (!target || !moving || !this.dragOrigin) return;
    const key = `${target.row}:${target.column}`;
    this.dragTarget.set(target);
    if (this.hoverKey === key) return;
    this.clearDragTimer();
    this.hoverKey = key;
    const hasCollision = hasCollisionAt(this.dragOrigin.widgets, moving, target.row, target.column);
    if (!hasCollision) {
      this.dragPreview.set({
        ...this.dragOrigin,
        widgets: [
          ...this.dragOrigin.widgets.filter((item) => item.id !== moving.id),
          { ...moving, ...target },
        ],
      });
      return;
    }
    this.hoverTimer = setTimeout(() => {
      const preview =
        this.dragOrigin && previewPlacement(this.dragOrigin, moving, target.row, target.column);
      this.dragPreview.set(preview);
      this.hoverTimer = null;
    }, 350);
  }

  protected dragLeaveWidget(event: DragEvent): void {
    const host = event.currentTarget as HTMLElement;
    if (event.relatedTarget instanceof Node && host.contains(event.relatedTarget)) return;
    this.clearDragTimer();
    this.dragTarget.set(null);
    this.dragPreview.set(null);
  }

  protected dropWidget(event: DragEvent): void {
    event.preventDefault();
    const preview = this.dragPreview();
    const target = this.dragTarget();
    const moving = this.draggedWidget();
    if (preview && target && moving) {
      this.commitPreview(preview);
    } else if (target && moving && this.dragOrigin) {
      const placed = previewPlacement(this.dragOrigin, moving, target.row, target.column);
      if (placed) this.commitPreview(placed);
    }
    this.endDrag();
  }

  protected endDrag(): void {
    this.clearDragTimer();
    this.dragId.set(null);
    this.dragPaletteItem.set(null);
    this.dragPreview.set(null);
    this.dragTarget.set(null);
    this.dragOrigin = null;
    this.hoverKey = null;
  }

  private draggedWidget(): LandscapeWidget | null {
    const id = this.dragId();
    if (id && this.dragOrigin)
      return this.dragOrigin.widgets.find((item) => item.id === id) ?? null;
    const item = this.dragPaletteItem();
    if (!item) return null;
    const widget = item.createWidget();
    return {
      id: widget.id,
      size: widget.size,
      widget: structuredClone(widget),
      row: 0,
      column: 0,
    };
  }

  protected draggedWidgetForTemplate(): LandscapeWidget | null {
    return this.draggedWidget();
  }

  protected canFitDraggedWidget(): boolean {
    const widget = this.draggedWidget();
    return widget !== null && canFitWidget(widget, this.renderedState().columns);
  }

  protected footprintFor(widget: LandscapeWidget) {
    return footprintFor(widget);
  }

  private commitPreview(preview: LandscapeState): void {
    const configuredState = this.draft() ?? this.state();
    this.draft.set(
      normalizeLandscapeState({
        ...preview,
        columns: configuredState.columns,
        responsive: configuredState.responsive,
      }),
    );
  }

  private targetForEvent(
    event: DragEvent,
    host: HTMLElement,
    moving: LandscapeWidget | null,
  ): { row: number; column: number } | null {
    const bounds = host.getBoundingClientRect();
    const columns = this.configuredColumns();
    if (!bounds.width || !columns || !moving) return null;
    const padding = WidgetLandscape.gridPadding;
    const column = Math.floor(
      (event.clientX - bounds.left - padding) /
        (WidgetLandscape.columnWidth + WidgetLandscape.gridGap),
    );
    const maxColumn = columns - footprintFor(moving).columnSpan;
    return {
      row: Math.max(
        0,
        Math.floor(
          (event.clientY - bounds.top - padding) /
            (WidgetLandscape.rowHeight + WidgetLandscape.gridGap),
        ),
      ),
      column: Math.max(0, Math.min(maxColumn, column)),
    };
  }

  private configuredColumns(): number {
    return Math.max(1, Math.floor((this.draft() ?? this.state()).columns || 1));
  }

  private updatePaletteSide(event: DragEvent, host: HTMLElement): void {
    const bounds = host.getBoundingClientRect();
    if (!bounds.width) return;
    const distanceFromLeft = event.clientX - bounds.left;
    const distanceFromRight = bounds.right - event.clientX;
    if (distanceFromRight <= WidgetLandscape.paletteSwitchDistance) {
      this.paletteSide.set('left');
    } else if (distanceFromLeft <= WidgetLandscape.paletteSwitchDistance) {
      this.paletteSide.set('right');
    }
  }

  private clearDragTimer(): void {
    if (this.hoverTimer !== null) clearTimeout(this.hoverTimer);
    this.hoverTimer = null;
  }

  protected selectWidget(id: string): void {
    this.selectedId.set(id);
    this.widgetSelected.emit({ id });
  }

  protected moveFromKeyboard(event: { id: string; row: number; column: number }): void {
    const movedState = moveWidget(
      { ...this.renderedState(), columns: this.configuredColumns() },
      event.id,
      event.row,
      event.column,
    );
    this.commitPreview(movedState);
    this.updatePaletteSideForKeyboardMove(movedState, event.id);
  }

  private updatePaletteSideForKeyboardMove(state: LandscapeState, id: string): void {
    const grid = this.gridElement()?.nativeElement;
    const palette = this.paletteComponent()?.element()?.nativeElement;
    const widget = this.renderedState().widgets.find((item) => item.id === id);
    if (!grid || !palette || !widget || getComputedStyle(palette).position === 'static') return;

    const gridBounds = grid.getBoundingClientRect();
    const paletteBounds = palette.getBoundingClientRect();
    const size = footprintFor(widget);
    const left =
      gridBounds.left +
      WidgetLandscape.gridPadding +
      widget.column * (WidgetLandscape.columnWidth + WidgetLandscape.gridGap);
    const top =
      gridBounds.top +
      WidgetLandscape.gridPadding +
      widget.row * (WidgetLandscape.rowHeight + WidgetLandscape.gridGap);
    const right =
      left +
      size.columnSpan * WidgetLandscape.columnWidth +
      (size.columnSpan - 1) * WidgetLandscape.gridGap;
    const bottom =
      top + size.rowSpan * WidgetLandscape.rowHeight + (size.rowSpan - 1) * WidgetLandscape.gridGap;
    const overlapsPalette =
      left < paletteBounds.right &&
      right > paletteBounds.left &&
      top < paletteBounds.bottom &&
      bottom > paletteBounds.top;

    if (!overlapsPalette) return;
    this.paletteSide.set(
      paletteBounds.left >= gridBounds.left + gridBounds.width / 2 ? 'left' : 'right',
    );
  }

  protected deleteWidget(id: string): void {
    this.draft.update((state) =>
      state ? { ...state, widgets: state.widgets.filter((item) => item.id !== id) } : state,
    );
    this.widgetDeleted.emit({ id });
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  protected refresh(id: string): void {
    const widget = this.activeState().widgets.find((item) => item.id === id)?.widget;
    this.refreshRequested.emit({ id, label: widget?.refresh?.label ?? 'Refresh widget' });
  }

  protected action(id: string, event: { element: ButtonElement; event: Event }): void {
    this.actionRequested.emit({ id, ...event });
  }
}
