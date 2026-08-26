using System.Text.Json;
using WidgetStudio.Contracts.Data;

namespace WidgetStudio.Contracts.Tests;

public sealed class PolymorphicSerializationTests
{
  [Fact]
  public void RoundTripsEveryWidgetElementType()
  {
    var elements = ContractFixtures.CreateCompleteWidget().Elements;
    var json = JsonSerializer.Serialize(elements, WidgetJsonContext.Default.ListWidgetElement);
    var result = JsonSerializer.Deserialize(json, WidgetJsonContext.Default.ListWidgetElement);

    Assert.NotNull(result);
    Assert.Equal(elements.Select(element => element.GetType()), result.Select(element => element.GetType()));
    Assert.Equal(["text", "image", "button", "divider", "pie", "donut", "funnel", "gauge", "bar", "line", "progress"],
      JsonDocument.Parse(json).RootElement.EnumerateArray().Select(element => element.GetProperty("type").GetString()));
  }

  [Fact]
  public void RoundTripsEveryProgressItemType()
  {
    var items = new List<ProgressItem>
    {
      new ProgressSegment { Value = 0.75, Label = "Complete", Color = "#00ff00", Active = true },
      new ProgressGap { Value = 0.25 }
    };

    var json = JsonSerializer.Serialize(items, WidgetJsonContext.Default.ListProgressItem);
    var result = JsonSerializer.Deserialize(json, WidgetJsonContext.Default.ListProgressItem);

    Assert.NotNull(result);
    var segment = Assert.IsType<ProgressSegment>(result[0]);
    var gap = Assert.IsType<ProgressGap>(result[1]);
    Assert.Equal(0.75, segment.Value);
    Assert.Equal("Complete", segment.Label);
    Assert.Equal("#00ff00", segment.Color);
    Assert.True(segment.Active);
    Assert.Equal(0.25, gap.Value);

    var document = JsonDocument.Parse(json);
    Assert.Equal("segment", document.RootElement[0].GetProperty("kind").GetString());
    Assert.Equal("gap", document.RootElement[1].GetProperty("kind").GetString());
  }
}
