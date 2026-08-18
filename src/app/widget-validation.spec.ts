import { hydrateWidget, parseWidgetInput, safeParseWidgetInput } from 'widget-renderer';
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

  it('accepts an empty background image URL', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      background: {
        ...validContract.background,
        color: '#101827',
        image: '',
        overlayColor: '#101827b8',
      },
    });

    expect(result.success).toBe(true);
  });

  it('accepts a divider contract without sensitive', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          type: 'divider',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1, anchor: 'center' },
          orientation: 'horizontal',
          style: { color: '#64748b' },
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('validates button request bodies and refresh settings', () => {
    const button = {
      type: 'button' as const,
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: false,
      label: 'Submit',
      method: 'post' as const,
      url: '/submit',
      body: '{}',
      requestRefresh: true,
      showOnlyOnHover: false,
      style: 'solid' as const,
    };

    expect(safeParseWidgetInput({ ...validContract, elements: [button] }).success).toBe(true);
    expect(
      safeParseWidgetInput({ ...validContract, elements: [{ ...button, method: 'get' }] }).success,
    ).toBe(false);
    expect(
      safeParseWidgetInput({
        ...validContract,
        elements: [{ ...button, method: 'get', body: null }],
      }).success,
    ).toBe(true);
    expect(
      safeParseWidgetInput({ ...validContract, elements: [{ ...button, requestRefresh: 'yes' }] })
        .success,
    ).toBe(false);
    expect(
      safeParseWidgetInput({ ...validContract, elements: [{ ...button, showOnlyOnHover: 'yes' }] })
        .success,
    ).toBe(false);
  });

  it('accepts omitted button display flags and hydrates them as false', () => {
    const button = {
      type: 'button' as const,
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: false,
      label: 'Open',
      method: 'get' as const,
      url: '/open',
      style: 'solid' as const,
    };
    const result = safeParseWidgetInput({ ...validContract, elements: [button] });

    expect(result.success).toBe(true);
    if (result.success) {
      const hydrated = hydrateWidget(result.data);
      expect(hydrated.elements[0]).toMatchObject({
        requestRefresh: false,
        showOnlyOnHover: false,
      });
    }
  });

  it('normalizes divider sensitivity to false when the input includes true', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          type: 'divider',
          sensitive: true,
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          orientation: 'horizontal',
          style: { color: '#64748b' },
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(hydrateWidget(result.data).elements[0].sensitive).toBe(false);
    }
  });

  it('allows the background image URL to be omitted', () => {
    const result = safeParseWidgetInput(validContract);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.background.image).toBeUndefined();
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

  it('rejects axis styling on pie and donut charts', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          type: 'pie',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          title: 'Distribution',
          showLegend: true,
          data: [{ label: 'A', value: 1 }],
          style: {
            color: { legend: '#fff', title: '#fff' },
            font: { size: 11 },
            axis: { label: '#fff', line: '#fff', grid: '#fff' },
          },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.issues.map((issue) => issue.path)).toContain('elements[0].style.axis');
  });

  it('throws a validation error from the throwing parser', () => {
    expect(() => parseWidgetInput(null)).toThrow(/must be an object/);
  });
});
