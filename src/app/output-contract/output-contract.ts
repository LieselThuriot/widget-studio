import { Component, input, signal } from '@angular/core';
import { WidgetContract } from 'widget-renderer';
import { JsonOutput } from './json-output';
import { CsharpOutput } from './csharp-output';
import { generateCsharpContract } from './csharp-contract';

@Component({
  selector: 'app-output-contract',
  imports: [JsonOutput, CsharpOutput],
  templateUrl: './output-contract.html',
  styleUrl: './output-contract.css',
})
export class OutputContract {
  readonly modelContract = input.required<WidgetContract>();
  protected readonly activeTab = signal<OutputFormat>(readOutputFormatPreference());
  protected readonly copyStatus = signal<string | null>(null);
  protected readonly isCopying = signal(false);
  private copyStatusTimer: ReturnType<typeof setTimeout> | undefined;

  protected selectTab(tab: 'json' | 'csharp', focus = false): void {
    this.activeTab.set(tab);
    try {
      localStorage.setItem(outputFormatStorageKey, tab);
    } catch {
      // Keep the selection in memory when storage is unavailable.
    }
    if (focus) {
      queueMicrotask(() => document.getElementById(`${tab}-tab`)?.focus());
    }
  }

  protected onTabKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    this.selectTab(event.key === 'ArrowLeft' ? 'json' : 'csharp', true);
  }

  protected async copyOutput(): Promise<void> {
    if (this.isCopying()) return;
    this.isCopying.set(true);
    this.copyStatus.set(null);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard is unavailable.');
      await navigator.clipboard.writeText(this.outputValue());
      this.showCopyStatus('Copied to clipboard.');
    } catch {
      this.showCopyStatus('Copy failed. Select the output and copy it manually.');
    } finally {
      this.isCopying.set(false);
    }
  }

  private showCopyStatus(status: string): void {
    if (this.copyStatusTimer) clearTimeout(this.copyStatusTimer);
    this.copyStatus.set(status);
    this.copyStatusTimer = setTimeout(() => {
      this.copyStatus.set(null);
      this.copyStatusTimer = undefined;
    }, 3200);
  }

  private outputValue(): string {
    return this.activeTab() === 'json'
      ? JSON.stringify(this.modelContract(), null, 2)
      : generateCsharpContract(this.modelContract());
  }
}

type OutputFormat = 'json' | 'csharp';

const outputFormatStorageKey = 'widget-studio-output-format';

function readOutputFormatPreference(): OutputFormat {
  try {
    const storedFormat = localStorage.getItem(outputFormatStorageKey);
    if (storedFormat === 'csharp') return 'csharp';
  } catch {
    // Fall back to JSON when storage is unavailable.
  }
  return 'json';
}
