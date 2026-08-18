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
import { ChartDataPoint } from 'widget-renderer';
import { randomPastelColor } from '../../colors';
import { focusFirstElement, focusableElements, trapTabFocus } from '../../dialog-focus';
import { eventNumber, eventValue } from '../form-events';
import { ColorPicker } from '../../color-picker/color-picker';

@Component({
  selector: 'app-data-points-dialog',
  imports: [ColorPicker],
  templateUrl: './data-points-dialog.html',
  styleUrl: './data-points-dialog.css',
})
export class DataPointsDialog {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly previouslyFocused = document.activeElement;
  readonly points = input.required<ChartDataPoint[]>();
  readonly saved = output<ChartDataPoint[]>();
  readonly closed = output<void>();
  protected readonly draft = signal<ChartDataPoint[]>([]);
  protected readonly canSave = computed(() =>
    this.draft().every((point) => point.label.trim().length > 0 && Number.isFinite(point.value)),
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

  protected invalidLabel(point: ChartDataPoint): boolean {
    return point.label.trim().length === 0;
  }

  protected invalidValue(point: ChartDataPoint): boolean {
    return !Number.isFinite(point.value);
  }

  protected update(index: number, patch: Partial<ChartDataPoint>): void {
    this.draft.update((points) =>
      points.map((point, pointIndex) => (pointIndex === index ? { ...point, ...patch } : point)),
    );
  }

  protected add(): void {
    this.draft.update((points) => [
      ...points,
      {
        label: '',
        value: 0,
        color: randomPastelColor(
          points.map((point) => point.color).filter((color): color is string => Boolean(color)),
        ),
      },
    ]);
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

  protected close(): void {
    this.closed.emit();
    if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
  }
}
