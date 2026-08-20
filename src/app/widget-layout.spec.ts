import { gridTemplate, widgetHeight, widgetWidth } from 'widget-renderer';
import { trackAt } from './editor-canvas/editor-canvas-interaction';

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

describe('widget dimensions', () => {
  it.each([
    ['mini', 133, 123],
    ['square', 265, 245],
    ['wide', 530, 245],
    ['mega', 530, 490],
    ['hero', 1060, 490],
  ] as const)('maps %s to its dimensions', (size, width, height) => {
    expect(widgetWidth(size)).toBe(width);
    expect(widgetHeight(size)).toBe(height);
  });
});

describe('trackAt', () => {
  it('uses resolved auto track sizes when provided', () => {
    const tracks = [
      { size: 1, unit: 'star' as const },
      { size: 1, unit: 'auto' as const },
      { size: 1, unit: 'star' as const },
    ];

    expect(trackAt(80, tracks, 229, 1, [40, 90, 75])).toBe(1);
    expect(trackAt(170, tracks, 229, 1, [40, 90, 75])).toBe(2);
  });
});
