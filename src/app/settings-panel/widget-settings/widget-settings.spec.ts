import { TestBed } from '@angular/core/testing';
import { Widget } from '../../editor-model';
import { sampleWidgets } from '../../sample-widget';
import { WidgetSettings } from './widget-settings';

describe('WidgetSettings fingerprint', () => {
  let writeText: ReturnType<typeof vi.fn>;

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    await TestBed.configureTestingModule({ imports: [WidgetSettings] }).compileComponents();
  });

  function render(widget: Widget) {
    const fixture = TestBed.createComponent(WidgetSettings);
    fixture.componentRef.setInput('widget', widget);
    fixture.detectChanges();
    return fixture;
  }

  it('shows a shortened fingerprint and copies the full value', async () => {
    const fixture = render(structuredClone(sampleWidgets[0].widget));
    const element = fixture.nativeElement as HTMLElement;
    const value = element.querySelector('.fingerprint__value') as HTMLElement;
    const fullId = value.getAttribute('title') ?? '';

    expect(fullId).toMatch(/^wfp:1:[0-9a-f]{64}$/);
    expect(value.getAttribute('aria-label')).toBe(`Fingerprint ${fullId}`);
    expect(value.textContent?.trim()).toBe(`${fullId.slice(0, 12)}…${fullId.slice(-6)}`);

    (element.querySelector('.fingerprint__copy') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(fullId));
    await Promise.resolve();
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')?.textContent).toContain('Fingerprint copied');

    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(element.querySelector('[role="status"]')?.textContent).not.toContain(
      'Fingerprint copied',
    );
  });

  it('explains that invalid widgets have no fingerprint', () => {
    const fixture = render({ ...structuredClone(sampleWidgets[0].widget), rows: [] });
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.fingerprint__value')).toBeNull();
    expect(element.querySelector('.fingerprint__invalid')?.textContent).toContain('invalid');
  });
});
