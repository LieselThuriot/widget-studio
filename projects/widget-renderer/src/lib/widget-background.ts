import { Component, input } from '@angular/core';
import { BackgroundConfig } from './widget.model';

@Component({
  selector: 'widget-background',
  template: `<div
      class="widget-background"
      [class.is-sensitive]="sensitive()"
      style="background-image: none"
    >
      <div
        class="widget-background-image"
        [class.is-sensitive]="sensitive()"
        [style.background-image]="image()"
        [style.background-size]="background().size"
        [style.background-position]="background().anchor"
        [style.background-repeat]="background().repeat ? 'repeat' : 'no-repeat'"
      ></div>
    </div>
    <div
      class="widget-overlay"
      [style.background-color]="background().overlayColor || 'transparent'"
    ></div>`,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
      }
      .widget-background {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: var(--widget-renderer-radius, 8px);
      }
      .widget-background-image {
        position: absolute;
        inset: 0;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        transition: filter var(--widget-renderer-transition-duration, 160ms)
          var(--widget-renderer-transition-easing, ease);
      }
      .widget-background-image.is-sensitive {
        inset: -18px;
        filter: blur(18px);
        transform: scale(1.04);
      }
      .widget-overlay {
        position: absolute;
        inset: 0;
        border-radius: var(--widget-renderer-radius, 8px);
        pointer-events: none;
        z-index: 0;
      }
    `,
  ],
})
export class WidgetBackground {
  readonly background = input.required<BackgroundConfig>();
  readonly sensitive = input(false);
  readonly image = input('none');
}
