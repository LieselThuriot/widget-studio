import { Component, input, output } from '@angular/core';
import { widgetHeight, Widget as RendererWidget, widgetWidth } from 'widget-renderer';
import { Widget } from '../../editor-model';
import { WidgetBackgroundSettings } from '../widget-background-settings/widget-background-settings';
import { WidgetGridSettings } from '../widget-grid-settings/widget-grid-settings';
import { WidgetRefreshSettings } from '../widget-refresh-settings/widget-refresh-settings';

export interface WidgetTrackChange {
  kind: 'rows' | 'columns';
  index: number;
  patch: { size?: number; unit?: 'star' | 'pixel' | 'auto' };
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
