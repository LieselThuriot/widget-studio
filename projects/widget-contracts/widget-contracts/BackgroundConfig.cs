using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts;

public sealed class BackgroundConfig
{
    public string? Image { get; set; }
    public required bool Sensitive { get; set; }
    public required bool Repeat { get; set; }
    public string? Color { get; set; }
    public required BackgroundSize Size { get; set; }
    public required ElementAnchor Anchor { get; set; }
    public string? OverlayColor { get; set; }
}