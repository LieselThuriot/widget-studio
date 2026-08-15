import { Component, input, output } from '@angular/core';
import { Widget } from 'widget-renderer';
import { ColorPicker } from '../../color-picker/color-picker';
import { AnchorControl } from '../anchor-control/anchor-control';
import { GridTrackEditor } from '../grid-track-editor/grid-track-editor';

export interface WidgetTrackChange {
  kind: 'rows' | 'columns';
  index: number;
  patch: { size?: number; unit?: 'star' | 'pixel' | 'auto' };
}

@Component({
  selector: 'app-widget-settings',
  imports: [ColorPicker, AnchorControl, GridTrackEditor],
  template: `
    <div class="widget-settings">
      <div class="selected-chip">
        <span class="chip-icon">W</span><span>Widget</span
        ><span class="chip-id">{{ widget().size === 'wide' ? '530' : '265' }} × 245</span>
      </div>
      <section class="widget-setting-section">
        <div class="widget-setting-section-heading">
          <span class="eyebrow">Grid</span
          ><span class="summary-value"
            >{{ widget().rows.length }} rows · {{ widget().columns.length }} columns</span
          >
        </div>
        <label
          >Widget size<select
            [value]="widget().size"
            (change)="widgetChanged.emit({ size: $any($event.target).value })"
          >
            <option value="square">Square · 265 × 245</option>
            <option value="wide">Wide · 530 × 245</option>
          </select></label
        ><app-grid-track-editor
          kind="rows"
          [tracks]="widget().rows"
          (added)="trackAdded.emit('rows')"
          (removed)="trackRemoved.emit({ kind: 'rows', index: $event })"
          (sizeChanged)="
            trackChanged.emit({ kind: 'rows', index: $event.index, patch: { size: $event.value } })
          "
          (unitChanged)="
            trackChanged.emit({ kind: 'rows', index: $event.index, patch: { unit: $event.value } })
          "
        /><app-grid-track-editor
          kind="columns"
          [tracks]="widget().columns"
          (added)="trackAdded.emit('columns')"
          (removed)="trackRemoved.emit({ kind: 'columns', index: $event })"
          (sizeChanged)="
            trackChanged.emit({
              kind: 'columns',
              index: $event.index,
              patch: { size: $event.value },
            })
          "
          (unitChanged)="
            trackChanged.emit({
              kind: 'columns',
              index: $event.index,
              patch: { unit: $event.value },
            })
          "
        />
      </section>
      <section class="widget-setting-section">
        <div class="widget-setting-section-heading">
          <span class="eyebrow">Background</span
          ><span class="summary-value">{{
            widget().background.image ? 'Image' : widget().background.color
          }}</span>
        </div>
        <app-color-picker
          label="Color"
          [value]="widget().background.color"
          [clearable]="true"
          (changed)="widgetChanged.emit({ background: { ...widget().background, color: $event } })"
          (cleared)="
            widgetChanged.emit({ background: { ...widget().background, color: undefined } })
          "
        /><app-color-picker
          label="Overlay color"
          [value]="widget().background.overlayColor"
          [clearable]="true"
          [withAlpha]="true"
          (changed)="
            widgetChanged.emit({ background: { ...widget().background, overlayColor: $event } })
          "
          (cleared)="
            widgetChanged.emit({ background: { ...widget().background, overlayColor: undefined } })
          "
        /><label
          >Image URL or base64 data<textarea
            [value]="widget().background.image || ''"
            (input)="
              widgetChanged.emit({
                background: { ...widget().background, image: $any($event.target).value },
              })
            "
          ></textarea></label
        ><label
          >Size<select
            [value]="widget().background.size"
            (change)="
              widgetChanged.emit({
                background: { ...widget().background, size: $any($event.target).value },
              })
            "
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
          </select></label
        ><label class="toggle-row"
          ><span
            ><strong>Repeat image</strong
            ><small>Tile the background image across the widget</small></span
          ><input
            type="checkbox"
            [checked]="widget().background.repeat"
            (change)="
              widgetChanged.emit({
                background: { ...widget().background, repeat: $any($event.target).checked },
              })
            " /><span class="toggle"></span></label
        ><app-anchor-control
          [value]="widget().background.anchor"
          ariaLabel="Background image anchor"
          (changed)="widgetChanged.emit({ background: { ...widget().background, anchor: $event } })"
        />
      </section>
      <section class="widget-setting-section">
        <div class="widget-setting-section-heading">
          <span class="eyebrow">Refresh</span
          ><span class="summary-value">{{
            widget().refresh.enabled ? 'Enabled' : 'Disabled'
          }}</span>
        </div>
        <label class="toggle-row"
          ><span
            ><strong>Refresh control</strong><small>Show refresh in the hover toolbar</small></span
          ><input
            type="checkbox"
            [checked]="widget().refresh.enabled"
            (change)="
              widgetChanged.emit({
                refresh: { ...widget().refresh, enabled: $any($event.target).checked },
              })
            " /><span class="toggle"></span></label
        ><label
          >Accessible label<input
            [value]="widget().refresh.label"
            (input)="
              widgetChanged.emit({
                refresh: { ...widget().refresh, label: $any($event.target).value },
              })
            "
        /></label>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .widget-setting-section {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #edf0f4;
    }
    .widget-setting-section-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
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
    .summary-value {
      margin-left: auto;
      color: #9aa5b7;
      font-size: 10px;
    }
    label {
      display: block;
      margin: 13px 0;
      color: #67738a;
      font-size: 11px;
      font-weight: 600;
    }
    input,
    textarea,
    select {
      display: block;
      box-sizing: border-box;
      width: 100%;
      margin-top: 6px;
      padding: 8px 9px;
      border: 1px solid #dfe5ee;
      border-radius: 6px;
      background: #fff;
      color: #34425c;
      font: 12px inherit;
    }
    textarea {
      min-height: 57px;
      resize: vertical;
    }
    .toggle-row {
      display: flex !important;
      align-items: center;
      gap: 8px;
      padding: 12px 0 2px;
      border-top: 1px solid #edf0f4;
    }
    .toggle-row span:first-child {
      flex: 1;
    }
    .toggle-row strong,
    .toggle-row small {
      display: block;
    }
    .toggle-row small {
      margin-top: 3px;
      color: #9aa5b7;
      font-size: 10px;
      font-weight: 400;
    }
    .toggle-row input {
      position: absolute;
      opacity: 0;
      width: 1px !important;
    }
    .toggle {
      position: relative;
      width: 29px;
      height: 17px;
      border-radius: 20px;
      background: #cbd3df;
    }
    .toggle:after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #fff;
    }
    .toggle-row input:checked + .toggle {
      background: #5874ab;
    }
    .toggle-row input:checked + .toggle:after {
      transform: translateX(12px);
    }
  `,
})
export class WidgetSettings {
  readonly widget = input.required<Widget>();
  readonly widgetChanged = output<Partial<Widget>>();
  readonly trackChanged = output<WidgetTrackChange>();
  readonly trackAdded = output<'rows' | 'columns'>();
  readonly trackRemoved = output<{ kind: 'rows' | 'columns'; index: number }>();
}
