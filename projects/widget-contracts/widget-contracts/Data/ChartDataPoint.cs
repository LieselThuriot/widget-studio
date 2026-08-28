namespace WidgetStudio.Contracts.Data;

public sealed class ChartDataPoint
{
    public required string Label { get; set; }
    public required double Value { get; set; }
    public string? Color { get; set; }
}