# Widget Landscape

`widget-landscape` is a reusable Angular component for arranging `WidgetRenderer` instances in a configurable dashboard grid. It is published as a separate package and imports the renderer through its public package API.

## Features

- Fixed widget footprints based on widget size
- Configurable column count with implicit rows
- Landscape edit mode with palette, drag and drop, delete, and confirm/cancel
- Delayed push-down collision previews while dragging
- Transparent host surface with a dotted edit-mode pattern
- Package-owned styling with no dependency on application editor tokens
- `darkMode` input forwarded to every `WidgetRenderer` and applied to package controls
- Optional responsive reflow that preserves fixed widget dimensions
- Persisted responsive preference with an edit-mode toggle for uncontrolled usage

## Installation

```bash
npm install widget-landscape widget-renderer @angular/common @angular/core echarts
```

`@angular/common`, `@angular/core`, and `widget-renderer` are peer dependencies of this package. ECharts is required by `widget-renderer`.

## Integration

Import `WidgetLandscape`, `LandscapeState`, and the related types from `widget-landscape`, then bind a `LandscapeState`. Supply palette entries with `createWidget` factories so every inserted item is independent. After confirmation, `stateChange` emits versioned landscape data containing the column count, responsive setting, and widget placements with only the widget ID, size, row, and column.

The edit controls are shown when the palette has entries. Passing an empty array or `null` hides the edit controls, allowing consumers to provide a fixed layout without allowing widgets to be added, removed, or repositioned.

```html
<widget-landscape
  [state]="state"
  [palette]="palette"
  [responsive]="true"
  [darkMode]="darkMode"
  [columnsLocked]="false"
  (stateChange)="save($event)"
/>
```

The component exposes `state`, `palette`, `editMode`, `columnsLocked`, `darkMode`, and optional `responsive` inputs. Its outputs are `stateChange`, `editModeChange`, `widgetSelected`, `widgetDeleted`, `refreshRequested`, and `actionRequested`.

### Localization

Visible landscape controls use English defaults and can be localized with the optional `locale` input. The input accepts partial overrides, so users can provide a complete locale or extend an existing locale with only the values they want to change. Widget content and palette labels remain consumer-provided values, so supply those in the language returned by your API or application translation layer.

```ts
import { WidgetLandscapeLocaleOverrides } from 'widget-landscape';

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
} from 'widget-landscape';

readonly landscapeLocale: WidgetLandscapeLocaleOverrides = {
  ...frenchWidgetLandscapeLocale,
  clearAll: 'Supprimer les widgets',
};
```

```html
<widget-landscape [state]="state" [palette]="palette" [locale]="landscapeLocale" />
```

The `aria` property contains the labels owned by `widget-landscape`, including the column control, responsive toggle, edit action, palette, widget selection, deletion, and palette footprint. It supports partial nested overrides:

```ts
const customLocale: WidgetLandscapeLocaleOverrides = {
  aria: {
    deleteWidget: 'Supprimer le widget',
  },
};
```

ARIA labels from nested `widget-renderer` instances and validation diagnostics are outside this localization API. When the application language changes, replace the locale and refetch the localized widget contracts. State updates received while editing continue to follow the component's existing draft behavior.

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

## Development

Run these commands from the workspace root:

```bash
npm ci
npm run build:libraries
npm run format:check
npm run lint
npm test -- --watch=false
```

`build:libraries` builds `widget-renderer` first and then `widget-landscape`. Use `build:landscape` when the renderer has already been built. The package entry point is [`src/public-api.ts`](https://github.com/LieselThuriot/widget-studio/blob/main/projects/widget-landscape/src/public-api.ts).
