import { Component, input, output } from '@angular/core';
import { ButtonElement } from 'widget-renderer';
import { eventValue } from '../form-events';

@Component({
  selector: 'app-button-element-settings',
  template: `<label
      >Label<input [value]="element().label" (input)="changed.emit({ label: value($event) })"
    /></label>
    <div class="field-row">
      <label
        >Method<select
          [value]="element().method"
          (change)="changed.emit({ method: method($event) })"
        >
          <option value="get">GET</option>
          <option value="post">POST</option>
        </select></label
      ><label
        >Style<select [value]="element().style" (change)="changed.emit({ style: style($event) })">
          <option value="solid">Solid</option>
          <option value="outline">Outline</option>
        </select></label
      >
    </div>
    <label
      >Request URL<input [value]="element().url" (input)="changed.emit({ url: value($event) })"
    /></label>`,
  styles: `
    :host {
      display: block;
    }
    label {
      display: block;
      margin: 13px 0;
      color: #67738a;
      font-size: 11px;
      font-weight: 600;
    }
    input,
    select {
      display: block;
      box-sizing: border-box;
      width: 100%;
      margin-top: 6px;
      padding: 8px 9px;
      border: 1px solid #dfe5ee;
      border-radius: 6px;
      background: #fff;
      color: #34425c;
      font: 12px inherit;
    }
    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
    }
  `,
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
