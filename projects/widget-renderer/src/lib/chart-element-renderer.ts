import { Component, ElementRef, OnDestroy, effect, input, signal, viewChild } from '@angular/core';
import { use } from 'echarts/core';
import { BarChart, FunnelChart, GaugeChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { init, type ECharts, type EChartsCoreOption } from 'echarts/core';
import {
  ChartElement,
  ProgressElement,
  ProgressItem,
  ProgressSegment,
  WidgetElement,
} from './widget.model';
import { chartAccessibilitySummary, chartAriaLabel } from './chart-accessibility';

use([
  BarChart,
  GaugeChart,
  LineChart,
  PieChart,
  FunnelChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  SVGRenderer,
]);

@Component({
  selector: 'widget-chart-element',
  templateUrl: './chart-element-renderer.html',
  styleUrl: './chart-element-renderer.css',
  host: {
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class ChartElementRenderer implements OnDestroy {
  readonly element = input.required<ChartElement | ProgressElement>();
  protected readonly summaryId = `chart-summary-${crypto.randomUUID()}`;
  private readonly chartHost = viewChild<ElementRef<HTMLDivElement>>('chartHost');
  private chartHostElement: HTMLDivElement | null = null;
  private chartInstance: ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private tooltipHideTimer: ReturnType<typeof setTimeout> | null = null;
  protected readonly tooltipIndex = signal<number | null>(null);
  protected readonly tooltipPosition = signal<{ x: string; y: string }>({ x: '50%', y: '0px' });

  constructor() {
    effect(() => {
      const element = this.element();
      const chartHost = this.chartHost()?.nativeElement ?? null;

      if (element.type === 'progress' || !chartHost) {
        this.destroyChart();
        return;
      }

      if (chartHost !== this.chartHostElement) {
        this.destroyChart();
        this.chartHostElement = chartHost;
        this.chartInstance = init(chartHost, undefined, { renderer: 'svg' });

        if (typeof ResizeObserver !== 'undefined') {
          const chartInstance = this.chartInstance;
          this.resizeObserver = new ResizeObserver(() => {
            if (this.chartInstance === chartInstance) chartInstance.resize();
          });
          this.resizeObserver.observe(chartHost);
        }
      }

      this.renderChart();
    });
  }

  ngOnDestroy(): void {
    if (this.tooltipHideTimer) clearTimeout(this.tooltipHideTimer);
    this.destroyChart();
  }

  private destroyChart(): void {
    this.resizeObserver?.disconnect();
    this.chartInstance?.dispose();
    this.resizeObserver = null;
    this.chartInstance = null;
    this.chartHostElement = null;
  }

  protected isProgress(element: WidgetElement): element is ProgressElement {
    return element.type === 'progress';
  }
  protected progress(element: ChartElement | ProgressElement): ProgressElement {
    return element as ProgressElement;
  }
  protected chart(element: ChartElement | ProgressElement): ChartElement {
    return element as ChartElement;
  }

  protected progressStyle(element: ProgressElement): Record<string, string> {
    return {
      '--progress-track': element.style.color.track,
      '--progress-title-color': element.style.color.title,
      '--progress-legend-color': element.style.color.legend,
      '--progress-font-size': `${element.style?.font.size ?? 11}px`,
    };
  }

  protected progressItems(element: ProgressElement): {
    item: ProgressItem;
    index: number;
    start: number;
    end: number;
    width: number;
    center: number;
  }[] {
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

  protected progressSegments(
    element: ProgressElement,
  ): ReturnType<ChartElementRenderer['progressItems']> {
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
    if (!(event.target instanceof Element) || !event.target.closest('.progress-segment')) {
      this.tooltipIndex.set(null);
    }
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
    if (!this.tooltipHideTimer) return;
    clearTimeout(this.tooltipHideTimer);
    this.tooltipHideTimer = null;
  }

  protected progressTextAlign(element: ProgressElement): 'left' | 'center' | 'right' {
    return (element.grid.anchor ?? 'center').endsWith('left')
      ? 'left'
      : (element.grid.anchor ?? 'center').endsWith('right')
        ? 'right'
        : 'center';
  }

  protected ariaLabel(element: ChartElement | ProgressElement): string {
    return chartAriaLabel(element);
  }

  protected accessibilitySummary(element: ChartElement | ProgressElement): string {
    return chartAccessibilitySummary(element);
  }

  private renderChart(): void {
    const element = this.element();
    if (element.type === 'progress' || !this.chartInstance) return;
    this.chartInstance.setOption(this.options(element), true);
  }

  private options(element: ChartElement): EChartsCoreOption {
    const base = {
      animation: false,
      title: element.title
        ? {
            text: element.title,
            left: 'center',
            textStyle: { fontSize: element.style.font.size, color: element.style.color.title },
          }
        : undefined,
      legend:
        (element.type === 'pie' || element.type === 'donut' || element.type === 'funnel') &&
        element.showLegend
          ? {
              bottom: 10,
              textStyle: { fontSize: element.style.font.size, color: element.style.color.legend },
            }
          : undefined,
      tooltip: {
        trigger:
          element.type === 'pie' || element.type === 'donut' || element.type === 'funnel'
            ? 'item'
            : 'axis',
      },
    } satisfies EChartsCoreOption;

    if (element.type === 'pie' || element.type === 'donut') {
      return {
        ...base,
        series: [
          {
            type: 'pie',
            center: ['50%', element.title ? '54%' : '50%'],
            radius:
              element.type === 'donut'
                ? [element.title ? '34%' : '45%', element.title ? '54%' : '72%']
                : element.title
                  ? '62%'
                  : '68%',
            label: { show: false },
            labelLine: { show: false },
            data: element.data.map(({ label, value, color }) => ({
              name: label,
              value,
              ...(color ? { itemStyle: { color } } : {}),
            })),
          },
        ],
      };
    }
    if (element.type === 'funnel') {
      return {
        ...base,
        series: [
          {
            type: 'funnel',
            left: '8%',
            right: '8%',
            top: element.title ? 38 : 12,
            bottom: element.showLegend ? 38 : 12,
            min: 0,
            max: Math.max(...element.data.map(({ value }) => value), 1),
            minSize: '10%',
            maxSize: '88%',
            sort: 'descending',
            gap: 3,
            label: { show: false },
            labelLine: { show: false },
            emphasis: {
              label: { show: false },
              labelLine: { show: false },
            },
            data: element.data.map(({ label, value, color }) => ({
              name: label,
              value,
              ...(color ? { itemStyle: { color } } : {}),
            })),
          },
        ],
      };
    }
    if (element.type === 'gauge') {
      const percentage = Math.max(
        0,
        Math.min(
          1,
          (element.data.value - element.data.min) /
            Math.max(1, element.data.max - element.data.min),
        ),
      );
      return {
        ...base,
        title: element.title
          ? {
              text: element.title,
              left: 'center',
              bottom: 0,
              textStyle: {
                fontSize: element.style.font.size,
                color: element.style.color.title,
              },
            }
          : undefined,
        series: [
          {
            type: 'gauge',
            center: ['50%', '58%'],
            radius: '78%',
            startAngle: 200,
            endAngle: -20,
            min: element.data.min,
            max: element.data.max,
            splitNumber: 6,
            axisLine: {
              lineStyle: {
                width: 16,
                cap: 'round',
                color: [
                  [percentage, element.style.color.fill],
                  [1, element.style.color.track],
                ],
              },
            },
            axisTick: {
              distance: -22,
              splitNumber: 5,
              length: 4,
              lineStyle: { color: element.style.color.legend, width: 1 },
            },
            splitLine: {
              distance: -24,
              length: 8,
              lineStyle: { color: element.style.color.legend, width: 2 },
            },
            axisLabel: {
              show: element.showLegend,
              distance: -2,
              color: element.style.color.legend,
              fontSize: element.style.font.size,
              formatter: (value: number) => `${Math.round(value)}`,
            },
            pointer: {
              show: true,
              length: '55%',
              width: 5,
              itemStyle: { color: element.style.color.legend },
            },
            progress: { show: true, itemStyle: { color: element.style.color.fill } },
            detail: {
              show: element.showLegend,
              valueAnimation: false,
              formatter: (value: number) => `${Math.round(value)}`,
              color: element.style.color.legend,
              fontSize: element.style.font.size,
            },
            data: [{ value: element.data.value }],
          },
        ],
      };
    }
    const seriesElement = element as Extract<ChartElement, { type: 'bar' | 'line' }>;
    return {
      ...base,
      grid: {
        left: 34,
        right: 12,
        top: element.title ? 30 : 12,
        bottom: element.showLegend ? 28 : 24,
        outerBoundsMode: 'same',
        outerBoundsContain: 'axisLabel',
      },
      xAxis: {
        type: 'category',
        data: element.data.map(({ label }) => label),
        axisLabel: {
          color: seriesElement.style.axis.label,
          fontSize: seriesElement.style.font.size,
        },
        axisLine: { lineStyle: { color: seriesElement.style.axis.line } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: seriesElement.style.axis.label,
          fontSize: seriesElement.style.font.size,
        },
        axisLine: { lineStyle: { color: seriesElement.style.axis.line } },
        splitLine: { lineStyle: { color: seriesElement.style.axis.grid } },
      },
      series: [
        {
          type: seriesElement.type,
          data: seriesElement.data.map(({ value, color }) => ({
            value,
            ...(seriesElement.type === 'line'
              ? { itemStyle: { color: color ?? seriesElement.style.color.line } }
              : { itemStyle: { color } }),
          })),
          itemStyle:
            seriesElement.type === 'line' ? { color: seriesElement.style.color.line } : undefined,
          lineStyle:
            seriesElement.type === 'line' ? { color: seriesElement.style.color.line } : undefined,
          symbol: seriesElement.type === 'line' ? 'circle' : undefined,
          smooth: seriesElement.type === 'line',
        },
      ],
    };
  }
}
