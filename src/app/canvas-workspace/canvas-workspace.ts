import { Component, input, output, signal } from '@angular/core';
import { ButtonElement, widgetHeight, widgetWidth } from 'widget-renderer';
import { Widget } from '../editor-model';
import { EditorCanvas } from '../editor-canvas/editor-canvas';
import { WidgetSample } from '../sample-widget';

@Component({
  selector: 'app-canvas-workspace',
  imports: [EditorCanvas],
  host: {
    '(document:keydown.escape)': 'closeShortcuts()',
    '(document:click)': 'closeShortcutsOnOutside($event)',
  },
  templateUrl: './canvas-workspace.html',
  styleUrl: './canvas-workspace.css',
})
export class CanvasWorkspace {
  readonly widget = input.required<Widget>();
  readonly darkMode = input(false);
  readonly selectedId = input<string | null>(null);
  readonly samples = input<readonly WidgetSample[]>([]);
  readonly selectedSampleId = input('');
  readonly elementDropped = output<DragEvent>();
  readonly widgetSelected = output<void>();
  readonly elementSelected = output<string>();
  readonly elementDeleted = output<string>();
  readonly elementMoved = output<{ id: string; row: number; column: number }>();
  readonly elementResized = output<{ id: string; rowSpan?: number; columnSpan?: number }>();
  readonly elementStackChanged = output<{ id: string; action: 'up' | 'down' | 'front' | 'back' }>();
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
  readonly sampleSelected = output<string>();
  readonly modelLoadRequested = output<void>();
  protected readonly shortcutsOpen = signal(false);
  protected readonly samplesOpen = signal(false);
  protected readonly width = () => widgetWidth(this.widget().size);
  protected readonly height = () => widgetHeight(this.widget().size);

  protected toggleShortcuts(event: Event): void {
    event.stopPropagation();
    this.shortcutsOpen.update((open) => !open);
  }

  protected closeShortcuts(): void {
    this.shortcutsOpen.set(false);
    this.samplesOpen.set(false);
  }

  protected toggleSamples(event: Event): void {
    event.stopPropagation();
    this.samplesOpen.update((open) => !open);
  }

  protected selectSample(sampleId: string): void {
    this.sampleSelected.emit(sampleId);
    this.samplesOpen.set(false);
  }

  protected closeSamples(): void {
    this.samplesOpen.set(false);
  }

  protected closeShortcutsOnOutside(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.shortcut-help')) this.closeShortcuts();
    if (!(event.target as HTMLElement).closest('.sample-menu')) this.closeSamples();
  }
}
