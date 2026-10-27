# WidgetStudio.Contracts

C# contracts for the widget JSON rendered by the [`@lieselthuriot/widget-renderer`](https://www.npmjs.com/package/@lieselthuriot/widget-renderer) Angular package. Build widgets in a .NET API, serialize them with the included source-generated context, and render them in the browser.

- **Live editor:** [widget-studio.liesel.dev](https://widget-studio.liesel.dev). Design a widget visually and copy the generated C# code.
- **Source and issues:** [github.com/LieselThuriot/widget-studio](https://github.com/LieselThuriot/widget-studio)

The package targets `netstandard2.0`.

## Installation

```bash
dotnet add package WidgetStudio.Contracts
```

## Usage

```csharp
using System.Text.Json;
using WidgetStudio.Contracts;
using WidgetStudio.Contracts.Elements;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

var widget = new WidgetContract
{
    Id = "hello-widget",
    Size = WidgetSize.Square,
    Rows = [GridTrack.Auto],
    Columns = [GridTrack.Star()],
    Background = new BackgroundConfig
    {
        Color = WidgetColor.Rgb(23, 32, 51),
        Sensitive = false,
        Repeat = false,
        Size = BackgroundSize.Cover,
        Anchor = ElementAnchor.Center,
    },
    Refresh = new RefreshConfig { Enabled = true, Label = "Refresh widget" },
    Elements =
    [
        new TextElement
        {
            Grid = new ElementGrid { Row = 0, Column = 0, RowSpan = 1, ColumnSpan = 1, Anchor = ElementAnchor.Center },
            Sensitive = false,
            Text = "Hello from .NET",
            Style = new TextStyle
            {
                Color = WidgetColor.White,
                Font = new TextFontStyle { Size = 16, Bold = true },
                Align = TextAlign.Center,
                Wrap = true,
            },
        },
    ],
};

var json = JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract);
```

Always serialize with `WidgetJsonContext`. It emits camel-case property names, lowercase enum values, space-separated anchor values such as `"top left"`, and the `type` discriminator required by the renderer's polymorphic element model. It also omits null properties. The default `JsonSerializerOptions` do not produce the renderer wire format.

This package is primarily a serialization layer. When deserializing external JSON with `WidgetJsonContext`, put each polymorphic discriminator before the object's other properties: `type` first for widget elements and `kind` first for progress items. JSON produced by `WidgetJsonContext` already has this order.

## Colors

Use `WidgetColor` to create renderer-compatible hexadecimal colors without formatting channel values by hand:

```csharp
using WidgetStudio.Contracts;

var background = WidgetColor.Rgb(16, 24, 39);       // #101827
var overlay = WidgetColor.Rgba(16, 24, 39, 184);    // #101827b8
var softBlue = WidgetColor.Pastel(WidgetColor.Blue); // #8080ff
var transparent = WidgetColor.Transparent;           // #00000000
```

`Pastel` accepts `#RGB`, `#RRGGBB`, and `#RRGGBBAA` values, blends the color toward white, and preserves an input alpha channel. Its default blend amount is 50%; pass a value from `0` to `1` as the second argument to control the blend.

## Compatibility

The package and the npm renderer share the same JSON wire format, and the repository tests serialized contracts against the built renderer. Use matching versions of `WidgetStudio.Contracts` and `@lieselthuriot/widget-renderer`.

## License

[MIT](https://github.com/LieselThuriot/widget-studio/blob/main/LICENSE)
