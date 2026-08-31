import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WidgetElementRenderer } from './widget-element-renderer';
import { ImageElement } from './widget.model';

function image(source: string): ImageElement {
  return {
    type: 'image',
    source,
    alt: 'Test image',
    fit: 'contain',
    radius: 0,
    grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    sensitive: false,
  };
}

describe('WidgetElementRenderer', () => {
  let fixture: ComponentFixture<WidgetElementRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetElementRenderer],
    }).compileComponents();
    fixture = TestBed.createComponent(WidgetElementRenderer);
  });

  it('does not carry an image failure to a replacement element with the same source', async () => {
    fixture.componentRef.setInput('element', image('https://example.test/image.png'));
    await fixture.whenStable();

    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.image-placeholder')).not.toBeNull();

    fixture.componentRef.setInput('element', image('https://example.test/image.png'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.image-placeholder')).toBeNull();
  });
});
