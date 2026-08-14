import { Component, input, output } from '@angular/core';
import { WidgetElement } from 'widget-renderer';

export interface PaletteItem {
  type: WidgetElement['type'];
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-element-palette',
  template: `
    <p class="helper">Drag components into the canvas, or click to add them.</p>
    <div class="palette-list">
      @for (item of items(); track item.type) {
        <button
          class="palette-item"
          type="button"
          draggable="true"
          (dragstart)="dragStarted.emit({ event: $event, type: item.type })"
          (click)="elementAdded.emit(item.type)"
        >
          <span class="palette-icon">{{ item.icon }}</span
          ><span
            ><strong>{{ item.label }}</strong
            ><small>{{ item.description }}</small></span
          ><span class="add">+</span>
        </button>
      }
    </div>
  `,
  styles: `
    .helper {
      margin: 14px 0 18px;
      color: #8490a7;
      font-size: 12px;
      line-height: 1.45;
    }
    .palette-list {
      display: grid;
      gap: 8px;
    }
    .palette-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px;
      border: 1px solid #e4e8f0;
      border-radius: 9px;
      background: #fff;
      color: #25324b;
      text-align: left;
      cursor: pointer;
    }
    .palette-item:hover,
    .palette-item:focus-visible {
      border-color: #a8bae1;
      background: #f8faff;
    }
    .palette-icon {
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      border-radius: 7px;
      background: #edf2fb;
      color: #5874ab;
      font-weight: 700;
    }
    .palette-item strong,
    .palette-item small {
      display: block;
    }
    .palette-item strong {
      font-size: 12px;
    }
    .palette-item small {
      margin-top: 2px;
      color: #8b96a9;
      font-size: 10px;
    }
    .add {
      margin-left: auto;
      color: #a6b0c0;
      font-size: 18px;
    }
  `,
})
export class ElementPalette {
  readonly items = input.required<PaletteItem[]>();
  readonly elementAdded = output<WidgetElement['type']>();
  readonly dragStarted = output<{ event: DragEvent; type: WidgetElement['type'] }>();
}
