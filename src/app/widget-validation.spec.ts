import { parseWidgetInput, safeParseWidgetInput } from 'widget-renderer';
import { WidgetContract } from 'widget-renderer';

const validContract: WidgetContract = {
  version: 2,
  size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: { sensitive: false, repeat: false, size: 'auto', anchor: 'center' },
  refresh: { enabled: false, label: 'Refresh' },
  elements: [],
};

describe('widget contract validation', () => {
  it('accepts a valid API contract', () => {
    const result = safeParseWidgetInput(validContract);

    expect(result).toEqual({ success: true, data: validContract });
  });

  it('reports actionable paths for malformed contracts', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      rows: [{ size: 0, unit: 'invalid' }],
      elements: [{ type: 'unknown' }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.map((issue) => issue.path)).toEqual(
        expect.arrayContaining(['rows[0].unit', 'elements[0].type']),
      );
    }
  });

  it('rejects invalid ranges and duplicate IDs', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          id: 'same',
          type: 'gauge',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          title: 'Gauge',
          showLegend: true,
          data: { value: 2, min: 10, max: 1 },
          style: {
            color: { legend: '#fff', title: '#fff', fill: '#0ff', track: '#000' },
            font: { size: 11 },
          },
        },
        {
          id: 'same',
          type: 'text',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          text: 'Duplicate',
          style: { color: '#fff', font: { size: 11 }, align: 'left', wrap: true },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.map((issue) => issue.path)).toEqual(
        expect.arrayContaining(['elements["same"].data', 'elements["same"].id']),
      );
    }
  });

  it('allows optional IDs and uses an ID in nested issue paths', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          id: 'headline.primary',
          type: 'text',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          text: 'Headline',
          style: { color: '#fff', font: { size: 0 }, align: 'left', wrap: true },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.map((issue) => issue.path)).toContain(
        'elements["headline.primary"].style.font.size',
      );
    }
  });

  it('accepts null and empty IDs as missing IDs', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          id: null,
          type: 'text',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          text: 'First',
          style: { color: '#fff', font: { size: 11 }, align: 'left', wrap: true },
        },
        {
          id: '',
          type: 'text',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          text: 'Second',
          style: { color: '#fff', font: { size: 11 }, align: 'left', wrap: true },
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('throws a validation error from the throwing parser', () => {
    expect(() => parseWidgetInput(null)).toThrow(/must be an object/);
  });
});
