namespace WidgetStudio.Contracts.Data;

public sealed class ChartDataPoint
{
  public string Label { get; set; } = string.Empty;
  public double Value { get; set; }
  public string? Color { get; set; }
}
