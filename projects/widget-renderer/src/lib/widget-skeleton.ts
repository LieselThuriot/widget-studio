import { Component, input } from '@angular/core';
import { Widget } from './widget.model';

@Component({
  selector: 'widget-skeleton',
  templateUrl: './widget-skeleton.html',
  styleUrl: './widget-skeleton.css',
})
export class WidgetSkeleton {
  readonly size = input.required<Widget['size']>();
  readonly darkMode = input(false);
}
