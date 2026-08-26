namespace WidgetStudio.Contracts.Styles;

public sealed class ValueChartStyle
{
  public ValueChartColor Color { get; set; } = new();
  public ChartFontStyle Font { get; set; } = new();
}
