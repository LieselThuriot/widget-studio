import { Component, computed } from '@angular/core';
import { ChartPoint, InteractiveChart } from './interactive-chart';
import { DEFAULT_SERIES_COLOR, seriesChartLayout } from './series-chart-layout';
import { SeriesElement } from './widget.model';

@Component({
  selector: 'widget-series-chart',
  templateUrl: './series-chart-renderer.html',
  styleUrl: './chart-renderer.css',
})
export class SeriesChartRenderer extends InteractiveChart<SeriesElement> {
  protected readonly lineColor = computed(
    () => this.element().style.color.line ?? DEFAULT_SERIES_COLOR,
  );
  protected readonly layout = computed(() => {
    const { width, height } = this.size();
    return width > 0 && height > 0 ? seriesChartLayout(this.element(), width, height) : null;
  });
  protected readonly points = computed<ChartPoint[]>(
    () =>
      this.layout()?.categories.map(({ index, label, value, color, center, pointY }) => ({
        index,
        label,
        value,
        color,
        anchorX: center,
        anchorY: pointY,
      })) ?? [],
  );
}
