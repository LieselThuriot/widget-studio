import {
  Directive,
  ElementRef,
  OnDestroy,
  Signal,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { chartAccessibilitySummary, chartAriaLabel } from './chart-accessibility';
import { ChartElement } from './widget.model';
import { WidgetTooltip } from './widget-tooltip';
import { defaultWidgetRendererLocale, WidgetRendererLocale } from './widget-locale';

export const DEFAULT_CHART_COLORS = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
];

export function defaultChartColor(index: number): string {
  return DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
}

export interface ChartPoint {
  index: number;
  label: string;
  value: number;
  color: string;
  anchorX: number;
  anchorY: number;
}

@Directive({
  host: { '(document:pointerdown)': 'onDocumentPointerDown($event)' },
})
export abstract class InteractiveChart<T extends ChartElement> implements OnDestroy {
  readonly element = input.required<T>();
  readonly sensitiveHidden = input(false);
  readonly locale = input<WidgetRendererLocale>(defaultWidgetRendererLocale);
  protected readonly summaryId = `chart-summary-${crypto.randomUUID()}`;
  protected readonly activeIndex = signal<number | null>(null);
  protected readonly size = signal({ width: 0, height: 0 });
  protected readonly announcement = computed(() => {
    const point = this.activePoint();
    return point ? this.locale().aria.chart.dataPointLabel(point.label, `${point.value}`) : '';
  });
  private readonly activePoint = computed(() => {
    const index = this.activeIndex();
    return index === null ? undefined : this.points()[index];
  });
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('chartHost');
  private readonly widgetTooltip = inject(WidgetTooltip);
  private readonly tooltipOwner = {};
  private resizeObserver: ResizeObserver | null = null;

  protected abstract readonly points: Signal<ChartPoint[]>;

  constructor() {
    afterNextRender(() => {
      const host = this.host().nativeElement;
      this.measure(host);
      if (typeof ResizeObserver === 'undefined') return;
      this.resizeObserver = new ResizeObserver(() => this.measure(host));
      this.resizeObserver.observe(host);
    });
    effect(() => {
      this.element();
      this.sensitiveHidden();
      this.hideTooltip();
    });
    effect(() => {
      const owner = this.widgetTooltip.owner();
      if (owner && owner !== this.tooltipOwner) this.activeIndex.set(null);
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.widgetTooltip.hide(this.tooltipOwner);
  }

  protected ariaLabel(element: T): string {
    return chartAriaLabel(element, this.locale().aria.chart);
  }
  protected accessibilitySummary(element: T): string {
    return chartAccessibilitySummary(element, this.locale().aria.chart);
  }

  protected pointerMove(index: number, event: PointerEvent): void {
    if (this.sensitiveHidden()) return;
    if (event.pointerType === 'touch') event.stopPropagation();
    const point = this.points()[index];
    if (point) this.showTooltip(point, event.clientX, event.clientY);
  }
  protected pointerLeave(): void {
    this.hideTooltip();
  }
  protected focus(): void {
    if (this.sensitiveHidden()) return;
    this.select(this.activeIndex() ?? 0);
  }
  protected keyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.activeIndex() === null) return;
      event.preventDefault();
      this.hideTooltip();
      return;
    }
    const count = this.points().length;
    if (!count || this.sensitiveHidden()) return;
    const current = this.activeIndex();
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? current === null
          ? 0
          : Math.min(count - 1, current + 1)
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? current === null
            ? 0
            : Math.max(0, current - 1)
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? count - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    this.select(next);
  }
  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!(event.target instanceof Element) || !this.host().nativeElement.contains(event.target)) {
      this.hideTooltip();
    }
  }

  private select(index: number): void {
    const point = this.points()[index];
    if (!point) return;
    const bounds = this.host().nativeElement.getBoundingClientRect();
    this.showTooltip(point, bounds.left + point.anchorX, bounds.top + point.anchorY);
  }
  private showTooltip(point: ChartPoint, clientX: number, clientY: number): void {
    const shell = this.widgetTooltip.overlayElement()?.parentElement;
    this.activeIndex.set(point.index);
    if (!shell) return;
    const bounds = shell.getBoundingClientRect();
    this.widgetTooltip.show(this.tooltipOwner, {
      x: clientX - bounds.left,
      y: clientY - bounds.top,
      label: point.label,
      value: point.value,
      color: point.color,
    });
  }
  private hideTooltip(): void {
    this.activeIndex.set(null);
    this.widgetTooltip.hide(this.tooltipOwner);
  }
  private measure(host: HTMLElement): void {
    const width = host.clientWidth;
    const height = host.clientHeight;
    const current = this.size();
    if (current.width !== width || current.height !== height) this.size.set({ width, height });
  }
}
