# Widget

An Angular workspace for building and rendering configurable dashboard widgets.

This repository contains two related projects:

- **Widget editor**: a visual editor for creating widget layouts and previewing them.
- **`widget-renderer`**: a reusable Angular library for rendering widget data from an API.

The renderer is display-focused. It does not edit layouts, persist changes, or make network requests for button actions or refreshes.

## Features

- Text, image, button, and progress elements
- Pie, donut, gauge, bar, and line charts powered by ECharts
- Square and wide widget layouts with configurable rows and columns
- Loading skeletons for data that has not arrived yet
- Defensive runtime validation for API responses
- Sensitive-content visibility controls
- Accessible chart summaries and keyboard-friendly interaction
- Optional API IDs with temporary internal IDs when IDs are absent

## Quick Start

### Run the editor

Requirements:

- Node.js compatible with npm 12
- npm 12.0.2, as declared by this repository

Install dependencies and start the development server:

```bash
npm ci
npm start
```

Open [http://localhost:4200/](http://localhost:4200/).

### Use the renderer library

The library supports Angular 21 and 22. Install it with its required ECharts peer dependency:

```bash
npm install widget-renderer echarts
```

Pass API-shaped data directly to `WidgetRenderer` using `WidgetContract`:

```ts
import { Component } from '@angular/core';
import { ButtonElement, WidgetContract, WidgetRenderer } from 'widget-renderer';

@Component({
  selector: 'app-widget-page',
  imports: [WidgetRenderer],
  template: `
    <widget-renderer
      [widget]="widget"
      (refreshRequested)="reloadWidget()"
      (actionRequested)="handleAction($event)"
    />
  `,
})
export class WidgetPage {
  protected readonly widget: WidgetContract = /* data from your API */;

  protected reloadWidget(): void {
    // Fetch the latest widget in the consuming application.
  }

  protected handleAction(event: { element: ButtonElement; event: Event }): void {
    // Decide how to handle the button method, URL, and body here.
  }
}
```

API data does not need renderer-generated element IDs, and normal consumers do not need to call `hydrateWidget()` before rendering. The renderer validates input defensively and renders a safe empty widget when data is malformed. Use `safeParseWidgetInput()` or `parseWidgetInput()` when the consuming application needs detailed validation errors.

Button actions and refresh requests are emitted to the consuming application. The library never performs those requests itself.

See [`projects/widget-renderer/README.md`](projects/widget-renderer/README.md) for the complete data model, supported element properties, loading states, validation examples, and integration guidance.

## Workspace Layout

```text
src/                         Angular editor application
projects/widget-renderer/    Reusable renderer library
scripts/                     Package verification scripts
```

The library public API is defined in [`projects/widget-renderer/src/public-api.ts`](projects/widget-renderer/src/public-api.ts). Consumer-facing exports should be added there.

## Development Commands

```bash
npm run format                 # Format application and library sources
npm run format:check           # Check Prettier formatting
npm run lint                   # Run Angular ESLint
npm test -- --watch=false      # Run unit tests once
npm run build                  # Build the editor and library
npm run build:app              # Build only the editor
npm run build:library          # Build only the library
npm run verify:library-package # Pack and test the library as an external consumer
```

For library-facing changes, run `npm run verify:library-package` after building the library. The script packs `dist/widget-renderer`, installs it into a temporary consumer application, and verifies the published public API rather than only the workspace path alias.

## Testing Notes

Tests run through Angular's Vitest integration. The test setup in [`src/test-setup.ts`](src/test-setup.ts) provides the canvas shim required because ECharts probes canvas support even when charts are configured to render as SVG.

The test suite covers renderer loading, hydration, validation, focus behavior, chart accessibility, image failures, and sensitive content.

## License

This project is licensed under the [MIT License](LICENSE).
