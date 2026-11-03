import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { seriesChartLayout } from './series-chart-layout';
import { SeriesChartRenderer } from './series-chart-renderer';
import { SeriesElement } from './widget.model';
import { WidgetTooltip } from './widget-tooltip';

const element: SeriesElement = {
  type: 'bar',
  grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  sensitive: false,
  showLegend: false,
  title: 'Sales',
  style: {
    font: { size: 11 },
    color: { legend: '#111', title: '#222' },
    axis: { label: '#333', line: '#444', grid: '#eee' },
  },
  data: [
    { label: 'Mon', value: 4 },
    { label: 'Tue', value: 9, color: '#f00' },
    { label: 'Wed', value: -2 },
  ],
};

describe('seriesChartLayout', () => {
  it('builds nice ticks that include zero and every value', () => {
    const layout = seriesChartLayout(element, 300, 150);
    const values = layout.ticks.map(({ value }) => value);
    expect(values).toContain(0);
    expect(Math.min(...values)).toBeLessThanOrEqual(-2);
    expect(Math.max(...values)).toBeGreaterThanOrEqual(9);
  });

  it('draws negative bars below the zero line', () => {
    const [, tue, wed] = seriesChartLayout(element, 300, 150).categories;
    const { zeroY } = seriesChartLayout(element, 300, 150);
    expect(tue.barY + tue.barHeight).toBeCloseTo(zeroY);
    expect(wed.barY).toBeCloseTo(zeroY);
    expect(tue.color).toBe('#f00');
  });

  it('thins out category labels that would overlap', () => {
    const crowded = {
      ...element,
      data: Array.from({ length: 30 }, (_, index) => ({ label: `Label ${index}`, value: index })),
    };
    const shown = seriesChartLayout(crowded, 200, 120).categories.filter(
      ({ showLabel }) => showLabel,
    );
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.length).toBeLessThan(30);
  });

  it('builds a line path only for line charts', () => {
    expect(seriesChartLayout(element, 300, 150).linePath).toBeNull();
    expect(seriesChartLayout({ ...element, type: 'line' }, 300, 150).linePath).toMatch(/^M/);
  });

  it('uses the line color for uncolored line points', () => {
    const line: SeriesElement = {
      ...element,
      type: 'line',
      style: { ...element.style, color: { ...element.style.color, line: '#123456' } },
    };
    const [mon, tue] = seriesChartLayout(line, 300, 150).categories;
    expect(mon.color).toBe('#123456');
    expect(tue.color).toBe('#f00');
  });
});

describe('SeriesChartRenderer', () => {
  let fixture: ComponentFixture<SeriesChartRenderer>;
  let tooltip: WidgetTooltip;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesChartRenderer],
      providers: [WidgetTooltip],
    }).compileComponents();
    tooltip = TestBed.inject(WidgetTooltip);
    const shell = document.createElement('section');
    const layer = document.createElement('div');
    shell.append(layer);
    tooltip.setOverlay(layer);
    fixture = TestBed.createComponent(SeriesChartRenderer);
    fixture.componentRef.setInput('element', element);
    await fixture.whenStable();
  });

  function svg(): SVGSVGElement {
    return fixture.nativeElement.querySelector('.chart-host svg');
  }

  it('renders bars with an accessible label and summary', () => {
    expect(svg().getAttribute('role')).toBe('img');
    expect(svg().getAttribute('aria-label')).toBeTruthy();
    const summaryId = svg().getAttribute('aria-describedby');
    expect(fixture.nativeElement.querySelector(`#${summaryId}`)?.textContent).toContain('Mon: 4');
    expect(svg().querySelectorAll('.series-hit')).toHaveLength(3);
  });

  it('moves the tooltip between points with the keyboard', async () => {
    svg().dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();
    expect(tooltip.state()?.label).toBe('Mon');
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    await fixture.whenStable();
    expect(tooltip.state()?.label).toBe('Tue');
    expect(fixture.nativeElement.querySelector('[aria-live]')?.textContent).toContain('Tue: 9');
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(tooltip.state()).toBeNull();
  });

  it('starts at the first point after the tooltip was dismissed', async () => {
    svg().dispatchEvent(new FocusEvent('focus'));
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    await fixture.whenStable();
    expect(tooltip.state()?.label).toBe('Mon');
  });

  it('only consumes Escape when a tooltip is shown', async () => {
    const idle = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    svg().dispatchEvent(idle);
    expect(idle.defaultPrevented).toBe(false);
    svg().dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();
    const active = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    svg().dispatchEvent(active);
    expect(active.defaultPrevented).toBe(true);
    expect(tooltip.state()).toBeNull();
  });

  it('hides content and disables interaction for sensitive data', async () => {
    fixture.componentRef.setInput('sensitiveHidden', true);
    await fixture.whenStable();
    const chart = fixture.nativeElement.querySelector('.chart-chart');
    expect(chart.getAttribute('aria-hidden')).toBe('true');
    expect(svg().getAttribute('tabindex')).toBe('-1');
    expect(svg().querySelectorAll('.series-hit')).toHaveLength(0);
    svg().dispatchEvent(new FocusEvent('focus'));
    expect(tooltip.state()).toBeNull();
  });

  it('renders a line with points for line charts', async () => {
    fixture.componentRef.setInput('element', { ...element, type: 'line' });
    await fixture.whenStable();
    expect(svg().querySelector('.series-line')).toBeTruthy();
    expect(svg().querySelectorAll('.series-point')).toHaveLength(3);
  });
});
