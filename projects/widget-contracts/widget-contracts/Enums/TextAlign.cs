using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum TextAlign
{
    [JsonStringEnumMemberName("left")] Left,
    [JsonStringEnumMemberName("center")] Center,
    [JsonStringEnumMemberName("right")] Right
}