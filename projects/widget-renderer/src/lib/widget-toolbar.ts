import { Component, input, output } from '@angular/core';
import { RefreshConfig } from './widget.model';

@Component({
  selector: 'widget-toolbar',
  template: `<div class="widget-toolbar" aria-label="Widget actions">
    @if (refresh()?.enabled) {
      <button
        type="button"
        class="icon-button"
        [attr.aria-label]="refresh()?.label"
        [title]="refresh()?.label"
        (click)="refreshRequested.emit()"
      >
        ↻
      </button>
    }
    @if (hasSensitiveElements()) {
      <button
        type="button"
        class="icon-button"
        [attr.aria-label]="sensitiveVisible() ? 'Hide sensitive data' : 'Show sensitive data'"
        [title]="sensitiveVisible() ? 'Hide sensitive data' : 'Show sensitive data'"
        (click)="sensitiveToggled.emit()"
      >
        @if (sensitiveVisible()) {
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        } @else {
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path
              d="m3 3 18 18M10.6 5.3A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.4 18.4 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10.7 10.7 0 0 1-3.4-.6"
            />
          </svg>
        }
      </button>
    }
  </div>`,
  styles: [
    `
      :host {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 3;
      }
      .widget-toolbar {
        display: flex;
        gap: 4px;
        opacity: 0;
        transform: translateY(-4px);
        transition:
          opacity var(--widget-renderer-transition-duration, 160ms)
            var(--widget-renderer-transition-easing, ease),
          transform var(--widget-renderer-transition-duration, 160ms)
            var(--widget-renderer-transition-easing, ease);
      }
      :host-context(.widget-shell:hover) .widget-toolbar,
      :host-context(.widget-shell:focus-within) .widget-toolbar {
        opacity: 1;
        transform: translateY(0);
      }
      .icon-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        pointer-events: var(--widget-renderer-actions-pointer-events, auto);
        width: var(--widget-renderer-control-size, 28px);
        height: var(--widget-renderer-control-size, 28px);
        border: 1px solid var(--widget-renderer-control-border, #ffffff38);
        border-radius: var(--widget-renderer-radius, 8px);
        background: var(--widget-renderer-control-background, #10182ccc);
        color: var(--widget-renderer-action-color, #fff);
        cursor: pointer;
      }
      .icon-button svg {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 1.8;
      }
      .icon-button:hover,
      .icon-button:focus-visible {
        border-color: var(--widget-renderer-control-hover-border, #17233c);
        background: var(--widget-renderer-control-hover-background, #fff);
        color: var(--widget-renderer-control-hover-color, #17233c);
      }
    `,
  ],
})
export class WidgetToolbar {
  readonly refresh = input<RefreshConfig | null>(null);
  readonly hasSensitiveElements = input(false);
  readonly sensitiveVisible = input(false);
  readonly refreshRequested = output<void>();
  readonly sensitiveToggled = output<void>();
}
