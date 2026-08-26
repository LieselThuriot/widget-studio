using System.Text.Json.Serialization;
using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Elements.Charts;

public sealed class ProgressElement : ChartElement
{
  [JsonIgnore]
  public override WidgetElementType Type => WidgetElementType.Progress;
  public ProgressData Data { get; set; } = new();
  public ProgressStyle Style { get; set; } = new();
}
