import {
  createWidgetElement,
  defaultGaugeStyle,
  defaultGraphStyle,
} from './widget-element-factory';

describe('widget element factory', () => {
  it('creates the existing text and image defaults', () => {
    const text = createWidgetElement('text', 'text-id');
    const image = createWidgetElement('image', 'image-id');

    expect(text).toMatchObject({ id: 'text-id', type: 'text', text: 'New text' });
    expect(image).toMatchObject({
      id: 'image-id',
      type: 'image',
      fit: 'cover',
      radius: 8,
      grid: { anchor: 'center' },
    });
  });

  it('creates chart defaults without an anchor in the grid', () => {
    const gauge = createWidgetElement('gauge', 'gauge-id');
    const progress = createWidgetElement('progress', 'progress-id');

    expect(gauge).toMatchObject({
      id: 'gauge-id',
      type: 'gauge',
      title: 'Performance',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    });
    expect(gauge.grid).not.toHaveProperty('anchor');
    expect(progress).toMatchObject({
      id: 'progress-id',
      type: 'progress',
      showLegend: true,
      active: false,
    });
  });

  it('returns fresh default style objects', () => {
    expect(defaultGraphStyle()).toEqual(defaultGraphStyle());
    expect(defaultGaugeStyle()).toEqual(defaultGaugeStyle());
    expect(defaultGraphStyle()).not.toBe(defaultGraphStyle());
    expect(defaultGaugeStyle()).not.toBe(defaultGaugeStyle());
  });
});
