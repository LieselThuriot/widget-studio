using System.Text.Json;
using System.Text.Json.Nodes;

using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Elements;
using WidgetStudio.Contracts.Elements.Charts;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Tests;

public sealed class OptionalPropertySerializationTests
{
    [Fact]
    public void OmitsNullPropertiesButPreservesNonNullOptionalValues()
    {
        var widget = ContractFixtures.CreateCompleteWidget();
        widget.Elements =
        [
          new ButtonElement
      {
        Grid = new ElementGrid { Row = 0, Column = 0, RowSpan = 1, ColumnSpan = 1 },
        Sensitive = false,
        Label = "Button",
        Method = ButtonMethod.Get,
        Url = "/button",
        Style = ButtonStyle.Solid
      }
        ];
        widget.Background.Image = null;
        widget.Background.Color = null;
        widget.Background.OverlayColor = null;

        var serialized = JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract);
        var root = JsonNode.Parse(serialized)!.AsObject();
        var background = root["background"]!.AsObject();
        var button = root["elements"]![0]!.AsObject();

        Assert.DoesNotContain("image", background);
        Assert.DoesNotContain("color", background);
        Assert.DoesNotContain("overlayColor", background);
        Assert.DoesNotContain("body", button);
        Assert.DoesNotContain("requestRefresh", button);
        Assert.DoesNotContain("showOnlyOnHover", button);

        var optional = (ButtonElement)JsonSerializer.Deserialize(
          button.ToJsonString(),
          WidgetJsonContext.Default.ButtonElement)!;
        optional.Body = "{}";
        optional.RequestRefresh = false;
        optional.ShowOnlyOnHover = true;
        var optionalJson = JsonSerializer.Serialize(optional, WidgetJsonContext.Default.ButtonElement);
        Assert.Contains("\"body\":\"{}\"", optionalJson);
        Assert.Contains("\"requestRefresh\":false", optionalJson);
        Assert.Contains("\"showOnlyOnHover\":true", optionalJson);
    }

    [Fact]
    public void ComputedAndIgnoredPropertiesAreNotSerialized()
    {
        var divider = new DividerElement
        {
            Grid = new ElementGrid { Row = 0, Column = 0, RowSpan = 1, ColumnSpan = 1 },
            Orientation = DividerOrientation.Horizontal,
            Style = new() { Color = "#ccc" },
            Sensitive = true
        };
        var progress = new ProgressSegment { Value = 1, Label = "Progress", Color = "#ccc", Active = true };
        var elementJson = JsonSerializer.Serialize(divider, WidgetJsonContext.Default.DividerElement);
        var itemJson = JsonSerializer.Serialize(progress, WidgetJsonContext.Default.ProgressSegment);

        Assert.DoesNotContain("sensitive", elementJson, StringComparison.Ordinal);
        Assert.DoesNotContain("kind", itemJson, StringComparison.Ordinal);
        Assert.DoesNotContain("type", elementJson, StringComparison.Ordinal);
        Assert.False(JsonSerializer.Deserialize(elementJson, WidgetJsonContext.Default.DividerElement)!.Sensitive);
    }

    [Fact]
    public void OmitsNullRefresh()
    {
        var widget = ContractFixtures.CreateCompleteWidget();
        widget.Refresh = null;

        var serialized = JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract);

        Assert.DoesNotContain("\"refresh\"", serialized, StringComparison.Ordinal);
    }

    [Fact]
    public void ProgressRadiusMayBeOmitted()
    {
        var widget = ContractFixtures.CreateCompleteWidget();
        var progress = widget.Elements.OfType<ProgressElement>().Single();
        progress.Style = new ProgressStyle
        {
            Color = progress.Style.Color,
            Font = progress.Style.Font
        };

        var serialized = JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract);
        var progressJson = JsonNode.Parse(serialized)!["elements"]!.AsArray()
          .Single(element => element!["type"]!.GetValue<string>() == "progress")!;
        var result = JsonSerializer.Deserialize(serialized, WidgetJsonContext.Default.WidgetContract)!;

        Assert.DoesNotContain("radius", progressJson["style"]!.AsObject());
        Assert.Null(result.Elements.OfType<ProgressElement>().Single().Style.Radius);
    }
}
