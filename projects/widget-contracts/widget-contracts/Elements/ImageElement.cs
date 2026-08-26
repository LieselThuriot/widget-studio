using System.Text.Json.Serialization;
using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts.Elements;

public sealed class ImageElement : WidgetElement
{
  [JsonIgnore]
  public override WidgetElementType Type => WidgetElementType.Image;
  public string Source { get; set; } = string.Empty;
  public string Alt { get; set; } = string.Empty;
  public ImageFit Fit { get; set; }
  public string? OverlayColor { get; set; }
  public double Radius { get; set; }
}
