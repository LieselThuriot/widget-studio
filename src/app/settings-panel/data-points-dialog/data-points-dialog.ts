import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ChartDataPoint, ProgressItem } from 'widget-renderer';
import { randomPastelColor } from '../../colors';
import { focusFirstElement, focusableElements, trapTabFocus } from '../../dialog-focus';
import { eventChecked, eventNumber, eventValue } from '../form-events';
import { ColorPicker } from '../../color-picker/color-picker';

interface EditablePointPatch {
  label?: string;
  value?: number;
  color?: string | null;
  active?: boolean;
}

@Component({
  selector: 'app-data-points-dialog',
  imports: [ColorPicker],
  templateUrl: './data-points-dialog.html',
  styleUrl: './data-points-dialog.css',
})
export class DataPointsDialog {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly previouslyFocused = document.activeElement;
  readonly points = input.required<(ChartDataPoint | ProgressItem)[]>();
  readonly mode = input<'chart' | 'progress'>('chart');
  readonly maxTotal = input<number | null>(null);
  readonly saved = output<(ChartDataPoint | ProgressItem)[]>();
  readonly closed = output<void>();
  protected readonly draft = signal<(ChartDataPoint | ProgressItem)[]>([]);
  protected readonly total = computed(() =>
    this.draft().reduce((sum, point) => sum + (Number.isFinite(point.value) ? point.value : 0), 0),
  );
  protected readonly exceedsRange = computed(() => {
    const maxTotal = this.maxTotal();
    return maxTotal !== null && this.total() > maxTotal;
  });
  protected readonly canSave = computed(
    () =>
      this.draft().every(
        (point) => this.validLabel(point) && Number.isFinite(point.value) && point.value >= 0,
      ) && !this.exceedsRange(),
  );

  constructor() {
    effect(() => this.draft.set(this.points().map((point) => ({ ...point }))));
    queueMicrotask(() => focusFirstElement(this.elementRef.nativeElement));
  }

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected number(event: Event): number {
    const value = eventValue(event).trim();
    return value ? eventNumber(event) : Number.NaN;
  }

  protected checked(event: Event): boolean {
    return eventChecked(event);
  }

  protected isProgressItem(point: ChartDataPoint | ProgressItem): point is ProgressItem {
    return 'kind' in point;
  }

  protected isSegment(
    point: ChartDataPoint | ProgressItem,
  ): point is Extract<ProgressItem, { kind: 'segment' }> {
    return this.isProgressItem(point) && point.kind === 'segment';
  }

  protected isGap(
    point: ChartDataPoint | ProgressItem,
  ): point is Extract<ProgressItem, { kind: 'gap' }> {
    return this.isProgressItem(point) && point.kind === 'gap';
  }

  private validLabel(point: ChartDataPoint | ProgressItem): boolean {
    return this.isGap(point) || point.label.trim().length > 0;
  }

  protected invalidLabel(point: ChartDataPoint | ProgressItem): boolean {
    return !this.validLabel(point);
  }

  protected invalidValue(point: ChartDataPoint | ProgressItem): boolean {
    return !Number.isFinite(point.value) || point.value < 0;
  }

  protected update(index: number, patch: EditablePointPatch): void {
    this.draft.update((points) =>
      points.map((point, pointIndex) =>
        pointIndex === index ? ({ ...point, ...patch } as ChartDataPoint | ProgressItem) : point,
      ),
    );
  }

  protected changeKind(index: number, kind: string): void {
    const point = this.draft()[index];
    if (kind === 'gap') {
      this.draft.update((points) =>
        points.map((item, pointIndex) =>
          pointIndex === index ? { kind: 'gap', value: point.value } : item,
        ),
      );
      return;
    }
    const usedColors = this.draft()
      .map((item) => ('color' in item ? item.color : null))
      .filter((color): color is string => Boolean(color));
    this.draft.update((points) =>
      points.map((item, pointIndex) =>
        pointIndex === index
          ? {
              kind: 'segment',
              label: '',
              value: point.value,
              color: randomPastelColor(usedColors),
              active: false,
            }
          : item,
      ),
    );
  }

  protected add(): void {
    if (this.mode() === 'progress') {
      const usedColors = this.draft()
        .map((point) => ('color' in point ? point.color : null))
        .filter((color): color is string => Boolean(color));
      this.draft.update((points) => [
        ...points,
        {
          kind: 'segment',
          label: '',
          value: 0,
          color: randomPastelColor(usedColors),
          active: false,
        },
      ]);
      return;
    }
    this.draft.update((points) => [
      ...points,
      {
        label: '',
        value: 0,
        color: randomPastelColor(
          points
            .map((point) => ('color' in point ? point.color : null))
            .filter((color): color is string => Boolean(color)),
        ),
      },
    ]);
  }

  protected itemName(point: ChartDataPoint | ProgressItem): string {
    return this.isGap(point)
      ? 'gap'
      : point.label || (this.mode() === 'progress' ? 'segment' : 'data point');
  }

  protected remove(index: number): void {
    this.draft.update((points) => points.filter((_, pointIndex) => pointIndex !== index));
  }

  protected save(): void {
    if (!this.canSave()) return;
    this.saved.emit(this.draft());
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

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  protected close(): void {
    this.closed.emit();
    if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
  }
}
