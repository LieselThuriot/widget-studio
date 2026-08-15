import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the widget studio', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Compose a widget');
    expect(compiled.querySelector('app-editor-canvas')).toBeTruthy();
    expect(compiled.querySelector('.topbar-meta')).toBeNull();
  });

  it('should omit internal element IDs from the output contract', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as {
      elements: Record<string, unknown>[];
    };

    expect(contract.elements.every((element) => !('id' in element))).toBe(true);
  });

  it('should include left text alignment in the output contract', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as {
      elements: Record<string, unknown>[];
    };
    const textElements = contract.elements.filter((element) => element['type'] === 'text');

    expect(
      textElements.every(
        (element) => (element['style'] as Record<string, unknown>)['align'] === 'left',
      ),
    ).toBe(true);
  });

  it('should not show internal element IDs in the inspector', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const inspector = fixture.nativeElement.querySelector('.settings-panel') as HTMLElement;

    expect(inspector.querySelector('.selected-chip')?.textContent).not.toContain('headline');
  });

  it('should select a visible button from the canvas', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      '[data-widget-element-id="details"] .action-button',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement
        .querySelector('.editor-element[data-widget-element-id="details"]')
        ?.classList.contains('selected'),
    ).toBe(true);
  });

  it('should select the widget when clicking an empty grid gap', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const editorCanvas = fixture.nativeElement.querySelector('.editor-canvas') as HTMLElement;
    const elementNodes = Array.from(
      fixture.nativeElement.querySelectorAll('[data-widget-element-id]'),
    ) as HTMLElement[];
    const rectangles: Record<string, DOMRect> = {
      headline: new DOMRect(20, 20, 100, 30),
      message: new DOMRect(20, 58, 70, 40),
      caption: new DOMRect(20, 106, 70, 40),
      details: new DOMRect(98, 106, 40, 40),
    };
    for (const node of elementNodes) {
      const id = node.dataset['widgetElementId'];
      if (id) {
        vi.spyOn(node, 'getBoundingClientRect').mockImplementation(() => rectangles[id]);
      }
    }

    editorCanvas.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: 50, clientY: 100 }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.editor-element.selected')).toBeNull();
    expect(fixture.nativeElement.querySelector('.widget-settings')).toBeTruthy();
  });

  it('should focus and restore focus for the preview dialog', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const previewButton = fixture.nativeElement.querySelector(
      '.preview-button',
    ) as HTMLButtonElement;
    previewButton.focus();
    previewButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.preview-close')).toBe(document.activeElement);

    const previewWindow = fixture.nativeElement.querySelector('.preview-window') as HTMLElement;
    previewWindow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.preview-overlay')).toBeNull();
    expect(document.activeElement).toBe(previewButton);
  });

  it('should focus and restore focus for the event alert dialog', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const actionButton = fixture.nativeElement.querySelector(
      '[data-widget-element-id="details"] .action-button',
    ) as HTMLButtonElement;
    actionButton.focus();
    actionButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const alertClose = fixture.nativeElement.querySelector('.alert-close') as HTMLButtonElement;
    expect(alertClose).toBe(document.activeElement);

    const alertDialog = fixture.nativeElement.querySelector('.event-alert') as HTMLElement;
    alertDialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.alert-overlay')).toBeNull();
    expect(document.activeElement).toBe(actionButton);
  });
});
