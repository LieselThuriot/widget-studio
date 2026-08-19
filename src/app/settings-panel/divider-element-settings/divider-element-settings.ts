import { Component, input, output } from '@angular/core';
import { DividerElement } from '../../editor-model';
import { ColorPicker } from '../../color-picker/color-picker';
import { eventValue } from '../form-events';

@Component({
  selector: 'app-divider-element-settings',
  imports: [ColorPicker],
  templateUrl: './divider-element-settings.html',
  styleUrl: './divider-element-settings.css',
})
export class DividerElementSettings {
  readonly element = input.required<DividerElement>();
  readonly changed = output<Partial<DividerElement>>();

  protected orientation(event: Event): DividerElement['orientation'] {
    return eventValue(event) === 'vertical' ? 'vertical' : 'horizontal';
  }
}
