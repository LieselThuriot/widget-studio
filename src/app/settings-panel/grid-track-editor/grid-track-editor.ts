import { Component, input, output } from '@angular/core';
import { GridTrack } from 'widget-renderer';
import { eventNumber, eventValue } from '../form-events';

@Component({
  selector: 'app-grid-track-editor',
  templateUrl: './grid-track-editor.html',
  styleUrl: './grid-track-editor.css',
})
export class GridTrackEditor {
  readonly kind = input.required<'rows' | 'columns'>();
  readonly tracks = input.required<GridTrack[]>();
  readonly added = output<void>();
  readonly removed = output<number>();
  readonly sizeChanged = output<{ index: number; value: number }>();
  readonly unitChanged = output<{ index: number; value: GridTrack['unit'] }>();

  protected number(event: Event): number {
    return eventNumber(event);
  }

  protected unit(event: Event): GridTrack['unit'] {
    const value = eventValue(event);
    return value === 'pixel' || value === 'auto' ? value : 'star';
  }
}
