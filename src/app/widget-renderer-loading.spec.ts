import { TestBed } from '@angular/core/testing';
import { WidgetRenderer } from 'widget-renderer';

describe('widget renderer loading state', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WidgetRenderer] }).compileComponents();
  });

  it('renders a square skeleton for boolean loading without widget data', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.widget-skeleton')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.widget-skeleton.is-wide')).toBeNull();
    expect(fixture.nativeElement.querySelector('.widget-shell')).toBeNull();
  });

  it('renders a wide skeleton when requested', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('loading', 'wide');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.widget-skeleton.is-wide')).toBeTruthy();
  });

  it.each(['mini', 'compact', 'tall', 'mega'] as const)(
    'renders the %s skeleton variant when requested',
    async (size) => {
      const fixture = TestBed.createComponent(WidgetRenderer);
      fixture.componentRef.setInput('loading', size);
      await fixture.whenStable();

      const skeleton = fixture.nativeElement.querySelector('.widget-skeleton') as HTMLElement;
      expect(skeleton.classList.contains(`is-${size}`)).toBe(true);
    },
  );

  it('keeps a compact chart region in the mini skeleton', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('loading', 'mini');
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector('.widget-skeleton.is-mini .skeleton-chart'),
    ).toBeTruthy();
  });

  it('renders a hero skeleton when requested', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('loading', 'hero');
    await fixture.whenStable();

    const skeleton = fixture.nativeElement.querySelector('.widget-skeleton') as HTMLElement;
    expect(skeleton.classList.contains('is-hero')).toBe(true);
  });

  it('uses the light skeleton by default', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.widget-skeleton.is-dark')).toBeNull();
  });

  it('renders a dark skeleton when dark mode is enabled', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('darkMode', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.widget-skeleton.is-dark')).toBeTruthy();
  });

  it('renders the widget shell when loading is disabled', async () => {
    const fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.widget-skeleton')).toBeNull();
    expect(fixture.nativeElement.querySelector('.widget-shell')).toBeTruthy();
  });
});
