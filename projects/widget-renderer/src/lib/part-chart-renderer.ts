import { Component, computed } from '@angular/core';
import { ChartPoint, InteractiveChart } from './interactive-chart';
import { chartColor, funnelChartLayout, pieChartLayout } from './part-chart-layout';
import { FunnelElement, PieElement } from './widget.model';

@Component({
  selector: 'widget-part-chart',
  templateUrl: './part-chart-renderer.html',
  styleUrl: './chart-renderer.css',
})
export class PartChartRenderer extends InteractiveChart<PieElement | FunnelElement> {
  protected readonly pie = computed(() => {
    const element = this.element();
    const { width, height } = this.size();
    return element.type !== 'funnel' && width > 0 && height > 0
      ? pieChartLayout(element, width, height)
      : null;
  });
  protected readonly funnel = computed(() => {
    const element = this.element();
    const { width, height } = this.size();
    return element.type === 'funnel' && width > 0 && height > 0
      ? funnelChartLayout(element, width, height)
      : null;
  });
  protected readonly legend = computed(() =>
    this.element().data.map((point, index) => ({
      index,
      label: point.label,
      color: chartColor(point, index),
    })),
  );
  protected readonly points = computed<ChartPoint[]>(() => {
    const pie = this.pie();
    if (pie) {
      return pie.slices.map(({ index, label, value, color, centroid }) => ({
        index,
        label,
        value,
        color,
        anchorX: centroid[0],
        anchorY: centroid[1],
      }));
    }
    return (this.funnel() ?? []).map(({ index, label, value, color, centerX, centerY }) => ({
      index,
      label,
      value,
      color,
      anchorX: centerX,
      anchorY: centerY,
    }));
  });
}
