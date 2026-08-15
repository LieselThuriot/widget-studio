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
    expect(compiled.querySelector('.editor-canvas')?.getAttribute('aria-label')).toBe(
      'Widget editor canvas',
    );
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

  it('should omit anchors from chart grid contracts', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: { type: string; grid?: { anchor?: string } }[] };

    const chartElements = contract.elements.filter((element) =>
      ['pie', 'donut', 'gauge', 'bar', 'line'].includes(element.type),
    );

    expect(chartElements.every((element) => !('anchor' in (element.grid ?? {})))).toBe(true);
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

  it('should keep dragging visible renderer elements', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const target = fixture.nativeElement.querySelector(
      'widget-renderer [data-widget-element-id="headline"]',
    ) as HTMLElement;
    const canvas = fixture.nativeElement.querySelector('.editor-canvas') as HTMLElement;
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 265, 245));
    (canvas as HTMLElement & { setPointerCapture: (pointerId: number) => void }).setPointerCapture =
      vi.fn();
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(new DOMRect(18, 18, 100, 30));

    target.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientX: 20,
        clientY: 20,
        pointerId: 1,
      }),
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 90,
        clientY: 90,
        pointerId: 1,
      }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.editor-element.is-dragging')).toBeTruthy();
  });

  it('should add an element from the palette', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const text = fixture.nativeElement.querySelector('.palette-item') as HTMLButtonElement;
    text.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.layer').length).toBe(5);
    expect(fixture.nativeElement.querySelector('.selected-chip')?.textContent).toContain('Text');
  });

  it('should add progress defaults to the output contract', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const progress = Array.from(
      fixture.nativeElement.querySelectorAll('.palette-item') as NodeListOf<HTMLButtonElement>,
    ).find((item) => item.textContent?.includes('Progress')) as HTMLButtonElement;
    progress.click();
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: Record<string, unknown>[] };
    const progressElement = contract.elements.find((element) => element['type'] === 'progress');

    expect(progressElement?.['showLegend']).toBe(true);
    expect(progressElement?.['active']).toBe(false);
  });

  it('should update progress legend and active settings', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const progress = Array.from(
      fixture.nativeElement.querySelectorAll('.palette-item') as NodeListOf<HTMLButtonElement>,
    ).find((item) => item.textContent?.includes('Progress')) as HTMLButtonElement;
    progress.click();
    fixture.detectChanges();

    const toggles = Array.from(
      fixture.nativeElement.querySelectorAll(
        'app-chart-element-settings .toggle-row input',
      ) as NodeListOf<HTMLInputElement>,
    );
    expect(toggles).toHaveLength(2);
    toggles[0].click();
    toggles[1].click();
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: Record<string, unknown>[] };
    const progressElement = contract.elements.find((element) => element['type'] === 'progress');

    expect(progressElement?.['showLegend']).toBe(false);
    expect(progressElement?.['active']).toBe(true);
  });

  it('should preserve progress style fields when changing one style setting', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const progress = Array.from(
      fixture.nativeElement.querySelectorAll('.palette-item') as NodeListOf<HTMLButtonElement>,
    ).find((item) => item.textContent?.includes('Progress')) as HTMLButtonElement;
    progress.click();
    fixture.detectChanges();

    const legendColor = Array.from(
      fixture.nativeElement.querySelectorAll(
        'app-chart-element-settings input[type="color"]',
      ) as NodeListOf<HTMLInputElement>,
    ).find((input) =>
      input.parentElement?.textContent?.includes('Legend color'),
    ) as HTMLInputElement;
    legendColor.value = '#ff0000';
    legendColor.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as {
      elements: {
        type: string;
        data?: Record<string, unknown>;
        style?: { color?: Record<string, unknown> };
      }[];
    };
    const progressElement = contract.elements.find((element) => element.type === 'progress');

    expect(progressElement?.style?.color?.['fill']).toBe('#7dd3fc');
    expect(progressElement?.style?.color?.['legend']).toBe('#ff0000');
    expect(progressElement?.style?.color?.['track']).toBe('#334155');
  });

  it('should omit gauge label, colors, and value color from the contract', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const gauge = Array.from(
      fixture.nativeElement.querySelectorAll('.palette-item') as NodeListOf<HTMLButtonElement>,
    ).find((item) => item.textContent?.includes('Gauge')) as HTMLButtonElement;
    gauge.click();
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: Record<string, unknown>[] };
    const gaugeElement = contract.elements.find((element) => element['type'] === 'gauge');
    const data = gaugeElement?.['data'] as Record<string, unknown>;
    const style = gaugeElement?.['style'] as Record<string, unknown>;

    expect(data['label']).toBeUndefined();
    expect(gaugeElement?.['colors']).toBeUndefined();
    expect(style['valueColor']).toBeUndefined();
    expect(style['axisLabelColor']).toBeUndefined();
    expect(style['axisLineColor']).toBeUndefined();
    expect((style['color'] as Record<string, unknown>)['legend']).toBe('#f6f7fb');
  });

  it('should update gauge legend color from the inspector', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const gauge = Array.from(
      fixture.nativeElement.querySelectorAll('.palette-item') as NodeListOf<HTMLButtonElement>,
    ).find((item) => item.textContent?.includes('Gauge')) as HTMLButtonElement;
    gauge.click();
    fixture.detectChanges();

    const legendColor = Array.from(
      fixture.nativeElement.querySelectorAll(
        'app-chart-element-settings input[type="color"]',
      ) as NodeListOf<HTMLInputElement>,
    ).find((input) =>
      input.parentElement?.textContent?.includes('Legend color'),
    ) as HTMLInputElement;
    legendColor.value = '#ff0000';
    legendColor.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: { type: string; style?: { color?: { legend?: string } } }[] };
    const gaugeElement = contract.elements.find((element) => element.type === 'gauge');

    expect(gaugeElement?.style?.color?.legend).toBe('#ff0000');
  });

  it('should expose gauge legend controls in the gauge section', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const gauge = Array.from(
      fixture.nativeElement.querySelectorAll('.palette-item') as NodeListOf<HTMLButtonElement>,
    ).find((item) => item.textContent?.includes('Gauge')) as HTMLButtonElement;
    gauge.click();
    fixture.detectChanges();

    const settings = fixture.nativeElement.querySelector(
      'app-chart-element-settings',
    ) as HTMLElement;
    const labels = Array.from(settings.querySelectorAll('label')).map((label) =>
      label.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(labels).toEqual([
      'Title',
      'Title color',
      'Value',
      'Minimum',
      'Maximum',
      'Fill color',
      'Track color',
      'Show legendDisplay gauge labels and value',
      'Legend color',
      'Font size',
    ]);
  });

  it('should delete a layer from the layer panel', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const actionsButton = fixture.nativeElement.querySelector(
      '.layer-actions-trigger',
    ) as HTMLButtonElement;
    actionsButton.click();
    fixture.detectChanges();
    const deleteButton = fixture.nativeElement.querySelector(
      '.layer-menu-delete',
    ) as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.layer').length).toBe(3);
  });

  it('should apply a context-menu stack action', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const target = fixture.nativeElement.querySelector(
      'widget-renderer [data-widget-element-id="headline"] .element-content',
    ) as HTMLElement;
    target.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, clientX: 10, clientY: 10 }),
    );
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: { type: string }[] };
    expect(contract.elements.at(1)?.type).toBe('text');
    expect(
      fixture.nativeElement.querySelector('.settings-panel .selected-chip')?.textContent,
    ).toContain('Text');
  });

  it('should close the context menu when deleting an element', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const target = fixture.nativeElement.querySelector(
      'widget-renderer [data-widget-element-id="headline"] .element-content',
    ) as HTMLElement;
    target.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, clientX: 10, clientY: 10 }),
    );
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('.menu-delete') as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.element-context-menu')).toBeNull();
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

  it('should toggle the preview loading skeleton', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const previewButton = fixture.nativeElement.querySelector(
      '.preview-button',
    ) as HTMLButtonElement;
    previewButton.click();
    fixture.detectChanges();

    const loadingToggle = fixture.nativeElement.querySelector(
      '.loading-toggle',
    ) as HTMLButtonElement;
    const previewStage = fixture.nativeElement.querySelector('.preview-stage') as HTMLElement;
    expect(loadingToggle.getAttribute('aria-pressed')).toBe('false');
    expect(previewStage.getAttribute('aria-busy')).toBe('false');
    expect(fixture.nativeElement.querySelector('.widget-skeleton')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-preview-dialog widget-renderer')).toBeTruthy();

    loadingToggle.click();
    fixture.detectChanges();

    expect(loadingToggle.getAttribute('aria-pressed')).toBe('true');
    expect(loadingToggle.textContent).toContain('Show widget');
    expect(previewStage.getAttribute('aria-busy')).toBe('true');
    expect(previewStage.getAttribute('aria-label')).toBe('Widget loading');
    expect(fixture.nativeElement.querySelector('.widget-skeleton')).toBeTruthy();

    loadingToggle.click();
    fixture.detectChanges();

    expect(loadingToggle.getAttribute('aria-pressed')).toBe('false');
    expect(fixture.nativeElement.querySelector('.widget-skeleton')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-preview-dialog widget-renderer')).toBeTruthy();
  });

  it('should trap preview dialog tab focus', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const previewButton = fixture.nativeElement.querySelector(
      '.preview-button',
    ) as HTMLButtonElement;
    previewButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const previewWindow = fixture.nativeElement.querySelector('.preview-window') as HTMLElement;
    const closeButton = fixture.nativeElement.querySelector('.preview-close') as HTMLButtonElement;
    closeButton.focus();
    previewWindow.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );

    expect(document.activeElement).not.toBe(closeButton);
    expect((document.activeElement as HTMLElement).closest('.preview-window')).toBe(previewWindow);
  });

  it('should keep alert dialog focus on its close action', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const actionButton = fixture.nativeElement.querySelector(
      '[data-widget-element-id="details"] .action-button',
    ) as HTMLButtonElement;
    actionButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const alertDialog = fixture.nativeElement.querySelector('.event-alert') as HTMLElement;
    const closeButton = fixture.nativeElement.querySelector('.alert-close') as HTMLButtonElement;
    closeButton.focus();
    alertDialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    expect(document.activeElement).toBe(closeButton);
  });

  it('should close dialogs from the backdrop and restore focus', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const previewButton = fixture.nativeElement.querySelector(
      '.preview-button',
    ) as HTMLButtonElement;
    previewButton.focus();
    previewButton.click();
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.preview-overlay') as HTMLElement;
    overlay.click();
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

  it('should update text formatting from the inspector', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const boldButton = fixture.nativeElement.querySelector(
      '.formatting-tools button[aria-label="Toggle bold"]',
    ) as HTMLButtonElement;
    boldButton.click();
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: { id?: string; type: string; style?: { font?: { weight?: number } } }[] };
    const headline = contract.elements.find((element) => element.type === 'text');

    expect(headline?.style?.font?.weight).toBe(400);
  });

  it('should preserve the remaining text decoration when toggling another', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const underline = fixture.nativeElement.querySelector(
      '.formatting-tools button[aria-label="Toggle underline"]',
    ) as HTMLButtonElement;
    const strikethrough = fixture.nativeElement.querySelector(
      '.formatting-tools button[aria-label="Toggle strikethrough"]',
    ) as HTMLButtonElement;
    underline.click();
    fixture.detectChanges();
    strikethrough.click();
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: { type: string; style?: { font?: { decoration?: string } } }[] };
    const headline = contract.elements.find((element) => element.type === 'text');
    expect(headline?.style?.font?.decoration).toBe('underline line-through');

    underline.click();
    fixture.detectChanges();
    const updatedContract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: { type: string; style?: { font?: { decoration?: string } } }[] };
    const updatedHeadline = updatedContract.elements.find((element) => element.type === 'text');

    expect(updatedHeadline?.style?.font?.decoration).toBe('line-through');
  });

  it('should update widget size and add a grid track', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const canvas = fixture.nativeElement.querySelector('.canvas') as HTMLElement;
    canvas.click();
    fixture.detectChanges();

    const size = fixture.nativeElement.querySelector('.settings-panel select') as HTMLSelectElement;
    size.value = 'wide';
    size.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    const addRow = fixture.nativeElement.querySelector(
      'app-grid-track-editor[kind="rows"] .small-add',
    ) as HTMLButtonElement;
    addRow.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dimensions')?.textContent).toContain('530');
    expect(
      fixture.nativeElement.querySelectorAll('app-grid-track-editor[kind="rows"] .track-row'),
    ).toHaveLength(4);
  });

  it('should mark the widget background as sensitive', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.canvas') as HTMLElement).click();
    fixture.detectChanges();

    const sensitiveToggle = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.widget-settings input[type="checkbox"]',
      ) as NodeListOf<HTMLInputElement>,
    ).find((input) => (input.parentElement?.textContent ?? '').includes('Sensitive content')) as
      HTMLInputElement | undefined;
    expect(sensitiveToggle).toBeTruthy();

    sensitiveToggle!.click();
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { background: { sensitive: boolean } };
    expect(contract.background.sensitive).toBe(true);
  });

  it('should reveal a sensitive background with the sensitive content control', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.canvas') as HTMLElement).click();
    fixture.detectChanges();
    const sensitiveToggle = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.widget-settings input[type="checkbox"]',
      ) as NodeListOf<HTMLInputElement>,
    ).find((input) => (input.parentElement?.textContent ?? '').includes('Sensitive content')) as
      HTMLInputElement | undefined;
    sensitiveToggle!.click();
    fixture.detectChanges();

    const renderer = fixture.nativeElement.querySelector('widget-renderer');
    expect(renderer.querySelector('.widget-background')?.classList.contains('is-sensitive')).toBe(
      true,
    );

    (
      renderer.querySelector('.icon-button[aria-label="Show sensitive data"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(renderer.querySelector('.widget-background')?.classList.contains('is-sensitive')).toBe(
      false,
    );
  });

  it('should clamp selected element placement and span values', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const numberInputs = fixture.nativeElement.querySelectorAll(
      '.settings-panel .placement input',
    ) as NodeListOf<HTMLInputElement>;
    numberInputs[0].value = '99';
    numberInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    numberInputs[2].value = '99';
    numberInputs[2].dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: { type: string; grid: { row: number; rowSpan: number } }[] };
    const headline = contract.elements.find((element) => element.type === 'text');

    expect(headline?.grid.row).toBe(2);
    expect(headline?.grid.rowSpan).toBe(1);
  });
});
