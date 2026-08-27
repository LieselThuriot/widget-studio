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

  it('summarizes funnel data', () => {
    const element: ChartElement = {
      ...base,
      type: 'funnel',
      data: [{ label: 'Qualified', value: 12 }],
      style: { color: { legend: '#fff', title: '#fff' }, font: { size: 11 } },
    };

    expect(chartAriaLabel(element)).toContain('1 data points');
    expect(chartAccessibilitySummary(element)).toContain('Qualified: 12');
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
      title: 'Progress',
      data: {
        min: 0,
        max: 10,
        items: [
          { kind: 'segment', label: 'Morning', value: 4, color: '#0ff', active: false },
          { kind: 'gap', value: 1 },
        ],
      },
      style: {
        color: { legend: '#fff', title: '#fff', track: '#000' },
        font: { size: 11 },
        radius: null,
      },
      showLegend: true,
    };

    expect(chartAriaLabel(element)).toContain('Progress');
    expect(chartAccessibilitySummary(element)).toContain('Morning: 0 to 4');
  });

  it('counts only visible segments as progress', () => {
    const element = {
      ...({
        type: 'progress',
        grid: base.grid,
        sensitive: false,
        title: 'Progress',
        data: {
          min: 0,
          max: 10,
          items: [
            { kind: 'segment', label: 'Morning', value: 4, color: '#0ff', active: false },
            { kind: 'gap', value: 2 },
          ],
        },
        style: {
          color: { legend: '#fff', title: '#fff', track: '#000' },
          font: { size: 11 },
          radius: null,
        },
        showLegend: true,
      } satisfies ProgressElement),
    } as ProgressElement;

    expect(chartAriaLabel(element)).toContain('4 of 10.');
  });
});
