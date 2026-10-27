import { Component, input, output } from '@angular/core';
import {
  widgetHeight,
  Widget as RendererWidget,
  widgetWidth,
} from '@lieselthuriot/widget-renderer';
import { Widget } from '../../editor-model';
import { GridTrackPatch } from '../../editor-state';
import { WidgetBackgroundSettings } from '../widget-background-settings/widget-background-settings';
import { WidgetGridSettings } from '../widget-grid-settings/widget-grid-settings';
import { WidgetRefreshSettings } from '../widget-refresh-settings/widget-refresh-settings';

export interface WidgetTrackChange {
  kind: 'rows' | 'columns';
  index: number;
  patch: GridTrackPatch;
}

@Component({
  selector: 'app-widget-settings',
  imports: [WidgetGridSettings, WidgetBackgroundSettings, WidgetRefreshSettings],
  templateUrl: './widget-settings.html',
  styleUrl: './widget-settings.css',
})
export class WidgetSettings {
  readonly widget = input.required<Widget>();
  readonly widgetChanged = output<Partial<RendererWidget>>();
  readonly trackChanged = output<WidgetTrackChange>();
  readonly trackAdded = output<'rows' | 'columns'>();
  readonly trackRemoved = output<{ kind: 'rows' | 'columns'; index: number }>();
  protected readonly width = () => widgetWidth(this.widget().size);
  protected readonly height = () => widgetHeight(this.widget().size);
}
