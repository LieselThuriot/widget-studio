import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WidgetElementRenderer } from './widget-element-renderer';
import { ChartElement, ImageElement } from './widget.model';
import { WidgetTooltip } from './widget-tooltip';

function image(source: string): ImageElement {
  return {
    type: 'image',
    source,
    alt: 'Test image',
    fit: 'contain',
    radius: 0,
    grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    sensitive: false,
  };
}

describe('WidgetElementRenderer', () => {
  let fixture: ComponentFixture<WidgetElementRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetElementRenderer],
      providers: [WidgetTooltip],
    }).compileComponents();
    fixture = TestBed.createComponent(WidgetElementRenderer);
  });

  it('does not carry an image failure to a replacement element with the same source', async () => {
    fixture.componentRef.setInput('element', image('https://example.test/image.png'));
    await fixture.whenStable();

    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.image-placeholder')).not.toBeNull();

    fixture.componentRef.setInput('element', image('https://example.test/image.png'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.image-placeholder')).toBeNull();
  });

  it('makes a revealed sensitive chart accessible', async () => {
    fixture.componentRef.setInput('element', {
      type: 'pie',
      sensitive: true,
      showLegend: true,
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      style: { font: { size: 11 }, color: { legend: '#111', title: '#222' } },
      data: [{ label: 'A', value: 1, color: '#0a0' }],
    } as ChartElement);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.chart-chart').getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(
      fixture.nativeElement.querySelector('.chart-chart').getAttribute('aria-describedby'),
    ).toBeNull();
    expect(
      (fixture.nativeElement.querySelector('.chart-chart') as HTMLElement).style.pointerEvents,
    ).toBe('none');

    fixture.componentRef.setInput('sensitiveVisible', true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.chart-chart').getAttribute('aria-hidden'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.chart-chart').getAttribute('aria-describedby'),
    ).toMatch(/^chart-summary-/);
    expect(fixture.nativeElement.querySelector('.chart-chart .visually-hidden')).not.toBeNull();
    expect(
      (fixture.nativeElement.querySelector('.chart-chart') as HTMLElement).style.pointerEvents,
    ).toBe('');
  });
});
