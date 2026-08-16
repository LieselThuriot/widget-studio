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
