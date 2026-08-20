import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
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

  it('should toggle and persist dark mode', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const themeButton = fixture.nativeElement.querySelector('.theme-button') as HTMLButtonElement;
    expect(themeButton.getAttribute('aria-pressed')).toBe('false');

    themeButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(themeButton.getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.classList.contains('is-dark')).toBe(true);
    expect(localStorage.getItem('widget-studio-theme')).toBe('dark');

    const previewButton = fixture.nativeElement.querySelector(
      '.preview-button',
    ) as HTMLButtonElement;
    previewButton.click();
    fixture.detectChanges();
    const loadingToggle = fixture.nativeElement.querySelector(
      '.loading-toggle',
    ) as HTMLButtonElement;
    loadingToggle.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(
        '.preview-dialog .widget-skeleton.is-dark, .preview-window .widget-skeleton.is-dark',
      ),
    ).toBeTruthy();
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

  it('should omit a cleared background image from the output contract', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.canvas') as HTMLElement).click();
    fixture.detectChanges();

    const imageInput = fixture.nativeElement.querySelector(
      '.widget-settings textarea',
    ) as HTMLTextAreaElement;
    imageInput.value = '';
    imageInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { background: Record<string, unknown> };
    expect(contract.background).not.toHaveProperty('image');
  });

  it('should omit anchors from chart grid contracts', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: { type: string; grid?: { anchor?: string } }[] };

    const chartElements = contract.elements.filter((element) =>
      ['pie', 'donut', 'funnel', 'gauge', 'bar', 'line'].includes(element.type),
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

  it('should add a divider with its public defaults', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const divider = Array.from(
      fixture.nativeElement.querySelectorAll('.palette-item') as NodeListOf<HTMLButtonElement>,
    ).find((item) => item.textContent?.includes('Divider')) as HTMLButtonElement;

    divider.click();
    fixture.detectChanges();

    const contract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as { elements: Record<string, unknown>[] };
    const dividerElement = contract.elements.find((element) => element['type'] === 'divider');

    expect(dividerElement).toMatchObject({
      orientation: 'horizontal',
      style: { color: '#64748b' },
    });
    expect(dividerElement).not.toHaveProperty('sensitive');
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
        'app-chart-element-settings app-color-picker',
      ) as NodeListOf<HTMLElement>,
    )
      .find((input) => input.textContent?.includes('Legend color'))
      ?.querySelector('input[type="color"]') as HTMLInputElement;
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
        'app-chart-element-settings app-color-picker',
      ) as NodeListOf<HTMLElement>,
    )
      .find((input) => input.textContent?.includes('Legend color'))
      ?.querySelector('input[type="color"]') as HTMLInputElement;
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
    const labels = [
      ...Array.from(settings.querySelectorAll('label')).map((label) =>
        label.textContent?.replace(/\s+/g, ' ').trim(),
      ),
      ...Array.from(settings.querySelectorAll('app-color-picker .color-picker-label span')).map(
        (label) => label.textContent?.replace(/\s+/g, ' ').trim(),
      ),
    ];

    expect(labels).toEqual([
      'Title',
      'Opacity 100%',
      'Value',
      'Minimum',
      'Maximum',
      'Opacity 100%',
      'Opacity 100%',
      'Show legendDisplay gauge labels and value',
      'Opacity 100%',
      'Font size',
      'Title color',
      'Fill color',
      'Track color',
      'Legend color',
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
      '.element-actions-menu .menu-delete',
    ) as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.layer').length).toBe(3);
  });

  it('should open layer actions from the context menu', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const layer = fixture.nativeElement.querySelector('.layer') as HTMLElement;

    layer.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.element-actions-menu')).toBeTruthy();
    expect(layer.classList.contains('selected')).toBe(true);
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

    expect(fixture.nativeElement.querySelector('.element-actions-menu')).toBeNull();
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
    ) as { elements: { id?: string; type: string; style?: { font?: { bold?: boolean } } }[] };
    const headline = contract.elements.find((element) => element.type === 'text');

    expect(headline?.style?.font?.bold).toBe(false);
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
    ) as {
      elements: {
        type: string;
        style?: { font?: { underline?: boolean; strikethrough?: boolean } };
      }[];
    };
    const headline = contract.elements.find((element) => element.type === 'text');
    expect(headline?.style?.font?.underline).toBe(true);
    expect(headline?.style?.font?.strikethrough).toBe(true);

    underline.click();
    fixture.detectChanges();
    const updatedContract = JSON.parse(
      fixture.nativeElement.querySelector('pre')?.textContent ?? '{}',
    ) as {
      elements: {
        type: string;
        style?: { font?: { underline?: boolean; strikethrough?: boolean } };
      }[];
    };
    const updatedHeadline = updatedContract.elements.find((element) => element.type === 'text');

    expect(updatedHeadline?.style?.font?.underline).toBe(false);
    expect(updatedHeadline?.style?.font?.strikethrough).toBe(true);
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
    const editGrid = fixture.nativeElement.querySelector('.edit-grid-button') as HTMLButtonElement;
    editGrid.click();
    fixture.detectChanges();

    const addRow = fixture.nativeElement.querySelector(
      '.grid-editor-dialog .row-add',
    ) as HTMLButtonElement;
    addRow.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dimensions')?.textContent).toContain('530');
    expect(fixture.nativeElement.querySelectorAll('.grid-editor-dialog .row-label')).toHaveLength(
      4,
    );
    expect(fixture.nativeElement.querySelectorAll('.grid-editor-dialog .grid-cell')).toHaveLength(
      12,
    );
    expect(
      fixture.nativeElement.querySelectorAll('.grid-editor-dialog .grid-cell.selected'),
    ).toHaveLength(1);
    const preview = fixture.nativeElement.querySelector(
      '.grid-editor-dialog .grid-preview',
    ) as HTMLElement;
    expect(preview.style.gridTemplateColumns).toContain('1fr');
    expect(preview.style.gridTemplateRows).toContain('1fr');

    const firstRowSize = fixture.nativeElement.querySelector(
      '.selection-editor label:first-child input',
    ) as HTMLInputElement;
    firstRowSize.value = '20';
    firstRowSize.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.grid-editor-dialog .row-label')?.textContent,
    ).toContain('auto');

    const secondCell = fixture.nativeElement.querySelectorAll(
      '.grid-editor-dialog .grid-cell',
    )[1] as HTMLButtonElement;
    secondCell.click();
    fixture.detectChanges();
    expect(secondCell.classList.contains('selected')).toBe(true);

    (
      fixture.nativeElement.querySelector(
        '.grid-editor-dialog .primary-button',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.grid-editor-dialog')).toBeNull();
  });

  it('should display auto grid tracks without their stored size', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.canvas') as HTMLElement).click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.edit-grid-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const columnUnit = fixture.nativeElement.querySelector(
      '#selected-column-unit',
    ) as HTMLSelectElement;
    columnUnit.value = 'auto';
    columnUnit.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.column-label')?.textContent).toContain('auto');
    expect(fixture.nativeElement.querySelector('.column-label')?.textContent).not.toContain('1');
    expect(
      (fixture.nativeElement.querySelector('.grid-editor-dialog .grid-preview') as HTMLElement)
        .style.gridTemplateColumns,
    ).toContain('auto');
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
