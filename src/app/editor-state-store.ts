import { computed, signal } from '@angular/core';
import { ActionAlert } from './event-alert-dialog/event-alert-dialog';
import { createWidgetElement } from './widget-element-factory';
import {
  addTrack,
  changeElementStack,
  moveElement,
  patchElement,
  patchWidget,
  removeTrack,
  reorderElements,
  resizeElement,
  updateElementPosition,
  updateElementRadius,
  updateElementSpan,
  updateTrack,
} from './editor-state';
import { assignEditorIds, normalizeWidget } from './widget-normalization';
import { sampleWidgets } from './sample-widget';
import { ButtonElement, Widget, WidgetElement } from 'widget-renderer';

export class EditorStateStore {
  readonly widget = signal<Widget>(normalizeWidget(structuredClone(sampleWidgets[0].widget)));
  readonly selectedId = signal<string | null>('headline');
  readonly isPreviewOpen = signal(false);
  readonly actionAlert = signal<ActionAlert | null>(null);
  readonly selectedElement = computed(
    () => this.widget().elements.find((element) => element.id === this.selectedId()) ?? null,
  );
  readonly modelJson = computed(() => {
    const { elements, ...publicWidget } = this.widget();
    return JSON.stringify(
      {
        ...publicWidget,
        elements: elements.map(({ id: _id, ...element }) => {
          if (element.type === 'divider') {
            const { sensitive: _sensitive, ...publicDivider } = element;
            return publicDivider;
          }
          return element;
        }),
      },
      null,
      2,
    );
  });

  loadSample(sampleId: string): void {
    const sample = sampleWidgets.find((candidate) => candidate.id === sampleId);
    if (!sample) return;
    const widget = normalizeWidget(structuredClone(sample.widget));
    this.widget.set(widget);
    this.selectedId.set(widget.elements[0]?.id ?? null);
    this.isPreviewOpen.set(false);
    this.actionAlert.set(null);
  }

  loadSharedWidget(value: unknown): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const widget = value as Widget;
    if (!Array.isArray(widget.elements)) return false;
    if (!widget.elements.every((element) => element && typeof element === 'object')) return false;
    const importedWidget = assignEditorIds(widget);
    this.widget.set(importedWidget);
    this.selectedId.set(importedWidget.elements[0]?.id ?? null);
    this.isPreviewOpen.set(false);
    this.actionAlert.set(null);
    return true;
  }

  addElement(type: WidgetElement['type']): void {
    const id = `${type}-${crypto.randomUUID()}`;
    const element = createWidgetElement(type, id, this.widget().background.color);
    this.widget.update((widget) => ({ ...widget, elements: [...widget.elements, element] }));
    this.selectedId.set(id);
  }

  reorderLayer(event: DragEvent, targetId: string): void {
    event.preventDefault();
    const sourceId = event.dataTransfer?.getData('widget-layer-id');
    if (!sourceId || sourceId === targetId) return;
    this.widget.update((widget) => reorderElements(widget, sourceId, targetId));
  }

  changeStack(change: { id: string; action: 'up' | 'down' | 'front' | 'back' }): void {
    this.widget.update((widget) => changeElementStack(widget, change));
  }

  clearLayers(): void {
    this.widget.update((widget) => ({ ...widget, elements: [] }));
    this.selectedId.set(null);
  }

  deleteElement(id: string): void {
    this.widget.update((widget) => ({
      ...widget,
      elements: widget.elements.filter((element) => element.id !== id),
    }));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  moveElement(position: { id: string; row: number; column: number }): void {
    this.widget.update((widget) => moveElement(widget, position));
  }

  resizeElement(size: { id: string; rowSpan?: number; columnSpan?: number }): void {
    this.widget.update((widget) => resizeElement(widget, size));
  }

  updateSpan(kind: 'rowSpan' | 'columnSpan', value: number): void {
    const element = this.selectedElement();
    if (!element) return;
    this.widget.update((widget) => updateElementSpan(widget, element, kind, value));
  }

  updatePosition(kind: 'row' | 'column', value: number): void {
    const id = this.selectedId();
    if (!id) return;
    this.widget.update((widget) => updateElementPosition(widget, id, kind, value));
  }

  updateRadius(value: number): void {
    const id = this.selectedId();
    if (!id) return;
    this.widget.update((widget) => updateElementRadius(widget, id, value));
  }

  updateWidget(patch: Partial<Widget>): void {
    this.widget.update((widget) => patchWidget(widget, patch));
  }

  updateTrack(
    kind: 'rows' | 'columns',
    index: number,
    patch: Partial<Widget['rows'][number]>,
  ): void {
    this.widget.update((widget) => updateTrack(widget, kind, index, patch));
  }

  addTrack(kind: 'rows' | 'columns'): void {
    this.widget.update((widget) => addTrack(widget, kind));
  }

  removeTrack(kind: 'rows' | 'columns', index: number): void {
    this.widget.update((widget) => removeTrack(widget, kind, index));
  }

  updateSelected(patch: Partial<WidgetElement>): void {
    const id = this.selectedId();
    if (!id) return;
    this.widget.update((widget) => patchElement(widget, id, patch));
  }

  onRefresh(): void {
    this.actionAlert.set({ kind: 'refresh', label: this.widget().refresh.label });
  }

  openPreview(): void {
    this.isPreviewOpen.set(true);
  }

  closePreview(): void {
    this.isPreviewOpen.set(false);
  }

  closeActionAlert(): void {
    this.actionAlert.set(null);
  }

  onAction(event: { element: ButtonElement; event: Event }): void {
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
