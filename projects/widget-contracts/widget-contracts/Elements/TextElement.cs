using System.Text.Json.Serialization;

using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Elements;

public sealed class TextElement : WidgetElement
{
    [JsonIgnore]
    public override WidgetElementType Type => WidgetElementType.Text;
    public override required bool Sensitive { get; set; }
    public required string Text { get; set; }
    public required TextStyle Style { get; set; }
}