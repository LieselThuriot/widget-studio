import { TestBed } from '@angular/core/testing';
import { WidgetInput, WidgetRenderer } from 'widget-renderer';

describe('widget renderer validation state', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WidgetRenderer] }).compileComponents();
  });

  it('shows validation issues inside the renderer', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', {
      version: 3,
      size: 'square',
    } as unknown as WidgetInput);
    await fixture.whenStable();

    const overlay = fixture.nativeElement.querySelector('.widget-validation-overlay');
    expect(overlay?.getAttribute('role')).toBe('alert');
    expect(overlay?.textContent).toContain('Widget validation failed');
    expect(overlay?.textContent).toContain('version');
    expect(overlay?.textContent).toContain('must be 2');
  });

  it('shows all validation issues', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', {
      version: 3,
      size: 'invalid',
    } as unknown as WidgetInput);
    await fixture.whenStable();

    const issues = fixture.nativeElement.querySelectorAll('.widget-validation-issues li');
    expect(issues.length).toBeGreaterThan(1);
  });

  it.each([
    ['mini', 133, 123],
    ['compact', 274, 123],
    ['tall', 133, 254],
    ['square', 274, 254],
    ['wide', 556, 254],
    ['mega', 556, 516],
    ['hero', 1120, 516],
  ] as const)(
    'uses the selected %s dimensions when validation fails',
    async (size, width, height) => {
      const fixture = TestBed.createComponent(WidgetRenderer);
      fixture.componentRef.setInput('widget', {
        version: 3,
        size,
      } as unknown as WidgetInput);
      await fixture.whenStable();

      const shell = fixture.nativeElement.querySelector('.widget-shell') as HTMLElement;
      expect(shell.style.width).toBe(`${width}px`);
      expect(shell.style.height).toBe(`${height}px`);
    },
  );

  it('defaults to square dimensions when the size is missing or invalid', async () => {
    for (const size of [undefined, 'invalid']) {
      const fixture = TestBed.createComponent(WidgetRenderer);
      fixture.componentRef.setInput('widget', {
        version: 3,
        size,
      } as unknown as WidgetInput);
      await fixture.whenStable();

      const shell = fixture.nativeElement.querySelector('.widget-shell') as HTMLElement;
      expect(shell.style.width).toBe('274px');
      expect(shell.style.height).toBe('254px');
    }
  });

  it('does not show validation issues while loading', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', { version: 3 } as unknown as WidgetInput);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.widget-validation-overlay')).toBeNull();
  });
});
