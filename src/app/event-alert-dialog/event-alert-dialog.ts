import { Component, ElementRef, effect, inject, input, output } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ButtonElement } from 'widget-renderer';
import { LandscapeState } from 'widget-landscape';
import { focusFirstElement, focusableElements, trapTabFocus } from '../dialog-focus';

export type ActionAlert =
  | {
      kind: 'action';
      widgetId: string;
      element: ButtonElement;
      event: { type: string; target: string };
    }
  | { kind: 'refresh'; widgetId: string; label: string }
  | { kind: 'landscape-confirm'; state: LandscapeState };

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
    trapTabFocus(event, focusableElements(this.elementRef.nativeElement));
  }

  protected close(): void {
    this.closed.emit();
    this.restoreFocus();
  }

  private focusInitial(): void {
    focusFirstElement(this.elementRef.nativeElement);
  }

  private restoreFocus(): void {
    if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
  }
}
