import { describe, expect, it } from 'vitest';
import { computeWidgetFingerprint, WIDGET_FINGERPRINT_VERSION } from './widget-fingerprint';
import { WidgetContract } from './widget.model';

function createWidget(): WidgetContract {
  return {
    version: 2,
    id: 'fingerprint-widget',
    size: 'wide',
    rows: [{ unit: 'auto' }, { size: 2.5, unit: 'star' }],
    columns: [{ size: 120, unit: 'pixel' }],
    background: {
      image: 'https://example.test/background.png',
      sensitive: false,
      repeat: false,
      color: '#101820',
      size: 'cover',
      anchor: 'center',
    },
    refresh: { enabled: true, label: 'Reload' },
    elements: [
      {
        type: 'text',
        grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
        sensitive: false,
        text: 'Hello',
        style: { color: '#ffffff', font: { size: 16 }, align: 'left', wrap: true },
      },
      {
        type: 'image',
        grid: { row: 1, column: 0, rowSpan: 1, columnSpan: 1 },
        sensitive: false,
        source: 'image.png',
        alt: 'An image',
        fit: 'cover',
        radius: 4,
      },
      {
        type: 'button',
        grid: { row: 1, column: 0, rowSpan: 1, columnSpan: 1, anchor: 'bottom right' },
        sensitive: false,
        label: 'Submit',
        method: 'post',
        url: '/submit',
        body: '{"ok":true}',
        style: 'solid',
      },
      {
        type: 'bar',
        grid: { row: 0, column: 0, rowSpan: 2, columnSpan: 1 },
        sensitive: false,
        title: 'Sales',
        showLegend: true,
        data: [{ label: 'A', value: 1, color: '#ff0000' }],
        style: {
          color: { legend: '#111111', title: '#222222', line: '#333333' },
          font: { size: 12 },
          axis: { label: '#444444', line: '#555555', grid: '#666666' },
        },
      },
    ],
  };
}

function fingerprintOf(mutate: (widget: WidgetContract) => void): string | null {
  const widget = createWidget();
  mutate(widget);
  return computeWidgetFingerprint(widget);
}

type ContractElement = WidgetContract['elements'][number];
type ElementOf<T extends ContractElement['type']> = ContractElement extends infer E
  ? E extends ContractElement
    ? T extends E['type']
      ? E
      : never
    : never
  : never;

function elementOf<T extends ContractElement['type']>(
  widget: WidgetContract,
  type: T,
): ElementOf<T> {
  return widget.elements.find((element) => element.type === type) as ElementOf<T>;
}

describe('computeWidgetFingerprint', () => {
  const baseline = computeWidgetFingerprint(createWidget());

  it('returns a versioned SHA-256 fingerprint', () => {
    expect(baseline).toMatch(new RegExp(`^wfp:${WIDGET_FINGERPRINT_VERSION}:[0-9a-f]{64}$`));
  });

  it('returns null for invalid widgets', () => {
    expect(computeWidgetFingerprint(null)).toBeNull();
    expect(computeWidgetFingerprint({ ...createWidget(), rows: [] })).toBeNull();
  });

  it('ignores visitor-specific content', () => {
    expect(
      fingerprintOf((widget) => {
        widget.id = 'other';
        widget.refresh = { enabled: true, label: 'Refresh now' };
        elementOf(widget, 'text').text = 'Hi, visitor';
        elementOf(widget, 'image').alt = 'Other alt';
        const button = elementOf(widget, 'button');
        button.label = 'Go';
        button.url = '/elsewhere';
        button.body = null;
        const bar = elementOf(widget, 'bar');
        bar.title = 'Revenue';
        bar.data = [
          { label: 'X', value: 5, color: '#0000ff' },
          { label: 'Y', value: 9, color: '#00ff00' },
        ];
      }),
    ).toBe(baseline);
  });

  it('ignores color casing and omitted defaults', () => {
    expect(
      fingerprintOf((widget) => {
        widget.background.color = '#101820'.toUpperCase();
        const text = elementOf(widget, 'text');
        text.style.padding = { vertical: 0, horizontal: 0 };
        text.style.font = { size: 16, bold: false };
        const button = elementOf(widget, 'button');
        Object.assign(button, { requestRefresh: false, showOnlyOnHover: false });
      }),
    ).toBe(baseline);
  });

  it.each<[string, (widget: WidgetContract) => void]>([
    ['text color', (widget) => (elementOf(widget, 'text').style.color = '#000000')],
    ['empty text', (widget) => (elementOf(widget, 'text').text = '  ')],
    ['image source', (widget) => (elementOf(widget, 'image').source = 'other.png')],
    ['background image', (widget) => delete widget.background.image],
    ['empty alt', (widget) => (elementOf(widget, 'image').alt = '')],
    [
      'button method',
      (widget) => Object.assign(elementOf(widget, 'button'), { method: 'get', body: null }),
    ],
    ['missing title', (widget) => delete elementOf(widget, 'bar').title],
    ['chart style', (widget) => (elementOf(widget, 'bar').style.font.size = 13)],
    ['grid position', (widget) => (widget.elements[0].grid.row = 1)],
    ['widget size', (widget) => (widget.size = 'square')],
    ['refresh button', (widget) => (widget.refresh = null)],
    ['element order', (widget) => widget.elements.reverse()],
  ])('changes when the %s changes', (_, mutate) => {
    const fingerprint = fingerprintOf(mutate);
    expect(fingerprint).not.toBeNull();
    expect(fingerprint).not.toBe(baseline);
  });
});
