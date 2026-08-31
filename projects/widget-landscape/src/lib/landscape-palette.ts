import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { LandscapePaletteItem } from './landscape.model';
import { landscapeFootprintForSize } from './landscape.model';

@Component({
  selector: 'widget-landscape-palette',
  templateUrl: './landscape-palette.html',
  styleUrl: './landscape-palette.css',
  host: { style: 'display: contents' },
})
export class LandscapePalette {
  readonly element = viewChild<ElementRef<HTMLElement>>('palette');
  readonly items = input<readonly LandscapePaletteItem[]>([]);
  readonly invalidIds = input<readonly string[]>([]);
  readonly hasWidgets = input(false);
  readonly dragStarted = output<{ event: DragEvent; item: LandscapePaletteItem }>();
  readonly dragEnded = output<void>();
  readonly added = output<LandscapePaletteItem>();
  readonly cleared = output<void>();

  protected footprint(item: LandscapePaletteItem) {
    return item.size ? landscapeFootprintForSize(item.size) : null;
  }
}
