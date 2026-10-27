import { Component, input, output, signal } from '@angular/core';
import { ChartDataPoint, ProgressItem } from '@lieselthuriot/widget-renderer';
import { ProgressElement } from '../../editor-model';
import { eventChecked, eventNumber, eventValue } from '../form-events';
import { ColorPicker } from '../../color-picker/color-picker';
import { DataPointsDialog } from '../data-points-dialog/data-points-dialog';

@Component({
  selector: 'app-progress-element-settings',
  imports: [ColorPicker, DataPointsDialog],
  templateUrl: './progress-element-settings.html',
  styleUrl: '../chart-element-settings/chart-settings.css',
})
export class ProgressElementSettings {
  readonly element = input.required<ProgressElement>();
  readonly changed = output<Partial<ProgressElement>>();
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

  protected saveData(items: (ChartDataPoint | ProgressItem)[]): void {
    this.changed.emit({ data: { ...this.element().data, items: items as ProgressItem[] } });
  }
}
