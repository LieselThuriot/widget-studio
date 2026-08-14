import { Component, input, output } from '@angular/core';
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
      (click)="closed.emit()"
      (keydown)="$event.stopPropagation()"
    >
      <div
        class="preview-window"
        tabindex="-1"
        (click)="$event.stopPropagation()"
        (keydown)="$event.stopPropagation()"
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
            (click)="closed.emit()"
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
  readonly widget = input.required<Widget>();
  readonly closed = output<void>();
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
}
