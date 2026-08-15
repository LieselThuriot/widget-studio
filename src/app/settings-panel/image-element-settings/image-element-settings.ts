import { Component, input, output } from '@angular/core';
import { ImageElement } from 'widget-renderer';
import { ColorPicker } from '../../color-picker/color-picker';
import { AnchorControl } from '../anchor-control/anchor-control';
import { eventNumber, eventValue } from '../form-events';

@Component({
  selector: 'app-image-element-settings',
  imports: [ColorPicker, AnchorControl],
  templateUrl: './image-element-settings.html',
  styleUrl: './image-element-settings.css',
})
export class ImageElementSettings {
  readonly element = input.required<ImageElement>();
  readonly changed = output<Partial<ImageElement>>();
  readonly radiusChanged = output<number>();

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected number(event: Event): number {
    return eventNumber(event);
  }

  protected fit(event: Event): ImageElement['fit'] {
    const value = eventValue(event);
    return value === 'contain' || value === 'fill' ? value : 'cover';
  }
}
