import { Component, input, output } from '@angular/core';
import { ProgressElement } from 'widget-renderer';
import { eventChecked, eventNumber, eventValue } from '../form-events';
import { ColorPicker } from '../../color-picker/color-picker';

@Component({
  selector: 'app-progress-element-settings',
  imports: [ColorPicker],
  templateUrl: './progress-element-settings.html',
  styleUrl: '../chart-element-settings/chart-settings.css',
})
export class ProgressElementSettings {
  readonly element = input.required<ProgressElement>();
  readonly changed = output<Partial<ProgressElement>>();

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
