import { Component, ElementRef, inject, output, signal } from '@angular/core';
import { WidgetInput, safeParseWidgetInput } from '@lieselthuriot/widget-renderer';
import { focusFirstElement, focusableElements, trapTabFocus } from '../dialog-focus';

@Component({
  selector: 'app-model-loader-dialog',
  templateUrl: './model-loader-dialog.html',
  styleUrl: './model-loader-dialog.css',
})
export class ModelLoaderDialog {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly previouslyFocused = document.activeElement;
  readonly loaded = output<WidgetInput>();
  readonly closed = output<void>();
  protected readonly json = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly isDragging = signal(false);

  constructor() {
    queueMicrotask(() => focusFirstElement(this.elementRef.nativeElement));
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }
    trapTabFocus(event, focusableElements(this.elementRef.nativeElement));
  }

  protected close(): void {
    this.closed.emit();
    if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
  }

  protected updateJson(event: Event): void {
    this.json.set((event.target as HTMLTextAreaElement).value);
    this.error.set(null);
  }

  protected chooseFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) void this.readFile(file);
  }

  protected dragEnter(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected dragLeave(event: DragEvent): void {
    if (event.currentTarget === event.target) this.isDragging.set(false);
  }

  protected dropFile(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) {
      void this.readFile(file);
      return;
    }
    const text = event.dataTransfer?.getData('text/plain');
    if (text) this.json.set(text);
  }

  protected load(): void {
    let value: unknown;
    try {
      value = JSON.parse(this.json());
    } catch {
      this.error.set('The model is not valid JSON.');
      return;
    }
    const result = safeParseWidgetInput(value);
    if (!result.success) {
      const details = result.issues.slice(0, 3).map(({ path, message }) => `${path}: ${message}`);
      this.error.set(`${details.join('; ')}${result.issues.length > 3 ? ' …' : ''}`);
      return;
    }
    this.loaded.emit(result.data);
  }

  private async readFile(file: File): Promise<void> {
    try {
      this.json.set(await file.text());
      this.error.set(null);
    } catch {
      this.error.set('The model file could not be read.');
    }
  }
}
