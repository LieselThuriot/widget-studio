import { hydrateWidget, WidgetContract } from 'widget-renderer';

const contract: WidgetContract = {
  version: 2,
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

describe('hydrateWidget', () => {
  it('adds internal IDs without changing the API payload', () => {
    const hydrated = hydrateWidget(contract);

    expect(contract.elements[0]).not.toHaveProperty('id');
    expect(hydrated.elements[0].id).toMatch(/^text-/);
    expect(hydrated.elements[0].type).toBe('text');
  });

  it('retains IDs for unchanged element positions and types', () => {
    const first = hydrateWidget(contract);
    const second = hydrateWidget(structuredClone(contract), first);

    expect(second.elements[0].id).toBe(first.elements[0].id);
  });

  it('creates a new ID when an element type changes', () => {
    const first = hydrateWidget(contract);
    const changed = structuredClone(contract);
    changed.elements[0] = {
      type: 'button',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: false,
      label: 'Open',
      method: 'get',
      url: '/',
      style: 'solid',
    };

    const second = hydrateWidget(changed, first);

    expect(second.elements[0].id).not.toBe(first.elements[0].id);
  });

  it('preserves API-provided IDs when elements reorder', () => {
    const first = hydrateWidget({
      ...contract,
      elements: [
        { ...contract.elements[0], id: 'headline' },
        { ...contract.elements[0], id: 'summary' },
      ],
    });
    const reordered = hydrateWidget(
      {
        ...contract,
        elements: [
          { ...contract.elements[0], id: 'summary' },
          { ...contract.elements[0], id: 'headline' },
        ],
      },
      first,
    );

    expect(reordered.elements.map((element) => element.id)).toEqual(['summary', 'headline']);
  });

  it('generates IDs for elements without public IDs', () => {
    const hydrated = hydrateWidget(contract);

    expect(hydrated.elements[0].id).toMatch(/^text-/);
    expect(contract.elements[0]).not.toHaveProperty('id');
  });
});
