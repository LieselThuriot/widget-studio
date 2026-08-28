namespace WidgetStudio.Contracts.Elements.Charts;

public abstract class ChartElement : WidgetElement
{
    public override required bool Sensitive { get; set; }
    public string? Title { get; set; }
    public required bool ShowLegend { get; set; }
}