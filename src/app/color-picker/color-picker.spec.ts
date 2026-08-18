import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPicker } from './color-picker';

@Component({
  imports: [ColorPicker],
  template: `<app-color-picker label="Background" [value]="value" [withAlpha]="withAlpha" />`,
})
class TestHost {
  value: string | undefined;
  withAlpha = false;
}

describe('ColorPicker', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
  });

  it('does not render an unset value as black', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input.value).toBe('#ffffff');
    expect(input.parentElement?.classList.contains('is-transparent')).toBe(true);
  });

  it('marks transparent and fully transparent colors as transparent', () => {
    fixture.componentInstance.value = 'transparent';
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('input[type="color"]') as HTMLInputElement).parentElement
        ?.classList,
    ).toContain('is-transparent');

    fixture.componentInstance.value = '#64748b00';
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('input[type="color"]') as HTMLInputElement).parentElement
        ?.classList,
    ).toContain('is-transparent');
  });

  it('preserves the visible part of a valid color', () => {
    fixture.componentInstance.value = '#64748bcc';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input.value).toBe('#64748b');
    expect(input.parentElement?.classList.contains('is-transparent')).toBe(false);
  });
});
