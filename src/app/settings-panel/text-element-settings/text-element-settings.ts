import { Component, input, output } from '@angular/core';
import { FontStyle, TextElement } from 'widget-renderer';
import { ColorPicker } from '../../color-picker/color-picker';
import { eventChecked, eventNumber, eventValue } from '../form-events';

@Component({
  selector: 'app-text-element-settings',
  imports: [ColorPicker],
  templateUrl: './text-element-settings.html',
  styleUrl: './text-element-settings.css',
})
export class TextElementSettings {
  readonly element = input.required<TextElement>();
  readonly changed = output<Partial<TextElement>>();

  protected value(event: Event): string {
    return eventValue(event);
  }

  protected number(event: Event): number {
    return eventNumber(event);
  }

  protected checked(event: Event): boolean {
    return eventChecked(event);
  }

  protected alignment(event: Event): TextElement['style']['align'] {
    const value = eventValue(event);
    return value === 'center' || value === 'right' ? value : 'left';
  }

  protected toggleDecoration(decoration: 'underline' | 'line-through'): FontStyle['decoration'] {
    const current = this.element().style.font.decoration ?? 'none';
    const decorations = new Set(current === 'none' ? [] : current.split(' '));
    if (decorations.has(decoration)) {
      decorations.delete(decoration);
    } else {
      decorations.add(decoration);
    }
    return decorations.has('underline')
      ? decorations.has('line-through')
        ? 'underline line-through'
        : 'underline'
      : decorations.has('line-through')
        ? 'line-through'
        : 'none';
  }
}
