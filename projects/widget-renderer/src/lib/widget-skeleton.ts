import { Component, input } from '@angular/core';
import { Widget } from './widget.model';
import { defaultWidgetRendererLocale, WidgetRendererLocale } from './widget-locale';

@Component({
  selector: 'widget-skeleton',
  templateUrl: './widget-skeleton.html',
  styleUrl: './widget-skeleton.css',
})
export class WidgetSkeleton {
  readonly size = input.required<Widget['size']>();
  readonly darkMode = input(false);
  readonly locale = input<WidgetRendererLocale>(defaultWidgetRendererLocale);
}
