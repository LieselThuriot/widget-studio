import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { funnelChartLayout, pieChartLayout } from './part-chart-layout';
import { PartChartRenderer } from './part-chart-renderer';
import { FunnelElement, PieElement } from './widget.model';
import { WidgetTooltip } from './widget-tooltip';

const pie: PieElement = {
  type: 'pie',
  grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  sensitive: false,
  showLegend: true,
  title: 'Teams',
  style: { font: { size: 11 }, color: { legend: '#111', title: '#222' } },
  data: [
    { label: 'Red', value: 3, color: '#f00' },
    { label: 'Green', value: 1, color: '#0f0' },
    { label: 'Default', value: 0 },
  ],
};

const funnel: FunnelElement = {
  ...pie,
  type: 'funnel',
  data: [
    { label: 'Small', value: 10 },
    { label: 'Large', value: 100 },
  ],
};

describe('pieChartLayout', () => {
  it('keeps data order and splits the circle by value', () => {
    const { slices } = pieChartLayout(pie, 200, 100);
    expect(slices.map(({ label }) => label)).toEqual(['Red', 'Green', 'Default']);
    expect(slices[2].color).toBe('#fac858');
    expect(slices[0].path).toMatch(/^M/);
  });

  it('adds a hole for donuts', () => {
    expect(pieChartLayout(pie, 200, 100).innerRadius).toBe(0);
    expect(pieChartLayout({ ...pie, type: 'donut' }, 200, 100).innerRadius).toBeGreaterThan(0);
  });
});

describe('funnelChartLayout', () => {
  it('stacks the largest value on top while keeping data order', () => {
    const [small, large] = funnelChartLayout(funnel, 200, 100);
    expect(small.label).toBe('Small');
    expect(large.centerY).toBeLessThan(small.centerY);
  });
});

describe('PartChartRenderer', () => {
  let fixture: ComponentFixture<PartChartRenderer>;
  let tooltip: WidgetTooltip;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartChartRenderer],
      providers: [WidgetTooltip],
    }).compileComponents();
    tooltip = TestBed.inject(WidgetTooltip);
    const shell = document.createElement('section');
    const layer = document.createElement('div');
    shell.append(layer);
    tooltip.setOverlay(layer);
    fixture = TestBed.createComponent(PartChartRenderer);
    fixture.componentRef.setInput('element', pie);
    await fixture.whenStable();
  });

  function svg(): SVGSVGElement {
    return fixture.nativeElement.querySelector('.chart-host svg');
  }

  it('renders slices, title, legend and an accessible summary', () => {
    expect(svg().querySelectorAll('path.chart-shape')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('.chart-title')?.textContent).toContain('Teams');
    expect(fixture.nativeElement.querySelectorAll('.chart-legend-item')).toHaveLength(3);
    const summaryId = svg().getAttribute('aria-describedby');
    expect(fixture.nativeElement.querySelector(`#${summaryId}`)?.textContent).toContain('Red: 3');
  });

  it('moves the tooltip between slices with the keyboard', async () => {
    svg().dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();
    expect(tooltip.state()?.label).toBe('Red');
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    await fixture.whenStable();
    expect(tooltip.state()?.label).toBe('Default');
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(tooltip.state()).toBeNull();
  });

  it('shows a tooltip when a slice is hovered', async () => {
    const slice = svg().querySelectorAll('path.chart-shape')[1];
    slice.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    await fixture.whenStable();
    expect(tooltip.state()?.label).toBe('Green');
  });

  it('clears its highlight when another chart takes over the tooltip', async () => {
    const other = TestBed.createComponent(PartChartRenderer);
    other.componentRef.setInput('element', pie);
    await other.whenStable();
    const touch = { pointerType: 'touch', bubbles: true };
    svg()
      .querySelectorAll('path.chart-shape')[0]
      .dispatchEvent(new PointerEvent('pointerdown', touch));
    await fixture.whenStable();
    expect(svg().querySelectorAll('.is-dimmed')).toHaveLength(2);
    other.nativeElement
      .querySelectorAll('path.chart-shape')[1]
      .dispatchEvent(new PointerEvent('pointerdown', touch));
    await other.whenStable();
    await fixture.whenStable();
    expect(tooltip.state()?.label).toBe('Green');
    expect(svg().querySelectorAll('.is-dimmed')).toHaveLength(0);
  });

  it('hides the legend when disabled', async () => {
    fixture.componentRef.setInput('element', { ...pie, showLegend: false });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.chart-legend')).toBeNull();
  });

  it('renders funnel segments', async () => {
    fixture.componentRef.setInput('element', funnel);
    await fixture.whenStable();
    expect(svg().querySelectorAll('polygon.chart-shape')).toHaveLength(2);
    expect(svg().querySelector('path')).toBeNull();
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
