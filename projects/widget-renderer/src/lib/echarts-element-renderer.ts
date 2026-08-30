import { Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { use, init, type ECharts } from 'echarts/core';
import { BarChart, FunnelChart, GaugeChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { ChartElement } from './widget.model';
import { chartAccessibilitySummary, chartAriaLabel } from './chart-accessibility';
import { chartOptions } from './chart-options';

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
  selector: 'widget-echarts-element',
  template: `<div
    class="chart-chart"
    [attr.aria-label]="ariaLabel(element())"
    [attr.aria-describedby]="element().sensitive ? null : summaryId"
    [attr.aria-hidden]="element().sensitive ? 'true' : null"
    role="img"
  >
    <div #chartHost class="chart-host"></div>
    @if (!element().sensitive) {
      <span class="visually-hidden" [id]="summaryId">{{ accessibilitySummary(element()) }}</span>
    }
  </div>`,
  styleUrl: './echarts-element-renderer.css',
})
export class EchartsElementRenderer implements OnDestroy {
  readonly element = input.required<ChartElement>();
  protected readonly summaryId = `chart-summary-${crypto.randomUUID()}`;
  private readonly chartHost = viewChild<ElementRef<HTMLDivElement>>('chartHost');
  private chartHostElement: HTMLDivElement | null = null;
  private chartInstance: ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      const host = this.chartHost()?.nativeElement ?? null;
      if (!host) return;
      if (host !== this.chartHostElement) {
        this.destroyChart();
        this.chartHostElement = host;
        this.chartInstance = init(host, undefined, { renderer: 'svg' });
        if (typeof ResizeObserver !== 'undefined') {
          const chart = this.chartInstance;
          this.resizeObserver = new ResizeObserver(() => {
            if (this.chartInstance === chart) chart.resize();
          });
          this.resizeObserver.observe(host);
        }
      }
      this.chartInstance?.setOption(chartOptions(this.element()), true);
    });
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }
  protected ariaLabel(element: ChartElement): string {
    return chartAriaLabel(element);
  }
  protected accessibilitySummary(element: ChartElement): string {
    return chartAccessibilitySummary(element);
  }
  private destroyChart(): void {
    this.resizeObserver?.disconnect();
    this.chartInstance?.dispose();
    this.resizeObserver = null;
    this.chartInstance = null;
    this.chartHostElement = null;
  }
}
