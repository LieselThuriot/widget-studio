import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { ButtonElement, Widget, WidgetRenderer } from 'widget-renderer';
import { focusableElements, trapTabFocus } from '../dialog-focus';

@Component({
  selector: 'app-preview-dialog',
  imports: [WidgetRenderer],
  templateUrl: './preview-dialog.html',
  styleUrl: './preview-dialog.css',
})
export class PreviewDialog {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly previouslyFocused = document.activeElement;
  readonly widget = input.required<Widget>();
  readonly closed = output<void>();
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
  protected readonly previewLoading = signal<false | Widget['size']>(false);

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
    trapTabFocus(event, focusableElements(this.elementRef.nativeElement));
  }

  protected close(): void {
    this.closed.emit();
    this.restoreFocus();
  }

  protected toggleLoading(): void {
    this.previewLoading.set(this.previewLoading() ? false : this.widget().size);
  }

  private focusInitial(): void {
    focusableElements(this.elementRef.nativeElement)[0]?.focus();
  }

  private restoreFocus(): void {
    if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
  }
}
