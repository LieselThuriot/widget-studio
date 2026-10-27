import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WidgetRenderer } from '@lieselthuriot/widget-renderer';
import { beforeEach, describe, expect, it } from 'vitest';
import { LandscapeItem } from './landscape-item';

describe('LandscapeItem', () => {
  let fixture: ComponentFixture<LandscapeItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LandscapeItem] }).compileComponents();
    fixture = TestBed.createComponent(LandscapeItem);
    fixture.componentRef.setInput('item', {
      id: 'item',
      size: 'mini',
      widget: { id: 'item', size: 'mini' } as never,
      row: 0,
      column: 0,
    });
    fixture.componentRef.setInput('editing', true);
    fixture.detectChanges();
  });

  it('emits movement intent for an arrow key', () => {
    let movement: { id: string; row: number; column: number } | undefined;
    fixture.componentInstance.moved.subscribe((value) => (movement = value));

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    fixture.nativeElement.querySelector('.landscape-item').dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(movement).toEqual({ id: 'item', row: 0, column: 1 });
  });

  it('does not treat a nested button key as item movement', () => {
    let movement = false;
    fixture.componentInstance.moved.subscribe(() => (movement = true));
    const button = fixture.nativeElement.querySelector('.landscape-icon-button') as HTMLElement;

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(movement).toBe(false);
  });

  it('preserves the placement size for a loading skeleton', () => {
    fixture.componentRef.setInput('item', {
      id: 'item',
      size: 'wide',
      widget: null,
      row: 0,
      column: 0,
    });
    fixture.detectChanges();

    const renderer = fixture.debugElement.query(By.directive(WidgetRenderer))
      .componentInstance as WidgetRenderer;
    expect(renderer.loading()).toBe('wide');
    expect(
      (fixture.nativeElement.querySelector('.landscape-item') as HTMLElement).style.gridArea,
    ).toBe('1 / 1 / 3 / 5');
  });
});
