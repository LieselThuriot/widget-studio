# Widget Renderer

Reusable Angular components for rendering compact, grid-based widgets with text, imagery, actions, charts, progress indicators, loading states, and sensitive-content controls.

The package is designed to receive a plain `WidgetContract` from an API or application. Consumers do not need to add editor-only element IDs or hydrate the data before rendering.

## Features

- Render `mini`, `compact`, `tall`, `square`, `wide`, `mega`, `banner`, and `hero` widgets from a version 2 contract
- Place elements with configurable rows, columns, spans, and anchors
- Support text, images, buttons, dividers, pie, donut, funnel, gauge, bar, line, and progress elements
- Render charts with ECharts using SVG output
- Validate incoming data with structured paths and messages
- Normalize optional contract fields such as button defaults and text padding
- Blur sensitive backgrounds and elements until explicitly revealed
- Emit refresh and button-action events without making network requests
- Provide accessible names and text summaries for charts and progress bars
- Respect reduced-motion preferences for loading and active progress animations

## Installation

```bash
npm install widget-renderer @angular/common @angular/core echarts
```

`@angular/common`, `@angular/core`, and `echarts` are peer dependencies. Use Angular 21 or 22 and ECharts 6.x, as declared by the package metadata.

## Usage

Import the standalone `WidgetRenderer` component into an Angular component and bind a `WidgetContract`:

```ts
import { Component } from '@angular/core';
import { WidgetContract, WidgetRenderer } from 'widget-renderer';

@Component({
  selector: 'app-dashboard-card',
  imports: [WidgetRenderer],
  template: `
    <widget-renderer
      [widget]="widget"
      [darkMode]="darkMode"
      [loading]="loading"
      (refreshRequested)="refreshWidget()"
      (actionRequested)="handleAction($event)"
    />
  `,
})
export class DashboardCard {
  readonly darkMode = false;
  readonly loading = false;

  readonly widget: WidgetContract = {
    version: 2,
    size: 'square',
    rows: [{ unit: 'auto' }],
    columns: [{ size: 1, unit: 'star' }],
    background: {
      color: '#172033',
      sensitive: false,
      repeat: false,
      size: 'cover',
      anchor: 'center',
    },
    refresh: { enabled: true, label: 'Refresh widget' },
    elements: [
      {
        type: 'text',
        grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1, anchor: 'center' },
        sensitive: false,
        text: 'Hello from Widget Renderer',
        style: {
          color: '#ffffff',
          font: { size: 16, bold: true },
          align: 'center',
          wrap: true,
        },
      },
    ],
  };

  refreshWidget(): void {
    // Fetch updated data in the consuming application.
  }

  handleAction(event: { element: unknown; event: Event }): void {
    // Handle the configured button request in the consuming application.
    console.log(event);
  }
}
```

> [!IMPORTANT]
> `WidgetRenderer` emits `refreshRequested` and `actionRequested`; it does not call the configured button URL or perform refresh requests itself.

### Loading state

Set `loading` to `true` for the default square skeleton, or to a widget size such as `'wide'` for a matching skeleton:

```html
<widget-renderer [loading]="'wide'" [darkMode]="true" />
```

### Dark mode

Pass `darkMode` to style the loading state for a dark surface. The rendered widget itself uses the colors provided by its contract, so applications can control the surrounding theme and widget palette independently.

### Outputs

`refreshRequested` is emitted when the refresh control is clicked. `actionRequested` is emitted with the clicked `ButtonElement` and DOM event:

```ts
import { ButtonElement } from 'widget-renderer';

handleAction(event: { element: ButtonElement; event: Event }): void {
  event.event.preventDefault();
  const { method, url, body, requestRefresh } = event.element;
  // Perform the application-specific request here.
  console.log(method, url, body, requestRefresh);
}
```

## Widget contract

Every input must use `version: 2` and include:

| Field        | Description                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`       | `mini`, `compact`, `square`, `wide`, `mega`, `banner`, `hero`, or `tall`; dimensions include the 8px layout gap                                      |
| `rows`       | Non-empty grid tracks using `pixel`, `auto`, or `star` units; `size` is required for `pixel` and `star` tracks and must be omitted for `auto` tracks |
| `columns`    | Non-empty grid tracks using `pixel`, `auto`, or `star` units; `size` is required for `pixel` and `star` tracks and must be omitted for `auto` tracks |
| `background` | Color, optional image, sizing, position, repeat, overlay, and sensitivity settings                                                                   |
| `refresh`    | Whether to show a refresh action and its accessible label                                                                                            |
| `elements`   | An array of supported widget elements                                                                                                                |

Element positions are zero-based. For example, `row: 0` and `column: 0` place an element in the first grid cell.

### Supported elements

- `text`: formatted text with alignment, wrapping, font styling, color, background, radius, and padding
- `image`: remote or local image with alternative text, fit mode, radius, and overlay color
- `button`: `get` or `post` action metadata, optional body, solid or outline styling, and hover behavior
- `divider`: horizontal or vertical separator
- `pie`, `donut`, and `funnel`: labeled data points with optional legends and per-point colors
- `gauge`: a value within a minimum and maximum range
- `bar` and `line`: labeled series data with axis and line styling
- `progress`: a range-based progress bar with label, suffix, legend, and active animation options

Editor-only `id` fields are not required. The renderer accepts `WidgetContract` data and normalizes optional button fields and text padding before rendering.

### Sensitive content

Set `sensitive: true` on the background or an element to blur it and remove hidden content from the accessible tree. The renderer provides a local show/hide control when sensitive content is present.

> [!WARNING]
> Sensitive-content handling is a display and privacy feature, not encryption. Sensitive values remain in the JavaScript object supplied by the consuming application.

## Validation and normalization

Use the exported helpers when data enters your application:

```ts
import { normalizeWidgetInput, parseWidgetInput, safeParseWidgetInput } from 'widget-renderer';

const result = safeParseWidgetInput(payload);

if (!result.success) {
  console.error(result.issues);
} else {
  const widget = normalizeWidgetInput(result.data);
}

// Throws WidgetValidationError when the payload is invalid.
const parsed = parseWidgetInput(payload);
```

`WidgetValidationIssue` entries contain a `path` such as `elements[0].style.font.size` and a human-readable `message`. Invalid input supplied to `WidgetRenderer` produces a safe empty widget and exposes issues through `validationIssues`. `isWidgetContract` and `isWidget` are also available as type guards.

## Public API

The package entry point exports:

- Widget model types, including `WidgetContract`, `WidgetInput`, and element types
- `WidgetRenderer` and `WidgetLoading`
- `normalizeWidgetInput`
- `safeParseWidgetInput`, `parseWidgetInput`, `isWidgetContract`, `isWidget`, and validation types
- Grid layout helpers and widget dimensions
- `WidgetRenderer` is the supported rendering entry point; element and chart implementation components are internal.
- `chartAriaLabel` and `chartAccessibilitySummary`

Import from `widget-renderer` rather than reaching into internal source files. The complete export list is maintained in [`src/public-api.ts`](https://github.com/LieselThuriot/widget-studio/blob/main/projects/widget-renderer/src/public-api.ts). The package metadata is in [`package.json`](package.json); Angular and ECharts are peer dependencies.

## Development

This library is part of the parent Angular workspace. Run these commands from the workspace root:

```bash
# Install the locked dependency tree
npm ci

# Build the renderer library
npm run build:renderer

# Build, pack, install into a temporary consumer, and verify the public API
npm run verify:renderer-package

# Check formatting, lint, and tests
npm run format:check
npm run lint
npm test -- --watch=false
```

The package output is written to `dist/widget-renderer`. Its Angular entry point is `src/public-api.ts`, and the package is compiled in Angular partial compilation mode for downstream applications.

## Related technologies

- [Angular](https://angular.dev/)
- [Angular Package Format](https://angular.dev/tools/libraries/creating-libraries)
- [Apache ECharts](https://echarts.apache.org/)
