import { Component, ElementRef, effect, inject, input, output } from '@angular/core';
import { ButtonElement } from '@lieselthuriot/widget-renderer';
import { LandscapeStateChange } from '@lieselthuriot/widget-landscape';
import { focusFirstElement, focusableElements, trapTabFocus } from '../dialog-focus';
import { ActionAlertComponent } from './action-alert';
import { RefreshAlertComponent } from './refresh-alert';
import { LandscapeConfirmAlertComponent } from './landscape-confirm-alert';

export interface ActionEventAlert {
  kind: 'action';
  widgetId: string;
  element: ButtonElement;
  event: { type: string; target: string };
}
export interface RefreshEventAlert {
  kind: 'refresh';
  widgetId: string;
  label: string;
}
export interface LandscapeConfirmAlert {
  kind: 'landscape-confirm';
  state: LandscapeStateChange;
}
export type ActionAlert = ActionEventAlert | RefreshEventAlert | LandscapeConfirmAlert;

@Component({
  selector: 'app-event-alert-dialog',
  imports: [ActionAlertComponent, RefreshAlertComponent, LandscapeConfirmAlertComponent],
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
