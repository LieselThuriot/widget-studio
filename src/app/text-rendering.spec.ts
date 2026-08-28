import { TestBed } from '@angular/core/testing';
import { WidgetContract, WidgetRenderer } from 'widget-renderer';

function textWidget(wrap: boolean): WidgetContract {
  return {
    version: 2,
    id: 'text-rendering-test',
    size: 'square',
    rows: [{ size: 1, unit: 'star' }],
    columns: [{ size: 1, unit: 'star' }],
    background: { sensitive: false, repeat: false, size: 'auto', anchor: 'center' },
    refresh: { enabled: false, label: 'Refresh' },
    elements: [
      {
        type: 'text',
        grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
        sensitive: false,
        text: 'First line\nSecond line',
        style: { color: '#fff', font: { size: 11 }, align: 'left', wrap },
      },
    ],
  };
}

describe('text renderer whitespace', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WidgetRenderer] }).compileComponents();
  });

  it('preserves newlines and allows automatic wrapping when enabled', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', textWidget(true));
    await fixture.whenStable();

    const text = fixture.nativeElement.querySelector('.text-element') as HTMLElement;
    expect(text.style.whiteSpace).toBe('pre-wrap');
    expect(text.textContent).toContain('First line\nSecond line');
  });

  it('preserves newlines without automatic wrapping when disabled', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', textWidget(false));
    await fixture.whenStable();

    const text = fixture.nativeElement.querySelector('.text-element') as HTMLElement;
    expect(text.style.whiteSpace).toBe('pre');
    expect(text.textContent).toContain('First line\nSecond line');
  });

  it('renders optional badge styling on text', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    const baseText = textWidget(false).elements[0];
    fixture.componentRef.setInput('widget', {
      ...textWidget(false),
      elements: [
        {
          ...baseText,
          text: 'New badge',
          style: {
            color: '#fff',
            font: { size: 11 },
            align: 'left',
            wrap: false,
            background: '#2563eb',
            radius: 999,
            padding: { vertical: 4, horizontal: 8 },
          },
        },
      ],
    });
    await fixture.whenStable();

    const text = fixture.nativeElement.querySelector('.text-element') as HTMLElement;
    expect(text.style.backgroundColor).toBe('rgb(37, 99, 235)');
    expect(text.style.borderRadius).toBe('999px');
    expect(text.style.padding).toBe('4px 8px');
  });
});
