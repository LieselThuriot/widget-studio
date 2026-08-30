import { Component, input } from '@angular/core';
import { WidgetValidationIssue } from './widget-validation';

@Component({
  selector: 'widget-validation-overlay',
  template: `<div class="widget-validation-overlay" role="alert" aria-live="polite">
    <strong class="widget-validation-title">Widget validation failed</strong>
    <ul class="widget-validation-issues">
      @for (issue of issues(); track $index) {
        <li>
          <code>{{ issue.path }}</code
          >: {{ issue.message }}
        </li>
      }
    </ul>
  </div>`,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        z-index: 2;
      }
      .widget-validation-overlay {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-sizing: border-box;
        overflow: auto;
        padding: var(--widget-renderer-content-padding, 18px);
        border: 1px solid #e06a6a;
        border-radius: var(--widget-renderer-radius, 8px);
        background: #fff4f4ef;
        color: #7f1d1d;
        pointer-events: auto;
      }
      .widget-validation-title {
        font-size: 13px;
      }
      .widget-validation-issues {
        display: grid;
        gap: 4px;
        margin: 0;
        padding-inline-start: 18px;
        font:
          12px/1.4 ui-monospace,
          SFMono-Regular,
          Consolas,
          monospace;
      }
      .widget-validation-issues code {
        font: inherit;
        font-weight: 700;
      }
      :host-context(html[data-theme='dark']) .widget-validation-overlay {
        border-color: #f08a8a;
        background: #3b1717ef;
        color: #ffd6d6;
      }
    `,
  ],
})
export class WidgetValidationOverlay {
  readonly issues = input.required<WidgetValidationIssue[]>();
}
