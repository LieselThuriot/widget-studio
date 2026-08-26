using System.Text.Json.Serialization;
using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts.Elements;

public sealed class ButtonElement : WidgetElement
{
  [JsonIgnore]
  public override WidgetElementType Type => WidgetElementType.Button;
  public string Label { get; set; } = string.Empty;
  public ButtonMethod Method { get; set; }
  public string Url { get; set; } = string.Empty;
  public string? Body { get; set; }
  public bool? RequestRefresh { get; set; }
  public bool? ShowOnlyOnHover { get; set; }
  public ButtonStyle Style { get; set; }
}
