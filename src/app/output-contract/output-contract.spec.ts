import { TestBed } from '@angular/core/testing';
import { OutputContract } from './output-contract';

describe('OutputContract', () => {
  const values = new Map<string, string>();
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useRealTimers();
    values.clear();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OutputContract] }).compileComponents();
  });

  it('shows JSON by default and switches to the C# contract', () => {
    const fixture = TestBed.createComponent(OutputContract);
    fixture.componentRef.setInput('modelContract', { version: 2, id: 'output-test' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[data-output-format="json"] pre')?.textContent).toContain(
      '"version"',
    );
    expect(element.querySelector('[data-output-format="json"] .syntax-property')).not.toBeNull();
    expect(element.querySelector('[data-output-format="csharp"]')).toBeNull();

    (element.querySelector('#csharp-tab') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(element.querySelector('[data-output-format="json"]')).toBeNull();
    expect(element.querySelector('[data-output-format="csharp"] pre')?.textContent).toContain(
      'new()',
    );
    expect(element.querySelector('[data-output-format="csharp"] .syntax-keyword')).not.toBeNull();
    expect(element.querySelector('#csharp-tab')?.getAttribute('aria-selected')).toBe('true');
  });

  it('moves between tabs with arrow keys', () => {
    const fixture = TestBed.createComponent(OutputContract);
    fixture.componentRef.setInput('modelContract', { id: 'output-test' });
    fixture.detectChanges();

    const jsonTab = fixture.nativeElement.querySelector('#json-tab') as HTMLButtonElement;
    jsonTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#csharp-tab')?.getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(fixture.nativeElement.querySelector('#json-tab')?.getAttribute('tabindex')).toBe('-1');
    expect(fixture.nativeElement.querySelector('#csharp-tab')?.getAttribute('tabindex')).toBe('0');
  });

  it('restores and saves the selected output format', () => {
    localStorage.setItem('widget-studio-output-format', 'csharp');
    const fixture = TestBed.createComponent(OutputContract);
    fixture.componentRef.setInput('modelContract', { id: 'output-test' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#csharp-tab')?.getAttribute('aria-selected')).toBe(
      'true',
    );

    (fixture.nativeElement.querySelector('#json-tab') as HTMLButtonElement).click();
    expect(localStorage.getItem('widget-studio-output-format')).toBe('json');
  });

  it('copies the active JSON output and reports success', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(OutputContract);
    fixture.componentRef.setInput('modelContract', { version: 2, id: 'output-test' });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.copy-button') as HTMLButtonElement).click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith(`{
  "version": 2,
  "id": "output-test"
}`);
    expect(fixture.nativeElement.querySelector('.copy-status')?.textContent).toContain(
      'Copied to clipboard.',
    );
    vi.advanceTimersByTime(3200);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.copy-status')).toBeNull();
    vi.useRealTimers();
  });

  it('copies the active C# output', async () => {
    const fixture = TestBed.createComponent(OutputContract);
    fixture.componentRef.setInput('modelContract', { version: 2, id: 'output-test' });
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('#csharp-tab') as HTMLButtonElement).click();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.copy-button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('WidgetContract widget = new()'),
    );
  });

  it('reports clipboard failures', async () => {
    vi.useFakeTimers();
    writeText.mockRejectedValue(new Error('denied'));
    const fixture = TestBed.createComponent(OutputContract);
    fixture.componentRef.setInput('modelContract', { id: 'output-test' });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.copy-button') as HTMLButtonElement).click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.copy-status')?.textContent).toContain(
      'Copy failed.',
    );
    vi.advanceTimersByTime(3200);
    vi.useRealTimers();
  });
});
