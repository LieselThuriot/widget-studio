namespace WidgetStudio.Contracts.Data;

public sealed class ProgressData
{
  public double Min { get; set; }
  public double Max { get; set; }
  public List<ProgressItem> Items { get; set; } = [];
}
