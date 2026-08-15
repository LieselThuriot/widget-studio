import { sampleWidget } from './sample-widget';
import {
  addTrack,
  changeElementStack,
  normalizeWidget,
  patchElement,
  removeTrack,
  updateElementPosition,
  updateElementSpan,
} from './editor-state';

describe('editor state transformations', () => {
  it('patches only the requested element', () => {
    const widget = structuredClone(sampleWidget);
    const updated = patchElement(widget, 'headline', { sensitive: true });

    expect(updated.elements.find((element) => element.id === 'headline')?.sensitive).toBe(true);
    expect(updated.elements.find((element) => element.id === 'message')?.sensitive).toBe(false);
  });

  it('clamps element position and span to the widget grid', () => {
    const widget = structuredClone(sampleWidget);
    const position = updateElementPosition(widget, 'headline', 'row', 99);
    const element = position.elements.find((candidate) => candidate.id === 'headline');
    const span = updateElementSpan(position, element!, 'rowSpan', 99);

    expect(element?.grid.row).toBe(2);
    expect(span.elements.find((candidate) => candidate.id === 'headline')?.grid.rowSpan).toBe(1);
  });

  it('moves an element to the requested stack position', () => {
    const widget = structuredClone(sampleWidget);
    const updated = changeElementStack(widget, { id: 'headline', action: 'front' });

    expect(updated.elements.at(-1)?.id).toBe('headline');
  });

  it('reorders layers without changing element data', () => {
    const widget = structuredClone(sampleWidget);
    const updated = changeElementStack(widget, { id: 'details', action: 'back' });

    expect(updated.elements[0].id).toBe('details');
    const details = updated.elements.find((element) => element.id === 'details');
    expect(details?.type).toBe('button');
    if (details?.type === 'button') expect(details.url).toBe('/brief');
  });

  it('adds tracks and keeps at least one track when removing', () => {
    const widget = structuredClone(sampleWidget);
    const expanded = addTrack(widget, 'rows');
    const removed = removeTrack(expanded, 'rows', 0);
    const lastRemoved = removeTrack(widget, 'rows', 0);

    expect(expanded.rows).toHaveLength(4);
    expect(removed.rows).toHaveLength(3);
    expect(lastRemoved.rows).toHaveLength(2);
  });

  it('repositions elements when a track is removed', () => {
    const widget = structuredClone(sampleWidget);
    const updated = removeTrack(widget, 'columns', 0);

    expect(updated.columns).toHaveLength(2);
    expect(updated.elements.find((element) => element.id === 'details')?.grid.column).toBe(1);
  });

  it('shifts later elements and clamps spans when removing a middle track', () => {
    const widget = structuredClone(sampleWidget);
    widget.columns.push({ size: 1, unit: 'star' });
    const headline = widget.elements.find((element) => element.id === 'headline');
    if (!headline) throw new Error('Expected headline element');
    headline.grid = { ...headline.grid, column: 0, columnSpan: 4 };
    const updated = removeTrack(widget, 'columns', 1);

    expect(updated.elements.find((element) => element.id === 'details')?.grid.column).toBe(1);
    expect(updated.elements.find((element) => element.id === 'headline')?.grid.columnSpan).toBe(3);
  });

  it('falls back to the first grid position for invalid coordinates', () => {
    const widget = structuredClone(sampleWidget);
    const updated = updateElementPosition(widget, 'headline', 'row', Number.NaN);

    expect(updated.elements.find((element) => element.id === 'headline')?.grid.row).toBe(0);
  });

  it('leaves the widget unchanged for unknown operations', () => {
    const widget = structuredClone(sampleWidget);

    expect(changeElementStack(widget, { id: 'missing', action: 'front' })).toBe(widget);
    expect(removeTrack(widget, 'rows', 99).rows).toHaveLength(widget.rows.length);
  });

  it('normalizes legacy text styles without a nested font', () => {
    const widget = structuredClone(sampleWidget);
    const text = widget.elements.find((element) => element.type === 'text');
    if (!text || text.type !== 'text') throw new Error('Expected a text element');

    (text as unknown as { style: Record<string, unknown> }).style = {
      color: '#fff',
      fontSize: 18,
      fontWeight: 700,
      italic: true,
      underline: true,
      strikethrough: true,
    };

    const normalized = normalizeWidget(widget);
    const normalizedText = normalized.elements.find((element) => element.type === 'text');

    expect(normalizedText?.type).toBe('text');
    if (normalizedText?.type === 'text') {
      expect(normalizedText.style.font).toEqual({
        size: 18,
        weight: 700,
        style: 'italic',
        decoration: 'underline line-through',
      });
    }
  });
});
