using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum ImageFit
{
    [JsonStringEnumMemberName("cover")] Cover,
    [JsonStringEnumMemberName("contain")] Contain,
    [JsonStringEnumMemberName("fill")] Fill
}