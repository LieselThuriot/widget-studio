using System.Text.Json.Serialization;
using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Elements.Charts;

public sealed class PieElement : ChartElement
{
  [JsonIgnore]
  public override WidgetElementType Type => WidgetElementType.Pie;
  public List<ChartDataPoint> Data { get; set; } = [];
  public ChartStyle Style { get; set; } = new();
}
