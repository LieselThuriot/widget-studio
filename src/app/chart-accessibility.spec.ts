import { chartAccessibilitySummary, chartAriaLabel } from 'widget-renderer';
import { ChartElement, ProgressElement } from 'widget-renderer';

const base = {
  grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  sensitive: false,
  title: 'Sales',
  showLegend: true,
  style: {
    color: { legend: '#fff', title: '#fff', fill: '#0ff', track: '#000' },
    font: { size: 11 },
    axis: { label: '#fff', line: '#fff', grid: '#fff' },
  },
};

describe('chart accessibility summaries', () => {
  it('summarizes series data', () => {
    const element: ChartElement = { ...base, type: 'bar', data: [{ label: 'Mon', value: 4 }] };

    expect(chartAriaLabel(element)).toContain('1 data points');
    expect(chartAccessibilitySummary(element)).toContain('Mon: 4');
  });

  it('summarizes gauge ranges', () => {
    const element: ChartElement = {
      type: 'gauge',
      grid: base.grid,
      sensitive: false,
      title: 'Performance',
      showLegend: true,
      data: { value: 75, min: 0, max: 100 },
      style: {
        color: { legend: '#fff', title: '#fff', fill: '#0ff', track: '#000' },
        font: { size: 11 },
      },
    };

    expect(chartAccessibilitySummary(element)).toContain('75 percent');
  });

  it('caps long summaries', () => {
    const element: ChartElement = {
      ...base,
      type: 'line',
      data: Array.from({ length: 21 }, (_, index) => ({ label: `${index}`, value: index })),
    };

    expect(chartAccessibilitySummary(element)).toContain('1 more points');
    expect(chartAccessibilitySummary(element)).not.toContain('20: 20');
  });

  it('summarizes progress', () => {
    const element: ProgressElement = {
      type: 'progress',
      grid: base.grid,
      sensitive: false,
      data: { label: 'Complete', value: 4, min: 0, max: 10, separator: ' of ', suffix: '' },
      style: { color: { legend: '#fff', fill: '#0ff', track: '#000' }, font: { size: 11 } },
      showLegend: true,
      active: false,
    };

    expect(chartAriaLabel(element)).toContain('Complete');
    expect(chartAccessibilitySummary(element)).toContain('maximum 10');
  });

  it('uses renderer defaults for missing progress separator and suffix', () => {
    const element = {
      ...({
        type: 'progress',
        grid: base.grid,
        sensitive: false,
        data: { label: 'Complete', value: 4, min: 0, max: 10 },
        style: { color: { legend: '#fff', fill: '#0ff', track: '#000' }, font: { size: 11 } },
        showLegend: true,
        active: false,
      } satisfies ProgressElement),
    } as ProgressElement;

    expect(chartAriaLabel(element)).toContain('4 - 10.');
  });
});
