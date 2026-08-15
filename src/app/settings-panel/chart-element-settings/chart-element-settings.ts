import { Component, input, output } from '@angular/core';
import { ChartElement, ProgressElement } from 'widget-renderer';
import { GaugeElementSettings } from '../gauge-element-settings/gauge-element-settings';
import { ProgressElementSettings } from '../progress-element-settings/progress-element-settings';
import { SeriesChartSettings } from '../series-chart-settings/series-chart-settings';

@Component({
  selector: 'app-chart-element-settings',
  imports: [ProgressElementSettings, GaugeElementSettings, SeriesChartSettings],
  templateUrl: './chart-element-settings.html',
  styleUrl: './chart-settings.css',
})
export class ChartElementSettings {
  readonly element = input.required<ChartElement | ProgressElement>();
  readonly changed = output<Partial<ChartElement | ProgressElement>>();
}
