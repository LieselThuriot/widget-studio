import { Component, input, output } from '@angular/core';
import { ButtonElement, Widget } from 'widget-renderer';
import { EditorCanvas } from '../editor-canvas/editor-canvas';

@Component({
  selector: 'app-canvas-workspace',
  imports: [EditorCanvas],
  template: `
    <section class="canvas-area" aria-label="Widget preview">
      <div class="canvas-toolbar">
        <span>Preview canvas</span
        ><span class="dimensions">{{ widget().size === 'wide' ? '530' : '265' }} × 245 px</span>
      </div>
      <div class="canvas" (dragover)="$event.preventDefault()" (drop)="elementDropped.emit($event)">
        <app-editor-canvas
          [widget]="widget()"
          [selectedId]="selectedId()"
          (widgetSelected)="widgetSelected.emit()"
          (elementSelected)="elementSelected.emit($event)"
          (elementDeleted)="elementDeleted.emit($event)"
          (elementMoved)="elementMoved.emit($event)"
          (elementResized)="elementResized.emit($event)"
          (elementStackChanged)="elementStackChanged.emit($event)"
          (refreshRequested)="refreshRequested.emit()"
          (actionRequested)="actionRequested.emit($event)"
        />
      </div>
      <div class="canvas-hint">
        <span>Ctrl</span> Hold Ctrl to show element boundaries
        <span class="hint-separator"></span> Hover the widget to reveal its controls
      </div>
    </section>
  `,
  styles: `
    .canvas-area {
      min-width: 0;
      padding: 4px 0;
    }
    .canvas-toolbar {
      display: flex;
      justify-content: space-between;
      margin: 0 4px 14px;
      color: #56647d;
      font:
        700 12px 'DM Sans',
        sans-serif;
    }
    .dimensions {
      color: #a1aabd;
      font-weight: 500;
    }
    .canvas {
      min-height: 430px;
      display: grid;
      place-items: center;
      border: 1px dashed #cbd4e3;
      border-radius: 14px;
      background: #f2f5f9;
      background-image: radial-gradient(#d5dce8 1px, transparent 1px);
      background-size: 14px 14px;
    }
    .canvas-hint {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 15px;
      color: #97a1b3;
      font-size: 11px;
    }
    .canvas-hint span:first-child {
      padding: 2px 5px;
      border: 1px solid #d6dce6;
      border-radius: 4px;
      font-weight: 700;
    }
    .hint-separator {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: #c2c9d5;
    }
    @media (max-width: 700px) {
      .canvas {
        min-height: 340px;
      }
      .canvas-hint {
        flex-wrap: wrap;
        text-align: center;
      }
    }
  `,
})
export class CanvasWorkspace {
  readonly widget = input.required<Widget>();
  readonly selectedId = input<string | null>(null);
  readonly elementDropped = output<DragEvent>();
  readonly widgetSelected = output<void>();
  readonly elementSelected = output<string>();
  readonly elementDeleted = output<string>();
  readonly elementMoved = output<{ id: string; row: number; column: number }>();
  readonly elementResized = output<{ id: string; rowSpan?: number; columnSpan?: number }>();
  readonly elementStackChanged = output<{ id: string; action: 'up' | 'down' | 'front' | 'back' }>();
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
}
