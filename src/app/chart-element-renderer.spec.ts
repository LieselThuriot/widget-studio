import { TestBed } from '@angular/core/testing';
import { ChartElementRenderer, ChartElement } from 'widget-renderer';

const chart: ChartElement = {
  id: 'chart',
  type: 'bar',
  grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  sensitive: false,
  title: 'Sales',
  showLegend: true,
  data: [{ label: 'Mon', value: 4 }],
  style: {
    color: {
      legend: '#fff',
      title: '#fff',
      line: '#0ff',
    },
    font: { size: 11 },
    axis: { label: '#fff', line: '#fff', grid: '#fff' },
  },
};

describe('chart element renderer dark mode', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ChartElementRenderer] }).compileComponents();
  });

  it('renders a chart with dark mode enabled', async () => {
    const fixture = TestBed.createComponent(ChartElementRenderer);
    fixture.componentRef.setInput('element', chart);
    fixture.componentRef.setInput('darkMode', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });
});
