using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum ProgressItemKind
{
  [JsonStringEnumMemberName("segment")] Segment,
  [JsonStringEnumMemberName("gap")] Gap
}
