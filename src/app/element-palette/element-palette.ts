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
  templateUrl: './element-palette.html',
  styleUrl: './element-palette.css',
})
export class ElementPalette {
  readonly items = input.required<PaletteItem[]>();
  readonly elementAdded = output<WidgetElement['type']>();
  readonly dragStarted = output<{ event: DragEvent; type: WidgetElement['type'] }>();
}
