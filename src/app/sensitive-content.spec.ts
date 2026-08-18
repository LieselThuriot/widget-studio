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
      requestRefresh: false,
      showOnlyOnHover: false,
      style: 'solid',
    },
    {
      type: 'text',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: false,
      text: 'Public text',
      style: { color: '#fff', font: { size: 32 }, align: 'left', wrap: true },
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

  it('scales blur for sensitive text and omits it from public content', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', widget);
    await fixture.whenStable();

    const sensitiveText = fixture.nativeElement.querySelector(
      '.widget-element:nth-child(1) .element-content',
    ) as HTMLElement;
    const publicText = fixture.nativeElement.querySelector(
      '.widget-element:nth-child(3) .element-content',
    ) as HTMLElement;

    expect(sensitiveText.style.getPropertyValue('--sensitive-blur')).toBe('2.75px');
    expect(publicText.style.getPropertyValue('--sensitive-blur')).toBe('');
    expect(sensitiveText.parentElement?.classList.contains('is-sensitive')).toBe(true);
    expect(publicText.parentElement?.classList.contains('is-sensitive')).toBe(false);
  });

  it('uses the maximum blur for large sensitive text', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', {
      ...widget,
      elements: [
        {
          type: 'text',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: true,
          text: 'Large secret',
          style: { color: '#fff', font: { size: 64 }, align: 'left', wrap: true },
        },
      ],
    });
    await fixture.whenStable();

    const sensitiveText = fixture.nativeElement.querySelector('.element-content') as HTMLElement;
    expect(sensitiveText.style.getPropertyValue('--sensitive-blur')).toBe('10px');
  });
});
