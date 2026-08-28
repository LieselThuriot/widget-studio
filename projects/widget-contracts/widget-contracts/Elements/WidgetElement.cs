using System.Text.Json.Serialization;

using WidgetStudio.Contracts.Elements.Charts;
using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts.Elements;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(TextElement), "text")]
[JsonDerivedType(typeof(ImageElement), "image")]
[JsonDerivedType(typeof(ButtonElement), "button")]
[JsonDerivedType(typeof(DividerElement), "divider")]
[JsonDerivedType(typeof(PieElement), "pie")]
[JsonDerivedType(typeof(DonutElement), "donut")]
[JsonDerivedType(typeof(FunnelElement), "funnel")]
[JsonDerivedType(typeof(GaugeElement), "gauge")]
[JsonDerivedType(typeof(BarElement), "bar")]
[JsonDerivedType(typeof(LineElement), "line")]
[JsonDerivedType(typeof(ProgressElement), "progress")]
public abstract class WidgetElement
{
    [JsonIgnore]
    public abstract WidgetElementType Type { get; }
    public required ElementGrid Grid { get; set; }
    public virtual bool Sensitive { get; set; }
}