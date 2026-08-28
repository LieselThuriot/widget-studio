namespace WidgetStudio.Contracts.Data;

public sealed class GaugeData
{
    public required double Value { get; set; }
    public required double Min { get; set; }
    public required double Max { get; set; }
}