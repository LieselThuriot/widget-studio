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
    const pie = createWidgetElement('pie', 'pie-id');
    const donut = createWidgetElement('donut', 'donut-id');
    const bar = createWidgetElement('bar', 'bar-id');

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
    expect(pie).toMatchObject({ id: 'pie-id', type: 'pie', title: 'Distribution' });
    expect(donut).toMatchObject({ id: 'donut-id', type: 'donut', title: 'Composition' });
    expect((pie as { style: object }).style).not.toHaveProperty('axis');
    expect((donut as { style: object }).style).not.toHaveProperty('axis');
    expect(bar).toMatchObject({ id: 'bar-id', type: 'bar', title: 'Comparison' });
  });

  it('uses text colors that contrast with the widget background', () => {
    const lightGauge = createWidgetElement('gauge', 'light-gauge', '#edf4ef');
    const darkGauge = createWidgetElement('gauge', 'dark-gauge', '#101827');
    const lightText = createWidgetElement('text', 'light-text', '#edf4ef');

    expect(lightGauge).toMatchObject({ style: { color: { title: '#172033', legend: '#172033' } } });
    expect(darkGauge).toMatchObject({ style: { color: { title: '#f6f7fb', legend: '#f6f7fb' } } });
    expect(lightText).toMatchObject({ style: { color: '#172033' } });
  });

  it('creates a horizontal divider default', () => {
    expect(createWidgetElement('divider', 'divider-id')).toMatchObject({
      id: 'divider-id',
      type: 'divider',
      orientation: 'horizontal',
      style: { color: '#64748b' },
      grid: { anchor: 'center' },
    });
  });

  it('returns fresh default style objects', () => {
    expect(defaultGraphStyle()).toEqual(defaultGraphStyle());
    expect(defaultGaugeStyle()).toEqual(defaultGaugeStyle());
    expect(defaultGraphStyle()).not.toBe(defaultGraphStyle());
    expect(defaultGaugeStyle()).not.toBe(defaultGaugeStyle());
  });
});
