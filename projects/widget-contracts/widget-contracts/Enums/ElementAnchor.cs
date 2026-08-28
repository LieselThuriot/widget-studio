using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum ElementAnchor
{
    [JsonStringEnumMemberName("top left")] TopLeft,
    [JsonStringEnumMemberName("top center")] TopCenter,
    [JsonStringEnumMemberName("top right")] TopRight,
    [JsonStringEnumMemberName("center left")] CenterLeft,
    [JsonStringEnumMemberName("center")] Center,
    [JsonStringEnumMemberName("center right")] CenterRight,
    [JsonStringEnumMemberName("bottom left")] BottomLeft,
    [JsonStringEnumMemberName("bottom center")] BottomCenter,
    [JsonStringEnumMemberName("bottom right")] BottomRight
}