import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioHeader } from './studio-header/studio-header';
import { ElementPalette } from './element-palette/element-palette';
import { LayerPanel } from './layer-panel/layer-panel';
import { CanvasWorkspace } from './canvas-workspace/canvas-workspace';
import { OutputContract } from './output-contract/output-contract';
import { PreviewDialog } from './preview-dialog/preview-dialog';
import { EventAlertDialog } from './event-alert-dialog/event-alert-dialog';
import { SettingsPanel } from './settings-panel/settings-panel';
import { ButtonElement } from 'widget-renderer';
import { Widget as RendererWidget, WidgetInput } from 'widget-renderer';
import { WidgetElement } from './editor-model';
import { GridTrackPatch } from './editor-state';
import { widgetElementPalette } from './widget-element-metadata';
import { EditorStateStore } from './editor-state-store';
import { sampleWidgets } from './sample-widget';
import { decodeWidgetShareHash } from './widget-sharing';
import { ShareDialog } from './share-dialog/share-dialog';
import { ModelLoaderDialog } from './model-loader-dialog/model-loader-dialog';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    StudioHeader,
    ElementPalette,
    LayerPanel,
    CanvasWorkspace,
    OutputContract,
    PreviewDialog,
    EventAlertDialog,
    SettingsPanel,
    ShareDialog,
    ModelLoaderDialog,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '[class.is-dark]': 'darkMode()',
    '(document:click)': 'selectCanvasBackground($event)',
    '(document:keydown)': 'onDocumentKeyDown($event)',
  },
})
export class App {
  protected readonly darkMode = signal(readThemePreference());
  private readonly editorState = new EditorStateStore();
  protected readonly widget = this.editorState.widget;
  protected readonly selectedId = this.editorState.selectedId;
  protected readonly isPreviewOpen = this.editorState.isPreviewOpen;
  protected readonly isShareOpen = signal(false);
  protected readonly actionAlert = this.editorState.actionAlert;
  protected readonly selectedElement = this.editorState.selectedElement;
  protected readonly modelContract = this.editorState.modelContract;
  protected readonly modelJson = computed(() => JSON.stringify(this.modelContract(), null, 2));
  protected readonly palette = widgetElementPalette;
  protected readonly samples = sampleWidgets;
  protected readonly widgetSampleId = signal(sampleWidgets[0].id);
  protected readonly shareLoadMessage = signal<string | null>(null);
  protected readonly isModelLoaderOpen = signal(false);

  constructor() {
    effect(() => {
      const darkMode = this.darkMode();
      document.documentElement.dataset['theme'] = darkMode ? 'dark' : 'light';
    });
    void this.loadSharedWidget();
  }

  private async loadSharedWidget(): Promise<void> {
    if (!location.hash.startsWith('#widget=')) return;
    try {
      const model = await decodeWidgetShareHash(location.hash);
      if (!this.editorState.loadSharedWidget(model)) {
        this.shareLoadMessage.set('This shared widget is not a valid model.');
      }
    } catch {
      this.shareLoadMessage.set('This shared widget link could not be loaded.');
    }
  }

  protected dismissShareLoadMessage(): void {
    this.shareLoadMessage.set(null);
  }

  protected toggleDarkMode(): void {
    const darkMode = !this.darkMode();
    this.darkMode.set(darkMode);
    try {
      localStorage.setItem(themeStorageKey, darkMode ? 'dark' : 'light');
    } catch {
      // Ignore unavailable storage and keep the in-memory preference.
    }
  }

  protected loadSample(sampleId: string): void {
    this.editorState.loadSample(sampleId);
    this.widgetSampleId.set(sampleId);
  }

  protected openModelLoader(): void {
    this.isModelLoaderOpen.set(true);
  }

  protected closeModelLoader(): void {
    this.isModelLoaderOpen.set(false);
  }

  protected loadModel(model: WidgetInput): void {
    if (!this.editorState.loadWidgetModel(model)) return;
    this.widgetSampleId.set('');
    this.closeModelLoader();
  }

  protected addElement(type: WidgetElement['type']): void {
    this.editorState.addElement(type);
  }

  protected dragStart(event: DragEvent, type: WidgetElement['type']): void {
    event.dataTransfer?.setData('widget-element-type', type);
  }

  protected layerDragStart(event: DragEvent, id: string): void {
    event.dataTransfer?.setData('widget-layer-id', id);
  }

  protected reorderLayer(event: DragEvent, targetId: string): void {
    this.editorState.reorderLayer(event, targetId);
  }

  protected changeStack(change: { id: string; action: 'up' | 'down' | 'front' | 'back' }): void {
    this.editorState.changeStack(change);
  }

  protected dropElement(event: DragEvent): void {
    event.preventDefault();
    const type = event.dataTransfer?.getData('widget-element-type') as WidgetElement['type'];
    if (this.palette.some((item) => item.type === type)) this.editorState.addElement(type);
  }

  protected selectElement(id: string): void {
    this.selectedId.set(id);
  }

  protected selectWidget(): void {
    this.selectedId.set(null);
  }

  protected selectCanvasBackground(event: MouseEvent): void {
    if (event.target instanceof HTMLElement && event.target.classList.contains('canvas')) {
      this.selectWidget();
    }
  }

  protected clearLayers(): void {
    this.editorState.clearLayers();
  }

  protected deleteElement(id: string): void {
    this.editorState.deleteElement(id);
  }

  protected moveElement(position: { id: string; row: number; column: number }): void {
    this.editorState.moveElement(position);
  }

  protected resizeElement(size: { id: string; rowSpan?: number; columnSpan?: number }): void {
    this.editorState.resizeElement(size);
  }

  protected updateSpan(kind: 'rowSpan' | 'columnSpan', value: number): void {
    this.editorState.updateSpan(kind, value);
  }

  protected updatePosition(kind: 'row' | 'column', value: number): void {
    this.editorState.updatePosition(kind, value);
  }

  protected updateRadius(value: number): void {
    this.editorState.updateRadius(value);
  }

  protected updateWidget(patch: Partial<RendererWidget>): void {
    this.editorState.updateWidget(patch);
  }

  protected updateTrack(kind: 'rows' | 'columns', index: number, patch: GridTrackPatch): void {
    this.editorState.updateTrack(kind, index, patch);
  }

  protected addTrack(kind: 'rows' | 'columns'): void {
    this.editorState.addTrack(kind);
  }

  protected removeTrack(kind: 'rows' | 'columns', index: number): void {
    this.editorState.removeTrack(kind, index);
  }

  protected updateSelected(patch: Partial<WidgetElement>): void {
    this.editorState.updateSelected(patch);
  }

  protected onRefresh(): void {
    this.editorState.onRefresh();
  }

  protected openPreview(): void {
    this.editorState.openPreview();
  }

  protected async openShare(): Promise<void> {
    this.isShareOpen.set(true);
  }

  protected closeShare(): void {
    this.isShareOpen.set(false);
  }

  protected closePreview(): void {
    this.editorState.closePreview();
  }

  protected closeActionAlert(): void {
    this.editorState.closeActionAlert();
  }

  protected onDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.actionAlert()) {
      this.closeActionAlert();
    } else if (this.isPreviewOpen()) {
      this.closePreview();
    }
  }

  protected onAction(event: { element: ButtonElement; event: Event }): void {
    this.editorState.onAction(event);
  }
}

const themeStorageKey = 'widget-studio-theme';

function readThemePreference(): boolean {
  try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme === 'dark') return true;
    if (storedTheme === 'light') return false;
  } catch {
    // Fall back to the operating system preference.
  }
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}
