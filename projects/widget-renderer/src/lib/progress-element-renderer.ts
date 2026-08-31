import { Component, OnDestroy, effect, inject, input, signal } from '@angular/core';
import { chartAccessibilitySummary, chartAriaLabel } from './chart-accessibility';
import { ProgressElement, ProgressItem, ProgressSegment } from './widget.model';
import { WidgetTooltip } from './widget-tooltip';

@Component({
  selector: 'widget-progress-element',
  templateUrl: './progress-element-renderer.html',
  styleUrl: './progress-element-renderer.css',
  host: {
    class: 'is-progress',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class ProgressElementRenderer implements OnDestroy {
  readonly element = input.required<ProgressElement>();
  readonly sensitiveHidden = input(false);
  protected readonly summaryId = `progress-summary-${crypto.randomUUID()}`;
  protected readonly tooltipIndex = signal<number | null>(null);
  private readonly widgetTooltip = inject(WidgetTooltip);
  private readonly tooltipOwner = {};
  private tooltipHideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.element();
      this.sensitiveHidden();
      this.clearTooltip();
    });
  }

  ngOnDestroy(): void {
    this.cancelTooltipHide();
    this.widgetTooltip.hideProgress(this.tooltipOwner);
  }
  protected progressStyle(element: ProgressElement): Record<string, string> {
    const radius = element.style.radius ?? { segment: 0, track: 999 };
    return {
      '--progress-track': element.style.color.track,
      '--progress-title-color': element.style.color.title,
      '--progress-legend-color': element.style.color.legend,
      '--progress-font-size': `${element.style?.font.size ?? 11}px`,
      '--progress-segment-radius': `${radius.segment}px`,
      '--progress-track-radius': `${radius.track}px`,
    };
  }
  protected progressItems(element: ProgressElement) {
    const range = element.data.max - element.data.min;
    let position = element.data.min;
    return element.data.items.map((item, index) => {
      const start = position;
      position += item.value;
      return {
        item,
        index,
        start,
        end: position,
        width: (item.value / range) * 100,
        center: ((start - element.data.min + item.value / 2) / range) * 100,
      };
    });
  }
  protected progressSegments(element: ProgressElement) {
    return this.progressItems(element).filter(({ item }) => item.kind === 'segment');
  }
  protected segment(item: ProgressItem): ProgressSegment {
    return item as ProgressSegment;
  }
  protected segmentStyle(width: number, color?: string): Record<string, string> {
    return { width: `${width}%`, ...(color ? { background: color } : {}) };
  }
  protected progressValue(element: ProgressElement): number {
    return element.data.items.reduce(
      (total, item) => total + (item.kind === 'segment' ? item.value : 0),
      0,
    );
  }
  protected showTooltip(index: number, event: FocusEvent): void {
    if (this.sensitiveHidden()) return;
    this.cancelTooltipHide();
    this.showTooltipAt(
      index,
      event.currentTarget instanceof HTMLElement
        ? event.currentTarget
        : event.target instanceof HTMLElement
          ? event.target
          : null,
    );
  }
  protected hideTooltip(index: number): void {
    this.cancelTooltipHide();
    this.tooltipHideTimer = setTimeout(() => {
      if (this.tooltipIndex() === index) {
        this.tooltipIndex.set(null);
        this.widgetTooltip.hideProgress(this.tooltipOwner);
      }
      this.tooltipHideTimer = null;
    }, 100);
  }
  protected moveTooltip(index: number, event: PointerEvent): void {
    if (this.sensitiveHidden() || event.pointerType === 'touch') return;
    this.positionTooltip(index, event);
  }
  protected toggleTouchTooltip(index: number, event: PointerEvent): void {
    if (this.sensitiveHidden() || event.pointerType === 'mouse') return;
    event.stopPropagation();
    this.cancelTooltipHide();
    if (this.tooltipIndex() === index) {
      this.tooltipIndex.set(null);
      this.widgetTooltip.hideProgress(this.tooltipOwner);
      return;
    }
    this.positionTooltip(index, event);
  }
  protected segmentKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    this.hideTooltip(index);
  }
  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!(event.target instanceof Element) || !event.target.closest('.progress-segment')) {
      this.tooltipIndex.set(null);
      this.widgetTooltip.hideProgress(this.tooltipOwner);
    }
  }
  private positionTooltip(index: number, event: PointerEvent): void {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    this.showTooltipAt(index, target, event.clientX, event.clientY);
  }
  private showTooltipAt(index: number, target: HTMLElement | null, x?: number, y?: number): void {
    if (!target) return;
    const shell = this.widgetTooltip.overlayElement()?.parentElement;
    if (!shell) return;
    const bounds = shell.getBoundingClientRect();
    const targetBounds = target.getBoundingClientRect();
    const entry = this.progressSegments(this.element()).find(
      ({ index: entryIndex }) => entryIndex === index,
    );
    if (!entry) return;
    const segment = this.segment(entry.item);
    this.tooltipIndex.set(index);
    this.widgetTooltip.showProgress(this.tooltipOwner, {
      x: (x ?? targetBounds.left + targetBounds.width / 2) - bounds.left,
      y: (y ?? targetBounds.top) - bounds.top,
      label: segment.label,
      value: segment.value,
      color: segment.color,
    });
  }
  private cancelTooltipHide(): void {
    if (this.tooltipHideTimer) clearTimeout(this.tooltipHideTimer);
    this.tooltipHideTimer = null;
  }
  private clearTooltip(): void {
    this.cancelTooltipHide();
    this.tooltipIndex.set(null);
    this.widgetTooltip.hideProgress(this.tooltipOwner);
  }
  protected progressTextAlign(element: ProgressElement): 'left' | 'center' | 'right' {
    return (element.grid.anchor ?? 'center').endsWith('left')
      ? 'left'
      : (element.grid.anchor ?? 'center').endsWith('right')
        ? 'right'
        : 'center';
  }
  protected ariaLabel(element: ProgressElement): string {
    return chartAriaLabel(element);
  }
  protected accessibilitySummary(element: ProgressElement): string {
    return chartAccessibilitySummary(element);
  }
}
