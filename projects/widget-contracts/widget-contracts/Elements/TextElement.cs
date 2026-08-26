using System.Text.Json.Serialization;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Elements;

public sealed class TextElement : WidgetElement
{
  [JsonIgnore]
  public override WidgetElementType Type => WidgetElementType.Text;
  public string Text { get; set; } = string.Empty;
  public TextStyle Style { get; set; } = new();
}
