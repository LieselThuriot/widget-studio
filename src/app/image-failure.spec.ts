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
      type: 'image',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      sensitive: false,
      source: '/missing.png',
      alt: 'A missing image',
      fit: 'cover',
      radius: 0,
    },
  ],
};

describe('renderer image failures', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WidgetRenderer] }).compileComponents();
  });

  it('shows an accessible fallback and retry action after an image error', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', widget);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.image-fallback')?.textContent).toContain(
      'A missing image',
    );
    expect(fixture.nativeElement.querySelector('.image-fallback button')).toBeTruthy();

    fixture.nativeElement.querySelector('.image-fallback button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
  });
});
