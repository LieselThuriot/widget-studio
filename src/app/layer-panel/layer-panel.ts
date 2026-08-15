import { Component, input, output } from '@angular/core';
import { WidgetElement } from 'widget-renderer';

@Component({
  selector: 'app-layer-panel',
  template: `
    <div class="panel-heading compact">
      <div>
        <p class="eyebrow">On canvas</p>
        <h2>Layers</h2>
      </div>
      <button
        type="button"
        class="clear-layers"
        [disabled]="!elements().length"
        (click)="layersCleared.emit()"
      >
        Clear all
      </button>
    </div>
    <div class="layer-list">
      @for (element of elements(); track element.id) {
        <div
          class="layer"
          draggable="true"
          [class.selected]="element.id === selectedId()"
          (dragstart)="dragStarted.emit({ event: $event, id: element.id })"
          (dragover)="$event.preventDefault()"
          (drop)="layerDropped.emit({ event: $event, id: element.id })"
        >
          <button type="button" class="layer-select" (click)="elementSelected.emit(element.id)">
            <span class="layer-grip" aria-hidden="true">⋮⋮</span><span>{{ icon(element) }}</span
            >{{ label(element) }}</button
          ><button
            type="button"
            class="layer-delete"
            aria-label="Delete layer"
            (click)="elementDeleted.emit(element.id)"
          >
            x
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .panel-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .panel-heading.compact {
      margin-top: 2px;
    }
    .eyebrow {
      margin: 0;
      color: #8794ad;
      font:
        700 10px/1.2 'DM Sans',
        sans-serif;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }
    h2 {
      margin: 0;
      font:
        700 17px/1.1 'DM Sans',
        sans-serif;
      letter-spacing: -0.025em;
    }
    .clear-layers {
      border: 0;
      background: transparent;
      color: #bd8290;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
    }
    .clear-layers:disabled {
      color: #cbd2de;
      cursor: default;
    }
    .layer-list {
      display: grid;
      gap: 8px;
      margin-top: 18px;
    }
    .layer {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 3px;
      border-radius: 7px;
      cursor: grab;
    }
    .layer:active {
      cursor: grabbing;
    }
    .layer:hover,
    .layer.selected {
      background: #edf2fb;
    }
    .layer-select {
      display: flex;
      flex: 1;
      gap: 8px;
      align-items: center;
      padding: 5px;
      border: 0;
      background: transparent;
      color: #66738b;
      text-align: left;
      font-size: 11px;
      cursor: inherit;
    }
    .layer.selected .layer-select {
      color: #36527f;
    }
    .layer-select span {
      width: 18px;
      color: #a2aec2;
      font-weight: 700;
    }
    .layer-select .layer-grip {
      width: 10px;
      color: #c0c8d5;
      font-size: 13px;
      letter-spacing: -4px;
    }
    .layer-delete {
      display: none;
      width: 22px;
      height: 22px;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: #bd8290;
      font-size: 16px;
      cursor: pointer;
    }
    .layer:hover .layer-delete,
    .layer:focus-within .layer-delete {
      display: block;
    }
    .layer-delete:hover,
    .layer-delete:focus-visible {
      background: #fbecef;
      color: #b64d60;
    }
    .layer {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 3px;
      border-radius: 7px;
      cursor: grab;
    }
    .layer:hover,
    .layer.selected {
      background: #edf2fb;
    }
    .layer-select {
      display: flex;
      flex: 1;
      gap: 8px;
      align-items: center;
      padding: 5px;
      border: 0;
      background: transparent;
      color: #66738b;
      text-align: left;
      font-size: 11px;
      cursor: inherit;
    }
    .layer.selected .layer-select {
      color: #36527f;
    }
    .layer-select span {
      width: 18px;
      color: #a2aec2;
      font-weight: 700;
    }
    .layer-select .layer-grip {
      width: 10px;
      color: #c0c8d5;
      font-size: 13px;
      letter-spacing: -4px;
    }
    .layer-delete {
      display: none;
      width: 22px;
      height: 22px;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: #bd8290;
      font-size: 16px;
      cursor: pointer;
    }
    .layer:hover .layer-delete,
    .layer:focus-within .layer-delete {
      display: block;
    }
  `,
})
export class LayerPanel {
  readonly elements = input.required<WidgetElement[]>();
  readonly selectedId = input<string | null>(null);
  readonly elementSelected = output<string>();
  readonly elementDeleted = output<string>();
  readonly layersCleared = output<void>();
  readonly dragStarted = output<{ event: DragEvent; id: string }>();
  readonly layerDropped = output<{ event: DragEvent; id: string }>();

  protected icon(element: WidgetElement): string {
    return element.type === 'text' ? 'T' : element.type === 'image' ? '▧' : '↗';
  }
  protected label(element: WidgetElement): string {
    return element.type === 'text'
      ? element.text
      : element.type === 'image'
        ? element.alt
        : element.label;
  }
}
