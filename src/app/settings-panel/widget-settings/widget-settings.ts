import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
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
  protected readonly fingerprint = computed(() =>
    computeWidgetFingerprint(toWidgetContract(this.widget())),
  );
  protected readonly shortFingerprint = computed(() => {
    const id = this.fingerprint();
    return id && id.length > 24 ? `${id.slice(0, 12)}…${id.slice(-6)}` : id;
  });
  protected readonly fingerprintCopyStatus = signal<'copied' | 'failed' | null>(null);
  private fingerprintCopyStatusTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.fingerprintCopyStatusTimer));
  }

  protected async copyFingerprint(): Promise<void> {
    const fingerprint = this.fingerprint();
    if (!fingerprint) return;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard is unavailable.');
      await navigator.clipboard.writeText(fingerprint);
      this.showFingerprintCopyStatus('copied');
    } catch {
      this.showFingerprintCopyStatus('failed');
    }
  }

  private showFingerprintCopyStatus(status: 'copied' | 'failed'): void {
    if (this.fingerprintCopyStatusTimer) clearTimeout(this.fingerprintCopyStatusTimer);
    this.fingerprintCopyStatus.set(status);
    this.fingerprintCopyStatusTimer = setTimeout(() => {
      this.fingerprintCopyStatus.set(null);
      this.fingerprintCopyStatusTimer = undefined;
    }, 2000);
  }
}
