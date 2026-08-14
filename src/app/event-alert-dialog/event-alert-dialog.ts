import { Component, input, output } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ButtonElement } from 'widget-renderer';

export type ActionAlert =
  | { kind: 'action'; element: ButtonElement; event: { type: string; target: string } }
  | { kind: 'refresh'; label: string };

@Component({
  selector: 'app-event-alert-dialog',
  imports: [UpperCasePipe],
  template: `
    @if (alert(); as alert) {
      <div
        class="alert-overlay"
        role="presentation"
        tabindex="-1"
        (click)="closed.emit()"
        (keydown)="$event.stopPropagation()"
      >
        <section
          class="event-alert"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="event-alert-title"
          tabindex="-1"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
        >
          <div class="alert-icon" aria-hidden="true">
            {{ alert.kind === 'refresh' ? '↻' : '↗' }}
          </div>
          <div class="alert-content">
            @if (alert.kind === 'refresh') {
              <p class="eyebrow">Refresh event</p>
              <h2 id="event-alert-title">Refresh requested</h2>
              <p class="alert-description">The renderer emitted the configured refresh event.</p>
              <dl class="event-data">
                <div>
                  <dt>Event</dt>
                  <dd>refreshRequested</dd>
                </div>
                <div>
                  <dt>Label</dt>
                  <dd>{{ alert.label }}</dd>
                </div>
              </dl>
            } @else {
              <p class="eyebrow">Action event</p>
              <h2 id="event-alert-title">{{ alert.element.label }} was clicked</h2>
              <p class="alert-description">The renderer passed this data to the action handler.</p>
              <dl class="event-data">
                <div>
                  <dt>Method</dt>
                  <dd>{{ alert.element.method | uppercase }}</dd>
                </div>
                <div>
                  <dt>URL</dt>
                  <dd>{{ alert.element.url }}</dd>
                </div>
                <div>
                  <dt>Event</dt>
                  <dd>{{ alert.event.type }}</dd>
                </div>
                @if (alert.element.body) {
                  <div>
                    <dt>Body</dt>
                    <dd>{{ alert.element.body }}</dd>
                  </div>
                }
                <div>
                  <dt>Target</dt>
                  <dd>{{ alert.event.target }}</dd>
                </div>
              </dl>
            }
            <button type="button" class="alert-close" (click)="closed.emit()">Close</button>
          </div>
        </section>
      </div>
    }
  `,
  styleUrl: './event-alert-dialog.css',
})
export class EventAlertDialog {
  readonly alert = input<ActionAlert | null>(null);
  readonly closed = output<void>();
}
