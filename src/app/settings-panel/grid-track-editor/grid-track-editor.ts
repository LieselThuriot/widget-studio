import { Component, input, output } from '@angular/core';
import { GridTrack } from 'widget-renderer';

@Component({
  selector: 'app-grid-track-editor',
  template: `
    <p class="eyebrow track-heading">
      {{ kind() === 'rows' ? 'Rows' : 'Columns' }}
      <button type="button" class="small-add" (click)="added.emit()">+ Add</button>
    </p>
    @for (track of tracks(); track $index) {
      <div class="track-row">
        <input
          type="number"
          min="1"
          [value]="track.size"
          (input)="sizeChanged.emit({ index: $index, value: +$any($event.target).value })"
        />
        <select
          [value]="track.unit"
          (change)="unitChanged.emit({ index: $index, value: $any($event.target).value })"
        >
          <option value="star">Star</option>
          <option value="pixel">Pixel</option>
          <option value="auto">Auto</option>
        </select>
        <button
          type="button"
          [attr.aria-label]="'Remove ' + (kind() === 'rows' ? 'row' : 'column')"
          (click)="removed.emit($index)"
        >
          ×
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
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
    .track-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 16px 0 5px;
    }
    .small-add {
      border: 0;
      background: transparent;
      color: #5874ab;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
    }
    .track-row {
      display: grid;
      grid-template-columns: 1fr 1.35fr 25px;
      gap: 6px;
      align-items: center;
      margin-top: 7px;
    }
    input,
    select {
      display: block;
      box-sizing: border-box;
      width: 100%;
      margin-top: 0;
      padding: 8px 9px;
      border: 1px solid #dfe5ee;
      border-radius: 6px;
      background: #fff;
      color: #34425c;
      font: 12px inherit;
    }
    button:not(.small-add) {
      width: 24px;
      height: 28px;
      border: 0;
      background: transparent;
      color: #bd8290;
      cursor: pointer;
    }
  `,
})
export class GridTrackEditor {
  readonly kind = input.required<'rows' | 'columns'>();
  readonly tracks = input.required<GridTrack[]>();
  readonly added = output<void>();
  readonly removed = output<number>();
  readonly sizeChanged = output<{ index: number; value: number }>();
  readonly unitChanged = output<{ index: number; value: GridTrack['unit'] }>();
}
