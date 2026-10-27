import { Component, ElementRef, effect, inject, input, output, signal } from '@angular/core';
import { GridTrack, Widget, gridTemplate } from '@lieselthuriot/widget-renderer';
import { focusFirstElement, focusableElements, trapTabFocus } from '../../dialog-focus';
import { GridTrackPatch, mergeTrack } from '../../editor-state';
import { eventNumber, eventValue } from '../form-events';

@Component({
  selector: 'app-grid-editor-dialog',
  templateUrl: './grid-editor-dialog.html',
  styleUrl: './grid-editor-dialog.css',
})
export class GridEditorDialog {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly previouslyFocused = document.activeElement;
  readonly widget = input.required<Widget>();
  readonly saved = output<{
    rows: GridTrack[];
    columns: GridTrack[];
    removed: { kind: 'rows' | 'columns'; index: number }[];
  }>();
  readonly closed = output<void>();
  protected readonly rows = signal<GridTrack[]>([]);
  protected readonly columns = signal<GridTrack[]>([]);
  protected readonly removed = signal<{ kind: 'rows' | 'columns'; index: number }[]>([]);
  protected readonly selectedCell = signal({ row: 0, column: 0 });

  constructor() {
    effect(() => {
      this.rows.set(this.widget().rows.map((track) => ({ ...track })));
      this.columns.set(this.widget().columns.map((track) => ({ ...track })));
      this.removed.set([]);
      this.selectedCell.set({ row: 0, column: 0 });
    });
    queueMicrotask(() => focusFirstElement(this.elementRef.nativeElement));
  }

  protected unit(event: Event): GridTrack['unit'] {
    const value = eventValue(event);
    return value === 'pixel' || value === 'auto' ? value : 'star';
  }

  protected number(event: Event): number {
    return eventNumber(event);
  }

  protected selectCell(row: number, column: number): void {
    this.selectedCell.set({ row, column });
  }

  protected selectedRow(): GridTrack {
    return this.rows()[this.selectedCell().row];
  }

  protected selectedColumn(): GridTrack {
    return this.columns()[this.selectedCell().column];
  }

  protected updateSelected(kind: 'rows' | 'columns', patch: GridTrackPatch): void {
    this.update(
      kind,
      kind === 'rows' ? this.selectedCell().row : this.selectedCell().column,
      patch,
    );
  }

  protected previewColumns(): string {
    return `auto ${gridTemplate(this.columns())} auto`;
  }

  protected previewRows(): string {
    return `auto ${gridTemplate(this.rows())} auto`;
  }

  protected trackLabel(track: GridTrack): string {
    return track.unit === 'auto' ? 'auto' : `${track.size}${track.unit === 'star' ? '*' : 'px'}`;
  }

  protected update(kind: 'rows' | 'columns', index: number, patch: GridTrackPatch): void {
    const tracks = kind === 'rows' ? this.rows : this.columns;
    tracks.update((items) =>
      items.map((track, trackIndex) => (trackIndex === index ? mergeTrack(track, patch) : track)),
    );
  }

  protected add(kind: 'rows' | 'columns'): void {
    const tracks = kind === 'rows' ? this.rows : this.columns;
    tracks.update((items) => [...items, { size: 1, unit: 'star' }]);
    if (kind === 'rows') {
      this.selectedCell.update((cell) => ({
        ...cell,
        row: Math.min(cell.row, tracks().length - 1),
      }));
    } else {
      this.selectedCell.update((cell) => ({
        ...cell,
        column: Math.min(cell.column, tracks().length - 1),
      }));
    }
  }

  protected remove(kind: 'rows' | 'columns', index: number): void {
    const tracks = kind === 'rows' ? this.rows : this.columns;
    if (tracks().length <= 1) return;
    tracks.update((items) => items.filter((_, trackIndex) => trackIndex !== index));
    this.removed.update((items) => [...items, { kind, index }]);
    this.selectedCell.update((cell) => ({
      row: kind === 'rows' ? Math.max(0, Math.min(cell.row, this.rows().length - 1)) : cell.row,
      column:
        kind === 'columns'
          ? Math.max(0, Math.min(cell.column, this.columns().length - 1))
          : cell.column,
    }));
  }

  protected clear(): void {
    this.removed.update((items) => [
      ...items,
      ...Array.from({ length: this.rows().length - 1 }, (_, index) => ({
        kind: 'rows' as const,
        index: index + 1,
      })).reverse(),
      ...Array.from({ length: this.columns().length - 1 }, (_, index) => ({
        kind: 'columns' as const,
        index: index + 1,
      })).reverse(),
    ]);
    this.rows.set([{ size: 1, unit: 'star' }]);
    this.columns.set([{ size: 1, unit: 'star' }]);
    this.selectedCell.set({ row: 0, column: 0 });
  }

  protected save(): void {
    this.saved.emit({ rows: this.rows(), columns: this.columns(), removed: this.removed() });
    this.close();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }
    trapTabFocus(event, focusableElements(this.elementRef.nativeElement));
  }

  protected close(): void {
    this.closed.emit();
    if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
  }
}
