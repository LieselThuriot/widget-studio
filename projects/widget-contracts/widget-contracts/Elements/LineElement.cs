using System.Text.Json.Serialization;
using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Elements.Charts;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Elements;

public sealed class LineElement : ChartElement
{
  [JsonIgnore]
  public override WidgetElementType Type => WidgetElementType.Line;
  public List<ChartDataPoint> Data { get; set; } = [];
  public AxisChartStyle Style { get; set; } = new();
}
