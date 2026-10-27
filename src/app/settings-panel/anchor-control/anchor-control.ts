import { Component, input, output } from '@angular/core';
import { ElementAnchor } from '@lieselthuriot/widget-renderer';

@Component({
  selector: 'app-anchor-control',
  templateUrl: './anchor-control.html',
  styleUrl: './anchor-control.css',
})
export class AnchorControl {
  readonly value = input.required<ElementAnchor>();
  readonly ariaLabel = input('Element anchor');
  readonly changed = output<ElementAnchor>();

  protected readonly anchors: { value: ElementAnchor; icon: string }[] = [
    { value: 'top left', icon: '↖' },
    { value: 'top center', icon: '↑' },
    { value: 'top right', icon: '↗' },
    { value: 'center left', icon: '←' },
    { value: 'center', icon: '•' },
    { value: 'center right', icon: '→' },
    { value: 'bottom left', icon: '↙' },
    { value: 'bottom center', icon: '↓' },
    { value: 'bottom right', icon: '↘' },
  ];
}
