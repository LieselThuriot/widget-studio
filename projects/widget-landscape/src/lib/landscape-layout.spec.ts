import { describe, expect, it } from 'vitest';
import {
  footprintFor,
  hasHorizontalOverflow,
  moveWidget,
  normalizeLandscapeState,
  placeWithPushDown,
  previewPlacement,
  reflowLandscapeState,
} from './landscape-layout';
import { landscapeFootprintForSize, LandscapeState } from './landscape.model';

const widget = (id: string, size: LandscapeState['widgets'][number]['size'] = 'mini') => ({
  id,
  size,
  row: 0,
  column: 0,
  widget: { id: `widget-${id}`, size } as never,
});

describe('landscape layout', () => {
  it('uses the stacked-square footprint for Banner widgets', () => {
    expect(landscapeFootprintForSize('banner')).toEqual({ columnSpan: 2, rowSpan: 4 });
  });

  it('uses compact footprints for the compact and tall sizes', () => {
    expect(landscapeFootprintForSize('compact')).toEqual({ columnSpan: 2, rowSpan: 1 });
    expect(landscapeFootprintForSize('tall')).toEqual({ columnSpan: 1, rowSpan: 2 });
  });

  it('uses the loaded widget size and falls back to the placement size while loading', () => {
    expect(
      footprintFor({ ...widget('loaded'), size: 'mini', widget: { size: 'wide' } as never }),
    ).toEqual({ columnSpan: 4, rowSpan: 2 });
    expect(footprintFor({ ...widget('loading'), size: 'wide', widget: null })).toEqual({
      columnSpan: 4,
      rowSpan: 2,
    });
  });

  it('uses loaded widget sizes when resolving collisions', () => {
    const normalized = normalizeLandscapeState({
      version: 1,
      columns: 4,
      responsive: false,
      widgets: [
        { ...widget('large'), size: 'mini', widget: { size: 'square' } as never },
        widget('small'),
      ],
    } as LandscapeState);

    expect(normalized.widgets.find(({ id }) => id === 'small')).toMatchObject({
      row: 0,
      column: 2,
    });
  });

  it('pushes overlapping widgets down', () => {
    const state = {
      version: 1,
      columns: 2,
      responsive: false,
      widgets: [widget('a'), widget('b')],
    } as LandscapeState;
    const moved = placeWithPushDown(state, 'b', 0, 0);
    expect(moved.widgets.map(({ id, row, column }) => ({ id, row, column }))).toEqual([
      { id: 'b', row: 0, column: 0 },
      { id: 'a', row: 0, column: 1 },
    ]);
  });

  it('uses the square footprint for unknown widget sizes', () => {
    const state = {
      version: 1,
      columns: 1,
      responsive: false,
      widgets: [widget('wide', 'square')],
    } as LandscapeState;
    expect(normalizeLandscapeState(state).widgets).toEqual([]);
  });

  it('preserves non-overlapping saved positions during normalization', () => {
    const state = {
      version: 1,
      columns: 8,
      responsive: false,
      widgets: [widget('first'), { ...widget('second'), row: 4, column: 5 }],
    } as LandscapeState;
    const normalized = normalizeLandscapeState(state);
    expect(normalized.widgets.map(({ id, row, column }) => ({ id, row, column }))).toEqual([
      { id: 'first', row: 0, column: 0 },
      { id: 'second', row: 4, column: 5 },
    ]);
  });

  it('detects overflow based on widget footprints instead of unused columns', () => {
    expect(hasHorizontalOverflow([widget('first'), widget('second')], 2)).toBe(false);
    expect(hasHorizontalOverflow([{ ...widget('wide', 'square'), column: 1 }], 2)).toBe(true);
  });

  it('packs widgets from the top-left for responsive layouts', () => {
    const state = {
      version: 1,
      columns: 2,
      responsive: true,
      widgets: [
        { ...widget('first'), row: 4, column: 1 },
        { ...widget('second'), row: 8, column: 0 },
      ],
    } as LandscapeState;

    const reflowed = reflowLandscapeState(state, 2);

    expect(reflowed.widgets.map(({ id, row, column }) => ({ id, row, column }))).toEqual([
      { id: 'first', row: 0, column: 0 },
      { id: 'second', row: 0, column: 1 },
    ]);
    expect(state.widgets.map(({ id, row, column }) => ({ id, row, column }))).toEqual([
      { id: 'first', row: 4, column: 1 },
      { id: 'second', row: 8, column: 0 },
    ]);
  });

  it('packs responsive widgets without overlapping their footprints', () => {
    const state = {
      version: 1,
      columns: 8,
      responsive: true,
      widgets: [
        { ...widget('wide', 'wide'), row: 6, column: 4 },
        { ...widget('tall', 'tall'), row: 2, column: 0 },
        { ...widget('square', 'square'), row: 10, column: 0 },
      ],
    } as LandscapeState;

    const reflowed = reflowLandscapeState(state, 4);

    expect(reflowed.widgets.map(({ id, row, column }) => ({ id, row, column }))).toEqual([
      { id: 'wide', row: 0, column: 0 },
      { id: 'tall', row: 2, column: 0 },
      { id: 'square', row: 2, column: 1 },
    ]);
  });

  it('recomputes a preview from the original state', () => {
    const state = {
      version: 1,
      columns: 2,
      responsive: false,
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
      responsive: false,
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
      responsive: false,
      widgets: [widget('dragged', 'square')],
    } as LandscapeState;
    const preview = previewPlacement(state, state.widgets[0], 0, 3);
    expect(preview?.widgets[0]).toMatchObject({ row: 0, column: 2 });
  });

  it('moves a widget by one cell and places overlapping widgets in the next available cell', () => {
    const state = {
      version: 1,
      columns: 2,
      responsive: false,
      widgets: [
        { ...widget('moving'), row: 0, column: 1 },
        { ...widget('other'), row: 1, column: 1 },
      ],
    } as LandscapeState;

    const moved = moveWidget(state, 'moving', 1, 0);

    expect(moved.widgets.find(({ id }) => id === 'moving')).toMatchObject({ row: 1, column: 1 });
    expect(moved.widgets.find(({ id }) => id === 'other')).toMatchObject({ row: 0, column: 0 });
    expect(moved.widgets.map(({ id }) => id)).toEqual(['moving', 'other']);
  });

  it('clamps keyboard movement to the landscape bounds', () => {
    const state = {
      version: 1,
      columns: 2,
      responsive: false,
      widgets: [{ ...widget('moving'), row: 0, column: 0 }],
    } as LandscapeState;

    expect(moveWidget(state, 'moving', -1, -1).widgets[0]).toMatchObject({ row: 0, column: 0 });
  });
});
