import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { ProgressElementRenderer } from './progress-element-renderer';
import { ProgressElement } from './widget.model';

const progress = {
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressElementRenderer],
    }).compileComponents();
    fixture = TestBed.createComponent(ProgressElementRenderer);
    fixture.componentRef.setInput('element', progress);
    await fixture.whenStable();
  });

  it('renders accessible progress and legend content', () => {
    expect(
      fixture.nativeElement.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow'),
    ).toBe('4');
    expect(fixture.nativeElement.querySelector('.progress-label')?.textContent).toContain(
      'Done: 0–4',
    );
  });

  it('shows a segment tooltip on focus', () => {
    const segment = fixture.nativeElement.querySelector('.progress-segment') as HTMLButtonElement;
    segment.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tooltip"]')?.textContent).toContain('Done');
  });
});
