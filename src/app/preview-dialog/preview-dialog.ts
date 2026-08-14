import { Component, ElementRef, inject, input, output } from '@angular/core';
import { ButtonElement, Widget, WidgetRenderer } from 'widget-renderer';

@Component({
  selector: 'app-preview-dialog',
  imports: [WidgetRenderer],
  template: `
    <div
      class="preview-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      tabindex="-1"
      (click)="close()"
      (keydown)="onKeyDown($event)"
    >
      <div
        class="preview-window"
        tabindex="-1"
        (click)="$event.stopPropagation()"
        (keydown)="onKeyDown($event)"
      >
        <header class="preview-header">
          <div>
            <p class="eyebrow">Preview</p>
            <h2 id="preview-title">This is how your widget will look</h2>
          </div>
          <button
            type="button"
            class="preview-close"
            aria-label="Close live preview"
            (click)="close()"
          >
            ×
          </button>
        </header>
        <div class="preview-stage">
          <widget-renderer
            [widget]="widget()"
            (refreshRequested)="refreshRequested.emit()"
            (actionRequested)="actionRequested.emit($event)"
          />
        </div>
        <p class="preview-hint">Click an action or refresh control to inspect its event data.</p>
      </div>
    </div>
  `,
  styleUrl: './preview-dialog.css',
})
export class PreviewDialog {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly previouslyFocused = document.activeElement;
  readonly widget = input.required<Widget>();
  readonly closed = output<void>();
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();

  constructor() {
    queueMicrotask(() => this.focusInitial());
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = this.getFocusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const focusTarget = event.shiftKey ? last : first;
    const focusBoundary = event.shiftKey ? first : last;
    if (document.activeElement !== focusBoundary) return;
    event.preventDefault();
    focusTarget.focus();
  }

  protected close(): void {
    this.closed.emit();
    this.restoreFocus();
  }

  private focusInitial(): void {
    this.getFocusableElements()[0]?.focus();
  }

  private restoreFocus(): void {
    if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    const elements = this.elementRef.nativeElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;
    return Array.from(elements).filter((element) => !element.hasAttribute('disabled'));
  }
}
