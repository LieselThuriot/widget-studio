import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WidgetRenderer } from './widget-renderer';
import { WidgetInput } from './widget.model';

function widget(id: string): WidgetInput {
  return {
    version: 2,
    id,
    size: 'mini',
    rows: [{ size: 1, unit: 'star' }],
    columns: [{ size: 1, unit: 'star' }],
    background: {
      sensitive: false,
      repeat: false,
      size: 'auto',
      anchor: 'center',
    },
    elements: [
      {
        type: 'text',
        text: 'Secret',
        sensitive: true,
        grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
        style: {
          color: '#fff',
          font: { size: 12 },
          align: 'center',
          wrap: false,
        },
      },
    ],
  };
}

describe('WidgetRenderer', () => {
  let fixture: ComponentFixture<WidgetRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WidgetRenderer] }).compileComponents();
    fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', widget('one'));
    await fixture.whenStable();
  });

  it('keeps sensitive content revealed across internal rendering reads', async () => {
    const toggle = fixture.nativeElement.querySelector(
      '[aria-label="Show sensitive data"]',
    ) as HTMLButtonElement;
    toggle.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.sensitiveVisible()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('.widget-element').getAttribute('aria-hidden'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Hide sensitive data"]'),
    ).not.toBeNull();
  });

  it('hides sensitive content when the widget input changes', async () => {
    fixture.nativeElement.querySelector('[aria-label="Show sensitive data"]').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.sensitiveVisible()).toBe(true);

    fixture.componentRef.setInput('widget', widget('two'));
    await fixture.whenStable();

    expect(fixture.componentInstance.sensitiveVisible()).toBe(false);
    expect(fixture.nativeElement.querySelector('.widget-element').getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('hides sensitive content when loading starts', async () => {
    fixture.nativeElement.querySelector('[aria-label="Show sensitive data"]').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.sensitiveVisible()).toBe(true);

    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    expect(fixture.componentInstance.sensitiveVisible()).toBe(false);

    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Show sensitive data"]'),
    ).not.toBeNull();
  });
});
