using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts;

public sealed class BackgroundConfig
{
  public string? Image { get; set; }
  public bool Sensitive { get; set; }
  public bool Repeat { get; set; }
  public string? Color { get; set; }
  public BackgroundSize Size { get; set; }
  public ElementAnchor Anchor { get; set; }
  public string? OverlayColor { get; set; }
}
