# Widget Landscape

`widget-landscape` is a reusable Angular component for arranging `WidgetRenderer` instances in a configurable dashboard grid.

## Features

- Fixed widget footprints based on widget size
- Configurable column count with implicit rows
- Landscape edit mode with palette, drag and drop, delete, and confirm/cancel
- Delayed push-down collision previews while dragging
- Transparent host surface with a dotted edit-mode pattern
- Package-owned styling with no dependency on application editor tokens
- `darkMode` input forwarded to every `WidgetRenderer` and applied to package controls

## Integration

Import `WidgetLandscape` and bind a `LandscapeState`. Supply palette entries with `createWidget` factories so every inserted item is independent. After confirmation, `stateChange` emits versioned landscape data containing the column count and widget placements with only the widget ID, size, row, and column.

The edit controls are shown when the palette has entries. Passing an empty array or `null` hides the edit controls, allowing consumers to provide a fixed layout without allowing widgets to be added, removed, or repositioned.

```html
<widget-landscape
  [state]="state"
  [palette]="palette"
  [darkMode]="darkMode"
  [columnsLocked]="false"
  (stateChange)="save($event)"
/>
```

While editing, users can change the column count unless `columnsLocked` is `true`. Column changes are draft-only until confirmation; cancelling edit mode restores the original count and layout. The confirmed count is emitted as `stateChange.columns`.

The surface is transparent. The package does not inspect `html[data-theme]` and does not require application-level design tokens. Consumers can override package variables such as `--widget-landscape-accent` from their host stylesheet.

## Footprints

| Widget size | Columns | Rows |
| --- | ---: | ---: |
| `mini` | 1 | 1 |
| `square` | 2 | 2 |
| `wide` | 4 | 2 |
| `mega` | 4 | 4 |
| `hero` | 8 | 4 |

Unknown widget sizes use the square footprint.
