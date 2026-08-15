import { Component, input, output } from '@angular/core';
import { Widget } from 'widget-renderer';
import { ColorPicker } from '../../color-picker/color-picker';
import { AnchorControl } from '../anchor-control/anchor-control';
import { GridTrackEditor } from '../grid-track-editor/grid-track-editor';
import { eventChecked, eventValue } from '../form-events';

export interface WidgetTrackChange {
  kind: 'rows' | 'columns';
  index: number;
  patch: { size?: number; unit?: 'star' | 'pixel' | 'auto' };
}

@Component({
  selector: 'app-widget-settings',
  imports: [ColorPicker, AnchorControl, GridTrackEditor],
  templateUrl: './widget-settings.html',
  styleUrl: './widget-settings.css',
})
export class WidgetSettings {
  readonly widget = input.required<Widget>();
  readonly widgetChanged = output<Partial<Widget>>();
  readonly trackChanged = output<WidgetTrackChange>();
  readonly trackAdded = output<'rows' | 'columns'>();
  readonly trackRemoved = output<{ kind: 'rows' | 'columns'; index: number }>();

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected checked(event: Event): boolean {
    return eventChecked(event);
  }

  protected size(event: Event): Widget['size'] {
    return eventValue(event) === 'wide' ? 'wide' : 'square';
  }

  protected backgroundSize(event: Event): Widget['background']['size'] {
    const value = eventValue(event);
    return value === 'contain' || value === 'auto' ? value : 'cover';
  }
}
