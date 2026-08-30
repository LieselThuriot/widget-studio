import { Component, OnDestroy, input, signal } from '@angular/core';
import { chartAccessibilitySummary, chartAriaLabel } from './chart-accessibility';
import { ProgressElement, ProgressItem, ProgressSegment } from './widget.model';

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
  protected readonly summaryId = `progress-summary-${crypto.randomUUID()}`;
  protected readonly tooltipIndex = signal<number | null>(null);
  protected readonly tooltipPosition = signal<{ x: string; y: string }>({ x: '50%', y: '0px' });
  private tooltipHideTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    this.cancelTooltipHide();
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
    const range = Math.max(1, element.data.max - element.data.min);
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
  protected showTooltip(index: number, center: number): void {
    this.cancelTooltipHide();
    this.tooltipPosition.set({ x: `${center}%`, y: '0px' });
    this.tooltipIndex.set(index);
  }
  protected hideTooltip(index: number): void {
    this.cancelTooltipHide();
    this.tooltipHideTimer = setTimeout(() => {
      if (this.tooltipIndex() === index) this.tooltipIndex.set(null);
      this.tooltipHideTimer = null;
    }, 100);
  }
  protected moveTooltip(index: number, event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    this.positionTooltip(event);
    this.tooltipIndex.set(index);
  }
  protected toggleTouchTooltip(index: number, event: PointerEvent): void {
    if (event.pointerType === 'mouse') return;
    event.stopPropagation();
    this.cancelTooltipHide();
    if (this.tooltipIndex() === index) {
      this.tooltipIndex.set(null);
      return;
    }
    this.positionTooltip(event);
    this.tooltipIndex.set(index);
  }
  protected segmentKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    this.hideTooltip(index);
  }
  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!(event.target instanceof Element) || !event.target.closest('.progress-segment'))
      this.tooltipIndex.set(null);
  }
  private positionTooltip(event: PointerEvent): void {
    const target = event.currentTarget;
    if (!(target instanceof Element)) return;
    const wrapper = target.closest('.progress-track-wrap');
    if (!wrapper) return;
    const bounds = wrapper.getBoundingClientRect();
    this.tooltipPosition.set({
      x: `${event.clientX - bounds.left}px`,
      y: `${event.clientY - bounds.top}px`,
    });
  }
  private cancelTooltipHide(): void {
    if (this.tooltipHideTimer) clearTimeout(this.tooltipHideTimer);
    this.tooltipHideTimer = null;
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
