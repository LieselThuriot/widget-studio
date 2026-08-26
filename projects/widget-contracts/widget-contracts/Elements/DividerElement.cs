using System.Text.Json.Serialization;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Elements;

public sealed class DividerElement : WidgetElement
{
  [JsonIgnore]
  public override WidgetElementType Type => WidgetElementType.Divider;
  [JsonIgnore]
  public override bool Sensitive { get => false; set { } }
  public DividerOrientation Orientation { get; set; }
  public DividerStyle Style { get; set; } = new();
}
