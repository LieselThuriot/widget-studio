import { Component, input, output } from '@angular/core';
import { GaugeElement } from '../../editor-model';
import { eventChecked, eventNumber, eventValue } from '../form-events';
import { ColorPicker } from '../../color-picker/color-picker';

@Component({
  selector: 'app-gauge-element-settings',
  imports: [ColorPicker],
  templateUrl: './gauge-element-settings.html',
  styleUrl: '../chart-element-settings/chart-settings.css',
})
export class GaugeElementSettings {
  readonly element = input.required<GaugeElement>();
  readonly changed = output<Partial<GaugeElement>>();

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected number(event: Event): number {
    return eventNumber(event);
  }

  protected checked(event: Event): boolean {
    return eventChecked(event);
  }
}
