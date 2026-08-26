using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts.Styles;

public sealed class TextStyle
{
  public string Color { get; set; } = string.Empty;
  public TextFontStyle Font { get; set; } = new();
  public TextAlign Align { get; set; }
  public bool Wrap { get; set; }
  public string? Background { get; set; }
  public double? Radius { get; set; }
  public TextPadding? Padding { get; set; }
}
