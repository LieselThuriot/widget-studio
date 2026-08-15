import { Component, input, output } from '@angular/core';
import { ButtonElement, Widget } from 'widget-renderer';
import { EditorCanvas } from '../editor-canvas/editor-canvas';

@Component({
  selector: 'app-canvas-workspace',
  imports: [EditorCanvas],
  templateUrl: './canvas-workspace.html',
  styleUrl: './canvas-workspace.css',
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
