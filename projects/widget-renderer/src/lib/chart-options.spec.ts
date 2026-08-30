import { describe, expect, it } from 'vitest';
import { chartOptions } from './chart-options';
import { ChartElement } from './widget.model';

const base = {
  grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  sensitive: false,
  showLegend: true,
  style: { font: { size: 12 }, color: { legend: '#111', title: '#222' } },
};

describe('chartOptions', () => {
  it('creates a donut series with title-aware radius', () => {
    const options = chartOptions({
      ...base,
      type: 'donut',
      title: 'Share',
      data: [{ label: 'A', value: 4 }],
    } as ChartElement);
    expect(options['series']).toEqual([
      {
        type: 'pie',
        center: ['50%', '54%'],
        radius: ['34%', '54%'],
        label: { show: false },
        labelLine: { show: false },
        data: [{ name: 'A', value: 4 }],
      },
    ]);
  });

  it('clamps gauge progress to the configured range', () => {
    const options = chartOptions({
      ...base,
      type: 'gauge',
      data: { value: 200, min: 0, max: 100 },
      style: { ...base.style, color: { ...base.style.color, fill: '#0a0', track: '#aaa' } },
    } as ChartElement);
    expect(
      (
        options['series'] as [
          { axisLine: { lineStyle: { color: [[number, string], [number, string]] } } },
        ]
      )[0].axisLine.lineStyle.color[0][0],
    ).toBe(1);
  });

  it('uses the line color fallback for uncolored line points', () => {
    const options = chartOptions({
      ...base,
      type: 'line',
      data: [{ label: 'A', value: 4 }],
      style: {
        ...base.style,
        color: { ...base.style.color, line: '#f00' },
        axis: { label: '#111', line: '#222', grid: '#333' },
      },
    } as ChartElement);
    expect(
      (options['series'] as [{ data: [{ itemStyle: { color: string } }] }])[0].data[0].itemStyle
        .color,
    ).toBe('#f00');
  });
});
