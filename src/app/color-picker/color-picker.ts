import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.html',
  styleUrl: './color-picker.css',
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
    const value = this.value()?.trim().toLowerCase();
    return value && /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/.test(value) ? value.slice(0, 7) : '#ffffff';
  }

  protected isTransparent(): boolean {
    const value = this.value()?.trim().toLowerCase();
    return !value || value === 'transparent' || /^#[0-9a-f]{6}00$/.test(value);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.changed.emit(this.withAlpha() ? `${value}${this.alphaHex()}` : value);
  }

  protected alphaValue(): number {
    const alpha = this.value()?.slice(7, 9);
    return alpha ? Math.round((parseInt(alpha, 16) / 255) * 100) : 60;
  }

  protected onAlphaInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
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
