namespace WidgetStudio.Contracts.Styles;

public sealed class ProgressStyle
{
    public required ProgressColor Color { get; set; }
    public required ChartFontStyle Font { get; set; }
    public ProgressRadius? Radius { get; set; }
}
