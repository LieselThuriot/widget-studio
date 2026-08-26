using System.Text.Json.Serialization;
using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Elements.Charts;

public sealed class FunnelElement : ChartElement
{
  [JsonIgnore]
  public override WidgetElementType Type => WidgetElementType.Funnel;
  public List<ChartDataPoint> Data { get; set; } = [];
  public ChartStyle Style { get; set; } = new();
}
