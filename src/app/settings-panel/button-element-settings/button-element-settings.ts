import { Component, input, output } from '@angular/core';
import { ButtonElement } from 'widget-renderer';
import { eventValue } from '../form-events';

@Component({
  selector: 'app-button-element-settings',
  templateUrl: './button-element-settings.html',
  styleUrl: './button-element-settings.css',
})
export class ButtonElementSettings {
  readonly element = input.required<ButtonElement>();
  readonly changed = output<Partial<ButtonElement>>();

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected method(event: Event): ButtonElement['method'] {
    return eventValue(event) === 'post' ? 'post' : 'get';
  }

  protected style(event: Event): ButtonElement['style'] {
    return eventValue(event) === 'outline' ? 'outline' : 'solid';
  }
}
