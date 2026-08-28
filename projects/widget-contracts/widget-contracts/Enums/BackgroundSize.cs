using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum BackgroundSize
{
    [JsonStringEnumMemberName("cover")] Cover,
    [JsonStringEnumMemberName("contain")] Contain,
    [JsonStringEnumMemberName("auto")] Auto
}