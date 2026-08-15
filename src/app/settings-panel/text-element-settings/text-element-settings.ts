import { Component, input, output } from '@angular/core';
import { TextElement } from 'widget-renderer';
import { ColorPicker } from '../../color-picker/color-picker';

@Component({
  selector: 'app-text-element-settings',
  imports: [ColorPicker],
  template: `
    <label
      >Content<textarea
        [value]="element().text"
        (input)="changed.emit({ text: $any($event.target).value })"
        >{{ element().text }}</textarea>
    </label>
    <div class="formatting-tools" aria-label="Text formatting">
      <button
        type="button"
        [class.active]="element().style.fontWeight >= 600"
        aria-label="Toggle bold"
        (click)="
          changed.emit({
            style: {
              ...element().style,
              fontWeight: element().style.fontWeight >= 600 ? 400 : 700,
            },
          })
        "
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        [class.active]="element().style.italic"
        aria-label="Toggle italic"
        (click)="changed.emit({ style: { ...element().style, italic: !element().style.italic } })"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        [class.active]="element().style.underline"
        aria-label="Toggle underline"
        (click)="
          changed.emit({ style: { ...element().style, underline: !element().style.underline } })
        "
      >
        <u>U</u>
      </button>
      <button
        type="button"
        [class.active]="element().style.strikethrough"
        aria-label="Toggle strikethrough"
        (click)="
          changed.emit({
            style: { ...element().style, strikethrough: !element().style.strikethrough },
          })
        "
      >
        <s>S</s>
      </button>
    </div>
    <label
      >Size<input
        type="number"
        [value]="element().style.fontSize"
        (input)="
          changed.emit({ style: { ...element().style, fontSize: +$any($event.target).value } })
        "
    /></label>
    <div class="text-layout-settings">
      <label
        >Horizontal alignment<select
          [value]="element().style.align"
          (change)="
            changed.emit({ style: { ...element().style, align: $any($event.target).value } })
          "
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select></label
      ><label class="toggle-row"
        ><span>Wrap text</span
        ><input
          type="checkbox"
          [checked]="element().style.wrap"
          (change)="
            changed.emit({ style: { ...element().style, wrap: $any($event.target).checked } })
          " /><span class="toggle"></span
      ></label>
    </div>
    <app-color-picker
      label="Color"
      [value]="element().style.color"
      (changed)="changed.emit({ style: { ...element().style, color: $event } })"
    />
  `,
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
    .formatting-tools {
      display: flex;
      gap: 5px;
      margin: 14px 0;
    }
    .formatting-tools button {
      width: 29px;
      height: 28px;
      border: 1px solid #dfe5ee;
      border-radius: 6px;
      background: #fff;
      color: #63718a;
      cursor: pointer;
    }
    .formatting-tools button.active,
    .formatting-tools button:focus-visible {
      border-color: #5874ab;
      background: #edf2fb;
      color: #36527f;
    }
    .text-layout-settings {
      margin-top: 13px;
      padding-top: 12px;
      border-top: 1px solid #edf0f4;
    }
    .toggle-row {
      display: flex !important;
      align-items: center;
      gap: 8px;
      padding: 12px 0 2px;
    }
    .toggle-row span:first-child {
      flex: 1;
    }
    .toggle-row input {
      position: absolute;
      opacity: 0;
      width: 1px !important;
    }
    .toggle {
      position: relative;
      width: 29px;
      height: 17px;
      border-radius: 20px;
      background: #cbd3df;
    }
    .toggle:after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #fff;
    }
    .toggle-row input:checked + .toggle {
      background: #5874ab;
    }
    .toggle-row input:checked + .toggle:after {
      transform: translateX(12px);
    }
  `,
})
export class TextElementSettings {
  readonly element = input.required<TextElement>();
  readonly changed = output<Partial<TextElement>>();
}
