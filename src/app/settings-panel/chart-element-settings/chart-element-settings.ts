import { Component, input, output } from '@angular/core';
import { ChartElement, GaugeElement, GraphStyle, ProgressElement } from 'widget-renderer';
import { eventChecked, eventNumber, eventValue } from '../form-events';

@Component({
  selector: 'app-chart-element-settings',
  templateUrl: './chart-element-settings.html',
  styleUrl: './chart-element-settings.css',
})
export class ChartElementSettings {
  readonly element = input.required<ChartElement | ProgressElement>();
  readonly changed = output<Partial<ChartElement | ProgressElement>>();

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected number(event: Event): number {
    return eventNumber(event);
  }
  protected checked(event: Event): boolean {
    return eventChecked(event);
  }
  protected progress(): ProgressElement {
    return this.element() as ProgressElement;
  }
  protected chart(): ChartElement {
    return this.element() as ChartElement;
  }
  protected gauge(): GaugeElement {
    return this.element() as GaugeElement;
  }
  protected chartStyle(): GraphStyle {
    return this.chart().style as GraphStyle;
  }
}
