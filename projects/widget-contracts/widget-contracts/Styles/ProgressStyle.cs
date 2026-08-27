namespace WidgetStudio.Contracts.Styles;

public sealed class ProgressStyle
{
  public ProgressColor Color { get; set; } = new();
  public ChartFontStyle Font { get; set; } = new();
  public ProgressRadius? Radius { get; set; }
}

public sealed class ProgressRadius
{
  public double Segment { get; set; }
  public double Track { get; set; }
}
