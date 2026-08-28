using System.Text.Json.Serialization;

using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Elements.Charts;

public sealed class GaugeElement : ChartElement
{
    [JsonIgnore]
    public override WidgetElementType Type => WidgetElementType.Gauge;
    public required GaugeData Data { get; set; }
    public required ValueChartStyle Style { get; set; }
}