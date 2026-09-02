import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LandscapeState, LandscapeStateChange } from './landscape.model';
import { WidgetLandscapeLocale } from './landscape-locale';
import { WidgetLandscape } from './widget-landscape';

describe('WidgetLandscape', () => {
  let fixture: ComponentFixture<WidgetLandscape>;

  const state: LandscapeState = {
    version: 1,
    columns: 8,
    responsive: false,
    widgets: [
      {
        id: 'mini',
        size: 'mini',
        widget: { id: 'mini', size: 'mini' } as never,
        row: 0,
        column: 7,
      },
    ],
  };
  const palette = [
    {
      id: 'new-widget',
      label: 'New widget',
      createWidget: () => ({ id: 'new-widget', size: 'mini' }) as never,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WidgetLandscape] }).compileComponents();
    fixture = TestBed.createComponent(WidgetLandscape);
    fixture.componentRef.setInput('state', structuredClone(state));
    fixture.componentRef.setInput('palette', palette);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function recreateResponsiveFixture(
    responsiveState: LandscapeState,
    editMode = false,
  ): { observerCount: () => number } {
    fixture.destroy();
    let observers = 0;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(_callback: ResizeObserverCallback) {
          observers++;
        }
        observe(): void {
          return;
        }
        unobserve(): void {
          return;
        }
        disconnect(): void {
          return;
        }
      },
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 310,
      height: 560,
      top: 0,
      right: 310,
      bottom: 560,
      left: 0,
      toJSON: () => ({}),
    });
    fixture = TestBed.createComponent(WidgetLandscape);
    fixture.componentRef.setInput('state', structuredClone(responsiveState));
    fixture.componentRef.setInput('palette', palette);
    fixture.componentRef.setInput('responsive', true);
    fixture.componentRef.setInput('editMode', editMode);
    fixture.detectChanges();
    return { observerCount: () => observers };
  }

  function enterEdit(): void {
    (fixture.nativeElement.querySelector('.landscape-icon-button') as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  function columnInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      '[aria-label="Landscape columns"]',
    ) as HTMLInputElement;
  }

  it('edits columns in the draft and emits the changed count on confirmation', () => {
    let change: LandscapeStateChange | undefined;
    fixture.componentInstance.stateChange.subscribe((value) => (change = value));
    enterEdit();

    const input = columnInput();
    input.value = '3';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(input.value).toBe('3');

    (
      fixture.nativeElement.querySelector('.landscape-button--primary') as HTMLButtonElement
    ).click();
    expect(change?.columns).toBe(3);
    expect(change?.widgets[0]).toMatchObject({ row: 0, column: 2 });
  });

  it('restores the original columns and layout when editing is cancelled', () => {
    enterEdit();

    const input = columnInput();
    input.value = '2';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(input.value).toBe('2');

    (
      fixture.nativeElement.querySelector(
        '.landscape-button:not(.landscape-button--primary)',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    enterEdit();

    expect(columnInput().value).toBe('8');
  });

  it('hides the column editor when columns are locked', () => {
    fixture.componentRef.setInput('columnsLocked', true);
    enterEdit();

    expect(columnInput()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('8 columns');
  });

  it('hides the edit button when the palette is empty', () => {
    fixture.componentRef.setInput('palette', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[aria-label="Edit landscape"]')).toBeNull();
  });

  it('hides the edit button when the palette is null', () => {
    fixture.componentRef.setInput('palette', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[aria-label="Edit landscape"]')).toBeNull();
  });

  it('hides edit actions when editing with an empty palette', () => {
    fixture.componentRef.setInput('palette', []);
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.landscape-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.landscape-button--primary')).toBeNull();
  });

  it('hides edit actions when editing with a null palette', () => {
    fixture.componentRef.setInput('palette', null);
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.landscape-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.landscape-button--primary')).toBeNull();
  });

  it('clears controlled edit state when editMode is turned off', () => {
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();
    const input = columnInput();
    input.value = '3';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.componentRef.setInput('editMode', false);
    fixture.detectChanges();
    expect(columnInput()).toBeNull();

    fixture.componentRef.setInput('state', { ...structuredClone(state), columns: 6 });
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();
    expect(columnInput().value).toBe('6');
  });

  it('shows the edit button when the palette has an item', () => {
    expect(fixture.nativeElement.querySelector('[aria-label="Edit landscape"]')).not.toBeNull();
  });

  it('renders the supplied locale for visible landscape UI', () => {
    const locale: WidgetLandscapeLocale = {
      landscape: 'Tableau',
      columns: 'Colonnes',
      responsive: 'Adaptatif',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      addWidget: 'Ajouter un widget',
      clearAll: 'Tout effacer',
      emptyEditMode: "Choisissez un widget dans la palette pour l'ajouter.",
      emptyLandscape: 'Ouvrez le mode édition pour ajouter un widget.',
      columnCount: (count) => `${count} colonnes`,
      refreshFallback: 'Actualiser le widget',
      aria: {
        columns: 'Colonnes du tableau',
        responsive: 'Tableau adaptatif',
        edit: 'Modifier le tableau',
        widgets: 'Widgets',
        widgetFootprint: (columns, rows) => `Taille du widget : ${columns} × ${rows}`,
        selectWidget: 'Sélectionner le widget',
        deleteWidget: 'Supprimer le widget',
      },
    };

    fixture.componentRef.setInput('locale', locale);
    fixture.detectChanges();
    enterEdit();

    expect(fixture.nativeElement.querySelector('.landscape-kicker').textContent).toContain(
      'Tableau',
    );
    expect(fixture.nativeElement.querySelector('.landscape-columns-field').textContent).toContain(
      'Colonnes',
    );
    expect(
      fixture.nativeElement.querySelector('.landscape-responsive-label').textContent,
    ).toContain('Adaptatif');
    expect(fixture.nativeElement.querySelector('.landscape-clear-button').textContent).toContain(
      'Tout effacer',
    );
    expect(fixture.nativeElement.querySelector('.landscape-button').textContent).toContain(
      'Annuler',
    );
    expect(fixture.nativeElement.querySelector('.landscape-button--primary').textContent).toContain(
      'Confirmer',
    );
    expect(
      fixture.nativeElement.querySelector('[aria-label="Colonnes du tableau"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Tableau adaptatif"]')).not.toBeNull();
  });

  it('updates visible locale text when the locale changes', () => {
    fixture.componentRef.setInput('state', { ...structuredClone(state), widgets: [] });
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.landscape-empty').textContent).toContain(
      'Choose a widget',
    );

    fixture.componentRef.setInput('locale', {
      ...fixture.componentInstance.locale(),
      emptyEditMode: 'Ajoutez un widget depuis la palette.',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.landscape-empty').textContent).toContain(
      'Ajoutez un widget depuis la palette.',
    );
  });

  it('falls back to English for omitted locale values', () => {
    fixture.componentRef.setInput('locale', { cancel: 'Abandonner' });
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.landscape-button').textContent).toContain(
      'Abandonner',
    );
    expect(fixture.nativeElement.querySelector('.landscape-button--primary').textContent).toContain(
      'Confirm',
    );
  });

  it('merges partial ARIA overrides with the default locale', () => {
    fixture.componentRef.setInput('locale', { aria: { deleteWidget: 'Supprimer le widget' } });
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[aria-label="Supprimer le widget"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Landscape columns"]')).not.toBeNull();
  });

  it('keeps responsive mode disabled by default', () => {
    expect(fixture.componentInstance.responsive()).toBeUndefined();
    expect(fixture.nativeElement.querySelector('.landscape-shell.is-responsive')).toBeNull();
  });

  it('enables responsive mode without changing the configured state', () => {
    fixture.componentRef.setInput('responsive', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.responsive()).toBe(true);
    expect(fixture.nativeElement.querySelector('.landscape-shell.is-responsive')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.landscape-grid')?.getAttribute('style')).toContain(
      '--landscape-columns: 8',
    );
  });

  it('recalculates responsive columns when a loaded widget footprint changes', () => {
    const responsiveState = {
      ...structuredClone(state),
      responsive: true,
      widgets: [
        {
          ...structuredClone(state.widgets[0]),
          column: 0,
          widget: { id: 'mini', size: 'mini' } as never,
        },
      ],
    };
    const observer = recreateResponsiveFixture(responsiveState);
    expect(
      fixture.nativeElement
        .querySelector('.landscape-grid')
        .style.getPropertyValue('--landscape-columns'),
    ).toBe('2');

    fixture.componentRef.setInput('state', {
      ...responsiveState,
      widgets: [
        {
          ...responsiveState.widgets[0],
          widget: { id: 'mini', size: 'wide' } as never,
        },
      ],
    });
    fixture.detectChanges();

    expect(observer.observerCount()).toBe(1);
    expect(
      fixture.nativeElement
        .querySelector('.landscape-grid')
        .style.getPropertyValue('--landscape-columns'),
    ).toBe('4');
    expect(fixture.nativeElement.querySelectorAll('.landscape-item')).toHaveLength(1);
    expect(
      (fixture.nativeElement.querySelector('.landscape-item') as HTMLElement).style.gridArea,
    ).toBe('1 / 1 / 3 / 5');
  });

  it('preserves widget locations when responsive width has room for them', () => {
    const responsiveState = {
      ...structuredClone(state),
      responsive: true,
      widgets: [
        { ...structuredClone(state.widgets[0]), id: 'first', row: 4, column: 1 },
        { ...structuredClone(state.widgets[0]), id: 'second', row: 8, column: 0 },
      ],
    };
    recreateResponsiveFixture(responsiveState);

    const items = fixture.nativeElement.querySelectorAll('.landscape-item');
    expect((items[0] as HTMLElement).style.gridArea).toBe('5 / 2 / 6 / 3');
    expect((items[1] as HTMLElement).style.gridArea).toBe('9 / 1 / 10 / 2');
    expect(responsiveState.widgets.map(({ row, column }) => ({ row, column }))).toEqual([
      { row: 4, column: 1 },
      { row: 8, column: 0 },
    ]);
  });

  it('packs widgets only after one overflows the responsive width', () => {
    const responsiveState = {
      ...structuredClone(state),
      responsive: true,
      widgets: [
        { ...structuredClone(state.widgets[0]), id: 'first', row: 4, column: 2 },
        { ...structuredClone(state.widgets[0]), id: 'second', row: 8, column: 0 },
      ],
    };
    recreateResponsiveFixture(responsiveState);

    const items = fixture.nativeElement.querySelectorAll('.landscape-item');
    expect((items[0] as HTMLElement).style.gridArea).toBe('1 / 1 / 2 / 2');
    expect((items[1] as HTMLElement).style.gridArea).toBe('1 / 2 / 2 / 3');
  });

  it('moves from visible responsive coordinates with the keyboard', () => {
    let change: LandscapeStateChange | undefined;
    recreateResponsiveFixture(
      {
        version: 1,
        columns: 4,
        responsive: true,
        widgets: [
          { ...structuredClone(state.widgets[0]), id: 'first', column: 2 },
          { ...structuredClone(state.widgets[0]), id: 'moving', column: 3 },
        ],
      },
      true,
    );
    fixture.componentInstance.stateChange.subscribe((value) => (change = value));

    const moving = fixture.nativeElement.querySelectorAll('.landscape-item')[1] as HTMLElement;
    moving.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('.landscape-button--primary') as HTMLButtonElement
    ).click();

    expect(change?.columns).toBe(4);
    expect(change?.widgets.find(({ id }) => id === 'moving')).toMatchObject({
      row: 0,
      column: 2,
    });
    expect(change?.widgets.find(({ id }) => id === 'first')).toMatchObject({ row: 0, column: 0 });
  });

  it('commits drag movement from the visible responsive layout', () => {
    let change: LandscapeStateChange | undefined;
    recreateResponsiveFixture(
      {
        version: 1,
        columns: 4,
        responsive: true,
        widgets: [
          { ...structuredClone(state.widgets[0]), id: 'first', column: 2 },
          { ...structuredClone(state.widgets[0]), id: 'moving', column: 3 },
        ],
      },
      true,
    );
    fixture.componentInstance.stateChange.subscribe((value) => (change = value));
    const grid = fixture.nativeElement.querySelector('.landscape-grid') as HTMLElement;
    const moving = fixture.nativeElement.querySelectorAll('.landscape-item')[1] as HTMLElement;

    moving.dispatchEvent(new Event('dragstart', { bubbles: true, cancelable: true }));
    grid.dispatchEvent(
      new MouseEvent('dragover', {
        clientX: 20,
        clientY: 20,
        bubbles: true,
        cancelable: true,
      }),
    );
    grid.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('.landscape-button--primary') as HTMLButtonElement
    ).click();

    expect(change?.widgets.find(({ id }) => id === 'moving')).toMatchObject({
      row: 0,
      column: 0,
    });
    expect(change?.widgets.find(({ id }) => id === 'first')).toMatchObject({ row: 0, column: 1 });
  });

  it('previews responsive collision displacement using committed columns', () => {
    vi.useFakeTimers();
    recreateResponsiveFixture(
      {
        version: 1,
        columns: 4,
        responsive: true,
        widgets: [
          { ...structuredClone(state.widgets[0]), id: 'target', row: 0, column: 0 },
          { ...structuredClone(state.widgets[0]), id: 'moving', row: 1, column: 1 },
        ],
      },
      true,
    );

    const grid = fixture.nativeElement.querySelector('.landscape-grid') as HTMLElement;
    const moving = fixture.nativeElement.querySelectorAll('.landscape-item')[1] as HTMLElement;
    moving.dispatchEvent(new Event('dragstart', { bubbles: true, cancelable: true }));
    grid.dispatchEvent(
      new MouseEvent('dragover', {
        clientX: 20,
        clientY: 20,
        bubbles: true,
        cancelable: true,
      }),
    );

    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.landscape-item');
    expect((items[0] as HTMLElement).style.gridArea).toBe('1 / 1 / 2 / 2');
    expect((items[1] as HTMLElement).style.gridArea).toBe('1 / 2 / 2 / 3');
  });

  it('shows the responsive toggle only when the input is omitted', () => {
    enterEdit();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Responsive landscape"]'),
    ).not.toBeNull();

    fixture.componentRef.setInput('responsive', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Responsive landscape"]')).toBeNull();
  });

  it('emits the toggled responsive value on confirmation', () => {
    let change: LandscapeStateChange | undefined;
    fixture.componentRef.setInput('state', { ...structuredClone(state), responsive: false });
    fixture.componentInstance.stateChange.subscribe((value) => (change = value));
    enterEdit();

    const toggle = fixture.nativeElement.querySelector(
      '[aria-label="Responsive landscape"]',
    ) as HTMLInputElement;
    toggle.click();
    fixture.detectChanges();
    expect(change).toBeUndefined();

    (
      fixture.nativeElement.querySelector('.landscape-button--primary') as HTMLButtonElement
    ).click();
    expect(change?.responsive).toBe(true);
  });

  it('reverts the responsive toggle when editing is cancelled', () => {
    fixture.componentRef.setInput('state', { ...structuredClone(state), responsive: false });
    fixture.detectChanges();
    enterEdit();

    (
      fixture.nativeElement.querySelector('[aria-label="Responsive landscape"]') as HTMLInputElement
    ).click();
    fixture.detectChanges();
    expect(
      (
        fixture.nativeElement.querySelector(
          '[aria-label="Responsive landscape"]',
        ) as HTMLInputElement
      ).checked,
    ).toBe(true);

    (
      fixture.nativeElement.querySelector(
        '.landscape-button:not(.landscape-button--primary)',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    enterEdit();
    expect(
      (
        fixture.nativeElement.querySelector(
          '[aria-label="Responsive landscape"]',
        ) as HTMLInputElement
      ).checked,
    ).toBe(false);
  });

  it('clears all widgets from the draft and emits an empty layout on confirmation', () => {
    let change: LandscapeStateChange | undefined;
    fixture.componentInstance.stateChange.subscribe((value) => (change = value));
    enterEdit();

    const clearButton = fixture.nativeElement.querySelector(
      '.landscape-clear-button',
    ) as HTMLButtonElement;
    expect(clearButton.disabled).toBe(false);
    clearButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.landscape-item')).toHaveLength(0);
    expect(clearButton.disabled).toBe(true);

    (
      fixture.nativeElement.querySelector('.landscape-button--primary') as HTMLButtonElement
    ).click();
    expect(change?.widgets).toEqual([]);
  });

  it('restores cleared widgets when editing is cancelled', () => {
    enterEdit();

    (fixture.nativeElement.querySelector('.landscape-clear-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.landscape-item')).toHaveLength(0);

    (
      fixture.nativeElement.querySelector(
        '.landscape-button:not(.landscape-button--primary)',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    enterEdit();

    expect(fixture.nativeElement.querySelectorAll('.landscape-item')).toHaveLength(1);
  });

  it('disables clear all when the landscape has no widgets', () => {
    fixture.componentRef.setInput('state', { ...structuredClone(state), widgets: [] });
    fixture.detectChanges();
    enterEdit();

    expect(
      (fixture.nativeElement.querySelector('.landscape-clear-button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('shows an add-widget prompt after clearing in edit mode', () => {
    enterEdit();

    (fixture.nativeElement.querySelector('.landscape-clear-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.landscape-empty')?.textContent).toContain(
      'Choose a widget from the palette to add it.',
    );
    expect(fixture.nativeElement.querySelector('.landscape-empty')?.textContent).not.toContain(
      'Open edit mode',
    );
  });

  it('shows the column boundary at the end of the configured grid', () => {
    enterEdit();

    const boundary = fixture.nativeElement.querySelector(
      '.landscape-column-boundary',
    ) as HTMLElement;
    expect(boundary.style.left).toBe('1138px');

    const input = columnInput();
    input.value = '4';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(boundary.style.left).toBe('574px');
  });

  it('keeps the column boundary tied to configured columns in responsive mode', () => {
    recreateResponsiveFixture({ ...structuredClone(state), columns: 7 }, true);

    const boundary = fixture.nativeElement.querySelector(
      '.landscape-column-boundary',
    ) as HTMLElement;
    expect(boundary.style.left).toBe('997px');

    const input = columnInput();
    input.value = '4';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(boundary.style.left).toBe('574px');
  });

  it('keeps the column boundary fixed while a responsive drag preview is active', () => {
    recreateResponsiveFixture(
      {
        ...structuredClone(state),
        columns: 8,
        responsive: true,
        widgets: [{ ...structuredClone(state.widgets[0]), column: 7 }],
      },
      true,
    );

    const boundary = fixture.nativeElement.querySelector(
      '.landscape-column-boundary',
    ) as HTMLElement;
    const grid = fixture.nativeElement.querySelector('.landscape-grid') as HTMLElement;
    const moving = fixture.nativeElement.querySelector('.landscape-item') as HTMLElement;

    expect(boundary.style.left).toBe('1138px');
    moving.dispatchEvent(new Event('dragstart', { bubbles: true, cancelable: true }));
    grid.dispatchEvent(
      new MouseEvent('dragover', {
        clientX: 20,
        clientY: 20,
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();

    expect(boundary.style.left).toBe('1138px');
  });

  it('clamps responsive keyboard movement to the configured boundary', () => {
    let change: LandscapeStateChange | undefined;
    recreateResponsiveFixture(
      {
        ...structuredClone(state),
        columns: 2,
        responsive: true,
        widgets: [{ ...structuredClone(state.widgets[0]), column: 1 }],
      },
      true,
    );
    fixture.componentInstance.stateChange.subscribe((value) => (change = value));

    const moving = fixture.nativeElement.querySelector('.landscape-item') as HTMLElement;
    moving.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('.landscape-button--primary') as HTMLButtonElement
    ).click();

    expect(change?.widgets[0]).toMatchObject({ row: 0, column: 1 });
  });

  it('uses the loaded widget size for the minimum column count', () => {
    fixture.componentRef.setInput('state', {
      ...structuredClone(state),
      widgets: [
        {
          ...structuredClone(state.widgets[0]),
          size: 'mini',
          widget: { id: 'mini', size: 'square' } as never,
        },
      ],
    });
    fixture.detectChanges();
    enterEdit();

    const input = columnInput();
    expect(input.min).toBe('2');
    input.value = '1';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('2');
    expect(fixture.nativeElement.querySelectorAll('.landscape-item')).toHaveLength(1);
  });

  it('emits the authoritative loaded widget size on confirmation', () => {
    let change: LandscapeStateChange | undefined;
    fixture.componentRef.setInput('state', {
      ...structuredClone(state),
      widgets: [
        {
          ...structuredClone(state.widgets[0]),
          size: 'mini',
          widget: { id: 'mini', size: 'square' } as never,
        },
      ],
    });
    fixture.componentInstance.stateChange.subscribe((value) => (change = value));
    fixture.detectChanges();
    enterEdit();

    (
      fixture.nativeElement.querySelector('.landscape-button--primary') as HTMLButtonElement
    ).click();

    expect(change?.widgets[0].size).toBe('square');
  });
});
