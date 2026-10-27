# Widget Landscape

`@lieselthuriot/widget-landscape` is a reusable Angular component for arranging [`@lieselthuriot/widget-renderer`](https://www.npmjs.com/package/@lieselthuriot/widget-renderer) widgets in a configurable dashboard grid.

- **Live editor:** [widget-studio.liesel.dev/landscape](https://widget-studio.liesel.dev/landscape)
- **C# contracts:** [`WidgetStudio.Contracts`](https://www.nuget.org/packages/WidgetStudio.Contracts) produces the widget JSON from .NET.

## Installation

```bash
npm install @lieselthuriot/widget-landscape
```

`@angular/common`, `@angular/core`, and `@lieselthuriot/widget-renderer` are peer dependencies. ECharts is a peer dependency of the renderer. The package supports Angular 21 and 22. npm, pnpm, and Bun install missing peer dependencies automatically; with Yarn, also add `@lieselthuriot/widget-renderer` and `echarts`.

## Features

- Fixed widget footprints based on widget size
- Configurable column count with implicit rows
- Landscape edit mode with palette, drag and drop, delete, and confirm/cancel
- Delayed push-down collision previews while dragging
- Transparent host surface with a dotted edit-mode pattern
- Package-owned styling with no dependency on application design tokens
- `darkMode` input forwarded to every `WidgetRenderer` and applied to package controls
- Optional responsive reflow that preserves fixed widget dimensions
- Persisted responsive preference with an edit-mode toggle for uncontrolled usage
- Localized controls, with built-in German, French, and Dutch locales

## Usage

Import `WidgetLandscape` and bind a `LandscapeState`. Supply palette entries with `createWidget` factories so every inserted item is independent. After confirmation, `stateChange` emits versioned landscape data containing the column count, responsive setting, and widget placements with only the widget ID, size, row, and column.

```ts
import { Component, signal } from '@angular/core';
import {
  LandscapePaletteItem,
  LandscapeState,
  LandscapeStateChange,
  WidgetLandscape,
} from '@lieselthuriot/widget-landscape';
import { WidgetInput } from '@lieselthuriot/widget-renderer';

const emptyWidget = (): WidgetInput => ({
  version: 2,
  id: crypto.randomUUID(),
  size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: { color: '#172033', sensitive: false, repeat: false, size: 'cover', anchor: 'center' },
  refresh: { enabled: false, label: 'Refresh' },
  elements: [],
});

@Component({
  selector: 'app-dashboard',
  imports: [WidgetLandscape],
  template: `
    <widget-landscape
      [state]="state()"
      [palette]="palette"
      [darkMode]="false"
      (stateChange)="save($event)"
    />
  `,
})
export class Dashboard {
  readonly state = signal<LandscapeState>({
    version: 1,
    columns: 8,
    responsive: true,
    widgets: [{ id: 'welcome', size: 'square', row: 0, column: 0, widget: emptyWidget() }],
  });

  readonly palette: LandscapePaletteItem[] = [
    { id: 'empty', label: 'Empty widget', size: 'square', createWidget: emptyWidget },
  ];

  save(change: LandscapeStateChange): void {
    // Persist the layout; widget content is stored separately.
    console.log(change);
  }
}
```

The edit controls are shown when the palette has entries. Passing an empty array or `null` hides the edit controls, allowing consumers to provide a fixed layout without allowing widgets to be added, removed, or repositioned.

The component exposes `state`, `palette`, `editMode`, `columnsLocked`, `darkMode`, `locale`, and optional `responsive` inputs. Its outputs are `stateChange`, `editModeChange`, `widgetSelected`, `widgetDeleted`, `refreshRequested`, and `actionRequested`. Like the renderer, the landscape emits refresh and button events and leaves the requests to your application.

### Localization

Visible landscape controls use English defaults and can be localized with the optional `locale` input. The input accepts partial overrides, so users can provide a complete locale or extend an existing locale with only the values they want to change. Widget content and palette labels remain consumer-provided values, so supply those in the language returned by your API or application translation layer.

```ts
import { WidgetLandscapeLocaleOverrides } from '@lieselthuriot/widget-landscape';

readonly landscapeLocale: WidgetLandscapeLocaleOverrides = {
  landscape: 'Widgetlandschap',
  columns: 'Kolommen',
  responsive: 'Responsief',
  cancel: 'Annuleren',
  confirm: 'Bevestigen',
  addWidget: 'Widget toevoegen',
  clearAll: 'Alles wissen',
  emptyEditMode: 'Kies een widget uit het palet om deze toe te voegen.',
  emptyLandscape: 'Open de bewerkingsmodus om een widget toe te voegen.',
  columnCount: (count) => `${count} ${count === 1 ? 'kolom' : 'kolommen'}`,
  refreshFallback: 'Widget vernieuwen',
  aria: {
    columns: 'Kolommen van het landschap',
    responsive: 'Responsief widgetlandschap',
    edit: 'Widgetlandschap bewerken',
    widgets: 'Widgets',
    widgetFootprint: (columns, rows) => `Widgetafmetingen: ${columns} × ${rows}`,
    selectWidget: 'Widget selecteren',
    deleteWidget: 'Widget verwijderen',
  },
};
```

For a small customization, override only the values you need:

```ts
import {
  frenchWidgetLandscapeLocale,
  WidgetLandscapeLocaleOverrides,
} from '@lieselthuriot/widget-landscape';

readonly landscapeLocale: WidgetLandscapeLocaleOverrides = {
  ...frenchWidgetLandscapeLocale,
  clearAll: 'Supprimer les widgets',
};
```

```html
<widget-landscape [state]="state" [palette]="palette" [locale]="landscapeLocale" />
```

The `aria` property contains the labels owned by the landscape, including the column control, responsive toggle, edit action, palette, widget selection, deletion, and palette footprint. It supports partial nested overrides:

```ts
const customLocale: WidgetLandscapeLocaleOverrides = {
  aria: {
    deleteWidget: 'Supprimer le widget',
  },
};
```

ARIA labels from nested `WidgetRenderer` instances (localized through the renderer's own `locale` input) and validation diagnostics are outside this localization API. When the application language changes, replace the locale and refetch the localized widget contracts. State updates received while editing continue to follow the component's existing draft behavior.

While editing, users can change the column count unless `columnsLocked` is `true`. Column changes are draft-only until confirmation; cancelling edit mode restores the original count and layout. The confirmed count is emitted as `stateChange.columns`.

The surface is transparent. The package does not inspect `html[data-theme]` and does not require application-level design tokens. Consumers can override package variables such as `--widget-landscape-accent` from their host stylesheet.

`responsive` defaults to `false`. When enabled, the landscape keeps its existing fixed column and row dimensions and measures the available host width. Widgets that do not fit in the available columns are visually reflowed into additional rows instead of being resized. Responsive reflow is presentation-only: the configured columns and widget placements are unchanged until an edit is explicitly confirmed.

If `responsive` is omitted, the value is read from `LandscapeState` and a Responsive toggle is available in edit mode. Toggling it changes the draft only. Confirming emits and persists the selected value; cancelling restores the previous value. Binding `[responsive]` to `true` or `false` makes the component controlled and hides the toggle.

## State and footprints

`LandscapeState` and `LandscapeStateChange` use `version: 1`. A state widget contains its `WidgetInput` while a state change deliberately contains only placement data, so applications can persist layout separately from widget content. Use `normalizeLandscapeState` when accepting state from an external source.

| Widget size | Columns | Rows |
| --- | ---: | ---: |
| `mini` | 1 | 1 |
| `compact` | 2 | 1 |
| `tall` | 1 | 2 |
| `square` | 2 | 2 |
| `wide` | 4 | 2 |
| `mega` | 4 | 4 |
| `banner` | 2 | 4 |
| `hero` | 8 | 4 |

Unknown widget sizes use the square footprint.

## Public API

Import everything from `@lieselthuriot/widget-landscape`. The entry point exports `WidgetLandscape`, the state, palette, and event types (`LandscapeState`, `LandscapeStateChange`, `LandscapeWidget`, `LandscapeWidgetPlacement`, `LandscapePaletteItem`, `LandscapeActionEvent`, `LandscapeRefreshEvent`), `normalizeLandscapeState`, footprint and layout helpers such as `landscapeFootprints` and `landscapeFootprintForSize`, and the locales `defaultWidgetLandscapeLocale`, `germanWidgetLandscapeLocale`, `frenchWidgetLandscapeLocale`, and `dutchWidgetLandscapeLocale`. The complete list is maintained in [`src/public-api.ts`](https://github.com/LieselThuriot/widget-studio/blob/main/projects/widget-landscape/src/public-api.ts).

## Contributing

The package is developed in the [widget-studio repository](https://github.com/LieselThuriot/widget-studio), together with the editor, the renderer, and the C# contracts. See the repository README for build, test, and release instructions. Report problems in the [issue tracker](https://github.com/LieselThuriot/widget-studio/issues).

## License

[MIT](https://github.com/LieselThuriot/widget-studio/blob/main/LICENSE)