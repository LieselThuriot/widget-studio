import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioHeader } from './studio-header/studio-header';
import { ElementPalette } from './element-palette/element-palette';
import { LayerPanel } from './layer-panel/layer-panel';
import { CanvasWorkspace } from './canvas-workspace/canvas-workspace';
import { OutputContract } from './output-contract/output-contract';
import { PreviewDialog } from './preview-dialog/preview-dialog';
import { ActionAlert, EventAlertDialog } from './event-alert-dialog/event-alert-dialog';
import { SettingsPanel } from './settings-panel/settings-panel';
import {
  ButtonElement,
  ChartElement,
  GaugeElement,
  ImageElement,
  ProgressElement,
  SeriesElement,
  TextElement,
  Widget,
  WidgetElement,
  WidgetElementBase,
  GraphStyle,
  GaugeStyle,
} from 'widget-renderer';
import { sampleWidget } from './sample-widget';
import {
  addTrack,
  changeElementStack,
  patchElement,
  patchWidget,
  removeTrack,
  reorderElements,
  updateElementPosition,
  updateElementRadius,
  updateElementSpan,
  updateTrack,
} from './editor-state';
import { normalizeWidget } from './editor-state';

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
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:click)': 'selectCanvasBackground($event)',
    '(document:keydown)': 'onDocumentKeyDown($event)',
  },
})
export class App {
  protected readonly widget = signal<Widget>(normalizeWidget(structuredClone(sampleWidget)));
  protected readonly selectedId = signal<string | null>('headline');
  protected readonly isPreviewOpen = signal(false);
  protected readonly actionAlert = signal<ActionAlert | null>(null);
  protected readonly selectedElement = computed(
    () => this.widget().elements.find((element) => element.id === this.selectedId()) ?? null,
  );
  protected readonly modelJson = computed(() => {
    const { elements, ...publicWidget } = this.widget();
    return JSON.stringify(
      {
        ...publicWidget,
        elements: elements.map(({ id: _id, ...element }) => {
          if (
            element.type === 'pie' ||
            element.type === 'donut' ||
            element.type === 'gauge' ||
            element.type === 'bar' ||
            element.type === 'line'
          ) {
            return element;
          }
          return element;
        }),
      },
      null,
      2,
    );
  });
  protected readonly palette = [
    { type: 'text' as const, label: 'Text', icon: 'T', description: 'Formatted content' },
    { type: 'image' as const, label: 'Image', icon: '▧', description: 'Remote image' },
    { type: 'button' as const, label: 'Action', icon: '↗', description: 'GET or POST' },
    { type: 'pie' as const, label: 'Pie', icon: '◔', description: 'Part-to-whole' },
    { type: 'donut' as const, label: 'Donut', icon: '◉', description: 'Part-to-whole' },
    { type: 'gauge' as const, label: 'Gauge', icon: '◌', description: 'Single value' },
    { type: 'bar' as const, label: 'Bar', icon: '▥', description: 'Compare values' },
    { type: 'line' as const, label: 'Line', icon: '⌁', description: 'Show a trend' },
    { type: 'progress' as const, label: 'Progress', icon: '▰', description: 'Completion value' },
  ];

  protected addElement(type: WidgetElement['type']): void {
    const id = `${type}-${Date.now()}`;
    const base = {
      id,
      type,
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1, anchor: 'top left' as const },
      sensitive: false,
    };
    const element: WidgetElement =
      type === 'text'
        ? ({
            ...base,
            type,
            text: 'New text',
            style: {
              color: '#f6f7fb',
              font: { size: 14, weight: 400, style: 'normal', decoration: 'none' },
              align: 'left',
              wrap: true,
            },
          } as TextElement)
        : type === 'image'
          ? ({
              ...base,
              type,
              source: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400',
              alt: 'Widget image',
              fit: 'cover',
              grid: { ...base.grid, anchor: 'center' as const },
              overlayColor: undefined,
              radius: 8,
            } as ImageElement)
          : type === 'button'
            ? ({
                ...base,
                type,
                label: 'New action',
                method: 'get',
                url: '/',
                style: 'solid',
              } as ButtonElement)
            : this.newChartElement(type, base);
    this.widget.update((widget) => ({ ...widget, elements: [...widget.elements, element] }));
    this.selectedId.set(id);
  }
  protected dragStart(event: DragEvent, type: WidgetElement['type']): void {
    event.dataTransfer?.setData('widget-element-type', type);
  }
  protected layerDragStart(event: DragEvent, id: string): void {
    event.dataTransfer?.setData('widget-layer-id', id);
  }
  protected reorderLayer(event: DragEvent, targetId: string): void {
    event.preventDefault();
    const sourceId = event.dataTransfer?.getData('widget-layer-id');
    if (!sourceId || sourceId === targetId) return;
    this.widget.update((widget) => reorderElements(widget, sourceId, targetId));
  }
  protected changeStack(change: { id: string; action: 'up' | 'down' | 'front' | 'back' }): void {
    this.widget.update((widget) => changeElementStack(widget, change));
  }
  protected dropElement(event: DragEvent): void {
    event.preventDefault();
    const type = event.dataTransfer?.getData('widget-element-type') as WidgetElement['type'];
    if (this.palette.some((item) => item.type === type)) this.addElement(type);
  }

  private newChartElement(
    type: Exclude<WidgetElement['type'], 'text' | 'image' | 'button'>,
    base: Omit<WidgetElementBase, 'type'>,
  ): ChartElement | ProgressElement {
    const data = [
      { label: 'Complete', value: 72, color: '#7dd3fc' },
      { label: 'Remaining', value: 28, color: '#334155' },
    ];
    if (type === 'progress') {
      return {
        ...base,
        type,
        data: { label: 'Progress', value: 72, min: 0, max: 100 },
        style: {
          color: { legend: '#f6f7fb', fill: '#7dd3fc', track: '#334155' },
          font: { size: 11 },
        },
        showLegend: true,
        active: false,
      } as ProgressElement;
    }
    if (type === 'gauge') {
      return {
        ...base,
        grid: {
          row: base.grid.row,
          column: base.grid.column,
          rowSpan: base.grid.rowSpan,
          columnSpan: base.grid.columnSpan,
        },
        type,
        title: 'Performance',
        data: { value: 72, min: 0, max: 100 },
        showLegend: true,
        style: this.gaugeStyle(),
      } as GaugeElement;
    }
    return {
      ...base,
      grid: {
        row: base.grid.row,
        column: base.grid.column,
        rowSpan: base.grid.rowSpan,
        columnSpan: base.grid.columnSpan,
      },
      type,
      title: type === 'line' ? 'Trend' : 'Overview',
      data,
      showLegend: type === 'pie' || type === 'donut',
      style: this.graphStyle(),
    } as SeriesElement;
  }

  private graphStyle(): GraphStyle {
    return {
      color: {
        legend: '#f6f7fb',
        title: '#f6f7fb',
      },
      font: { size: 11 },
      axis: { label: '#d4dbea', line: '#94a3b8', grid: '#475569' },
    };
  }

  private gaugeStyle(): GaugeStyle {
    return {
      color: {
        legend: '#f6f7fb',
        title: '#f6f7fb',
        fill: '#7dd3fc',
        track: '#334155',
      },
      font: { size: 11 },
    };
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
    this.widget.update((widget) => ({ ...widget, elements: [] }));
    this.selectedId.set(null);
  }
  protected deleteElement(id: string): void {
    this.widget.update((widget) => ({
      ...widget,
      elements: widget.elements.filter((element) => element.id !== id),
    }));
    if (this.selectedId() === id) this.selectedId.set(null);
  }
  protected moveElement(position: { id: string; row: number; column: number }): void {
    this.widget.update((widget) =>
      patchElement(widget, position.id, {
        grid: {
          ...widget.elements.find((element) => element.id === position.id)!.grid,
          row: position.row,
          column: position.column,
        },
      }),
    );
  }
  protected resizeElement(size: { id: string; rowSpan?: number; columnSpan?: number }): void {
    const { id, ...patch } = size;
    this.widget.update((widget) => {
      const element = widget.elements.find((candidate) => candidate.id === id);
      return element ? patchElement(widget, id, { grid: { ...element.grid, ...patch } }) : widget;
    });
  }
  protected updateSpan(kind: 'rowSpan' | 'columnSpan', value: number): void {
    const element = this.selectedElement();
    if (!element) return;
    this.widget.update((widget) => updateElementSpan(widget, element, kind, value));
  }
  protected updatePosition(kind: 'row' | 'column', value: number): void {
    const id = this.selectedId();
    if (!id) return;
    this.widget.update((widget) => updateElementPosition(widget, id, kind, value));
  }
  protected updateRadius(value: number): void {
    const id = this.selectedId();
    if (!id) return;
    this.widget.update((widget) => updateElementRadius(widget, id, value));
  }
  protected updateWidget(patch: Partial<Widget>): void {
    this.widget.update((widget) => patchWidget(widget, patch));
  }
  protected updateTrack(
    kind: 'rows' | 'columns',
    index: number,
    patch: Partial<Widget['rows'][number]>,
  ): void {
    this.widget.update((widget) => updateTrack(widget, kind, index, patch));
  }
  protected addTrack(kind: 'rows' | 'columns'): void {
    this.widget.update((widget) => addTrack(widget, kind));
  }
  protected removeTrack(kind: 'rows' | 'columns', index: number): void {
    this.widget.update((widget) => removeTrack(widget, kind, index));
  }
  protected updateSelected(patch: Partial<WidgetElement>): void {
    const id = this.selectedId();
    if (!id) return;
    this.widget.update((widget) => patchElement(widget, id, patch));
  }
  protected onRefresh(): void {
    this.actionAlert.set({ kind: 'refresh', label: this.widget().refresh.label });
  }
  protected openPreview(): void {
    this.isPreviewOpen.set(true);
  }
  protected closePreview(): void {
    this.isPreviewOpen.set(false);
  }
  protected closeActionAlert(): void {
    this.actionAlert.set(null);
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
    event.event.preventDefault();
    const target = event.event.target;
    this.actionAlert.set({
      kind: 'action',
      element: event.element,
      event: {
        type: event.event.type,
        target: target instanceof HTMLElement ? target.outerHTML : String(target),
      },
    });
  }
}
