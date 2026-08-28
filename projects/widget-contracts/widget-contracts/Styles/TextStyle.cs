using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts.Styles;

public sealed class TextStyle
{
    public required string Color { get; set; }
    public required TextFontStyle Font { get; set; }
    public required TextAlign Align { get; set; }
    public required bool Wrap { get; set; }
    public string? Background { get; set; }
    public double? Radius { get; set; }
    public TextPadding? Padding { get; set; }
}