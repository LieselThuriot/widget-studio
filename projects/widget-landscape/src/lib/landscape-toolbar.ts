import { Component, input, output } from '@angular/core';

@Component({
  selector: 'widget-landscape-toolbar',
  templateUrl: './landscape-toolbar.html',
  styleUrl: './landscape-toolbar.css',
  host: { style: 'display: contents' },
})
export class LandscapeToolbar {
  readonly editing = input(false);
  readonly hasPalette = input(false);
  readonly columnsLocked = input(false);
  readonly responsiveControlled = input(false);
  readonly columns = input.required<number>();
  readonly minimumColumns = input.required<number>();
  readonly responsive = input(false);
  readonly editRequested = output<void>();
  readonly editCancelled = output<void>();
  readonly confirm = output<void>();
  readonly columnsChanged = output<Event>();
  readonly responsiveChanged = output<Event>();
}
