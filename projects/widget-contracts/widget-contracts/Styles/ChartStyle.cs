namespace WidgetStudio.Contracts.Styles;

public sealed class ChartStyle
{
  public ChartColor Color { get; set; } = new();
  public ChartFontStyle Font { get; set; } = new();
}
