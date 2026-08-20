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

  it('does not show validation issues while loading', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('widget', { version: 3 } as unknown as WidgetInput);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.widget-validation-overlay')).toBeNull();
  });
});
