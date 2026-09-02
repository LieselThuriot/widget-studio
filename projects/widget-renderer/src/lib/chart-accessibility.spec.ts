import { describe, expect, it } from 'vitest';
import { chartAccessibilitySummary, chartAriaLabel } from './chart-accessibility';
import { ChartElement, ProgressElement } from './widget.model';
import { frenchWidgetRendererLocale } from './widget-locale';

const grid = { row: 0, column: 0, rowSpan: 1, columnSpan: 1 };

describe('chart accessibility', () => {
  it('summarizes progress ranges and segments', () => {
    const element = {
      type: 'progress',
      grid,
      sensitive: false,
      showLegend: true,
      style: {
        font: { size: 11 },
        color: { legend: '#111', title: '#222', track: '#ddd' },
        radius: null,
      },
      data: {
        min: 10,
        max: 20,
        items: [{ kind: 'segment', label: 'Done', value: 4, color: '#0a0', active: false }],
      },
    } as ProgressElement;
    expect(chartAriaLabel(element)).toBe('Progress, 4 of 10.');
    expect(chartAccessibilitySummary(element)).toContain('Done: 10 to 14.');
  });

  it('limits long chart summaries to twenty points', () => {
    const element = {
      type: 'bar',
      grid,
      sensitive: false,
      showLegend: false,
      style: {
        font: { size: 11 },
        color: { legend: '#111', title: '#222', line: '#333' },
        axis: { label: '#111', line: '#222', grid: '#ddd' },
      },
      data: Array.from({ length: 21 }, (_, index) => ({ label: `Point ${index}`, value: index })),
    } as ChartElement;
    const summary = chartAccessibilitySummary(element);
    expect(summary).toContain('Point 19: 19');
    expect(summary).toContain('1 more points.');
    expect(summary).not.toContain('Point 20');
  });

  it('uses the exact range for a sub-unit gauge percentage', () => {
    const element = {
      type: 'gauge',
      grid,
      sensitive: false,
      showLegend: true,
      style: {
        font: { size: 11 },
        color: { legend: '#111', title: '#222', fill: '#0a0', track: '#ddd' },
      },
      data: { value: 0.35, min: 0.1, max: 0.6 },
    } as ChartElement;
    expect(chartAccessibilitySummary(element)).toContain('50 percent.');
  });

  it('uses localized chart accessibility terminology', () => {
    const element = {
      type: 'bar',
      grid,
      sensitive: false,
      showLegend: false,
      style: {
        font: { size: 11 },
        color: { legend: '#111', title: '#222', line: '#333' },
        axis: { label: '#111', line: '#222', grid: '#ddd' },
      },
      data: [],
    } as ChartElement;

    expect(chartAriaLabel(element, frenchWidgetRendererLocale.aria.chart)).toBe(
      'Graphique bar, 0 points de données.',
    );
    expect(chartAccessibilitySummary(element, frenchWidgetRendererLocale.aria.chart)).toBe(
      'aucune donnée.',
    );
  });
});
