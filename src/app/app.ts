import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetRenderer } from './widget-renderer/widget-renderer';
import { ButtonElement, ImageElement, TextElement, WidgetElement, WidgetV2, sampleWidget } from './widget-v2.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule, WidgetRenderer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly widget = signal<WidgetV2>(structuredClone(sampleWidget));
  protected readonly selectedId = signal<string | null>('headline');
  protected readonly selectedElement = computed(() => this.widget().elements.find((element) => element.id === this.selectedId()) ?? null);
  protected readonly modelJson = computed(() => JSON.stringify(this.widget(), null, 2));
  protected readonly palette = [
    { type: 'text' as const, label: 'Text', icon: 'T', description: 'Formatted content' },
    { type: 'image' as const, label: 'Image', icon: '▧', description: 'Remote image' },
    { type: 'button' as const, label: 'Action', icon: '↗', description: 'GET or POST' },
  ];

  protected addElement(type: WidgetElement['type']): void {
    const id = `${type}-${Date.now()}`;
    const base = { id, type, row: 0, column: 0, rowSpan: 1, columnSpan: 1, sensitive: false };
    const element: WidgetElement = type === 'text'
      ? { ...base, type, text: 'New text', style: { color: '#f6f7fb', fontSize: 14, fontWeight: 400, italic: false, underline: false, strikethrough: false, align: 'left', verticalAlign: 'center', wrap: true } } as TextElement
      : type === 'image'
        ? { ...base, type, imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400', alt: 'Widget image', fit: 'cover', radius: 8 } as ImageElement
        : { ...base, type, label: 'New action', method: 'get', url: '/', style: 'solid' } as ButtonElement;
    this.widget.update((widget) => ({ ...widget, elements: [...widget.elements, element] }));
    this.selectedId.set(id);
  }
  protected dragStart(event: DragEvent, type: WidgetElement['type']): void { event.dataTransfer?.setData('widget-element-type', type); }
  protected layerDragStart(event: DragEvent, id: string): void { event.dataTransfer?.setData('widget-layer-id', id); }
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
  protected dropElement(event: DragEvent): void {
    event.preventDefault();
    const type = event.dataTransfer?.getData('widget-element-type') as WidgetElement['type'];
    if (type === 'text' || type === 'image' || type === 'button') this.addElement(type);
  }

  protected selectElement(id: string): void { this.selectedId.set(id); }
  protected selectWidget(): void { this.selectedId.set(null); }
  protected deleteSelected(): void {
    const id = this.selectedId();
    if (!id) return;
    this.widget.update((widget) => ({ ...widget, elements: widget.elements.filter((element) => element.id !== id) }));
    this.selectedId.set(null);
  }
  protected deleteElement(id: string): void {
    this.widget.update((widget) => ({ ...widget, elements: widget.elements.filter((element) => element.id !== id) }));
    if (this.selectedId() === id) this.selectedId.set(null);
  }
  protected moveElement(position: { id: string; row: number; column: number }): void {
    this.widget.update((widget) => ({ ...widget, elements: widget.elements.map((element) => element.id === position.id ? { ...element, row: position.row, column: position.column } : element) }));
  }
  protected resizeElement(size: { id: string; rowSpan?: number; columnSpan?: number }): void {
    this.widget.update((widget) => ({ ...widget, elements: widget.elements.map((element) => element.id === size.id ? { ...element, ...size, id: element.id } : element) }));
  }
  protected updateSpan(kind: 'rowSpan' | 'columnSpan', value: number): void {
    const element = this.selectedElement();
    if (!element) return;
    const limit = kind === 'rowSpan' ? this.widget().rows.length - element.row : this.widget().columns.length - element.column;
    this.updateSelected({ [kind]: Math.max(1, Math.min(limit, Math.round(value) || 1)) });
  }
  protected updatePosition(kind: 'row' | 'column', value: number): void {
    const maximum = kind === 'row' ? this.widget().rows.length - 1 : this.widget().columns.length - 1;
    this.updateSelected({ [kind]: Math.max(0, Math.min(maximum, Math.round(value) - 1)) });
  }
  protected updateWidget(patch: Partial<WidgetV2>): void { this.widget.update((widget) => ({ ...widget, ...patch })); }
  protected updateTrack(kind: 'rows' | 'columns', index: number, patch: Partial<WidgetV2['rows'][number]>): void {
    this.widget.update((widget) => ({ ...widget, [kind]: widget[kind].map((track, trackIndex) => trackIndex === index ? { ...track, ...patch } : track) }));
  }
  protected addTrack(kind: 'rows' | 'columns'): void {
    this.widget.update((widget) => ({ ...widget, [kind]: [...widget[kind], { size: 1, unit: 'star' as const }] }));
  }
  protected removeTrack(kind: 'rows' | 'columns', index: number): void {
    if (this.widget()[kind].length <= 1) return;
    this.widget.update((widget) => ({ ...widget, [kind]: widget[kind].filter((_, trackIndex) => trackIndex !== index), elements: widget.elements.map((element) => ({ ...element, [kind === 'rows' ? 'row' : 'column']: Math.min(element[kind === 'rows' ? 'row' : 'column'], widget[kind].length - 2) })) }));
  }
  protected updateSelected(patch: Partial<WidgetElement>): void {
    const id = this.selectedId();
    if (!id) return;
    this.widget.update((widget) => ({ ...widget, elements: widget.elements.map((element) => element.id === id ? { ...element, ...patch } as WidgetElement : element) }));
  }
  protected onRefresh(): void { console.info('Widget refresh requested'); }
  protected onAction(event: { element: ButtonElement; event: Event }): void { event.event.preventDefault(); console.info(`${event.element.method.toUpperCase()} action requested`, event.element.url, event.element.body); }
}
