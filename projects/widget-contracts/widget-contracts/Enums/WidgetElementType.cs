using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum WidgetElementType
{
  [JsonStringEnumMemberName("text")] Text,
  [JsonStringEnumMemberName("image")] Image,
  [JsonStringEnumMemberName("button")] Button,
  [JsonStringEnumMemberName("divider")] Divider,
  [JsonStringEnumMemberName("pie")] Pie,
  [JsonStringEnumMemberName("donut")] Donut,
  [JsonStringEnumMemberName("funnel")] Funnel,
  [JsonStringEnumMemberName("gauge")] Gauge,
  [JsonStringEnumMemberName("bar")] Bar,
  [JsonStringEnumMemberName("line")] Line,
  [JsonStringEnumMemberName("progress")] Progress
}
