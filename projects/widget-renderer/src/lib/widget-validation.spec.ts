import { describe, expect, it, vi } from 'vitest';
import { parseWidgetInput, safeParseWidgetInput, WidgetValidationError } from './widget-validation';

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

describe('external validation rules', () => {
  const valid = widgetWithElement({
    type: 'divider',
    grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    orientation: 'horizontal',
    style: { color: '#ccc' },
  });
  const issue = { path: 'background.image', message: 'not allowed' };

  it('skips rules when built-in validation fails', () => {
    const rule = vi.fn(() => []);
    const result = safeParseWidgetInput({ ...valid, elements: 'x' }, { rules: [rule] });

    expect(result.success).toBe(false);
    expect(rule).not.toHaveBeenCalled();
  });

  it('treats function rules as blocking', () => {
    const result = safeParseWidgetInput(valid, { rules: [() => [issue]] });

    expect(result).toEqual({ success: false, issues: [{ ...issue, severity: 'block' }] });
  });

  it('succeeds with report-only issues', () => {
    const result = safeParseWidgetInput(valid, {
      rules: [{ mode: 'report', validate: () => [issue] }],
    });

    expect(result).toEqual({
      success: true,
      data: valid,
      issues: [{ ...issue, severity: 'report' }],
    });
  });

  it('collects issues from every rule and blocks on mixed modes', () => {
    const result = safeParseWidgetInput(valid, {
      rules: [{ mode: 'report', validate: () => [issue] }, { validate: () => [issue] }],
    });

    expect(result.success).toBe(false);
    expect(result.issues.map((item) => item.severity)).toEqual(['report', 'block']);
  });

  it('turns throwing rules into issues with the rule mode', () => {
    const result = safeParseWidgetInput(valid, {
      rules: [
        {
          mode: 'report',
          validate: () => {
            throw new Error('boom');
          },
        },
      ],
    });

    expect(result).toMatchObject({
      success: true,
      issues: [{ path: '', message: 'Validation rule failed: boom', severity: 'report' }],
    });
  });

  it('parseWidgetInput throws only on blocking issues', () => {
    expect(() => parseWidgetInput(valid, { rules: [() => [issue]] })).toThrow(
      WidgetValidationError,
    );
    expect(parseWidgetInput(valid, { rules: [{ mode: 'report', validate: () => [issue] }] })).toBe(
      valid,
    );
  });
});
