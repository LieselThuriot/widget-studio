import { Component, input, output } from '@angular/core';
import { ImageAnchor } from 'widget-renderer';

@Component({
  selector: 'app-anchor-control',
  template: `
    <div class="anchor-field">
      <span>Anchor</span>
      <div class="anchor-control" role="group" [attr.aria-label]="ariaLabel()">
        @for (anchor of anchors; track anchor.value) {
          <button
            type="button"
            [class.active]="value() === anchor.value"
            [attr.aria-label]="anchor.value"
            (click)="changed.emit(anchor.value)"
          >
            {{ anchor.icon }}
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .anchor-field {
      margin: 14px 0;
      color: #67738a;
      font-size: 11px;
      font-weight: 600;
    }
    .anchor-control {
      display: grid;
      grid-template-columns: repeat(3, 28px);
      width: max-content;
      margin-top: 6px;
      border: 1px solid #dfe5ee;
      border-radius: 5px;
      overflow: hidden;
    }
    button {
      width: 28px;
      height: 26px;
      padding: 0;
      border: 0;
      border-right: 1px solid #dfe5ee;
      border-bottom: 1px solid #dfe5ee;
      background: #fff;
      color: #63718a;
      font-size: 17px;
      line-height: 1;
      cursor: pointer;
    }
    button:nth-child(3n) {
      border-right: 0;
    }
    button:nth-child(n + 7) {
      border-bottom: 0;
    }
    button:hover,
    button:focus-visible,
    button.active {
      background: #edf2fb;
      color: #36527f;
      outline: none;
    }
  `,
})
export class AnchorControl {
  readonly value = input.required<ImageAnchor>();
  readonly ariaLabel = input('Element anchor');
  readonly changed = output<ImageAnchor>();

  protected readonly anchors: { value: ImageAnchor; icon: string }[] = [
    { value: 'top left', icon: '↖' },
    { value: 'top center', icon: '↑' },
    { value: 'top right', icon: '↗' },
    { value: 'center left', icon: '←' },
    { value: 'center', icon: '•' },
    { value: 'center right', icon: '→' },
    { value: 'bottom left', icon: '↙' },
    { value: 'bottom center', icon: '↓' },
    { value: 'bottom right', icon: '↘' },
  ];
}
