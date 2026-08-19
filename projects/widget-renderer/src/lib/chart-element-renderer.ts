import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { use } from 'echarts/core';
import { BarChart, GaugeChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { init, type ECharts, type EChartsCoreOption } from 'echarts/core';
import { ChartElement, ProgressElement, WidgetElement } from './widget.model';
import { chartAccessibilitySummary, chartAriaLabel } from './chart-accessibility';

use([
  BarChart,
  GaugeChart,
  LineChart,
  PieChart,
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
})
export class ChartElementRenderer implements AfterViewInit, OnDestroy {
  readonly element = input.required<ChartElement | ProgressElement>();
  private readonly chartHost = viewChild.required<ElementRef<HTMLDivElement>>('chartHost');
  private chartInstance: ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      this.element();
      if (this.chartInstance) this.renderChart();
    });
  }

  ngAfterViewInit(): void {
    if (this.element().type !== 'progress') {
      this.chartInstance = init(this.chartHost().nativeElement, undefined, { renderer: 'svg' });
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.chartInstance?.resize());
        this.resizeObserver.observe(this.chartHost().nativeElement);
      }
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chartInstance?.dispose();
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
    const range = Math.max(1, element.data.max - element.data.min);
    const percent = Math.max(
      0,
      Math.min(100, ((element.data.value - element.data.min) / range) * 100),
    );
    return {
      '--progress-value': `${percent}%`,
      '--progress-color': element.style.color.fill,
      '--progress-track': element.style.color.track,
      '--progress-legend-color': element.style.color.legend,
      '--progress-font-size': `${element.style?.font.size ?? 11}px`,
    };
  }

  protected progressShowLegend(element: ProgressElement): boolean {
    return element.showLegend ?? true;
  }

  protected progressActive(element: ProgressElement): boolean {
    return element.active ?? false;
  }

  protected progressTextAlign(element: ProgressElement): 'left' | 'center' | 'right' {
    return (element.grid.anchor ?? 'center').endsWith('left')
      ? 'left'
      : (element.grid.anchor ?? 'center').endsWith('right')
        ? 'right'
        : 'center';
  }

  protected progressSeparator(element: ProgressElement): string {
    return element.data.separator ?? ' - ';
  }

  protected progressSuffix(element: ProgressElement): string {
    return element.data.suffix ?? '';
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
        (element.type === 'pie' || element.type === 'donut') && element.showLegend
          ? {
              bottom: 10,
              textStyle: { fontSize: element.style.font.size, color: element.style.color.legend },
            }
          : undefined,
      tooltip: { trigger: element.type === 'pie' || element.type === 'donut' ? 'item' : 'axis' },
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
        containLabel: true,
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
