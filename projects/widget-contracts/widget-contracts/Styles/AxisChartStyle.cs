namespace WidgetStudio.Contracts.Styles;

public sealed class AxisChartStyle
{
  public AxisChartColor Color { get; set; } = new();
  public ChartFontStyle Font { get; set; } = new();
  public AxisStyle Axis { get; set; } = new();
}
