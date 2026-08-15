import { Component, input, output } from '@angular/core';
import { ChartElement, GraphStyle, SeriesElement } from 'widget-renderer';
import { eventChecked, eventNumber, eventValue } from '../form-events';

@Component({
  selector: 'app-series-chart-settings',
  templateUrl: './series-chart-settings.html',
  styleUrl: '../chart-element-settings/chart-settings.css',
})
export class SeriesChartSettings {
  readonly element = input.required<Exclude<ChartElement, { type: 'gauge' }>>();
  readonly changed = output<Partial<SeriesElement>>();

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected number(event: Event): number {
    return eventNumber(event);
  }

  protected checked(event: Event): boolean {
    return eventChecked(event);
  }

  protected style(): GraphStyle {
    return this.element().style as GraphStyle;
  }
}
