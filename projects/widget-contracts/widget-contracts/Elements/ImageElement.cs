using System.Text.Json.Serialization;

using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts.Elements;

public sealed class ImageElement : WidgetElement
{
    [JsonIgnore]
    public override WidgetElementType Type => WidgetElementType.Image;
    public override required bool Sensitive { get; set; }
    public required string Source { get; set; }
    public required string Alt { get; set; }
    public required ImageFit Fit { get; set; }
    public string? OverlayColor { get; set; }
    public required double Radius { get; set; }
}