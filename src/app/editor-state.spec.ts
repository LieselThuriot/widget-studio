import { sampleWidget } from './sample-widget';
import {
  addTrack,
  changeElementStack,
  moveElement,
  normalizeWidget,
  patchElement,
  removeTrack,
  resizeElement,
  updateElementPosition,
  updateElementSpan,
} from './editor-state';
import { normalizeChartElement, normalizeGaugeElement } from './widget-normalization';

describe('editor state transformations', () => {
  it('clears an optional text background when patched as undefined', () => {
    const widget = structuredClone(sampleWidget);
    const withBackground = patchElement(widget, 'message', {
      style: { background: '#2563eb' } as never,
    });
    const cleared = patchElement(withBackground, 'message', {
      style: { background: undefined } as never,
    });
    const headline = cleared.elements.find((element) => element.id === 'message');

    expect(headline?.type).toBe('text');
    if (headline?.type === 'text') expect(headline.style.background).toBeUndefined();
  });

  it('patches only the requested element', () => {
    const widget = structuredClone(sampleWidget);
    const updated = patchElement(widget, 'message', { sensitive: true });

    expect(updated.elements.find((element) => element.id === 'message')?.sensitive).toBe(true);
    expect(updated.elements.find((element) => element.id === 'today-badge')?.sensitive).toBe(false);
  });

  it('preserves nested style fields when patching one style value', () => {
    const widget = structuredClone(sampleWidget);
    const updated = patchElement(widget, 'message', {
      style: { font: { bold: true } } as never,
    });
    const headline = updated.elements.find((element) => element.id === 'message');

    expect(headline?.type).toBe('text');
    if (headline?.type === 'text') {
      expect(headline.style.font.size).toBe(21);
      expect(headline.style.font.bold).toBe(true);
    }
  });

  it('clamps element position and span to the widget grid', () => {
    const widget = structuredClone(sampleWidget);
    const position = updateElementPosition(widget, 'message', 'row', 99);
    const element = position.elements.find((candidate) => candidate.id === 'message');
    const span = updateElementSpan(position, element!, 'rowSpan', 99);

    expect(element?.grid.row).toBe(5);
    expect(span.elements.find((candidate) => candidate.id === 'message')?.grid.rowSpan).toBe(1);
  });

  it('clamps element movement to the grid edges including its span', () => {
    const widget = structuredClone(sampleWidget);
    const updated = moveElement(widget, { id: 'message', row: 99, column: 99 });
    const element = updated.elements.find((candidate) => candidate.id === 'message');

    expect(element?.grid.row).toBe(5);
    expect(element?.grid.column).toBe(0);
  });

  it('keeps movement inside the grid when moving a smaller element', () => {
    const widget = structuredClone(sampleWidget);
    const updated = moveElement(widget, { id: 'message', row: 99, column: 99 });
    const element = updated.elements.find((candidate) => candidate.id === 'message');

    expect(element?.grid.row).toBe(5);
    expect(element?.grid.column).toBe(0);
  });

  it('clamps element resizing to one track and the remaining grid space', () => {
    const widget = structuredClone(sampleWidget);
    const updated = resizeElement(widget, { id: 'details', rowSpan: 99, columnSpan: 0 });
    const element = updated.elements.find((candidate) => candidate.id === 'details');

    expect(element?.grid.rowSpan).toBe(1);
    expect(element?.grid.columnSpan).toBe(1);
  });

  it('moves an element to the requested stack position', () => {
    const widget = structuredClone(sampleWidget);
    const updated = changeElementStack(widget, { id: 'message', action: 'front' });

    expect(updated.elements.at(-1)?.id).toBe('message');
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

    expect(expanded.rows).toHaveLength(7);
    expect(removed.rows).toHaveLength(6);
    expect(lastRemoved.rows).toHaveLength(5);
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
    const headline = widget.elements.find((element) => element.id === 'message');
    if (!headline) throw new Error('Expected message element');
    headline.grid = { ...headline.grid, column: 0, columnSpan: 4 };
    const updated = removeTrack(widget, 'columns', 1);

    expect(updated.elements.find((element) => element.id === 'details')?.grid.column).toBe(1);
    expect(updated.elements.find((element) => element.id === 'message')?.grid.columnSpan).toBe(3);
  });

  it('falls back to the first grid position for invalid coordinates', () => {
    const widget = structuredClone(sampleWidget);
    const updated = updateElementPosition(widget, 'message', 'row', Number.NaN);

    expect(updated.elements.find((element) => element.id === 'message')?.grid.row).toBe(0);
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
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
      });
    }
  });

  it('preserves current progress styles', () => {
    const widget = structuredClone(sampleWidget);
    widget.elements.push({
      id: 'legacy-progress',
      type: 'progress',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: false,
      title: 'Done',
      data: {
        min: 10,
        max: 90,
        items: [{ kind: 'segment', label: 'Done', value: 40, color: '#22c55e', active: false }],
      },
      style: {
        color: { legend: '#fff', title: '#eee', track: '#172033' },
        font: { size: 14 },
      },
    } as never);

    const progress = normalizeWidget(widget).elements.find(
      (element) => element.id === 'legacy-progress',
    );

    expect(progress?.type).toBe('progress');
    if (progress?.type === 'progress') {
      expect(progress.data).toEqual({
        min: 10,
        max: 90,
        items: [{ kind: 'segment', label: 'Done', value: 40, color: '#22c55e', active: false }],
      });
      expect(progress.style.color.track).toBe('#172033');
      expect(progress.style.color.title).toBe('#eee');
      expect(progress.title).toBe('Done');
      expect(progress.style.font.size).toBe(14);
      expect(progress.showLegend).toBeUndefined();
    }
  });

  it('preserves gauge and series chart styles', () => {
    const gauge = normalizeGaugeElement(
      {
        type: 'gauge',
        grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1, anchor: 'center' },
        sensitive: false,
        title: 'Gauge',
        showLegend: false,
        data: { value: 42, min: 0, max: 100 },
        style: {
          color: { legend: '#fff', title: '#eee', fill: '#0f0', track: '#000' },
          font: { size: 12 },
        },
      },
      { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    );
    const chart = normalizeChartElement(
      {
        type: 'bar',
        grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
        sensitive: false,
        title: 'Bar',
        showLegend: false,
        data: [{ label: 'A', value: 1 }],
        style: {
          color: { legend: '#fff', title: '#eee' },
          font: { size: 16 },
          axis: { label: '#aaa', line: '#bbb', grid: '#ccc' },
        },
      },
      { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    );

    expect(gauge.grid).not.toHaveProperty('anchor');
    expect(gauge.style.color.fill).toBe('#0f0');
    expect(chart.style.font.size).toBe(16);
    if ('axis' in chart.style) expect(chart.style.axis.grid).toBe('#ccc');
  });

  it('normalizes legacy grid coordinates and preserves chart anchor omission', () => {
    const widget = structuredClone(sampleWidget);
    const text = widget.elements[0] as unknown as Record<string, unknown>;
    delete text['grid'];
    text['row'] = 2;
    text['column'] = 1;
    text['rowSpan'] = 2;
    text['columnSpan'] = 2;
    text['anchor'] = 'bottom right';

    const normalized = normalizeWidget(widget);
    const normalizedText = normalized.elements[0];

    expect(normalizedText.grid).toMatchObject({
      row: 2,
      column: 1,
      rowSpan: 2,
      columnSpan: 2,
      anchor: 'bottom right',
    });
    expect(
      normalized.elements
        .filter((element) =>
          ['pie', 'donut', 'funnel', 'gauge', 'bar', 'line'].includes(element.type),
        )
        .every((element) => !('anchor' in element.grid)),
    ).toBe(true);
  });
});
