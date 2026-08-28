namespace WidgetStudio.Contracts.Styles;

public sealed class ProgressStyle
{
    public required ProgressColor Color { get; set; }
    public required ChartFontStyle Font { get; set; }
    public required ProgressRadius? Radius { get; set; }
}