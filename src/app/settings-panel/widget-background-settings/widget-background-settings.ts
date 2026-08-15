import { Component, input, output } from '@angular/core';
import { Widget } from 'widget-renderer';
import { ColorPicker } from '../../color-picker/color-picker';
import { AnchorControl } from '../anchor-control/anchor-control';
import { eventChecked, eventValue } from '../form-events';

@Component({
  selector: 'app-widget-background-settings',
  imports: [ColorPicker, AnchorControl],
  templateUrl: './widget-background-settings.html',
  styleUrl: '../widget-settings/widget-settings.css',
})
export class WidgetBackgroundSettings {
  readonly widget = input.required<Widget>();
  readonly changed = output<Partial<Widget>>();

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected checked(event: Event): boolean {
    return eventChecked(event);
  }

  protected size(event: Event): Widget['background']['size'] {
    const value = eventValue(event);
    return value === 'contain' || value === 'auto' ? value : 'cover';
  }
}
