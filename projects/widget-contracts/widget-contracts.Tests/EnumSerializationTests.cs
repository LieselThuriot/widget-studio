using System.Text.Json;
using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts.Tests;

public sealed class EnumSerializationTests
{
  [Theory]
  [InlineData(GridUnit.Pixel, "pixel")]
  [InlineData(GridUnit.Auto, "auto")]
  [InlineData(GridUnit.Star, "star")]
  public void SerializesGridUnits(GridUnit value, string expected)
  {
    Assert.Equal($"\"{expected}\"", JsonSerializer.Serialize(value, WidgetJsonContext.Default.GridUnit));
  }

  [Theory]
  [InlineData(WidgetSize.Mini, "mini")]
  [InlineData(WidgetSize.Square, "square")]
  [InlineData(WidgetSize.Wide, "wide")]
  [InlineData(WidgetSize.Mega, "mega")]
  [InlineData(WidgetSize.Hero, "hero")]
  public void SerializesWidgetSizes(WidgetSize value, string expected)
  {
    Assert.Equal($"\"{expected}\"", JsonSerializer.Serialize(value, WidgetJsonContext.Default.WidgetSize));
  }

  [Theory]
  [InlineData(ElementAnchor.TopLeft, "top left")]
  [InlineData(ElementAnchor.TopCenter, "top center")]
  [InlineData(ElementAnchor.TopRight, "top right")]
  [InlineData(ElementAnchor.CenterLeft, "center left")]
  [InlineData(ElementAnchor.Center, "center")]
  [InlineData(ElementAnchor.CenterRight, "center right")]
  [InlineData(ElementAnchor.BottomLeft, "bottom left")]
  [InlineData(ElementAnchor.BottomCenter, "bottom center")]
  [InlineData(ElementAnchor.BottomRight, "bottom right")]
  public void SerializesAnchorsAsRendererValues(ElementAnchor value, string expected)
  {
    Assert.Equal($"\"{expected}\"", JsonSerializer.Serialize(value, WidgetJsonContext.Default.ElementAnchor));
  }
}
