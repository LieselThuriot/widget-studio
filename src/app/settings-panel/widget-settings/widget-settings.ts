import { Component, computed, input, output, signal } from '@angular/core';
import {
  computeWidgetFingerprint,
  widgetHeight,
  Widget as RendererWidget,
  widgetWidth,
} from '@lieselthuriot/widget-renderer';
import { Widget } from '../../editor-model';
import { GridTrackPatch } from '../../editor-state';
import { toWidgetContract } from '../../widget-contract';
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
  protected readonly layoutId = computed(() =>
    computeWidgetFingerprint(toWidgetContract(this.widget())),
  );
  protected readonly shortLayoutId = computed(() => {
    const id = this.layoutId();
    return id && id.length > 24 ? `${id.slice(0, 12)}…${id.slice(-6)}` : id;
  });
  protected readonly layoutIdCopyStatus = signal<'copied' | 'failed' | null>(null);
  private layoutIdCopyStatusTimer: ReturnType<typeof setTimeout> | undefined;

  protected async copyLayoutId(): Promise<void> {
    const layoutId = this.layoutId();
    if (!layoutId) return;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard is unavailable.');
      await navigator.clipboard.writeText(layoutId);
      this.showLayoutIdCopyStatus('copied');
    } catch {
      this.showLayoutIdCopyStatus('failed');
    }
  }

  private showLayoutIdCopyStatus(status: 'copied' | 'failed'): void {
    if (this.layoutIdCopyStatusTimer) clearTimeout(this.layoutIdCopyStatusTimer);
    this.layoutIdCopyStatus.set(status);
    this.layoutIdCopyStatusTimer = setTimeout(() => {
      this.layoutIdCopyStatus.set(null);
      this.layoutIdCopyStatusTimer = undefined;
    }, 2000);
  }
}
