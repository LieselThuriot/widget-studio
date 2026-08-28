namespace WidgetStudio.Contracts.Styles;

public sealed class AxisChartStyle
{
    public required AxisChartColor Color { get; set; }
    public required ChartFontStyle Font { get; set; }
    public required AxisStyle Axis { get; set; }
}