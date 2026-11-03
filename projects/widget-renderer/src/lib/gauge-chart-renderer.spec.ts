import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { gaugeChartLayout, gaugeRatio } from './gauge-chart-layout';
import { GaugeChartRenderer } from './gauge-chart-renderer';
import { GaugeElement } from './widget.model';
import { WidgetTooltip } from './widget-tooltip';

const gauge: GaugeElement = {
  type: 'gauge',
  grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  sensitive: false,
  showLegend: true,
  title: 'Score',
  style: {
    font: { size: 11 },
    color: { legend: '#111', title: '#222', fill: '#0a0', track: '#ddd' },
  },
  data: { min: 0, max: 8, value: 6 },
};

describe('gaugeChartLayout', () => {
  it('clamps the value to the configured range', () => {
    expect(gaugeRatio({ ...gauge, data: { min: 0, max: 8, value: 12 } })).toBe(1);
    expect(gaugeRatio({ ...gauge, data: { min: 0, max: 8, value: -3 } })).toBe(0);
  });

  it('uses the exact range for a sub-unit gauge', () => {
    expect(gaugeRatio({ ...gauge, data: { min: 0, max: 0.5, value: 0.25 } })).toBe(0.5);
  });

  it('draws seven labelled major ticks when the legend is shown', () => {
    const layout = gaugeChartLayout(gauge, 200, 160);
    expect(layout.ticks.filter(({ major }) => major)).toHaveLength(7);
    expect(layout.labels.map(({ text }) => text)).toEqual(['0', '1', '3', '4', '5', '7', '8']);
    expect(gaugeChartLayout({ ...gauge, showLegend: false }, 200, 160).labels).toHaveLength(0);
  });

  it('omits the fill at the minimum value', () => {
    expect(gaugeChartLayout({ ...gauge, data: { min: 0, max: 8, value: 0 } }, 200, 160).fill).toBe(
      '',
    );
  });
});

describe('GaugeChartRenderer', () => {
  let fixture: ComponentFixture<GaugeChartRenderer>;
  let tooltip: WidgetTooltip;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaugeChartRenderer],
      providers: [WidgetTooltip],
    }).compileComponents();
    tooltip = TestBed.inject(WidgetTooltip);
    const shell = document.createElement('section');
    const layer = document.createElement('div');
    shell.append(layer);
    tooltip.setOverlay(layer);
    fixture = TestBed.createComponent(GaugeChartRenderer);
    fixture.componentRef.setInput('element', gauge);
    await fixture.whenStable();
  });

  function svg(): SVGSVGElement {
    return fixture.nativeElement.querySelector('.chart-host svg');
  }

  it('renders the value, title and an accessible summary', () => {
    expect(svg().querySelector('.gauge-value')?.textContent?.trim()).toBe('6');
    expect(fixture.nativeElement.querySelector('.chart-title')?.textContent).toContain('Score');
    const summaryId = svg().getAttribute('aria-describedby');
    expect(fixture.nativeElement.querySelector(`#${summaryId}`)?.textContent).toContain('75');
  });

  it('shows a tooltip on focus, using a fallback label without a title', async () => {
    fixture.componentRef.setInput('element', { ...gauge, title: undefined });
    await fixture.whenStable();
    svg().dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();
    expect(tooltip.state()).toMatchObject({ label: 'Value', value: 6 });
  });

  it('hides content and disables interaction for sensitive data', async () => {
    fixture.componentRef.setInput('sensitiveHidden', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.chart-chart').getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(svg().getAttribute('tabindex')).toBe('-1');
    svg().dispatchEvent(new FocusEvent('focus'));
    expect(tooltip.state()).toBeNull();
  });
});
