import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { GridTrack, ImageAnchor, Widget, WidgetElement, WidgetElementType } from 'widget-renderer';
import { ColorPicker } from '../color-picker/color-picker';

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
  imports: [CommonModule, ColorPicker],
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

  protected readonly anchors: { value: ImageAnchor; icon: string }[] = [
    { value: 'top left', icon: '↖' },
    { value: 'top center', icon: '↑' },
    { value: 'top right', icon: '↗' },
    { value: 'center left', icon: '←' },
    { value: 'center', icon: '•' },
    { value: 'center right', icon: '→' },
    { value: 'bottom left', icon: '↙' },
    { value: 'bottom center', icon: '↓' },
    { value: 'bottom right', icon: '↘' },
  ];
  protected readonly trackKinds = ['rows', 'columns'] as const;

  protected tracks(kind: 'rows' | 'columns'): GridTrack[] {
    return this.widget()[kind];
  }

  protected icon(type: WidgetElementType): string {
    return type === 'text' ? 'T' : type === 'image' ? '▧' : '↗';
  }

  protected setAnchor(anchor: ImageAnchor): void {
    if (this.selectedElement()) this.elementChanged.emit({ anchor });
    else this.widgetChanged.emit({ background: { ...this.widget().background, anchor } });
  }
}
