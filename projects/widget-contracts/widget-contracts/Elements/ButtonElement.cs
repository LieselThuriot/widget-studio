using System.Text.Json.Serialization;

using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts.Elements;

public sealed class ButtonElement : WidgetElement
{
    [JsonIgnore]
    public override WidgetElementType Type => WidgetElementType.Button;
    public override required bool Sensitive { get; set; }
    public required string Label { get; set; }
    public required ButtonMethod Method { get; set; }
    public required string Url { get; set; }
    public string? Body { get; set; }
    public bool? RequestRefresh { get; set; }
    public bool? ShowOnlyOnHover { get; set; }
    public required ButtonStyle Style { get; set; }
}