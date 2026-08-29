# WidgetStudio.Contracts

`WidgetStudio.Contracts` contains the C# API contracts for the JSON consumed by the `widget-renderer` Angular library. The package targets `netstandard2.0` and is published as the `WidgetStudio.Contracts` NuGet package.

The package exposes the source-generated `WidgetJsonContext`, which is configured for the renderer wire format:

```csharp
using System.Text.Json;
using WidgetStudio.Contracts;

var json = JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract);
```

The generated context emits camel-case property names, lowercase enum values, space-separated anchor values such as `"top left"`, and the `type` discriminator required by the renderer's polymorphic element model. It also omits null properties. Do not use the default `JsonSerializerOptions` when producing widget payloads.

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

Build or pack the package from the repository root:

```bash
dotnet build projects/widget-contracts/widget-contracts/WidgetStudio.Contracts.csproj
dotnet pack projects/widget-contracts/widget-contracts/WidgetStudio.Contracts.csproj
```

Run the contract tests, including compatibility tests against the built renderer library, with:

```bash
dotnet test projects/widget-contracts/WidgetStudio.slnx
```

Contract changes in `projects/widget-renderer/` must be mirrored here and covered by the compatibility tests. The TypeScript renderer contract and this package intentionally share the same JSON wire format.
