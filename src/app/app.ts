import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
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
import {
  WidgetLandscape,
  LandscapePaletteItem,
  LandscapeState,
  LandscapeStateChange,
  LandscapeWidget,
  LandscapeRefreshEvent,
  normalizeLandscapeState,
} from 'widget-landscape';

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
    WidgetLandscape,
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
  private readonly destroyRef = inject(DestroyRef);
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
  protected readonly activeTab = signal<'compose' | 'landscape'>('compose');
  protected readonly landscapeState = signal<LandscapeState>(readLandscapeState());
  protected readonly isLandscapeLoadingSimulation = signal(false);
  protected readonly landscapePalette: readonly LandscapePaletteItem[] = sampleWidgets.map(
    (sample) => ({
      id: sample.id,
      label: sample.name,
      description: sample.description,
      size: sample.id === 'broken-widget' ? null : sample.widget.size,
      createWidget: () => structuredClone(sample.widget),
    }),
  );
  private landscapeLoadingTimer: ReturnType<typeof setTimeout> | null = null;
  private landscapeLoadingQueue: LandscapeWidget[] = [];

  constructor() {
    this.destroyRef.onDestroy(() => this.stopLandscapeLoadingSimulation());
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

  protected selectTab(tab: 'compose' | 'landscape'): void {
    if (tab !== 'landscape') this.stopLandscapeLoadingSimulation();
    this.activeTab.set(tab);
  }

  protected saveLandscape(change: LandscapeStateChange): void {
    this.stopLandscapeLoadingSimulation();
    const savedChange = structuredClone(change);
    const savedState = landscapeStateFromPlacements(savedChange);
    this.landscapeState.set(savedState);
    try {
      localStorage.setItem(landscapeStorageKey, JSON.stringify(savedChange));
    } catch {
      // Keep the confirmed state in memory when storage is unavailable.
    }
    this.actionAlert.set({
      kind: 'landscape-confirm',
      state: structuredClone(savedChange),
    });
  }

  protected toggleLandscapeLoadingSimulation(): void {
    if (this.isLandscapeLoadingSimulation()) return;

    const widgetIds = this.landscapeState().widgets.map(({ id }) => id);
    if (!widgetIds.length) return;
    this.landscapeLoadingQueue = shuffle(this.landscapeState().widgets);
    this.landscapeState.update((state) => ({
      ...state,
      widgets: state.widgets.map((item) => ({ ...item, widget: null })),
    }));
    this.isLandscapeLoadingSimulation.set(true);
    this.scheduleNextLandscapeWidget();
  }

  private scheduleNextLandscapeWidget(): void {
    const nextWidget = this.landscapeLoadingQueue.shift();
    if (!nextWidget) {
      this.isLandscapeLoadingSimulation.set(false);
      return;
    }

    const delay = 300 + Math.floor(Math.random() * 901);
    this.landscapeLoadingTimer = setTimeout(() => {
      this.landscapeLoadingTimer = null;
      this.landscapeState.update((state) => ({
        ...state,
        widgets: state.widgets.map((item) =>
          item.id === nextWidget.id
            ? { ...item, widget: structuredClone(nextWidget.widget) }
            : item,
        ),
      }));
      this.scheduleNextLandscapeWidget();
    }, delay);
  }

  private stopLandscapeLoadingSimulation(): void {
    if (this.landscapeLoadingTimer !== null) clearTimeout(this.landscapeLoadingTimer);
    this.landscapeLoadingTimer = null;
    if (this.isLandscapeLoadingSimulation()) {
      this.landscapeState.update((state) => ({
        ...state,
        widgets: state.widgets.map((item) => {
          const sample = sampleWidgets.find(({ id }) => id === item.id);
          return sample && item.widget === null
            ? { ...item, widget: { ...structuredClone(sample.widget), size: item.size } }
            : item;
        }),
      }));
    }
    this.landscapeLoadingQueue = [];
    this.isLandscapeLoadingSimulation.set(false);
  }

  protected landscapeRefresh(event: LandscapeRefreshEvent): void {
    this.actionAlert.set({ kind: 'refresh', widgetId: event.id, label: event.label });
  }

  protected landscapeAction(event: { id: string; element: ButtonElement; event: Event }): void {
    this.onAction({ widgetId: event.id, element: event.element, event: event.event });
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

  protected onAction(event: { widgetId?: string; element: ButtonElement; event: Event }): void {
    this.editorState.onAction({ ...event, widgetId: event.widgetId ?? this.widget().id });
  }
}

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

const themeStorageKey = 'widget-studio-theme';
const landscapeStorageKey = 'widget-studio-landscape';

function defaultLandscapeState(): LandscapeState {
  return landscapeStateFromPlacements({
    version: 1,
    columns: 8,
    responsive: false,
    widgets: [
      { id: 'hydration', size: 'tall', row: 1, column: 4 },
      { id: 'holiday-balance', size: 'wide', row: 0, column: 0 },
      { id: 'clocked-in', size: 'wide', row: 3, column: 4 },
      { id: 'weather-snapshot', size: 'banner', row: 2, column: 2 },
      { id: 'payslip', size: 'square', row: 1, column: 5 },
      { id: 'hiring', size: 'compact', row: 2, column: 0 },
      { id: 'daily-brief', size: 'square', row: 3, column: 0 },
      { id: 'mini-pulse', size: 'mini', row: 0, column: 4 },
    ],
  });
}

function emptyLandscapeState(): LandscapeState {
  return { version: 1, columns: 8, responsive: false, widgets: [] };
}

function readLandscapeState(): LandscapeState {
  try {
    const storedState = localStorage.getItem(landscapeStorageKey);
    if (!storedState) return defaultLandscapeState();
    const parsed: unknown = JSON.parse(storedState);
    if (!isLandscapeStateChange(parsed)) return emptyLandscapeState();
    return landscapeStateFromPlacements(parsed);
  } catch {
    return emptyLandscapeState();
  }
}

function isLandscapeStateChange(value: unknown): value is LandscapeStateChange {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<LandscapeStateChange>;
  if (
    state.version !== 1 ||
    typeof state.columns !== 'number' ||
    (state.responsive !== undefined && typeof state.responsive !== 'boolean') ||
    !Array.isArray(state.widgets)
  ) {
    return false;
  }
  return state.widgets.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const placement = item as Partial<LandscapeStateChange['widgets'][number]>;
    return (
      typeof placement.id === 'string' &&
      isLandscapeWidgetSize(placement.size) &&
      typeof placement.row === 'number' &&
      typeof placement.column === 'number'
    );
  });
}

function isLandscapeWidgetSize(
  value: unknown,
): value is LandscapeStateChange['widgets'][number]['size'] {
  return (
    value === 'mini' ||
    value === 'compact' ||
    value === 'tall' ||
    value === 'square' ||
    value === 'wide' ||
    value === 'mega' ||
    value === 'banner' ||
    value === 'hero'
  );
}

function landscapeStateFromPlacements(change: LandscapeStateChange): LandscapeState {
  const widgets: LandscapeWidget[] = change.widgets.flatMap((placement) => {
    const sample = sampleWidgets.find(({ id }) => id === placement.id);
    if (!sample) return [];
    return [
      {
        id: sample.widget.id,
        size: placement.size,
        widget: { ...structuredClone(sample.widget), size: placement.size },
        row: placement.row,
        column: placement.column,
      },
    ];
  });
  return normalizeLandscapeState({
    version: 1,
    columns: change.columns,
    responsive: change.responsive ?? false,
    widgets,
  });
}

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
