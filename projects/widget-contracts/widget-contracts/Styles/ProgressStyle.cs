namespace WidgetStudio.Contracts.Styles;

public sealed class ProgressStyle
{
  public ProgressColor Color { get; set; } = new();
  public ChartFontStyle Font { get; set; } = new();
}
