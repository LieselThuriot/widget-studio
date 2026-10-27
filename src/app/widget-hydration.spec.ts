import { normalizeWidgetInput, WidgetContract } from '@lieselthuriot/widget-renderer';

const contract: WidgetContract = {
  version: 2,
  id: 'hydration-test',
  size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: {
    color: '#101827',
    sensitive: false,
    repeat: false,
    size: 'cover',
    anchor: 'center',
  },
  refresh: { enabled: false, label: 'Refresh widget' },
  elements: [
    {
      type: 'text',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: false,
      text: 'Hello',
      style: {
        color: '#fff',
        font: { size: 14 },
        align: 'left',
        wrap: true,
      },
    },
  ],
};

describe('normalizeWidgetInput', () => {
  it('normalizes without adding internal IDs or changing the API payload', () => {
    const normalized = normalizeWidgetInput(contract);

    expect(contract.elements[0]).not.toHaveProperty('id');
    expect(normalized.elements[0]).not.toHaveProperty('id');
    expect(normalized.elements[0].type).toBe('text');
  });

  it('keeps auto tracks without adding a size', () => {
    const normalized = normalizeWidgetInput({ ...contract, rows: [{ unit: 'auto' }] });

    expect(normalized.rows).toEqual([{ unit: 'auto' }]);
  });
});
