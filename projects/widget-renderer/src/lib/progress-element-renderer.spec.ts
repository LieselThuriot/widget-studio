import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressElementRenderer } from './progress-element-renderer';
import { ProgressElement } from './widget.model';
import { WidgetTooltip } from './widget-tooltip';

const element = {
  type: 'progress',
  grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  sensitive: false,
  showLegend: true,
  title: 'Work',
  style: {
    font: { size: 11 },
    color: { legend: '#111', title: '#222', track: '#ddd' },
    radius: null,
  },
  data: {
    min: 0,
    max: 10,
    items: [
      { kind: 'segment', label: 'Done', value: 4, color: '#0a0', active: false },
      { kind: 'gap', value: 6 },
    ],
  },
} as ProgressElement;

describe('ProgressElementRenderer', () => {
  let fixture: ComponentFixture<ProgressElementRenderer>;
  let tooltipLayer: HTMLElement;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressElementRenderer],
      providers: [WidgetTooltip],
    }).compileComponents();
    fixture = TestBed.createComponent(ProgressElementRenderer);
    fixture.componentRef.setInput('element', element);
    await fixture.whenStable();
    const shell = document.createElement('section');
    tooltipLayer = document.createElement('div');
    shell.append(tooltipLayer);
    TestBed.inject(WidgetTooltip).setOverlay(tooltipLayer);
  });
  it('renders accessible progress and legend content', () => {
    expect(
      fixture.nativeElement.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow'),
    ).toBe('4');
    expect(fixture.nativeElement.querySelector('.progress-label')?.textContent).toContain(
      'Done: 0–4',
    );
  });
  it('shows and hides a segment tooltip with focus and blur', () => {
    vi.useFakeTimers();
    const segment = fixture.nativeElement.querySelector('.progress-segment') as HTMLButtonElement;
    segment.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.debugElement.injector.get(WidgetTooltip).progress()?.label).toBe('Done');
    segment.dispatchEvent(new FocusEvent('blur'));
    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    expect(fixture.debugElement.injector.get(WidgetTooltip).progress()).toBeNull();
    vi.useRealTimers();
  });

  it('does not clear a tooltip owned by another progress element', async () => {
    const otherFixture = TestBed.createComponent(ProgressElementRenderer);
    otherFixture.componentRef.setInput('element', {
      ...element,
      data: {
        ...element.data,
        items: [
          { kind: 'segment', label: 'Other', value: 6, color: '#00a', active: false },
          { kind: 'gap', value: 4 },
        ],
      },
    } as ProgressElement);
    await otherFixture.whenStable();
    vi.useFakeTimers();

    const segment = fixture.nativeElement.querySelector('.progress-segment') as HTMLButtonElement;
    segment.dispatchEvent(new FocusEvent('focus'));
    segment.dispatchEvent(new FocusEvent('blur'));
    const otherSegment = otherFixture.nativeElement.querySelector(
      '.progress-segment',
    ) as HTMLButtonElement;
    otherSegment.dispatchEvent(new FocusEvent('focus'));

    vi.advanceTimersByTime(100);

    expect(TestBed.inject(WidgetTooltip).progress()?.label).toBe('Other');
    otherFixture.destroy();
    vi.useRealTimers();
  });

  it('clears the tooltip when progress data changes', async () => {
    const segment = fixture.nativeElement.querySelector('.progress-segment') as HTMLButtonElement;
    segment.dispatchEvent(new FocusEvent('focus'));
    expect(TestBed.inject(WidgetTooltip).progress()?.label).toBe('Done');

    fixture.componentRef.setInput('element', {
      ...element,
      data: {
        ...element.data,
        items: [
          { kind: 'segment', label: 'Updated', value: 7, color: '#0a0', active: false },
          { kind: 'gap', value: 3 },
        ],
      },
    } as ProgressElement);
    await fixture.whenStable();

    expect(TestBed.inject(WidgetTooltip).progress()).toBeNull();
  });

  it('clears and suppresses tooltips while sensitive content is hidden', async () => {
    const segment = fixture.nativeElement.querySelector('.progress-segment') as HTMLButtonElement;
    segment.dispatchEvent(new FocusEvent('focus'));
    expect(TestBed.inject(WidgetTooltip).progress()?.label).toBe('Done');

    fixture.componentRef.setInput('sensitiveHidden', true);
    await fixture.whenStable();
    expect(TestBed.inject(WidgetTooltip).progress()).toBeNull();

    segment.dispatchEvent(new FocusEvent('focus'));
    expect(TestBed.inject(WidgetTooltip).progress()).toBeNull();
    expect(
      (fixture.nativeElement.querySelector('.progress-element') as HTMLElement).style.pointerEvents,
    ).toBe('none');
  });

  it('uses the exact range for sub-unit segment widths and accessibility', async () => {
    fixture.componentRef.setInput('element', {
      ...element,
      data: {
        min: 0.1,
        max: 0.6,
        items: [
          { kind: 'segment', label: 'Done', value: 0.2, color: '#0a0', active: false },
          { kind: 'gap', value: 0.3 },
        ],
      },
    } as ProgressElement);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      (fixture.nativeElement.querySelector('.progress-segment') as HTMLElement).style.width,
    ).toBe('40%');
    expect(
      fixture.nativeElement.querySelector('[role="progressbar"]')?.getAttribute('aria-valuemax'),
    ).toBe('0.5');
  });

  it('uses effective sensitive-hidden state for accessibility and focus', async () => {
    fixture.componentRef.setInput('element', { ...element, sensitive: true });
    fixture.componentRef.setInput('sensitiveHidden', true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.progress-element').getAttribute('aria-hidden'),
    ).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="progressbar"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.progress-segment').getAttribute('tabindex')).toBe(
      '-1',
    );

    fixture.componentRef.setInput('sensitiveHidden', false);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.progress-element').getAttribute('aria-hidden'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="progressbar"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.progress-segment').getAttribute('tabindex')).toBe(
      '0',
    );
  });
});
