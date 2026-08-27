using System.Text.Json;
using System.Text.Json.Nodes;
using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Elements;
using WidgetStudio.Contracts.Enums;

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
        Grid = new ElementGrid(),
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
    var divider = new DividerElement { Sensitive = true };
    var progress = new ProgressSegment { Value = 1 };
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
}
