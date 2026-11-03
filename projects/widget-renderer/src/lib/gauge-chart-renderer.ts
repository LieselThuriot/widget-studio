import { Component, computed } from '@angular/core';
import { gaugeChartLayout } from './gauge-chart-layout';
import { ChartPoint, InteractiveChart } from './interactive-chart';
import { GaugeElement } from './widget.model';

@Component({
  selector: 'widget-gauge-chart',
  templateUrl: './gauge-chart-renderer.html',
  styleUrl: './chart-renderer.css',
})
export class GaugeChartRenderer extends InteractiveChart<GaugeElement> {
  protected readonly layout = computed(() => {
    const { width, height } = this.size();
    return width > 0 && height > 0 ? gaugeChartLayout(this.element(), width, height) : null;
  });
  protected readonly points = computed<ChartPoint[]>(() => {
    const layout = this.layout();
    const element = this.element();
    return layout
      ? [
          {
            index: 0,
            label: element.title || this.locale().aria.chart.gaugeValueLabel,
            value: element.data.value,
            color: element.style.color.fill,
            anchorX: layout.centerX,
            anchorY: layout.centerY - layout.radius,
          },
        ]
      : [];
  });
  protected roundedValue(element: GaugeElement): number {
    return Math.round(element.data.value);
  }
}
