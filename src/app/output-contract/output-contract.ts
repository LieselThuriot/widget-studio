import { Component, input, signal } from '@angular/core';
import { WidgetContract } from 'widget-renderer';
import { JsonOutput } from './json-output';
import { CsharpOutput } from './csharp-output';

@Component({
  selector: 'app-output-contract',
  imports: [JsonOutput, CsharpOutput],
  templateUrl: './output-contract.html',
  styleUrl: './output-contract.css',
})
export class OutputContract {
  readonly modelContract = input.required<WidgetContract>();
  protected readonly activeTab = signal<OutputFormat>(readOutputFormatPreference());

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
