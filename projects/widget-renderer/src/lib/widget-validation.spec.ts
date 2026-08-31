import { describe, expect, it } from 'vitest';
import { safeParseWidgetInput } from './widget-validation';

function widgetWithElement(element: Record<string, unknown>) {
  return {
    version: 2,
    id: 'validation-test',
    size: 'mini',
    rows: [{ size: 1, unit: 'star' }],
    columns: [{ size: 1, unit: 'star' }],
    background: {
      sensitive: false,
      repeat: false,
      size: 'auto',
      anchor: 'center',
    },
    elements: [element],
  };
}

const chartBase = {
  grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  sensitive: false,
  showLegend: true,
};

describe('widget validation', () => {
  it.each([
    ['pie', { data: [{ label: 'A', value: 1, color: '#0a0' }] }],
    ['donut', { data: [{ label: 'A', value: 1, color: '#0a0' }] }],
    ['funnel', { data: [{ label: 'A', value: 1, color: '#0a0' }] }],
    ['gauge', { data: { min: 0, max: 1, value: 0.5 } }],
    [
      'bar',
      {
        data: [{ label: 'A', value: 1, color: '#0a0' }],
        axis: { label: '#111', line: '#222', grid: '#333' },
      },
    ],
    [
      'line',
      {
        data: [{ label: 'A', value: 1 }],
        axis: { label: '#111', line: '#222', grid: '#333' },
      },
    ],
    ['progress', { data: { min: 0, max: 1, items: [] } }],
  ])('rejects scalar style.color for %s elements', (type, details) => {
    const { axis, ...elementDetails } = details as {
      data: unknown;
      axis?: Record<string, string>;
    };
    const result = safeParseWidgetInput(
      widgetWithElement({
        ...chartBase,
        ...elementDetails,
        type,
        style: { font: { size: 11 }, color: '#fff', ...(axis ? { axis } : {}) },
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual({
        path: 'elements[0].style.color',
        message: 'must be an object',
      });
    }
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an object', { segment: 2, track: 4 }],
  ])('accepts progress style.radius as %s', (_description, radius) => {
    const result = safeParseWidgetInput(
      widgetWithElement({
        ...chartBase,
        type: 'progress',
        data: { min: 0, max: 1, items: [] },
        style: {
          font: { size: 11 },
          color: { legend: '#111', title: '#222', track: '#ddd' },
          ...(radius === undefined ? {} : { radius }),
        },
      }),
    );

    expect(result).toMatchObject({ success: true });
  });
});
