import {
  isWidget,
  normalizeWidgetInput,
  parseWidgetInput,
  safeParseWidgetInput,
} from 'widget-renderer';
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

  it('accepts a valid ID-free widget', () => {
    expect(isWidget(validContract)).toBe(true);
  });

  it('accepts optional badge styling on text elements', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          type: 'text',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          text: 'Status',
          style: {
            color: '#fff',
            font: { size: 11 },
            align: 'left',
            wrap: false,
            background: '#2563eb',
            radius: 999,
            padding: { vertical: 4, horizontal: 8 },
          },
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('accepts omitted, null, and zero text padding', () => {
    const text = {
      type: 'text' as const,
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: false,
      text: 'Status',
      style: { color: '#fff', font: { size: 11 }, align: 'left' as const, wrap: false },
    };

    expect(safeParseWidgetInput({ ...validContract, elements: [text] }).success).toBe(true);
    expect(
      safeParseWidgetInput({
        ...validContract,
        elements: [{ ...text, style: { ...text.style, padding: null } }],
      }).success,
    ).toBe(true);
    expect(
      safeParseWidgetInput({
        ...validContract,
        elements: [
          {
            ...text,
            style: { ...text.style, padding: { vertical: 0, horizontal: 0 } },
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('accepts every chart type without a title', () => {
    const base = {
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: false,
      showLegend: true,
      font: { size: 11 },
    };
    const chartElements = [
      {
        ...base,
        type: 'pie' as const,
        data: [{ label: 'Complete', value: 72, color: '#0f0' }],
        style: { color: { legend: '#fff', title: '#fff' }, font: base.font },
      },
      {
        ...base,
        type: 'donut' as const,
        data: [{ label: 'Complete', value: 72, color: '#0f0' }],
        style: { color: { legend: '#fff', title: '#fff' }, font: base.font },
      },
      {
        ...base,
        type: 'funnel' as const,
        data: [{ label: 'Complete', value: 72, color: '#0f0' }],
        style: { color: { legend: '#fff', title: '#fff' }, font: base.font },
      },
      {
        ...base,
        type: 'gauge' as const,
        data: { value: 72, min: 0, max: 100 },
        style: {
          color: { legend: '#fff', title: '#fff', fill: '#0f0', track: '#333' },
          font: base.font,
        },
      },
      {
        ...base,
        type: 'bar' as const,
        data: [{ label: 'Complete', value: 72, color: '#0f0' }],
        style: {
          color: { legend: '#fff', title: '#fff', line: '#0f0' },
          font: base.font,
          axis: { label: '#fff', line: '#fff', grid: '#333' },
        },
      },
      {
        ...base,
        type: 'line' as const,
        data: [{ label: 'Complete', value: 72 }],
        style: {
          color: { legend: '#fff', title: '#fff', line: '#0f0' },
          font: base.font,
          axis: { label: '#fff', line: '#fff', grid: '#333' },
        },
      },
      {
        ...base,
        type: 'progress' as const,
        data: { label: 'Complete', value: 72, min: 0, max: 100 },
        style: {
          color: { legend: '#fff', title: '#fff', fill: '#0f0', track: '#333' },
          font: base.font,
        },
        active: false,
      },
    ];

    for (const element of chartElements) {
      expect(safeParseWidgetInput({ ...validContract, elements: [element] }).success).toBe(true);
    }
  });

  it('rejects negative text padding values', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          type: 'text',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          text: 'Status',
          style: {
            color: '#fff',
            font: { size: 11 },
            align: 'left',
            wrap: false,
            padding: { vertical: -1, horizontal: 0 },
          },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.map((issue) => issue.path)).toContain(
        'elements[0].style.padding.vertical',
      );
    }
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
      const normalized = normalizeWidgetInput(result.data);
      expect(normalized.elements[0]).toMatchObject({
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
      expect(normalizeWidgetInput(result.data).elements[0]).toMatchObject({ sensitive: false });
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

  it('rejects invalid ranges', () => {
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
      expect(result.issues.map((issue) => issue.path)).toContain('elements[0].data');
    }
  });

  it('uses positional paths for nested element issues', () => {
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
      expect(result.issues.map((issue) => issue.path)).toContain('elements[0].style.font.size');
    }
  });

  it('ignores legacy IDs in input payloads', () => {
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

  it('rejects axis styling on funnel charts', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          type: 'funnel',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          title: 'Conversion',
          showLegend: true,
          data: [{ label: 'Qualified', value: 12, color: '#0ff' }],
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

  it('requires colors for funnel data points', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          type: 'funnel',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          title: 'Conversion',
          showLegend: true,
          data: [{ label: 'Qualified', value: 12 }],
          style: { color: { legend: '#fff', title: '#fff' }, font: { size: 11 } },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.issues.map((issue) => issue.path)).toContain('elements[0].data[0].color');
  });

  it('requires colors for pie, donut, and bar data points', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          type: 'bar',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          title: 'Comparison',
          showLegend: false,
          data: [{ label: 'A', value: 1 }],
          style: {
            color: { legend: '#fff', title: '#fff', line: '#0ff' },
            font: { size: 11 },
            axis: { label: '#fff', line: '#fff', grid: '#fff' },
          },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.issues.map((issue) => issue.path)).toContain('elements[0].data[0].color');
  });

  it('allows omitted and null colors for line data points', () => {
    const result = safeParseWidgetInput({
      ...validContract,
      elements: [
        {
          type: 'line',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          title: 'Trend',
          showLegend: false,
          data: [
            { label: 'A', value: 1 },
            { label: 'B', value: 2, color: null },
          ],
          style: {
            color: { legend: '#fff', title: '#fff', line: '#0ff' },
            font: { size: 11 },
            axis: { label: '#fff', line: '#fff', grid: '#fff' },
          },
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('throws a validation error from the throwing parser', () => {
    expect(() => parseWidgetInput(null)).toThrow(/must be an object/);
  });
});
