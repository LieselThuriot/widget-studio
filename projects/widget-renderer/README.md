# widget-renderer

An Angular component that renders a widget model received from a web API.

## Install

```bash
npm install widget-renderer
```

Angular `^21.0.0` or `^22.0.0` is required as a peer dependency.

## Usage

```ts
import { Component } from '@angular/core';
import { ButtonElement, WidgetContract, WidgetRenderer } from 'widget-renderer';

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
  // API responses do not need renderer-specific element IDs.
  protected readonly widget: WidgetContract = /* API response */;

  protected refresh(): void {
    // Refresh data in the host application.
  }

  protected runAction(event: { element: ButtonElement; event: Event }): void {
    // Handle event.element.method, url, and body in the host application.
  }
}
```

The component owns sensitive-data visibility and renders the refresh control. It does not contain editor interactions such as selection, dragging, resizing, or layer management.

## API contract and internal IDs

`WidgetRenderer` accepts a `WidgetContract` without element IDs. It hydrates each element with a client-only internal ID before rendering. Consumers do not need to add IDs, persist them, or send them back to the API. When an ID-free response updates in place, IDs are retained by element position and type; APIs that need identity across reorder or replacement should provide a domain key separately.

The `Widget` type represents the hydrated model and is useful for editor integrations. Advanced consumers can call `hydrateWidget()` directly when they need access to the internal model.
