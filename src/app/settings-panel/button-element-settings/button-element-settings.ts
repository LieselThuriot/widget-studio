import { Component, input, output } from '@angular/core';
import { ButtonElement } from '../../editor-model';
import { eventChecked, eventValue } from '../form-events';

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

  protected methodChanged(event: Event): Partial<ButtonElement> {
    const method = this.method(event);
    return method === 'get' ? { method, body: undefined } : { method };
  }

  protected checked(event: Event): boolean {
    return eventChecked(event);
  }

  protected style(event: Event): ButtonElement['style'] {
    return eventValue(event) === 'outline' ? 'outline' : 'solid';
  }
}
