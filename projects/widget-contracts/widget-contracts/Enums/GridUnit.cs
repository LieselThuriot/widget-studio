using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum GridUnit
{
  [JsonStringEnumMemberName("pixel")] Pixel,
  [JsonStringEnumMemberName("auto")] Auto,
  [JsonStringEnumMemberName("star")] Star
}
