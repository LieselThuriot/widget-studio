import { TestBed } from '@angular/core/testing';
import { Widget } from '../../editor-model';
import { sampleWidgets } from '../../sample-widget';
import { WidgetSettings } from './widget-settings';

describe('WidgetSettings layout ID', () => {
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

  it('shows a shortened layout ID and copies the full value', async () => {
    const fixture = render(structuredClone(sampleWidgets[0].widget));
    const element = fixture.nativeElement as HTMLElement;
    const value = element.querySelector('.layout-id__value') as HTMLElement;
    const fullId = value.getAttribute('title') ?? '';

    expect(fullId).toMatch(/^wfp:1:[0-9a-f]{64}$/);
    expect(value.getAttribute('aria-label')).toBe(`Layout ID ${fullId}`);
    expect(value.textContent?.trim()).toBe(`${fullId.slice(0, 12)}…${fullId.slice(-6)}`);

    (element.querySelector('.layout-id__copy') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(fullId));
    await Promise.resolve();
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')?.textContent).toContain('Layout ID copied');

    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(element.querySelector('[role="status"]')?.textContent).not.toContain('Layout ID copied');
  });

  it('explains that invalid widgets have no layout ID', () => {
    const fixture = render({ ...structuredClone(sampleWidgets[0].widget), rows: [] });
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.layout-id__value')).toBeNull();
    expect(element.querySelector('.layout-id__invalid')?.textContent).toContain('invalid');
  });
});
