import { Component, input, output } from '@angular/core';
import { elementGridStyle } from 'widget-renderer';
import { WidgetElement } from '../editor-model';
import { elementLabel } from '../widget-element-metadata';

@Component({
  selector: 'app-canvas-element-overlay',
  templateUrl: './canvas-element-overlay.html',
  styleUrl: './canvas-element-overlay.css',
})
export class CanvasElementOverlay {
  readonly element = input.required<WidgetElement>();
  readonly selected = input(false);
  readonly dragging = input(false);
  readonly showGuides = input(false);
  readonly deleteRequested = output<Event>();
  readonly resizeStarted = output<{ axis: 'row' | 'column'; event: PointerEvent }>();

  protected style(element: WidgetElement): Record<string, string> {
    return elementGridStyle(element);
  }

  protected label(element: WidgetElement): string {
    return elementLabel(element);
  }
}
