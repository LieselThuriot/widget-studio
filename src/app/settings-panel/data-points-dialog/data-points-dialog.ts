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
      { label: '', value: 0, color: DataPointsDialog.randomPastelColor() },
    ]);
  }

  private static randomPastelColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 65 + Math.random() * 20;
    const lightness = 75 + Math.random() * 10;
    const chroma = ((1 - Math.abs((2 * lightness) / 100 - 1)) * saturation) / 100;
    const hueSegment = hue / 60;
    const secondComponent = chroma * (1 - Math.abs((hueSegment % 2) - 1));
    const [red, green, blue] =
      hueSegment < 1
        ? [chroma, secondComponent, 0]
        : hueSegment < 2
          ? [secondComponent, chroma, 0]
          : hueSegment < 3
            ? [0, chroma, secondComponent]
            : hueSegment < 4
              ? [0, secondComponent, chroma]
              : hueSegment < 5
                ? [secondComponent, 0, chroma]
                : [chroma, 0, secondComponent];
    const lightnessAdjustment = lightness / 100 - chroma / 2;
    const toHex = (channel: number) =>
      Math.round((channel + lightnessAdjustment) * 255)
        .toString(16)
        .padStart(2, '0');

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
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
