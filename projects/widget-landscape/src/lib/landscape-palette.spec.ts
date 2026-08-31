import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LandscapePalette } from './landscape-palette';

describe('LandscapePalette', () => {
  let fixture: ComponentFixture<LandscapePalette>;
  const item = {
    id: 'new',
    label: 'New widget',
    description: 'A widget',
    size: 'square' as const,
    createWidget: () => ({ id: 'new', size: 'square' }) as never,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LandscapePalette] }).compileComponents();
    fixture = TestBed.createComponent(LandscapePalette);
    fixture.componentRef.setInput('items', [item]);
    fixture.detectChanges();
  });

  it('emits the selected palette item and renders its footprint', () => {
    let added: unknown;
    fixture.componentInstance.added.subscribe((value) => (added = value));

    (fixture.nativeElement.querySelector('.palette-item') as HTMLButtonElement).click();

    expect(added).toBe(item);
    expect(fixture.nativeElement.querySelector('.palette-size')?.textContent?.trim()).toBe('2 × 2');
  });

  it('disables invalid palette items', () => {
    fixture.componentRef.setInput('invalidIds', ['new']);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement.querySelector('.palette-item') as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
