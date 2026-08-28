using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum ButtonStyle
{
    [JsonStringEnumMemberName("solid")] Solid,
    [JsonStringEnumMemberName("outline")] Outline
}