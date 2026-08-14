import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorCanvas } from './editor-canvas/editor-canvas';
import { ColorPicker } from './color-picker/color-picker';
import {
  ButtonElement,
  ImageElement,
  TextElement,
  Widget,
  WidgetElement,
  WidgetRenderer,
} from 'widget-renderer';
import { sampleWidget } from './sample-widget';

type ActionAlert =
  | {
      kind: 'action';
      element: ButtonElement;
      event: { type: string; target: string };
    }
  | {
      kind: 'refresh';
      label: string;
    };

@Component({
  selector: 'app-root',
  imports: [CommonModule, EditorCanvas, ColorPicker, WidgetRenderer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:click)': 'selectCanvasBackground($event)',
    '(document:keydown)': 'onDocumentKeyDown($event)',
  },
})
export class App {
  protected readonly widget = signal<Widget>(structuredClone(sampleWidget));
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
        elements: elements.map(({ id: _id, ...element }) => element),
      },
      null,
      2,
    );
  });
  protected readonly palette = [
    { type: 'text' as const, label: 'Text', icon: 'T', description: 'Formatted content' },
    { type: 'image' as const, label: 'Image', icon: '▧', description: 'Remote image' },
    { type: 'button' as const, label: 'Action', icon: '↗', description: 'GET or POST' },
  ];

  protected addElement(type: WidgetElement['type']): void {
    const id = `${type}-${Date.now()}`;
    const base = {
      id,
      type,
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
      sensitive: false,
      anchor: 'top left' as const,
    };
    const element: WidgetElement =
      type === 'text'
        ? ({
            ...base,
            type,
            text: 'New text',
            style: {
              color: '#f6f7fb',
              fontSize: 14,
              fontWeight: 400,
              italic: false,
              underline: false,
              strikethrough: false,
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
              anchor: 'center',
              overlayColor: undefined,
              radius: 8,
            } as ImageElement)
          : ({
              ...base,
              type,
              label: 'New action',
              method: 'get',
              url: '/',
              style: 'solid',
            } as ButtonElement);
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
    this.widget.update((widget) => {
      const elements = [...widget.elements];
      const sourceIndex = elements.findIndex((element) => element.id === sourceId);
      const targetIndex = elements.findIndex((element) => element.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return widget;
      const [source] = elements.splice(sourceIndex, 1);
      elements.splice(targetIndex, 0, source);
      return { ...widget, elements };
    });
  }
  protected changeStack(change: { id: string; action: 'up' | 'down' | 'front' | 'back' }): void {
    this.widget.update((widget) => {
      const elements = [...widget.elements];
      const index = elements.findIndex((element) => element.id === change.id);
      if (index < 0) return widget;
      const target =
        change.action === 'up'
          ? index + 1
          : change.action === 'down'
            ? index - 1
            : change.action === 'front'
              ? elements.length - 1
              : 0;
      if (target === index || target < 0 || target >= elements.length) return widget;
      const [element] = elements.splice(index, 1);
      elements.splice(target, 0, element);
      return { ...widget, elements };
    });
  }
  protected dropElement(event: DragEvent): void {
    event.preventDefault();
    const type = event.dataTransfer?.getData('widget-element-type') as WidgetElement['type'];
    if (type === 'text' || type === 'image' || type === 'button') this.addElement(type);
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
    this.widget.update((widget) => ({
      ...widget,
      elements: widget.elements.map((element) =>
        element.id === position.id
          ? { ...element, row: position.row, column: position.column }
          : element,
      ),
    }));
  }
  protected resizeElement(size: { id: string; rowSpan?: number; columnSpan?: number }): void {
    const { id, ...patch } = size;
    this.widget.update((widget) => ({
      ...widget,
      elements: widget.elements.map((element) =>
        element.id === id ? { ...element, ...patch } : element,
      ),
    }));
  }
  protected updateSpan(kind: 'rowSpan' | 'columnSpan', value: number): void {
    const element = this.selectedElement();
    if (!element) return;
    const limit =
      kind === 'rowSpan'
        ? this.widget().rows.length - element.row
        : this.widget().columns.length - element.column;
    this.updateSelected({ [kind]: Math.max(1, Math.min(limit, Math.round(value) || 1)) });
  }
  protected updatePosition(kind: 'row' | 'column', value: number): void {
    const maximum =
      kind === 'row' ? this.widget().rows.length - 1 : this.widget().columns.length - 1;
    this.updateSelected({ [kind]: Math.max(0, Math.min(maximum, Math.round(value) - 1)) });
  }
  protected updateRadius(value: number): void {
    this.updateSelected({ radius: Math.max(0, Math.round(value) || 0) });
  }
  protected updateWidget(patch: Partial<Widget>): void {
    this.widget.update((widget) => ({ ...widget, ...patch }));
  }
  protected updateTrack(
    kind: 'rows' | 'columns',
    index: number,
    patch: Partial<Widget['rows'][number]>,
  ): void {
    this.widget.update((widget) => ({
      ...widget,
      [kind]: widget[kind].map((track, trackIndex) =>
        trackIndex === index ? { ...track, ...patch } : track,
      ),
    }));
  }
  protected addTrack(kind: 'rows' | 'columns'): void {
    this.widget.update((widget) => ({
      ...widget,
      [kind]: [...widget[kind], { size: 1, unit: 'star' as const }],
    }));
  }
  protected removeTrack(kind: 'rows' | 'columns', index: number): void {
    if (this.widget()[kind].length <= 1) return;
    this.widget.update((widget) => ({
      ...widget,
      [kind]: widget[kind].filter((_, trackIndex) => trackIndex !== index),
      elements: widget.elements.map((element) => ({
        ...element,
        [kind === 'rows' ? 'row' : 'column']: Math.min(
          element[kind === 'rows' ? 'row' : 'column'],
          widget[kind].length - 2,
        ),
      })),
    }));
  }
  protected updateSelected(patch: Partial<WidgetElement>): void {
    const id = this.selectedId();
    if (!id) return;
    this.widget.update((widget) => ({
      ...widget,
      elements: widget.elements.map((element) =>
        element.id === id ? ({ ...element, ...patch } as WidgetElement) : element,
      ),
    }));
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
