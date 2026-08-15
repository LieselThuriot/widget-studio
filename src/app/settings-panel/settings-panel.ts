import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { GridTrack, Widget, WidgetElement, WidgetElementType } from 'widget-renderer';
import { AnchorControl } from './anchor-control/anchor-control';
import { TextElementSettings } from './text-element-settings/text-element-settings';
import { ImageElementSettings } from './image-element-settings/image-element-settings';
import { ButtonElementSettings } from './button-element-settings/button-element-settings';
import { WidgetSettings } from './widget-settings/widget-settings';
import { eventChecked, eventNumber } from './form-events';
import { ChartElementSettings } from './chart-element-settings/chart-element-settings';

export interface TrackChange {
  kind: 'rows' | 'columns';
  index: number;
  patch: Partial<GridTrack>;
}

export interface PlacementChange {
  kind: 'row' | 'column';
  value: number;
}

export interface SpanChange {
  kind: 'rowSpan' | 'columnSpan';
  value: number;
}

@Component({
  selector: 'app-settings-panel',
  imports: [
    CommonModule,
    AnchorControl,
    TextElementSettings,
    ImageElementSettings,
    ButtonElementSettings,
    WidgetSettings,
    ChartElementSettings,
  ],
  templateUrl: './settings-panel.html',
  styleUrl: './settings-panel.css',
})
export class SettingsPanel {
  readonly widget = input.required<Widget>();
  readonly selectedElement = input<WidgetElement | null>(null);
  readonly elementChanged = output<Partial<WidgetElement>>();
  readonly widgetChanged = output<Partial<Widget>>();
  readonly placementChanged = output<PlacementChange>();
  readonly spanChanged = output<SpanChange>();
  readonly radiusChanged = output<number>();
  readonly trackChanged = output<TrackChange>();
  readonly trackAdded = output<'rows' | 'columns'>();
  readonly trackRemoved = output<{ kind: 'rows' | 'columns'; index: number }>();

  protected icon(type: WidgetElementType): string {
    return type === 'text' ? 'T' : type === 'image' ? '▧' : type === 'button' ? '↗' : '◌';
  }

  protected checked(event: Event): boolean {
    return eventChecked(event);
  }

  protected number(event: Event): number {
    return eventNumber(event);
  }
}
