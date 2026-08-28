using System.Text.Json.Serialization;

using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Elements.Charts;

public sealed class DonutElement : ChartElement
{
    [JsonIgnore]
    public override WidgetElementType Type => WidgetElementType.Donut;
    public required List<ChartDataPoint> Data { get; set; }
    public required ChartStyle Style { get; set; }
}