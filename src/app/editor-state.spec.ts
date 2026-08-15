import { sampleWidget } from './sample-widget';
import {
  addTrack,
  changeElementStack,
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

    expect(element?.row).toBe(2);
    expect(span.elements.find((candidate) => candidate.id === 'headline')?.rowSpan).toBe(1);
  });

  it('moves an element to the requested stack position', () => {
    const widget = structuredClone(sampleWidget);
    const updated = changeElementStack(widget, { id: 'headline', action: 'front' });

    expect(updated.elements.at(-1)?.id).toBe('headline');
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
});
