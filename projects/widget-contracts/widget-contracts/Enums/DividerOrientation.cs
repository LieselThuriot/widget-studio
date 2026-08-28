using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum DividerOrientation
{
    [JsonStringEnumMemberName("horizontal")] Horizontal,
    [JsonStringEnumMemberName("vertical")] Vertical
}