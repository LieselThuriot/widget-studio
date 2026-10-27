import { Component, input, output } from '@angular/core';
import { Widget } from '@lieselthuriot/widget-renderer';
import { eventChecked, eventValue } from '../form-events';

@Component({
  selector: 'app-widget-refresh-settings',
  templateUrl: './widget-refresh-settings.html',
  styleUrl: '../widget-settings/widget-settings.css',
})
export class WidgetRefreshSettings {
  readonly widget = input.required<Widget>();
  readonly changed = output<Partial<Widget>>();

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected checked(event: Event): boolean {
    return eventChecked(event);
  }
}
