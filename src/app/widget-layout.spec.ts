import { gridTemplate } from 'widget-renderer';

describe('gridTemplate', () => {
  it('converts each grid unit to valid CSS syntax', () => {
    expect(
      gridTemplate([
        { size: 120, unit: 'pixel' },
        { size: 1, unit: 'star' },
        { size: 4, unit: 'auto' },
      ]),
    ).toBe('120px 1fr auto');
  });
});
