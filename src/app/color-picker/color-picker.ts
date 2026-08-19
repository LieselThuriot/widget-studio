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
  readonly alphaDefault = input(100);
  readonly inline = input(false);
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
    this.emitColor(value, this.alphaValue());
  }

  protected alphaValue(): number {
    const value = this.value()?.trim().toLowerCase();
    const alpha = value?.match(/^#[0-9a-f]{6}([0-9a-f]{2})$/)?.[1];
    return alpha ? Math.round((parseInt(alpha, 16) / 255) * 100) : this.alphaDefault();
  }

  protected onAlphaInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.emitColor(this.inputValue(), value);
  }

  private emitColor(color: string, opacity: number): void {
    const alpha = Math.round((Math.max(0, Math.min(100, opacity)) / 100) * 255);
    this.changed.emit(alpha === 255 ? color : `${color}${alpha.toString(16).padStart(2, '0')}`);
  }
}
