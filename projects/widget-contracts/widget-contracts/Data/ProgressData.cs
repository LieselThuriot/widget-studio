namespace WidgetStudio.Contracts.Data;

public sealed class ProgressData
{
    public required double Min { get; set; }
    public required double Max { get; set; }
    public required List<ProgressItem> Items { get; set; }
}