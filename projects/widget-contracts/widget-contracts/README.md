# Widget.Contracts

`Widget.Contracts` contains the C# API contracts for the JSON consumed by the `widget-renderer` Angular library.

The package targets `netstandard2.0` and exposes the source-generated `WidgetJsonContext`, which is configured for the renderer wire format:

```csharp
using System.Text.Json;
using WidgetStudio.Contracts;

var json = JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract);
```

The generated context emits camel-case property names, lowercase enum values, space-separated anchor values such as `"top left"`, and the `type` discriminator required by the renderer. Do not use the default `JsonSerializerOptions` when producing widget payloads.

Build or pack the package from the repository root with `dotnet pack projects/widget-contracts/widget-contracts/WidgetStudio.Contracts.csproj`.

Contract changes in `projects/widget-renderer/` must be mirrored here. The TypeScript renderer contract and this package intentionally share the same JSON wire format.
