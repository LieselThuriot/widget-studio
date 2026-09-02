import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WidgetElementRenderer } from './widget-element-renderer';
import { ButtonElement, ChartElement, ImageElement } from './widget.model';
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
    fixture.componentRef.setInput('element', {
      ...image('https://example.test/image.png'),
      alt: '',
    });
    await fixture.whenStable();

    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.image-placeholder')).not.toBeNull();

    fixture.componentRef.setInput('element', {
      ...image('https://example.test/image.png'),
      alt: '',
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.image-placeholder')).toBeNull();
  });

  it('localizes the image failure fallback', async () => {
    fixture.componentRef.setInput('locale', {
      aria: { imageUnavailable: 'Image indisponible' },
    });
    fixture.componentRef.setInput('element', {
      ...image('https://example.test/image.png'),
      alt: '',
    });
    await fixture.whenStable();

    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.image-placeholder').getAttribute('aria-label'),
    ).toBe('Image indisponible');
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

  it('only emits sensitive button actions after the content is revealed', async () => {
    const buttonElement: ButtonElement = {
      type: 'button',
      sensitive: true,
      label: 'Secret action',
      method: 'get',
      url: '/secret',
      requestRefresh: false,
      showOnlyOnHover: false,
      style: 'solid',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    };
    const actionRequested = vi.fn();
    fixture.componentInstance.actionRequested.subscribe(actionRequested);
    fixture.componentRef.setInput('element', buttonElement);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.action-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.tabIndex).toBe(-1);

    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(actionRequested).not.toHaveBeenCalled();

    fixture.componentRef.setInput('sensitiveVisible', true);
    await fixture.whenStable();

    expect(button.disabled).toBe(false);
    expect(button.tabIndex).toBe(0);

    button.click();
    expect(actionRequested).toHaveBeenCalledOnce();
    expect(actionRequested.mock.calls[0][0].element).toBe(buttonElement);
  });
});
