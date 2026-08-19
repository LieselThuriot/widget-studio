import { Component, input, output, signal } from '@angular/core';
import { ChartDataPoint, GraphStyle } from 'widget-renderer';
import { ChartElement, SeriesElement } from '../../editor-model';
import { eventChecked, eventNumber, eventValue } from '../form-events';
import { DataPointsDialog } from '../data-points-dialog/data-points-dialog';
import { ColorPicker } from '../../color-picker/color-picker';

@Component({
  selector: 'app-series-chart-settings',
  imports: [DataPointsDialog, ColorPicker],
  templateUrl: './series-chart-settings.html',
  styleUrl: '../chart-element-settings/chart-settings.css',
})
export class SeriesChartSettings {
  readonly element = input.required<Exclude<ChartElement, { type: 'gauge' }>>();
  readonly changed = output<Partial<SeriesElement>>();
  protected readonly isDataDialogOpen = signal(false);

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

  protected saveData(points: ChartDataPoint[]): void {
    this.changed.emit({ data: points });
  }
}
