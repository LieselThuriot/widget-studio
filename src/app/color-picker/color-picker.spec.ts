import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPicker } from './color-picker';

@Component({
  imports: [ColorPicker],
  template: `<app-color-picker
    label="Background"
    [value]="value"
    [alphaDefault]="alphaDefault"
    (changed)="changedValue = $event"
  />`,
})
class TestHost {
  value: string | undefined;
  alphaDefault = 100;
  changedValue: string | undefined;
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

  it('defaults to full opacity and emits six-digit colors', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="color"]') as HTMLInputElement;
    input.value = '#64748b';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(fixture.componentInstance.changedValue).toBe('#64748b');
  });

  it('emits eight-digit colors below full opacity', () => {
    fixture.componentInstance.value = '#64748b';
    fixture.detectChanges();
    const opacity = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
    opacity.value = '60';
    opacity.dispatchEvent(new Event('input', { bubbles: true }));

    expect(fixture.componentInstance.changedValue).toBe('#64748b99');
  });
});
