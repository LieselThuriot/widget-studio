import { describe, expect, it } from 'vitest';
import { normalizeLandscapeState, placeWithPushDown, previewPlacement } from './landscape-layout';
import { LandscapeState } from './landscape.model';

const widget = (id: string, size: 'mini' | 'square' = 'mini') => ({
  id,
  size,
  row: 0,
  column: 0,
  widget: { id: `widget-${id}`, size } as never,
});

describe('landscape layout', () => {
  it('pushes overlapping widgets down', () => {
    const state = { version: 1, columns: 2, widgets: [widget('a'), widget('b')] } as LandscapeState;
    const moved = placeWithPushDown(state, 'b', 0, 0);
    expect(moved.widgets.map(({ id, row, column }) => ({ id, row, column }))).toEqual([
      { id: 'b', row: 0, column: 0 },
      { id: 'a', row: 0, column: 1 },
    ]);
  });

  it('uses the square footprint for unknown widget sizes', () => {
    const state = { version: 1, columns: 1, widgets: [widget('wide', 'square')] } as LandscapeState;
    expect(normalizeLandscapeState(state).widgets).toEqual([]);
  });

  it('preserves non-overlapping saved positions during normalization', () => {
    const state = {
      version: 1,
      columns: 8,
      widgets: [widget('first'), { ...widget('second'), row: 4, column: 5 }],
    } as LandscapeState;
    const normalized = normalizeLandscapeState(state);
    expect(normalized.widgets.map(({ id, row, column }) => ({ id, row, column }))).toEqual([
      { id: 'first', row: 0, column: 0 },
      { id: 'second', row: 4, column: 5 },
    ]);
  });

  it('recomputes a preview from the original state', () => {
    const state = {
      version: 1,
      columns: 2,
      widgets: [widget('a'), widget('b')],
    } as LandscapeState;
    const preview = previewPlacement(state, state.widgets[1], 0, 0);
    expect(preview?.widgets.map(({ id, row, column }) => ({ id, row, column }))).toEqual([
      { id: 'b', row: 0, column: 0 },
      { id: 'a', row: 0, column: 1 },
    ]);
  });

  it('keeps the dragged widget at the requested target while displacing the underlying widget', () => {
    const state = {
      version: 1,
      columns: 2,
      widgets: [widget('underneath'), widget('dragged')],
    } as LandscapeState;
    const preview = previewPlacement(state, state.widgets[1], 0, 0);
    expect(preview?.widgets.find(({ id }) => id === 'dragged')).toMatchObject({
      row: 0,
      column: 0,
    });
    expect(preview?.widgets.find(({ id }) => id === 'underneath')).toMatchObject({
      row: 0,
      column: 1,
    });
  });

  it('clamps a preview to the dragged widget footprint', () => {
    const state = {
      version: 1,
      columns: 4,
      widgets: [widget('dragged', 'square')],
    } as LandscapeState;
    const preview = previewPlacement(state, state.widgets[0], 0, 3);
    expect(preview?.widgets[0]).toMatchObject({ row: 0, column: 2 });
  });
});
