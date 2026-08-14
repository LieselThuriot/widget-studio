# widget-renderer

An Angular component that renders a widget model.

## Install

```bash
npm install widget-renderer
```

Angular `^21.0.0` or `^22.0.0` is required as a peer dependency.

## Usage

```ts
import { Component } from '@angular/core';
import { ButtonElement, Widget, WidgetRenderer } from 'widget-renderer';

@Component({
  imports: [WidgetRenderer],
  template: `
    <widget-renderer
      [widget]="widget"
      (refreshRequested)="refresh()"
      (actionRequested)="runAction($event)"
    />
  `,
})
export class WidgetHost {
  protected readonly widget: Widget = /* Widget model */;

  protected refresh(): void {
    // Refresh data in the host application.
  }

  protected runAction(event: { element: ButtonElement; event: Event }): void {
    // Handle event.element.method, url, and body in the host application.
  }
}
```

The component owns sensitive-data visibility and renders the refresh control. It does not contain editor interactions such as selection, dragging, resizing, or layer management.
