import { Component, input, output, signal } from '@angular/core';
import { Widget } from '../../editor-model';
import { widgetHeight, widgetWidth, WidgetSize } from 'widget-renderer';
import { removeTrack } from '../../editor-state';
import { GridEditorDialog } from '../grid-editor-dialog/grid-editor-dialog';
import { eventValue } from '../form-events';
import { WidgetTrackChange } from '../widget-settings/widget-settings';

@Component({
  selector: 'app-widget-grid-settings',
  imports: [GridEditorDialog],
  templateUrl: './widget-grid-settings.html',
  styleUrl: '../widget-settings/widget-settings.css',
})
export class WidgetGridSettings {
  readonly widget = input.required<Widget>();
  readonly widgetChanged = output<Partial<Widget>>();
  readonly trackChanged = output<WidgetTrackChange>();
  readonly trackAdded = output<'rows' | 'columns'>();
  readonly trackRemoved = output<{ kind: 'rows' | 'columns'; index: number }>();
  protected readonly isGridDialogOpen = signal(false);

  protected size(event: Event): Widget['size'] {
    const value = eventValue(event);
    return ['mini', 'square', 'wide', 'mega', 'hero'].includes(value)
      ? (value as Widget['size'])
      : 'square';
  }

  protected dimensions(size: WidgetSize): string {
    return `${widgetWidth(size)} × ${widgetHeight(size)}`;
  }

  protected saveGrid(
    grid: Pick<Widget, 'rows' | 'columns'> & {
      removed: { kind: 'rows' | 'columns'; index: number }[];
    },
  ): void {
    const updated = grid.removed.reduce(
      (widget, removal) => removeTrack(widget, removal.kind, removal.index),
      this.widget(),
    );
    this.widgetChanged.emit({ rows: grid.rows, columns: grid.columns, elements: updated.elements });
  }
}
