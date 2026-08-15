import { TestBed } from '@angular/core/testing';
import { WidgetRenderer, WidgetContract } from 'widget-renderer';

const widget: WidgetContract = {
  version: 2,
  size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: { sensitive: false, repeat: false, size: 'auto', anchor: 'center' },
  refresh: { enabled: false, label: 'Refresh' },
  elements: [
    {
      type: 'text',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: true,
      text: 'Secret text',
      style: { color: '#fff', font: { size: 11 }, align: 'left', wrap: true },
    },
    {
      type: 'button',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: true,
      label: 'Secret action',
      method: 'get',
      url: '/secret',
      style: 'solid',
    },
  ],
};

describe('sensitive renderer content', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WidgetRenderer] }).compileComponents();
  });

  it('removes hidden sensitive content from the accessible tree', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', widget);
    await fixture.whenStable();

    const sensitive = fixture.nativeElement.querySelectorAll('[aria-hidden="true"]');
    expect(sensitive.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.action-button')?.getAttribute('tabindex')).toBe(
      '-1',
    );
    expect(fixture.nativeElement.querySelector('.text-element')?.textContent).toContain(
      'Secret text',
    );
  });
});
