# widget-renderer

`widget-renderer` is an Angular component that displays a widget received from a web API.

It renders the widget on screen. It does not edit the widget, move elements, resize elements, or save changes back to your API.

## Install

```bash
npm install widget-renderer
```

The consuming Angular application must use Angular 21 or 22. ECharts 6 is also required:

```bash
npm install echarts
```

## How It Works

The normal data flow is:

```text
Your API
  |
  | JSON widget data
  v
Your Angular component
  |
  | [widget]="widget"
  v
<widget-renderer>
```

Your API does not need to add an ID to every element.

## Basic Usage

Use `WidgetContract` for data that comes from your API:

```ts
import { Component } from '@angular/core';
import { WidgetContract, WidgetRenderer } from 'widget-renderer';

@Component({
  selector: 'app-widget-page',
  imports: [WidgetRenderer],
  template: ` <widget-renderer [widget]="widget" /> `,
})
export class WidgetPage {
  protected readonly widget: WidgetContract = /* data from your API */;
}
```

Pass the API model directly to the component. You do not need to call a conversion function first.

## Complete Small Example

This is the smallest useful API-shaped widget:

```ts
import { WidgetContract } from 'widget-renderer';

export const widget: WidgetContract = {
  version: 2,
  size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: {
    color: '#101827',
    sensitive: false,
    repeat: false,
    size: 'cover',
    anchor: 'center',
  },
  refresh: {
    enabled: false,
    label: 'Refresh widget',
  },
  elements: [
    {
      type: 'text',
      grid: {
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 1,
      },
      sensitive: false,
      text: 'Hello from the widget',
      style: {
        color: '#ffffff',
        font: { size: 18 },
        align: 'left',
        wrap: true,
      },
    },
  ],
};
```

Then render it:

```html
<widget-renderer [widget]="widget" />
```

## API Data And IDs

Use `WidgetContract` for API data. Its elements do not need an `id`:

```ts
const apiWidget: WidgetContract = {
  // ...
  elements: [
    {
      type: 'text',
      // No id is required here.
      // ...other text properties
    },
  ],
};
```

The renderer creates temporary internal IDs while it is running. These IDs are used by Angular and the renderer to keep track of elements.

You do not need to:

- Add renderer IDs to your API response.
- Save renderer IDs in your database.
- Send renderer IDs back to your API.
- Call `hydrateWidget()` before rendering.

The API only needs to describe the widget and its elements.

## Loading Data From An API

Your Angular service can fetch the response and expose it as a `WidgetContract`:

```ts
readonly widget = signal<WidgetContract | null>(null);

loadWidget(): void {
  this.http.get<WidgetContract>('/api/widget').subscribe((widget) => {
    this.widget.set(widget);
  });
}
```

Render it after the request completes:

```html
@if (widget(); as currentWidget) {
  <widget-renderer [widget]="currentWidget" />
}
```

The TypeScript type helps your Angular code. It does not prove that the server actually returned valid JSON. Runtime validation is explained below.

## Renderer Events

The renderer displays the refresh control when `refresh.enabled` is `true`. It does not fetch data by itself.

Handle refresh requests in your application:

```html
<widget-renderer
  [widget]="widget"
  (refreshRequested)="reloadWidget()"
  (actionRequested)="handleAction($event)"
/>
```

The renderer also emits button actions. Your application decides what to do with the button's method, URL, and body:

```ts
import { ButtonElement } from 'widget-renderer';

protected handleAction(event: { element: ButtonElement; event: Event }): void {
  event.element.method; // 'get' or 'post'
  event.element.url;
  event.element.body;
}
```

The renderer does not automatically make network requests for button elements.

## Supported Elements

| Type | Purpose |
| --- | --- |
| `text` | Displays formatted text. |
| `image` | Displays an image with alt text, fit, overlay, and radius settings. |
| `button` | Displays an action button and emits an event when clicked. |
| `pie` | Displays part-to-whole data. |
| `donut` | Displays part-to-whole data with a center hole. |
| `gauge` | Displays one value within a range. |
| `bar` | Compares multiple values. |
| `line` | Displays a trend. |
| `progress` | Displays completion within a range. |

## Runtime Validation

Most Angular applications can simply use:

```html
<widget-renderer [widget]="widget" />
```

The renderer validates its input defensively. If the input is malformed, it renders an empty safe widget instead of rendering a broken or partial widget.

You only need to call the validation helpers yourself if your application wants to show its own API error state or log detailed validation errors.

### Option 1: Return Validation Errors

Use `safeParseWidgetInput()` when you want to inspect the errors without throwing:

```ts
const result = safeParseWidgetInput(apiResponse);

if (result.success) {
  this.widget = result.data;
} else {
  console.error(result.issues);
  this.errorMessage = 'The widget data is invalid.';
}
```

Each issue includes a path, for example `elements[0].grid.rowSpan`.

### Option 2: Throw On Invalid Data

Use `parseWidgetInput()` when invalid data should throw:

```ts
const widget = parseWidgetInput(apiResponse);
```

Invalid data throws a `WidgetValidationError`. This is useful when your application already has a central error handler.

## Renderer And Editor

This library is the renderer. It is intended to be used in an Angular application that wants to display widgets.

This repository also contains a separate editor application. The editor helps users create widget layouts, but it is not required to use the library.

Use these types as follows:

| Type | Use it for |
| --- | --- |
| `WidgetContract` | API data without renderer IDs. This is the normal input for `WidgetRenderer`. |
| `Widget` | The internal client-side model, including renderer IDs. Useful for editors and advanced integrations. |

Advanced consumers can call `hydrateWidget()` when they specifically need the internal `Widget` model. Normal renderer consumers should not need it.

## Sensitive Content

Set `sensitive: true` on the background or an element to mark it as sensitive.

The renderer provides a control for showing or hiding sensitive content. Visibility is local to that renderer instance and is not stored in the widget contract.

This is a display and privacy feature. It is not encryption. Sensitive values still exist in the JavaScript model supplied by your application.

## Troubleshooting

### Do API elements need IDs?

No. Use `WidgetContract` and pass it directly to `WidgetRenderer`.

### Do I need to call `hydrateWidget()`?

No, not for normal rendering. The renderer hydrates API data internally.

### Why is my button not making an HTTP request?

Button requests belong to your application. Listen to `actionRequested` and make the request there.

### Why is the widget empty?

The input may be invalid. Inspect `safeParseWidgetInput(apiResponse).issues` before rendering to find the invalid field.

### Why do I need ECharts?

The renderer uses ECharts for pie, donut, gauge, bar, and line elements. Install the required peer dependency in the consuming application.

## Library Development

From this repository:

```bash
npm run format:check
npm run lint
npm test -- --watch=false
npm run build:library
npm run verify:library-package
```
