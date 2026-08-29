import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { LandscapeState, LandscapeStateChange } from './landscape.model';
import { WidgetLandscape } from './widget-landscape';

describe('WidgetLandscape', () => {
  let fixture: ComponentFixture<WidgetLandscape>;

  const state: LandscapeState = {
    version: 1,
    columns: 8,
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

  function enterEdit(): void {
    (
      fixture.nativeElement.querySelector('[aria-label="Edit landscape"]') as HTMLButtonElement
    ).click();
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

  it('shows the edit button when the palette has an item', () => {
    expect(fixture.nativeElement.querySelector('[aria-label="Edit landscape"]')).not.toBeNull();
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

  it('does not remove widgets when the requested columns cannot fit them', () => {
    fixture.componentRef.setInput('state', {
      ...structuredClone(state),
      widgets: [{ ...structuredClone(state.widgets[0]), size: 'square' }],
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
});
