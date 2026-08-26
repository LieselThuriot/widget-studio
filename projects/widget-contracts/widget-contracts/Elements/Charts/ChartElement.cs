namespace WidgetStudio.Contracts.Elements.Charts;

public abstract class ChartElement : WidgetElement
{
  public string? Title { get; set; }
  public bool ShowLegend { get; set; }
}
