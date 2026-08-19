import { Component, input, output } from '@angular/core';
import { WidgetElement } from '../editor-model';
import { PaletteItem } from '../widget-element-metadata';

export type { PaletteItem } from '../widget-element-metadata';

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
