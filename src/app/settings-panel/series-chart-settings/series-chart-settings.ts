import { Component, input, output, signal } from '@angular/core';
import { AxisChartStyle, ChartDataPoint, ProgressItem } from '@lieselthuriot/widget-renderer';
import { ChartElement } from '../../editor-model';
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
  readonly changed = output<Partial<Exclude<ChartElement, { type: 'gauge' }>>>();
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

  protected style(): AxisChartStyle {
    return this.element().style as AxisChartStyle;
  }

  protected saveData(points: (ChartDataPoint | ProgressItem)[]): void {
    this.changed.emit({ data: points as ChartDataPoint[] });
  }
}
