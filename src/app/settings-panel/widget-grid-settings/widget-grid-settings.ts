import { Component, input, output } from '@angular/core';
import { Widget } from 'widget-renderer';
import { GridTrackEditor } from '../grid-track-editor/grid-track-editor';
import { eventValue } from '../form-events';
import { WidgetTrackChange } from '../widget-settings/widget-settings';

@Component({
  selector: 'app-widget-grid-settings',
  imports: [GridTrackEditor],
  templateUrl: './widget-grid-settings.html',
  styleUrl: '../widget-settings/widget-settings.css',
})
export class WidgetGridSettings {
  readonly widget = input.required<Widget>();
  readonly widgetChanged = output<Partial<Widget>>();
  readonly trackChanged = output<WidgetTrackChange>();
  readonly trackAdded = output<'rows' | 'columns'>();
  readonly trackRemoved = output<{ kind: 'rows' | 'columns'; index: number }>();

  protected size(event: Event): Widget['size'] {
    return eventValue(event) === 'wide' ? 'wide' : 'square';
  }
}
