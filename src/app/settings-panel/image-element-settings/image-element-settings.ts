import { Component, input, output } from '@angular/core';
import { ImageElement } from 'widget-renderer';
import { ColorPicker } from '../../color-picker/color-picker';
import { AnchorControl } from '../anchor-control/anchor-control';

@Component({
  selector: 'app-image-element-settings',
  imports: [ColorPicker, AnchorControl],
  template: `<label
      >Image source URL or base64 data<textarea
        [value]="element().source"
        (input)="changed.emit({ source: $any($event.target).value })"
      ></textarea></label
    ><label
      >Alt text<input
        [value]="element().alt"
        (input)="changed.emit({ alt: $any($event.target).value })" /></label
    ><label
      >Corner radius (px)<input
        type="number"
        min="0"
        [value]="element().radius"
        (input)="radiusChanged.emit(+$any($event.target).value)" /></label
    ><app-color-picker
      label="Overlay color"
      [value]="element().overlayColor"
      [clearable]="true"
      [withAlpha]="true"
      (changed)="changed.emit({ overlayColor: $event })"
      (cleared)="changed.emit({ overlayColor: undefined })"
    /><label
      >Fit<select
        [value]="element().fit"
        (change)="changed.emit({ fit: $any($event.target).value })"
      >
        <option value="cover">Cover</option>
        <option value="contain">Contain</option>
        <option value="fill">Fill</option>
      </select></label
    ><app-anchor-control
      [value]="element().anchor"
      ariaLabel="Image anchor"
      (changed)="changed.emit({ anchor: $event })"
    />`,
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
    textarea,
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
    textarea {
      min-height: 57px;
      resize: vertical;
    }
  `,
})
export class ImageElementSettings {
  readonly element = input.required<ImageElement>();
  readonly changed = output<Partial<ImageElement>>();
  readonly radiusChanged = output<number>();
}
