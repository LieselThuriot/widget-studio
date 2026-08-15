import { Component, input, output } from '@angular/core';

export interface CanvasContextMenuState {
  id: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-canvas-context-menu',
  templateUrl: './canvas-context-menu.html',
  styleUrl: './canvas-context-menu.css',
})
export class CanvasContextMenu {
  readonly menu = input.required<CanvasContextMenuState>();
  readonly stackChanged = output<'up' | 'down' | 'front' | 'back'>();
  readonly deleteRequested = output<void>();
  readonly closed = output<void>();
}
