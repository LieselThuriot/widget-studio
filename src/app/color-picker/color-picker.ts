import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  template: `
    <div class="color-picker">
      <div class="color-picker-label">
        <span>{{ label() }}</span>
        @if (clearable()) {
          <button
            type="button"
            class="clear-button"
            [class.has-color]="value()"
            [disabled]="!value()"
            [attr.aria-label]="'Clear ' + label().toLowerCase()"
            (click)="cleared.emit()"
          >
            ×
          </button>
        }
      </div>
      <input
        type="color"
        [value]="inputValue()"
        [attr.aria-label]="label()"
        (input)="onInput($any($event.target).value)"
      />
      @if (withAlpha()) {
        <div class="alpha-control">
          <label [for]="alphaId"
            >Opacity <output>{{ alphaValue() }}%</output></label
          >
          <input
            [id]="alphaId"
            type="range"
            min="0"
            max="100"
            [value]="alphaValue()"
            [attr.aria-label]="label() + ' opacity'"
            (input)="onAlphaInput(+$any($event.target).value)"
          />
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin: 13px 0;
      color: #67738a;
      font-size: 11px;
      font-weight: 600;
    }
    .color-picker-label {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    input {
      display: block;
      box-sizing: border-box;
      width: 100%;
      height: 29px;
      margin-top: 6px;
      padding: 2px 9px;
      border: 1px solid #dfe5ee;
      border-radius: 6px;
      background: #fff;
    }
    .alpha-control {
      margin-top: 8px;
    }
    .alpha-control label {
      display: flex;
      justify-content: space-between;
      margin: 0;
      font-size: 10px;
      font-weight: 600;
    }
    .alpha-control output {
      color: #9aa5b7;
      font-weight: 400;
    }
    .alpha-control input[type='range'] {
      height: 16px;
      margin-top: 3px;
      padding: 0;
      border: 0;
      accent-color: #5874ab;
    }
    .clear-button {
      display: inline-grid;
      place-items: center;
      width: 22px;
      height: 22px;
      padding: 0;
      border: 0;
      border-radius: 5px;
      visibility: hidden;
      background: transparent;
      color: #bd8290;
      font:
        700 16px/1 Arial,
        sans-serif;
      cursor: pointer;
    }
    .clear-button.has-color {
      visibility: visible;
    }
    .clear-button:hover:not(:disabled),
    .clear-button:focus-visible {
      background: #fbecef;
      color: #b64d60;
    }
    .clear-button:disabled {
      cursor: default;
    }
  `,
})
export class ColorPicker {
  private static nextId = 0;
  protected readonly alphaId = `color-alpha-${ColorPicker.nextId++}`;
  readonly label = input.required<string>();
  readonly value = input<string | undefined>();
  readonly clearable = input(false);
  readonly withAlpha = input(false);
  readonly changed = output<string>();
  readonly cleared = output<void>();

  protected inputValue(): string {
    return this.value()?.slice(0, 7) || '#000000';
  }

  protected onInput(value: string): void {
    this.changed.emit(this.withAlpha() ? `${value}${this.alphaHex()}` : value);
  }

  protected alphaValue(): number {
    const alpha = this.value()?.slice(7, 9);
    return alpha ? Math.round((parseInt(alpha, 16) / 255) * 100) : 60;
  }

  protected onAlphaInput(value: number): void {
    this.changed.emit(
      `${this.inputValue()}${Math.round((value / 100) * 255)
        .toString(16)
        .padStart(2, '0')}`,
    );
  }

  private alphaHex(): string {
    return Math.round((this.alphaValue() / 100) * 255)
      .toString(16)
      .padStart(2, '0');
  }
}
