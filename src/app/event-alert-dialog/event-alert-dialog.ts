import { Component, ElementRef, effect, inject, input, output } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ButtonElement } from 'widget-renderer';

export type ActionAlert =
  | { kind: 'action'; element: ButtonElement; event: { type: string; target: string } }
  | { kind: 'refresh'; label: string };

@Component({
  selector: 'app-event-alert-dialog',
  imports: [UpperCasePipe],
  templateUrl: './event-alert-dialog.html',
  styleUrl: './event-alert-dialog.css',
})
export class EventAlertDialog {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private previouslyFocused: Element | null = null;
  readonly alert = input<ActionAlert | null>(null);
  readonly closed = output<void>();

  constructor() {
    effect(() => {
      const alert = this.alert();
      if (!alert) return;
      this.previouslyFocused = document.activeElement;
      queueMicrotask(() => this.focusInitial());
    });
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
